import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { cities as seedCities } from "@/lib/data/cities";

export const maxDuration = 60;

const SpotSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["attraction", "lunch", "cafe", "dinner"]),
  mapQuery: z.string().min(1),
  notes: z.string().optional(),
});
const SpotsResponseSchema = z.array(SpotSchema);

function extractJson(text: string): unknown {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text.match(/(\[[\s\S]*\])/)?.[1];
  if (!raw) throw new Error("응답에서 JSON 배열을 찾지 못했습니다.");
  return JSON.parse(raw);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ cityId: string }> }) {
  const { cityId } = await params;
  const seed = seedCities.find((c) => c.id === cityId);
  if (!seed) {
    return NextResponse.json({ error: "알 수 없는 도시입니다." }, { status: 404 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY가 설정되지 않아 이 기능을 사용할 수 없습니다. travel-planner-app/.env.local에 ANTHROPIC_API_KEY를 추가한 뒤 다시 시도해주세요.",
      },
      { status: 501 }
    );
  }

  const body = await req.json().catch(() => null);
  const address: string | undefined = body?.address;
  const nights: number | undefined = body?.nights;
  if (!address) {
    return NextResponse.json({ error: "숙소 이름/주소가 필요합니다." }, { status: 400 });
  }

  const n = Math.max(1, Math.min(nights ?? 2, 5));

  const prompt = `${seed.nameKo}(${seed.nameEn})에서 아래 숙소 근처 일정을 다시 짜려고 해.

숙소: ${address}

이 숙소에서 도보 또는 대중교통으로 30~40분 이내로 갈 수 있는 곳 위주로, ${n}박 일정을 채울 수 있을 만큼 아래 개수를 찾아줘 (숙소에서 왕복 2~3시간씩 걸리는 먼 곳은 절대 포함하지 마):
- 명소(attraction): ${n * 2}곳
- 점심(lunch): ${n}곳
- 카페(cafe): ${n}곳
- 저녁(dinner): ${n}곳

각 장소가 실제로 존재하고 숙소에서 얼마나 가까운지(대략 도보/지하철 몇 분) 웹 검색으로 확인한 뒤, notes에 그 이동시간을 간단히 적어줘.
응답 속도가 중요하니 웹 검색은 최대 4~5번만 사용해. 다른 설명 없이 마지막에 아래 형식의 JSON 배열 하나만 \`\`\`json 코드블록으로 출력해:

[
  { "name": "한국어 장소명 (영문/원어명)", "category": "attraction|lunch|cafe|dinner", "mapQuery": "구글맵 검색에 쓸 영문 질의어(장소명, 도시, 국가)", "notes": "숙소에서 도보/지하철 약 N분 등 이동시간 위주 설명" }
]`;

  const client = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  let finalText = "";

  try {
    for (let iteration = 0; iteration < 2; iteration++) {
      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 3000,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
        messages,
      });

      finalText = "";
      for (const block of response.content) {
        if (block.type === "text") finalText += block.text;
      }

      if (response.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: response.content });
        continue;
      }
      break;
    }
  } catch (err) {
    const message = err instanceof Anthropic.APIError ? err.message : "Claude API 호출 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  try {
    const parsed = SpotsResponseSchema.parse(extractJson(finalText));
    if (parsed.length === 0) {
      return NextResponse.json({ error: "숙소 근처에서 추천할 만한 장소를 찾지 못했습니다." }, { status: 502 });
    }
    return NextResponse.json({ spots: parsed });
  } catch {
    return NextResponse.json(
      { error: "결과를 해석하지 못했습니다. 잠시 후 다시 시도해주세요.", raw: finalText },
      { status: 502 }
    );
  }
}
