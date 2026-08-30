"use client";

import { useEffect, useState } from "react";
import { countries, findCountry, CountryInfo } from "@/lib/data/countries";
import { computeSuitability, SuitabilityResult, WeatherOutlook } from "@/lib/scoring";
import { buildSkyscannerUrl, buildNaverFlightUrl } from "@/lib/flightLinks";
import { CityInfo } from "@/lib/data/cities";
import { allocateCities, buildItinerary, CityAllocation, recommendCityCount } from "@/lib/cityPlanner";
import {
  buildBookingUrl,
  buildAgodaUrl,
  PriceTier,
  LocationPreference,
  PRICE_TIER_LABEL,
  LOCATION_LABEL,
} from "@/lib/lodgingLinks";

function nightsBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function addDays(ymd: string, days: number): string {
  const d = new Date(ymd);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const ADULT_OPTIONS = [1, 2, 3, 4, 5, 6];

/** AI 웹검색 기반 API는 오래 걸릴 수 있어, 일정 시간 넘으면 명확한 에러로 끝내기 위한 fetch 래퍼 */
async function fetchWithTimeout(input: RequestInfo, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const WEEKDAY_CODE_BY_JS_DAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function weekdayCode(ymd: string): string {
  return WEEKDAY_CODE_BY_JS_DAY[new Date(ymd).getDay()];
}

interface HospitalResult {
  name: string;
  url: string;
  translationSupport: "confirmed" | "unclear";
  notes: string;
}

interface FlightTimes {
  outboundArrivalDate: string;
  outboundArrivalTime: string;
  outboundArrivalAirport?: string;
  returnDepartureDate: string;
  returnDepartureTime: string;
  returnDepartureAirport?: string;
}

const WEEKDAYS = [
  { code: "mon", label: "월" },
  { code: "tue", label: "화" },
  { code: "wed", label: "수" },
  { code: "thu", label: "목" },
  { code: "fri", label: "금" },
  { code: "sat", label: "토" },
  { code: "sun", label: "일" },
];

const scoreColor = (label: SuitabilityResult["label"]) => {
  if (label === "추천") return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (label === "가능(참고 필요)") return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
};

export default function PlanPage() {
  const [countryCode, setCountryCode] = useState(countries[0].code);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dialysisRequired, setDialysisRequired] = useState(false);
  const [dialysisDays, setDialysisDays] = useState<string[]>([]);
  const [adults, setAdults] = useState(1);
  const [breakfastOnly, setBreakfastOnly] = useState(false);
  const [priceTier, setPriceTier] = useState<PriceTier>("10to20");
  const [locationPref, setLocationPref] = useState<LocationPreference>("any");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuitabilityResult | null>(null);
  const [submitted, setSubmitted] = useState<{
    country: CountryInfo;
    startDate: string;
    endDate: string;
    dialysisRequired: boolean;
    adults: number;
    breakfastOnly: boolean;
    priceTier: PriceTier;
    locationPref: LocationPreference;
  } | null>(null);
  const [flightTimes, setFlightTimes] = useState<FlightTimes | null>(null);
  const [ticketUploading, setTicketUploading] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const nights = startDate && endDate && endDate >= startDate ? nightsBetween(startDate, endDate) : null;

  const handleTicketUpload = async (file: File) => {
    setTicketUploading(true);
    setTicketError(null);
    try {
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = () => reject(new Error("파일을 읽지 못했습니다."));
        reader.readAsDataURL(file);
      });
      const res = await fetchWithTimeout(
        "/api/flights/parse-ticket",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64, mimeType: file.type }),
        },
        45000
      );
      const data = await res.json();
      if (!res.ok) {
        setTicketError(data.error ?? "항공권 이미지를 처리하지 못했습니다.");
      } else {
        setFlightTimes(data);
      }
    } catch (e) {
      setTicketError(
        e instanceof Error && e.name === "AbortError"
          ? "응답이 너무 오래 걸려 중단했습니다. 잠시 후 다시 시도해주세요."
          : "항공권 이미지를 처리하는 중 오류가 발생했습니다."
      );
    } finally {
      setTicketUploading(false);
    }
  };

  const toggleDay = (code: string) => {
    setDialysisDays((prev) => (prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!startDate || !endDate) {
      setError("여행 시작일과 종료일을 모두 입력해주세요.");
      return;
    }
    if (endDate < startDate) {
      setError("종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }
    const country = findCountry(countryCode);
    if (!country) {
      setError("국가 정보를 찾을 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: String(country.representativeCity.lat),
        lon: String(country.representativeCity.lon),
        start: startDate,
        end: endDate,
      });
      let weather: WeatherOutlook | null = null;
      let weatherFetchFailed = false;
      try {
        const res = await fetch(`/api/weather?${params.toString()}`);
        if (res.ok) {
          weather = await res.json();
        } else {
          weatherFetchFailed = true;
        }
      } catch {
        weatherFetchFailed = true;
      }

      const suitability = computeSuitability({
        country,
        startDate,
        endDate,
        dialysisRequired,
        weather,
      });
      if (weatherFetchFailed) {
        suitability.reasons.push("일기예보 조회에 실패해 이번 판단에는 날씨가 반영되지 않았습니다. 통계적 기후 정보만 사용했습니다.");
      }
      setResult(suitability);
      setSubmitted({ country, startDate, endDate, dialysisRequired, adults, breakfastOnly, priceTier, locationPref });
    } catch {
      setError("적합도를 계산하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">여행 적합도 확인</h1>
      <p className="mt-2 text-sm text-neutral-500">
        여행 국가와 일정을 입력하면 추천 여행월, 단기 일기예보, (선택 시) 투석 의료 여건을 기준으로 적합도를 계산해드립니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-neutral-700">여행 국가</label>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.nameKo} ({c.nameEn})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">출발일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              required
            />
          </div>
        </div>
        {nights !== null && (
          <p className="-mt-3 text-sm font-medium text-neutral-600">
            {nights}박 {nights + 1}일 일정입니다.
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700">인원수 (항공권/숙소 검색에 사용)</label>
          <select
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {ADULT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                성인 {n}명
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-sm font-medium text-neutral-700">숙소 조건</p>
          <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={breakfastOnly}
              onChange={(e) => setBreakfastOnly(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            조식 포함 숙소만
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-500">1박 예산</label>
              <select
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value as PriceTier)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                {(Object.keys(PRICE_TIER_LABEL) as PriceTier[]).map((t) => (
                  <option key={t} value={t}>
                    {PRICE_TIER_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500">위치 선호</label>
              <select
                value={locationPref}
                onChange={(e) => setLocationPref(e.target.value as LocationPreference)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                {(Object.keys(LOCATION_LABEL) as LocationPreference[]).map((l) => (
                  <option key={l} value={l}>
                    {LOCATION_LABEL[l]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={dialysisRequired}
              onChange={(e) => setDialysisRequired(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            동행 가족 중 투석이 필요한 인원이 있습니다
          </label>

          {dialysisRequired && (
            <div className="mt-3">
              <p className="text-xs text-neutral-500">투석 요일을 선택해주세요 (예: 월/수/금)</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {WEEKDAYS.map((d) => (
                  <button
                    type="button"
                    key={d.code}
                    onClick={() => toggleDay(d.code)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      dialysisDays.includes(d.code)
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-neutral-300 text-neutral-600"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-amber-600">
                ⚠ 투석 관련 정보는 여행 계획 참고용이며, 실제 병원 예약과 의료진 확인이 반드시 필요합니다.
              </p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "판단 중..." : "여행 적합도 확인하기"}
        </button>
      </form>

      {result && (
        <div className={`mt-6 rounded-xl border p-6 ${scoreColor(result.label)}`}>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold">{result.label}</span>
            <span className="text-3xl font-bold">{result.score}점</span>
          </div>
          {result.hardWarning && (
            <p className="mt-3 rounded-md bg-white/60 p-3 text-sm font-medium">{result.hardWarning}</p>
          )}
          <ul className="mt-4 space-y-2 text-sm text-neutral-700">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span>•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && result.label !== "비추천" && submitted && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-800">항공권 확인하기</h2>
          <p className="mt-1 text-xs text-neutral-500">
            항공권 가격은 실시간 조회 대신, 아래 버튼으로 각 사이트에서 직접 확인해주세요. 인천(ICN) 출발, 성인 {submitted.adults}명
            기준이며, 출발 9시경 / 도착 22시경(±1시간)을 우선적으로 확인하시는 걸 추천합니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href={buildSkyscannerUrl(submitted.country.airportCode, submitted.startDate, submitted.endDate, submitted.adults)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              스카이스캐너에서 확인 →
            </a>
            <a
              href={buildNaverFlightUrl(submitted.country.airportCode, submitted.startDate, submitted.endDate, submitted.adults)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              네이버 항공권에서 확인 →
            </a>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            * 딥링크로 검색 조건은 자동 입력되지만, 각 사이트의 정책 변경에 따라 반영되지 않을 수 있습니다.
          </p>

          <div className="mt-4 border-t border-neutral-200 pt-4">
            <p className="text-sm font-medium text-neutral-700">항공권 예약을 마치셨나요?</p>
            <p className="mt-1 text-xs text-neutral-500">
              예약 확인서 이미지를 올리면 실제 도착/출발 시간을 읽어서 아래 도시별 일정에 표시해드립니다.
            </p>
            <input
              type="file"
              accept="image/*"
              disabled={ticketUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleTicketUpload(file);
              }}
              className="mt-2 block text-xs text-neutral-600"
            />
            {ticketUploading && <p className="mt-1 text-xs text-neutral-500">이미지에서 시간 정보를 읽는 중...</p>}
            {ticketError && <p className="mt-1 text-xs text-red-600">{ticketError}</p>}
            {flightTimes && (
              <p className="mt-1 text-xs text-emerald-700">
                ✈ 도착 {flightTimes.outboundArrivalDate} {flightTimes.outboundArrivalTime} / 출발{" "}
                {flightTimes.returnDepartureDate} {flightTimes.returnDepartureTime} 반영됨
              </p>
            )}
          </div>
        </div>
      )}

      {result && result.label !== "비추천" && submitted && (
        <CityItinerarySection
          country={submitted.country}
          startDate={submitted.startDate}
          nights={nightsBetween(submitted.startDate, submitted.endDate)}
          adults={submitted.adults}
          breakfastOnly={submitted.breakfastOnly}
          priceTier={submitted.priceTier}
          locationPref={submitted.locationPref}
          flightTimes={flightTimes}
          dialysisRequired={submitted.dialysisRequired}
          dialysisDays={dialysisDays}
        />
      )}

      {submitted?.dialysisRequired && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-800">투석 가능 병원 정보</h2>
          {submitted.country.dialysis.hospitals && submitted.country.dialysis.hospitals.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {submitted.country.dialysis.hospitals.map((h, i) => (
                <li key={i} className="rounded-lg border border-neutral-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      {h.name} ↗
                    </a>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        h.translationSupport === "confirmed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {h.translationSupport === "confirmed" ? "통역 지원 확인됨" : "통역 지원 불확실"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-600">{h.notes}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 text-sm text-neutral-600">
              <p>아직 이 국가는 투석 병원 정보를 조사하지 못했습니다. 아래 검색 링크로 직접 찾아보시는 걸 추천합니다.</p>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  `${submitted.country.nameEn} hemodialysis for tourists international patient`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-700 hover:underline"
              >
                구글에서 검색하기 ↗
              </a>
            </div>
          )}
          <p className="mt-3 text-xs text-amber-600">
            ⚠ 위 정보는 병원 웹사이트를 참고해 정리한 자료로, 실제 예약 가능 여부·비용·통역 수준은 반드시 병원에 직접 연락해 확인해야 합니다.
            {dialysisDays.length > 0 && (
              <> 선택하신 투석 요일({dialysisDays.map((d) => WEEKDAYS.find((w) => w.code === d)?.label).join(", ")})에 예약이 불가하다면 국가/도시 변경을 고려해주세요.</>
            )}
          </p>
        </div>
      )}
    </main>
  );
}

function CityItinerarySection({
  country,
  startDate,
  nights,
  adults,
  breakfastOnly,
  priceTier,
  locationPref,
  flightTimes,
  dialysisRequired,
  dialysisDays,
}: {
  country: CountryInfo;
  startDate: string;
  nights: number;
  adults: number;
  breakfastOnly: boolean;
  priceTier: PriceTier;
  flightTimes: FlightTimes | null;
  dialysisRequired: boolean;
  dialysisDays: string[];
  locationPref: LocationPreference;
}) {
  const [cities, setCities] = useState<(CityInfo & { updatedAt: string | null })[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [selectedCityIds, setSelectedCityIds] = useState<string[] | null>(null);
  const [lodgingAddresses, setLodgingAddresses] = useState<Record<string, string>>({});
  const [dialysisSearch, setDialysisSearch] = useState<
    Record<string, { loading: boolean; error: string | null; hospitals: HospitalResult[] | null }>
  >({});
  const [personalizedSpots, setPersonalizedSpots] = useState<Record<string, CityInfo["spots"] | null>>({});
  const [personalizeState, setPersonalizeState] = useState<Record<string, { loading: boolean; error: string | null }>>({});

  const loadCities = async () => {
    try {
      const res = await fetch(`/api/cities?country=${country.code}`);
      const data = await res.json();
      setCities(data.cities ?? []);
    } catch {
      setLoadError("도시 정보를 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/cities?country=${country.code}`);
        const data = await res.json();
        if (!cancelled) setCities(data.cities ?? []);
      } catch {
        if (!cancelled) setLoadError("도시 정보를 불러오지 못했습니다.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [country.code]);

  const handleRefresh = async (cityId: string) => {
    setRefreshing(cityId);
    setRefreshError(null);
    try {
      const res = await fetchWithTimeout(`/api/cities/${cityId}/refresh`, { method: "POST" }, 55000);
      const data = await res.json();
      if (!res.ok) {
        setRefreshError(data.error ?? "업데이트에 실패했습니다.");
      } else {
        await loadCities();
      }
    } catch (e) {
      setRefreshError(
        e instanceof Error && e.name === "AbortError"
          ? "응답이 너무 오래 걸려 중단했습니다. 잠시 후 다시 시도해주세요."
          : "업데이트 중 오류가 발생했습니다."
      );
    } finally {
      setRefreshing(null);
    }
  };

  if (loadError) {
    return (
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-800">도시 선정 및 일정</h2>
        <p className="mt-2 text-sm text-red-600">{loadError}</p>
      </div>
    );
  }

  if (cities === null) {
    return (
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-800">도시 선정 및 일정</h2>
        <p className="mt-2 text-sm text-neutral-500">불러오는 중...</p>
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-800">도시 선정 및 일정</h2>
        <p className="mt-2 text-sm text-neutral-600">
          아직 {country.nameKo}의 도시별 상세 일정 데이터가 준비되지 않았습니다. 대표 도시인 {country.representativeCity.name}{" "}
          중심으로 직접 계획해보시는 걸 추천합니다.
        </p>
      </div>
    );
  }

  const defaultCityCount = Math.max(1, Math.min(recommendCityCount(nights), cities.length));
  const defaultSelectedIds = cities.slice(0, defaultCityCount).map((c) => c.id);
  const effectiveSelectedIds = selectedCityIds ?? defaultSelectedIds;

  const toggleCity = (cityId: string) => {
    const base = selectedCityIds ?? defaultSelectedIds;
    const next = base.includes(cityId) ? base.filter((id) => id !== cityId) : [...base, cityId];
    setSelectedCityIds(next);
  };

  const chosenCities = cities.filter((c) => effectiveSelectedIds.includes(c.id));
  const citiesForItinerary = chosenCities.map((c) =>
    personalizedSpots[c.id] ? { ...c, spots: personalizedSpots[c.id]! } : c
  );
  const allocations = allocateCities(citiesForItinerary, nights);
  const itinerary = buildItinerary(allocations);
  const droppedCityCount = chosenCities.length - allocations.length;

  const cityStays: { allocation: CityAllocation<CityInfo & { updatedAt: string | null }>; checkIn: string; checkOut: string }[] = [];
  {
    let cursor = startDate;
    for (const allocation of allocations) {
      const checkIn = cursor;
      const checkOut = addDays(cursor, allocation.nights);
      cityStays.push({ allocation, checkIn, checkOut });
      cursor = checkOut;
    }
  }

  const dialysisDatesByCity: Record<string, string[]> = {};
  if (dialysisRequired && dialysisDays.length > 0) {
    for (const { allocation, checkIn, checkOut } of cityStays) {
      const dates: string[] = [];
      for (let d = checkIn; d < checkOut; d = addDays(d, 1)) {
        if (dialysisDays.includes(weekdayCode(d))) dates.push(d);
      }
      if (dates.length > 0) dialysisDatesByCity[allocation.city.id] = dates;
    }
  }

  const handleDialysisSearch = async (cityId: string, cityNameEn: string) => {
    const address = lodgingAddresses[cityId];
    if (!address) return;
    setDialysisSearch((prev) => ({ ...prev, [cityId]: { loading: true, error: null, hospitals: null } }));
    try {
      const res = await fetchWithTimeout(
        "/api/dialysis/nearby-hospital",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, cityNameEn, countryNameEn: country.nameEn }),
        },
        55000
      );
      const data = await res.json();
      if (!res.ok) {
        setDialysisSearch((prev) => ({ ...prev, [cityId]: { loading: false, error: data.error ?? "검색에 실패했습니다.", hospitals: null } }));
      } else {
        setDialysisSearch((prev) => ({ ...prev, [cityId]: { loading: false, error: null, hospitals: data.hospitals } }));
      }
    } catch (e) {
      const message =
        e instanceof Error && e.name === "AbortError"
          ? "응답이 너무 오래 걸려 중단했습니다. 잠시 후 다시 시도해주세요."
          : "검색 중 오류가 발생했습니다.";
      setDialysisSearch((prev) => ({ ...prev, [cityId]: { loading: false, error: message, hospitals: null } }));
    }
  };

  const handlePersonalizeItinerary = async (cityId: string, cityNights: number) => {
    const address = lodgingAddresses[cityId];
    if (!address) return;
    setPersonalizeState((prev) => ({ ...prev, [cityId]: { loading: true, error: null } }));
    try {
      const res = await fetchWithTimeout(
        `/api/cities/${cityId}/nearby-itinerary`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, nights: cityNights }),
        },
        55000
      );
      const data = await res.json();
      if (!res.ok) {
        setPersonalizeState((prev) => ({ ...prev, [cityId]: { loading: false, error: data.error ?? "일정을 다시 짜지 못했습니다." } }));
      } else {
        setPersonalizedSpots((prev) => ({ ...prev, [cityId]: data.spots }));
        setPersonalizeState((prev) => ({ ...prev, [cityId]: { loading: false, error: null } }));
      }
    } catch (e) {
      const message =
        e instanceof Error && e.name === "AbortError"
          ? "응답이 너무 오래 걸려 중단했습니다. 잠시 후 다시 시도해주세요."
          : "일정을 다시 짜는 중 오류가 발생했습니다.";
      setPersonalizeState((prev) => ({ ...prev, [cityId]: { loading: false, error: message } }));
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-800">도시 선정 및 일정</h2>
      <p className="mt-1 text-xs text-neutral-500">
        여행하실 도시를 직접 선택하세요. 기본값은 {nights}박 기준 추천 개수({defaultCityCount}개)로 체크되어 있습니다.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {cities.map((c) => (
          <label
            key={c.id}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
              effectiveSelectedIds.includes(c.id)
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-neutral-300 text-neutral-600"
            }`}
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5"
              checked={effectiveSelectedIds.includes(c.id)}
              onChange={() => toggleCity(c.id)}
            />
            {c.nameKo}
          </label>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-neutral-400">
        * 현재 조사된 도시만 선택할 수 있습니다({country.nameKo}: {cities.length}개). 다른 도시는 아직 데이터가 없습니다.
      </p>

      {chosenCities.length === 0 ? (
        <p className="mt-4 text-sm text-red-600">최소 1개 도시를 선택해주세요.</p>
      ) : (
        <>
          <p className="mt-4 text-xs text-neutral-500">
            선택하신 도시:{" "}
            {allocations.map((a) => `${a.city.nameKo}(${a.nights}박)`).join(" → ")}. 아침은 숙소에서 해결하고,
            명소·점심·카페·명소·저녁 순으로 짜고 22시 전 숙소 복귀를 목표로 했습니다.
            {droppedCityCount > 0 && (
              <span className="text-amber-600">
                {" "}
                숙박일수보다 선택한 도시가 많아 {droppedCityCount}개 도시는 이번 일정에서 제외했습니다.
              </span>
            )}
          </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {allocations.map((a) => (
          <div key={a.city.id} className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1">
            <span className="text-xs text-neutral-600">
              {a.city.nameKo}
              {a.city.updatedAt && (
                <span className="ml-1 text-neutral-400">(업데이트: {new Date(a.city.updatedAt).toLocaleDateString("ko-KR")})</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => handleRefresh(a.city.id)}
              disabled={refreshing === a.city.id}
              className="text-xs font-medium text-blue-700 hover:underline disabled:opacity-50"
            >
              {refreshing === a.city.id ? "업데이트 중..." : "정보 업데이트"}
            </button>
          </div>
        ))}
      </div>
      {refreshError && <p className="mt-2 text-xs text-red-600">{refreshError}</p>}

      <div className="mt-4 space-y-4">
        {itinerary.map((d) => {
          const dayDate = addDays(startDate, d.day - 1);
          const isArrivalDay = flightTimes?.outboundArrivalDate === dayDate;
          const isDepartureDay = flightTimes?.returnDepartureDate === dayDate;
          return (
            <div key={d.day} className="rounded-lg border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-800">
                  Day {d.day} · {d.city.nameKo}
                </span>
                <a
                  href={d.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-700 hover:underline"
                >
                  구글맵에서 동선 보기 ↗
                </a>
              </div>
              {isArrivalDay && (
                <p className="mt-1 text-xs font-medium text-blue-700">
                  ✈ 이날 {flightTimes!.outboundArrivalTime} 도착 예정 (공항→숙소 이동 시간 고려해주세요)
                </p>
              )}
              {isDepartureDay && (
                <p className="mt-1 text-xs font-medium text-blue-700">
                  ✈ 이날 {flightTimes!.returnDepartureTime} 출발 예정 (공항 이동 시간 감안해 오후 일정은 조정하세요)
                </p>
              )}
              <ul className="mt-2 space-y-1 text-sm text-neutral-700">
                <li>🏨 아침: 숙소에서 해결</li>
                {d.morningAttraction && <li>📍 명소: {d.morningAttraction.name}</li>}
                <li>🍽️ 점심: {d.lunch.name}</li>
                <li>☕ 카페: {d.cafe.name}</li>
                {d.afternoonAttraction && <li>📍 명소: {d.afternoonAttraction.name}</li>}
                <li>🌙 저녁: {d.dinner.name} (22시 전 숙소 복귀 목표)</li>
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-neutral-400">
        * 구글맵 링크는 새 탭에서 열리며, 본인 구글 계정으로 로그인된 브라우저라면 경로를 그대로 저장하거나 내 지도에 장소를
        추가할 수 있습니다. &quot;정보 업데이트&quot;는 Claude가 웹 검색으로 새 명소·맛집을 찾아 추가합니다(기존 장소와
        중복되지 않음).
      </p>

      <div className="mt-6 border-t border-neutral-200 pt-4">
        <h3 className="text-sm font-semibold text-neutral-800">숙소 확인하기</h3>
        <p className="mt-1 text-xs text-neutral-500">
          도시별 체류 기간에 맞춰 부킹닷컴/아고다 검색 결과로 이동합니다. 조식·가격대·위치 조건은 각 사이트에서 아래 조건대로
          필터를 한 번 더 확인해주세요 — 조식 포함: {breakfastOnly ? "예 (딥링크에 필터 반영 시도)" : "상관없음"} · 1박 예산:{" "}
          {PRICE_TIER_LABEL[priceTier]} · 위치: {LOCATION_LABEL[locationPref]}
        </p>
        <div className="mt-3 space-y-3">
          {cityStays.map(({ allocation, checkIn, checkOut }) => {
            const cityQuery = `${allocation.city.nameEn}, ${country.nameEn}`;
            const searchInput = { cityQuery, checkIn, checkOut, adults, breakfastOnly, priceTier };
            const cityId = allocation.city.id;
            const pState = personalizeState[cityId];
            const hasPersonalized = Boolean(personalizedSpots[cityId]);
            return (
              <div key={cityId} className="rounded-lg border border-neutral-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-neutral-700">
                    {allocation.city.nameKo} ({checkIn} ~ {checkOut}, {allocation.nights}박)
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={buildBookingUrl(searchInput)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50"
                    >
                      부킹닷컴 →
                    </a>
                    <a
                      href={buildAgodaUrl(searchInput)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50"
                    >
                      아고다 →
                    </a>
                  </div>
                </div>

                <div className="mt-2 border-t border-neutral-100 pt-2">
                  <p className="text-xs text-neutral-500">
                    실제 예약한 숙소를 입력하면, 위 &quot;도시 선정 및 일정&quot;의 {allocation.city.nameKo} 일정을 이 숙소에서
                    도보·대중교통 30~40분 이내로 갈 수 있는 곳 위주로 다시 짭니다.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="숙소 이름 또는 주소 (예: Hotel Gracery Shinjuku, Tokyo)"
                      value={lodgingAddresses[cityId] ?? ""}
                      onChange={(e) => setLodgingAddresses((prev) => ({ ...prev, [cityId]: e.target.value }))}
                      className="min-w-[240px] flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handlePersonalizeItinerary(cityId, allocation.nights)}
                      disabled={!lodgingAddresses[cityId] || pState?.loading}
                      className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      {pState?.loading ? "일정 다시 짜는 중..." : "숙소 기준으로 일정 다시 짜기"}
                    </button>
                  </div>
                  {pState?.error && <p className="mt-1 text-xs text-red-600">{pState.error}</p>}
                  {hasPersonalized && !pState?.error && (
                    <p className="mt-1 text-xs text-emerald-700">
                      ✓ {allocation.city.nameKo} 일정이 이 숙소 기준으로 반영되었습니다. 위로 스크롤해서 확인해보세요.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-neutral-400">
          * 가격대·위치 조건은 사이트 필터로 완전히 자동화되지 않을 수 있어 참고용 안내로 표시됩니다.
        </p>
      </div>

      {Object.keys(dialysisDatesByCity).length > 0 && (
        <div className="mt-6 border-t border-neutral-200 pt-4">
          <h3 className="text-sm font-semibold text-neutral-800">숙소 근처 투석병원 찾기</h3>
          <p className="mt-1 text-xs text-neutral-500">
            위 &quot;숙소 확인하기&quot;에 입력하신 숙소 이름/주소를 그대로 사용해, 투석이 필요한 날짜에 머무는 숙소 기준으로
            가장 가까운 병원을 찾아드립니다.
          </p>
          <div className="mt-3 space-y-4">
            {cityStays
              .filter(({ allocation }) => dialysisDatesByCity[allocation.city.id])
              .map(({ allocation }) => {
                const cityId = allocation.city.id;
                const search = dialysisSearch[cityId];
                const address = lodgingAddresses[cityId];
                return (
                  <div key={cityId} className="rounded-lg border border-neutral-200 p-3">
                    <p className="text-sm font-medium text-neutral-800">
                      {allocation.city.nameKo} 숙소 — 투석 필요일:{" "}
                      {dialysisDatesByCity[cityId].map((d) => `${d}(${WEEKDAYS.find((w) => w.code === weekdayCode(d))?.label})`).join(", ")}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-neutral-600">
                        숙소: {address ? address : <span className="text-amber-600">위 숙소 확인하기에서 먼저 입력해주세요</span>}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDialysisSearch(cityId, allocation.city.nameEn)}
                        disabled={!address || search?.loading}
                        className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      >
                        {search?.loading ? "검색 중..." : "근처 투석병원 찾기"}
                      </button>
                    </div>
                    {search?.error && <p className="mt-2 text-xs text-red-600">{search.error}</p>}
                    {search?.hospitals && (
                      <ul className="mt-2 space-y-2">
                        {search.hospitals.length === 0 && (
                          <li className="text-xs text-neutral-500">근처에서 병원을 찾지 못했습니다. 직접 검색해보시는 걸 추천합니다.</li>
                        )}
                        {search.hospitals.map((h, i) => (
                          <li key={i} className="rounded-md border border-neutral-200 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <a href={h.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-700 hover:underline">
                                {h.name} ↗
                              </a>
                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  h.translationSupport === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
                                }`}
                              >
                                {h.translationSupport === "confirmed" ? "통역 지원 확인됨" : "통역 지원 불확실"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-neutral-600">{h.notes}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
          </div>
          <p className="mt-2 text-xs text-amber-600">
            ⚠ 실제 예약 가능 여부는 반드시 병원에 직접 연락해 확인해주세요. 예약이 안 되면 해당 도시/숙소를 변경하는 것을
            권장합니다.
          </p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
