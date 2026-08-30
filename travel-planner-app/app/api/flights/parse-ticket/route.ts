import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const FlightTimesSchema = z.object({
  outboundArrivalDate: z.string(),
  outboundArrivalTime: z.string(),
  outboundArrivalAirport: z.string().optional(),
  returnDepartureDate: z.string(),
  returnDepartureTime: z.string(),
  returnDepartureAirport: z.string().optional(),
});

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

function extractJson(text: string): unknown {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text.match(/(\{[\s\S]*\})/)?.[1];
  if (!raw) throw new Error("응답에서 JSON 객체를 찾지 못했습니다.");
  return JSON.parse(raw);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY가 설정되지 않아 항공권 이미지 인식 기능을 사용할 수 없습니다. travel-planner-app/.env.local에 ANTHROPIC_API_KEY를 추가한 뒤 다시 시도해주세요.",
      },
      { status: 501 }
    );
  }

  const body = await req.json().catch(() => null);
  const imageBase64: string | undefined = body?.imageBase64;
  const mimeType: string | undefined = body?.mimeType;
  if (!imageBase64 || !mimeType || !ALLOWED_MEDIA_TYPES.includes(mimeType as AllowedMediaType)) {
    return NextResponse.json({ error: "이미지 데이터(jpeg/png/webp/gif)가 필요합니다." }, { status: 400 });
  }

  const prompt = `첨부한 이미지는 항공권 예약 확인서(e-ticket) 또는 여행 일정표입니다.
여러 구간(경유/다구간)이 있을 수 있습니다. 아래 두 가지를 찾아줘:

1. outboundArrival: 한국(인천 등)에서 출발해 여행의 첫 해외 목적지에 "도착"하는 항공편의 도착 날짜/시간
2. returnDeparture: 한국으로 돌아오기 위해 마지막으로 출발하는 항공편(귀국편)의 출발 날짜/시간

날짜는 YYYY-MM-DD, 시간은 24시간제 HH:mm로. 다른 설명 없이 마지막에 아래 형식의 JSON 객체 하나만 \`\`\`json 코드블록으로 출력해:

{
  "outboundArrivalDate": "YYYY-MM-DD",
  "outboundArrivalTime": "HH:mm",
  "outboundArrivalAirport": "공항명 또는 코드",
  "returnDepartureDate": "YYYY-MM-DD",
  "returnDepartureTime": "HH:mm",
  "returnDepartureAirport": "공항명 또는 코드"
}`;

  const client = new Anthropic({ apiKey });
  let finalText = "";
  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType as AllowedMediaType, data: imageBase64 },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });
    for (const block of response.content) {
      if (block.type === "text") finalText += block.text;
    }
  } catch (err) {
    const message = err instanceof Anthropic.APIError ? err.message : "Claude API 호출 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  try {
    const parsed = FlightTimesSchema.parse(extractJson(finalText));
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "항공권 이미지에서 시간 정보를 읽어내지 못했습니다. 더 선명한 이미지로 다시 시도해주세요.", raw: finalText },
      { status: 502 }
    );
  }
}
