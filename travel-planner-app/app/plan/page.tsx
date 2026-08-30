"use client";

import { useEffect, useState } from "react";
import { countries, findCountry, CountryInfo } from "@/lib/data/countries";
import { computeSuitability, SuitabilityResult, WeatherOutlook } from "@/lib/scoring";
import { buildSkyscannerUrl, buildNaverFlightUrl } from "@/lib/flightLinks";
import { CityInfo } from "@/lib/data/cities";
import { allocateCities, buildItinerary } from "@/lib/cityPlanner";

function nightsBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuitabilityResult | null>(null);
  const [submitted, setSubmitted] = useState<{
    country: CountryInfo;
    startDate: string;
    endDate: string;
    dialysisRequired: boolean;
  } | null>(null);

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
      setSubmitted({ country, startDate, endDate, dialysisRequired });
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
            항공권 가격은 실시간 조회 대신, 아래 버튼으로 각 사이트에서 직접 확인해주세요. 인천(ICN) 출발 기준이며, 출발 9시경 / 도착
            22시경(±1시간)을 우선적으로 확인하시는 걸 추천합니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href={buildSkyscannerUrl(submitted.country.airportCode, submitted.startDate, submitted.endDate)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              스카이스캐너에서 확인 →
            </a>
            <a
              href={buildNaverFlightUrl(submitted.country.airportCode, submitted.startDate, submitted.endDate)}
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
        </div>
      )}

      {result && result.label !== "비추천" && submitted && (
        <CityItinerarySection country={submitted.country} nights={nightsBetween(submitted.startDate, submitted.endDate)} />
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

function CityItinerarySection({ country, nights }: { country: CountryInfo; nights: number }) {
  const [cities, setCities] = useState<(CityInfo & { updatedAt: string | null })[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

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
      const res = await fetch(`/api/cities/${cityId}/refresh`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setRefreshError(data.error ?? "업데이트에 실패했습니다.");
      } else {
        await loadCities();
      }
    } catch {
      setRefreshError("업데이트 중 오류가 발생했습니다.");
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

  const allocations = allocateCities(cities, nights);
  const itinerary = buildItinerary(allocations);

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-800">도시 선정 및 일정</h2>
      <p className="mt-1 text-xs text-neutral-500">
        {nights}박 기준 추천 도시:{" "}
        {allocations.map((a) => `${a.city.nameKo}(${a.nights}박)`).join(" → ")}. 아침은 숙소에서 해결하고, 명소·점심·카페·명소·저녁
        순으로 짜고 22시 전 숙소 복귀를 목표로 했습니다.
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
        {itinerary.map((d) => (
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
            <ul className="mt-2 space-y-1 text-sm text-neutral-700">
              <li>🏨 아침: 숙소에서 해결</li>
              {d.morningAttraction && <li>📍 명소: {d.morningAttraction.name}</li>}
              <li>🍽️ 점심: {d.lunch.name}</li>
              <li>☕ 카페: {d.cafe.name}</li>
              {d.afternoonAttraction && <li>📍 명소: {d.afternoonAttraction.name}</li>}
              <li>🌙 저녁: {d.dinner.name} (22시 전 숙소 복귀 목표)</li>
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-neutral-400">
        * 구글맵 링크는 새 탭에서 열리며, 본인 구글 계정으로 로그인된 브라우저라면 경로를 그대로 저장하거나 내 지도에 장소를
        추가할 수 있습니다. &quot;정보 업데이트&quot;는 Claude가 웹 검색으로 새 명소·맛집을 찾아 추가합니다(기존 장소와
        중복되지 않음).
      </p>
    </div>
  );
}
