import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getCached, setCached, normalizeCacheKey } from "@/lib/aiCache";

// Vercel 서버리스 함수 기본 제한시간(보통 10~15초)보다 웹검색 응답이 오래 걸릴 수 있어 명시적으로 늘려둠.
export const maxDuration = 60;

const CACHE_NAME = "dialysis-hospital-cache";

const HospitalSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  translationSupport: z.enum(["confirmed", "unclear"]),
  notes: z.string(),
});
const HospitalsResponseSchema = z.array(HospitalSchema);
type HospitalsResponse = z.infer<typeof HospitalsResponseSchema>;

function extractJson(text: string): unknown {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text.match(/(\[[\s\S]*\])/)?.[1];
  if (!raw) throw new Error("응답에서 JSON 배열을 찾지 못했습니다.");
  return JSON.parse(raw);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const address: string | undefined = body?.address;
  const cityNameEn: string | undefined = body?.cityNameEn;
  const countryNameEn: string | undefined = body?.countryNameEn;
  if (!address || !cityNameEn || !countryNameEn) {
    return NextResponse.json({ error: "숙소 주소와 도시/국가 정보가 필요합니다." }, { status: 400 });
  }

  const cacheKey = normalizeCacheKey(address, cityNameEn, countryNameEn);
  const cached = getCached<HospitalsResponse>(CACHE_NAME, cacheKey);
  if (cached) {
    return NextResponse.json({ hospitals: cached, cached: true });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY가 설정되지 않아 병원 검색 기능을 사용할 수 없습니다. travel-planner-app/.env.local에 ANTHROPIC_API_KEY를 추가한 뒤 다시 시도해주세요.",
      },
      { status: 501 }
    );
  }

  const prompt = `아래 숙소 주소에서 가장 가까운, 외국인 여행자가 임시 혈액투석(hemodialysis)을 받을 수 있는 병원/클리닉을 웹 검색으로 찾아줘.

숙소 주소: ${address}
도시/국가: ${cityNameEn}, ${countryNameEn}

응답 속도와 비용이 중요하니 웹 검색은 최대 2번만 사용해서 최대 2곳만 빠르게 찾아줘. 각 병원의 웹사이트 내용을 간단히 확인해 외국인 환자 대상 통역 지원이 명시되어 있는지만 판단하면 충분해.
다른 설명 없이 마지막에 아래 형식의 JSON 배열 하나만 \`\`\`json 코드블록으로 출력해:

[
  { "name": "병원명", "url": "홈페이지 URL", "translationSupport": "confirmed 또는 unclear", "notes": "숙소와의 대략적 거리/이동수단, 통역 지원 근거 등 한두 문장" }
]

찾은 병원이 없으면 빈 배열 []을 출력해.`;

  const client = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  let finalText = "";

  try {
    for (let iteration = 0; iteration < 2; iteration++) {
      const response = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1500,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 2 }],
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
    const parsed = HospitalsResponseSchema.parse(extractJson(finalText));
    setCached(CACHE_NAME, cacheKey, parsed);
    return NextResponse.json({ hospitals: parsed });
  } catch {
    return NextResponse.json(
      { error: "병원 검색 결과를 해석하지 못했습니다. 잠시 후 다시 시도해주세요.", raw: finalText },
      { status: 502 }
    );
  }
}
