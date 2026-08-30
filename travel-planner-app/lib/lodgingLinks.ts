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

export interface LodgingSearchInput {
  cityQuery: string; // 예: "Tokyo, Japan"
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  breakfastOnly: boolean;
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
  if (input.breakfastOnly) {
    // Booking.com의 "조식 포함" 필터 코드. 사이트 정책 변경 시 반영 안 될 수 있음.
    params.set("nflt", "mealplan=1");
  }
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

export function buildAgodaUrl(input: LodgingSearchInput): string {
  const params = new URLSearchParams({
    text: input.cityQuery,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: String(input.adults),
    rooms: "1",
    children: "0",
  });
  return `https://www.agoda.com/search?${params.toString()}`;
}
