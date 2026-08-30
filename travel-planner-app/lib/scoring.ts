import { CountryInfo, DialysisLevel } from "./data/countries";

export interface WeatherOutlook {
  withinForecastRange: boolean;
  avgMaxTemp: number | null;
  avgMinTemp: number | null;
  avgPrecipProbability: number | null;
}

export interface SuitabilityInput {
  country: CountryInfo;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dialysisRequired: boolean;
  weather: WeatherOutlook | null;
}

export interface SuitabilityResult {
  score: number; // 0-100
  label: "추천" | "가능(참고 필요)" | "비추천";
  reasons: string[];
  hardWarning: string | null;
}

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function getMonthsInRange(startDate: string, endDate: string): number[] {
  const start = parseYmd(startDate);
  const end = parseYmd(endDate);
  const months = new Set<number>();
  const cursor = new Date(start);
  // 여행 기간이 지나치게 길게 입력되는 경우를 대비해 최대 400일까지만 순회
  let guard = 0;
  while (cursor.getTime() <= end.getTime() && guard < 400) {
    months.add(cursor.getUTCMonth() + 1);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard += 1;
  }
  return Array.from(months);
}

function monthClassificationScore(month: number, country: CountryInfo): number {
  if (country.bestMonths.includes(month)) return 100;
  if (country.shoulderMonths.includes(month)) return 65;
  return 35;
}

function dialysisAdjustment(level: DialysisLevel): { delta: number; note: string } {
  switch (level) {
    case "high":
      return { delta: 0, note: "투석 인프라가 양호한 편입니다. 그래도 방문 전 병원 예약 확정은 필수입니다." };
    case "medium":
      return {
        delta: -12,
        note: "일부 대도시에서만 대응 가능합니다. 도시 선정 시 투석 병원 예약 가능 여부를 먼저 확인해야 합니다.",
      };
    case "low":
      return {
        delta: -30,
        note: "투석 인프라가 충분히 확인되지 않았습니다. 예약이 불가하면 국가 변경을 권장합니다.",
      };
  }
}

export function computeSuitability(input: SuitabilityInput): SuitabilityResult {
  const { country, startDate, endDate, dialysisRequired, weather } = input;
  const reasons: string[] = [];

  const months = getMonthsInRange(startDate, endDate);
  const monthScores = months.map((m) => monthClassificationScore(m, country));
  const monthScore = monthScores.reduce((a, b) => a + b, 0) / monthScores.length;

  const bestLabel = months.filter((m) => country.bestMonths.includes(m));
  const shoulderLabel = months.filter((m) => country.shoulderMonths.includes(m));
  const offLabel = months.filter(
    (m) => !country.bestMonths.includes(m) && !country.shoulderMonths.includes(m)
  );
  if (bestLabel.length === months.length) {
    reasons.push(`${country.nameKo}의 통상적인 추천 여행월과 일치합니다 (${bestLabel.join(", ")}월).`);
  } else if (bestLabel.length > 0) {
    reasons.push(
      `일정 중 일부(${bestLabel.join(", ")}월)만 추천 시즌이고, 나머지(${[...shoulderLabel, ...offLabel].join(", ")}월)는 최적기가 아닙니다.`
    );
  } else if (shoulderLabel.length > 0) {
    reasons.push(`추천 성수기는 아니지만 준수한 시기(${shoulderLabel.join(", ")}월)입니다.`);
  } else {
    reasons.push(`${country.nameKo}의 비추천 시즌(${offLabel.join(", ")}월)에 해당합니다: ${country.climateNotes}`);
  }
  reasons.push(`참고 기후 정보: ${country.climateNotes}`);

  let weatherAdjustment = 0;
  if (weather && weather.withinForecastRange) {
    if (weather.avgPrecipProbability !== null) {
      if (weather.avgPrecipProbability >= 60) {
        weatherAdjustment -= 15;
        reasons.push(`단기 예보 기준 평균 강수 확률이 ${weather.avgPrecipProbability}%로 높아 감점했습니다.`);
      } else if (weather.avgPrecipProbability >= 40) {
        weatherAdjustment -= 7;
        reasons.push(`단기 예보 기준 평균 강수 확률이 ${weather.avgPrecipProbability}%로 다소 높습니다.`);
      } else {
        weatherAdjustment += 5;
        reasons.push(`단기 예보 기준 평균 강수 확률이 ${weather.avgPrecipProbability}%로 낮아 가점했습니다.`);
      }
    }
    if (weather.avgMaxTemp !== null && (weather.avgMaxTemp >= 35 || (weather.avgMinTemp ?? 0) <= 0)) {
      weatherAdjustment -= 10;
      reasons.push(`예보상 평균 최고기온 ${weather.avgMaxTemp}°C로 극단적인 날씨가 예상되어 감점했습니다.`);
    }
    weatherAdjustment = Math.max(-25, Math.min(5, weatherAdjustment));
  } else if (weather && !weather.withinForecastRange) {
    reasons.push("출발일이 16일 이후라 실시간 일기예보 범위 밖입니다. 통계적 기후 정보로만 판단했습니다.");
  }

  let hardWarning: string | null = null;
  let dialysisDelta = 0;
  if (dialysisRequired) {
    const { delta, note } = dialysisAdjustment(country.dialysis.level);
    dialysisDelta = delta;
    reasons.push(`[투석 옵션] ${note}`);
    reasons.push(
      `[투석 옵션] 투석 시설 확인 도시: ${country.dialysis.citiesWithCenters.join(", ")} (참고용 정보이며 반드시 병원에 직접 예약 확인 필요)`
    );
    if (country.dialysis.level === "low") {
      hardWarning =
        "선택하신 국가는 투석 인프라 정보가 충분히 확인되지 않았습니다. 투석은 필수 조건이므로 예약이 확정되지 않으면 다른 국가로 변경하는 것을 권장합니다.";
    }
  }

  const rawScore = monthScore + weatherAdjustment + dialysisDelta;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let label: SuitabilityResult["label"];
  if (score >= 75) label = "추천";
  else if (score >= 50) label = "가능(참고 필요)";
  else label = "비추천";

  return { score, label, reasons, hardWarning };
}
