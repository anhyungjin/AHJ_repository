import { NextRequest, NextResponse } from "next/server";
import { getMergedCitiesForCountry } from "@/lib/cityStore";

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country");
  if (!country) {
    return NextResponse.json({ error: "country 파라미터가 필요합니다." }, { status: 400 });
  }
  const cities = getMergedCitiesForCountry(country);
  return NextResponse.json({ cities });
}
