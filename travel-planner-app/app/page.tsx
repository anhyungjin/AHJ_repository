import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold text-neutral-900">해외 여행 플래너</h1>
      <p className="mt-3 text-neutral-600">
        여행 국가와 일정을 입력하면 추천 여행월, 날씨, 필요 시 투석 의료 여건까지 고려해 여행 적합도를 확인해드립니다.
      </p>

      <Link
        href="/plan"
        className="mt-8 inline-flex items-center rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
      >
        여행 적합도 확인하러 가기 →
      </Link>

      <div className="mt-12 rounded-xl border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold text-neutral-700">개발 로드맵</h2>
        <ol className="mt-3 space-y-2 text-sm text-neutral-600">
          <li>✅ 1단계 — 국가/일정 입력, 추천월·날씨·투석 여건 기반 적합도 판단</li>
          <li>⏳ 2단계 — 항공권 시세 조회 (min/max/avg, 출발 9시·도착 22시 기준)</li>
          <li>⏳ 3단계 — 도시 선정 추천 (숙박 일수 기준)</li>
          <li>⏳ 4단계 — 동선/일정표 자동 구성 (점심·카페·저녁 포함)</li>
          <li>⏳ 5단계 — 숙소 시세 조회 (조식·가격대·위치 필터)</li>
          <li>⏳ 6단계 — 도시별 투석 병원 예약 가능 여부 반영</li>
        </ol>
      </div>
    </main>
  );
}
