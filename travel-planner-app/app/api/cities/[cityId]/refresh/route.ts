import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { appendCitySpots, getMergedCity } from "@/lib/cityStore";
import { cities as seedCities } from "@/lib/data/cities";

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
          "ANTHROPIC_API_KEY가 설정되지 않아 업데이트 기능을 사용할 수 없습니다. travel-planner-app/.env.local에 ANTHROPIC_API_KEY를 추가한 뒤 다시 시도해주세요.",
      },
      { status: 501 }
    );
  }

  const current = getMergedCity(cityId)!;
  const existingNames = current.spots.map((s) => `${s.category}:${s.name}`).join(", ") || "없음";

  const prompt = `${seed.nameKo}(${seed.nameEn}) 여행 정보를 웹 검색으로 조사해줘.
목표: 여행객에게 추천할 만한 "명소(attraction)" 최대 4곳, "점심(lunch)" 최대 2곳, "카페(cafe)" 최대 2곳, "저녁(dinner)" 최대 2곳을 찾아줘.
이미 알고 있는 곳(중복 제안 금지): ${existingNames}
각 장소가 실제로 존재하고 현재도 운영 중인지 검색으로 확인한 뒤, 아래 형식의 JSON 배열만 응답해. 다른 설명 없이 마지막에 \`\`\`json 코드블록 하나로만 출력해.

[
  { "name": "한국어 장소명 (영문/원어명)", "category": "attraction|lunch|cafe|dinner", "mapQuery": "구글맵 검색에 쓸 영문 질의어(장소명, 도시, 국가)", "notes": "한두 문장 설명" }
]`;

  const client = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  let finalText = "";

  try {
    for (let iteration = 0; iteration < 4; iteration++) {
      const response = await client.messages.create({
        model: "claude-opus-5",
        max_tokens: 4000,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
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

  let parsed: z.infer<typeof SpotsResponseSchema>;
  try {
    parsed = SpotsResponseSchema.parse(extractJson(finalText));
  } catch {
    return NextResponse.json({ error: "Claude 응답을 해석하지 못했습니다. 잠시 후 다시 시도해주세요.", raw: finalText }, { status: 502 });
  }

  const updated = appendCitySpots(cityId, parsed);
  return NextResponse.json({ city: updated });
}
