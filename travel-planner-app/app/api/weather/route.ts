import { NextRequest, NextResponse } from "next/server";

const MAX_FORECAST_DAYS = 16;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!lat || !lon || !start || !end) {
    return NextResponse.json({ error: "lat, lon, start, end 파라미터가 필요합니다." }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(start);
  const daysUntilStart = Math.floor((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilStart < 0 || daysUntilStart > MAX_FORECAST_DAYS) {
    return NextResponse.json({ withinForecastRange: false, avgMaxTemp: null, avgMinTemp: null, avgPrecipProbability: null });
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);
  url.searchParams.set("forecast_days", String(MAX_FORECAST_DAYS));

  const res = await fetch(url.toString());
  if (!res.ok) {
    return NextResponse.json({ error: "날씨 정보를 가져오지 못했습니다." }, { status: 502 });
  }
  const data = await res.json();
  const daily = data.daily;
  if (!daily || !Array.isArray(daily.time) || daily.time.length === 0) {
    return NextResponse.json({ withinForecastRange: false, avgMaxTemp: null, avgMinTemp: null, avgPrecipProbability: null });
  }

  const avg = (arr: number[]) => arr.reduce((a: number, b: number) => a + b, 0) / arr.length;

  return NextResponse.json({
    withinForecastRange: true,
    avgMaxTemp: Math.round(avg(daily.temperature_2m_max) * 10) / 10,
    avgMinTemp: Math.round(avg(daily.temperature_2m_min) * 10) / 10,
    avgPrecipProbability: Math.round(avg(daily.precipitation_probability_max)),
  });
}
