const ORIGIN_AIRPORT = "ICN";

/** YYYY-MM-DD -> YYMMDD (스카이스캐너 URL 형식) */
function toYyMmDd(ymd: string): string {
  return ymd.replace(/-/g, "").slice(2);
}

/** YYYY-MM-DD -> YYYYMMDD (네이버 항공 URL 형식) */
function toYyyyMmDd(ymd: string): string {
  return ymd.replace(/-/g, "");
}

export function buildSkyscannerUrl(destinationAirportCode: string, startDate: string, endDate: string): string {
  const dep = toYyMmDd(startDate);
  const ret = toYyMmDd(endDate);
  return `https://www.skyscanner.co.kr/transport/flights/${ORIGIN_AIRPORT.toLowerCase()}/${destinationAirportCode.toLowerCase()}/${dep}/${ret}/?adultsv2=1&cabinclass=economy&rtn=1`;
}

export function buildNaverFlightUrl(destinationAirportCode: string, startDate: string, endDate: string): string {
  const dep = toYyyyMmDd(startDate);
  const ret = toYyyyMmDd(endDate);
  return `https://flight.naver.com/flights/international/${ORIGIN_AIRPORT}-${destinationAirportCode}-${dep}/${destinationAirportCode}-${ORIGIN_AIRPORT}-${ret}?adultCount=1&fareType=Y`;
}
