export type PriceTier = "under10" | "10to20" | "20to30" | "over30";
export type LocationPreference = "any" | "downtown" | "station" | "airport";

export const PRICE_TIER_LABEL: Record<PriceTier, string> = {
  under10: "10만원대 이하",
  "10to20": "10~20만원대",
  "20to30": "20~30만원대",
  over30: "30만원대 이상",
};

export const LOCATION_LABEL: Record<LocationPreference, string> = {
  any: "상관없음",
  downtown: "도심/관광지 인접",
  station: "기차역·지하철역 인근",
  airport: "공항 인근",
};

/** KRW 기준 [최소, 최대] 1박 가격대. Booking.com의 nflt price 필터에 사용 */
const PRICE_TIER_KRW: Record<PriceTier, [number, number]> = {
  under10: [0, 100000],
  "10to20": [100000, 200000],
  "20to30": [200000, 300000],
  over30: [300000, 2000000],
};

export interface LodgingSearchInput {
  cityQuery: string; // 예: "Tokyo, Japan"
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  breakfastOnly: boolean;
  priceTier: PriceTier;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function buildBookingUrl(input: LodgingSearchInput): string {
  const params = new URLSearchParams({
    ss: input.cityQuery,
    checkin: input.checkIn,
    checkout: input.checkOut,
    group_adults: String(input.adults),
    no_rooms: "1",
    group_children: "0",
  });
  const filters: string[] = [];
  if (input.breakfastOnly) {
    // Booking.com의 "조식 포함" 필터 코드. 사이트 정책 변경 시 반영 안 될 수 있음.
    filters.push("mealplan=1");
  }
  const [min, max] = PRICE_TIER_KRW[input.priceTier];
  filters.push(`price=KRW-${min}-${max}-1`);
  params.set("nflt", filters.join(";"));
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

export function buildAgodaUrl(input: LodgingSearchInput): string {
  // 아고다는 checkOut이 아니라 체크인 + 숙박일수(los)로 기간을 지정해야 반영됨.
  const los = nightsBetween(input.checkIn, input.checkOut);
  const params = new URLSearchParams({
    text: input.cityQuery,
    checkIn: input.checkIn,
    los: String(los),
    adults: String(input.adults),
    rooms: "1",
    children: "0",
  });
  return `https://www.agoda.com/search?${params.toString()}`;
}
