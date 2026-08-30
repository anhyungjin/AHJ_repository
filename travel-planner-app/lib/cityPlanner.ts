import { CityInfo, Spot } from "./data/cities";

export function recommendCityCount(nights: number): number {
  if (nights <= 3) return 1;
  if (nights <= 6) return 2;
  return 3;
}

export interface CityAllocation<T extends CityInfo = CityInfo> {
  city: T;
  nights: number;
}

/** 추천 도시 개수를 실제 보유한 도시 수/숙박일수에 맞게 조정하고, 도시별 숙박일을 배분한다. */
export function allocateCities<T extends CityInfo>(availableCities: T[], totalNights: number): CityAllocation<T>[] {
  if (availableCities.length === 0 || totalNights <= 0) return [];

  const recommended = recommendCityCount(totalNights);
  const cityCount = Math.max(1, Math.min(recommended, availableCities.length, totalNights));
  const chosen = availableCities.slice(0, cityCount);

  const base = Math.floor(totalNights / cityCount);
  const remainder = totalNights % cityCount;

  return chosen.map((city, i) => ({
    city,
    nights: base + (i < remainder ? 1 : 0),
  }));
}

export interface DayPlan<T extends CityInfo = CityInfo> {
  day: number;
  city: T;
  morningAttraction: Spot | null;
  lunch: Spot;
  cafe: Spot;
  afternoonAttraction: Spot | null;
  dinner: Spot;
  googleMapsUrl: string;
}

function byCategory(city: CityInfo, category: Spot["category"]): Spot[] {
  return city.spots.filter((s) => s.category === category);
}

export function buildGoogleMapsUrl(spots: Spot[]): string {
  const queries = spots.map((s) => encodeURIComponent(s.mapQuery));
  if (queries.length === 0) return "";
  if (queries.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${queries[0]}`;
  }
  const origin = queries[0];
  const destination = queries[queries.length - 1];
  const waypoints = queries.slice(1, -1).join("|");
  const waypointsParam = waypoints ? `&waypoints=${waypoints}` : "";
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointsParam}&travelmode=transit`;
}

/** 순차적으로 소진하는 큐. 데이터가 부족하면(exhausted) null을 돌려주고, allowRepeat이면 처음부터 다시 순환한다. */
function makeSpotQueue(pool: Spot[], allowRepeat: boolean) {
  let cursor = 0;
  return (): Spot | null => {
    if (pool.length === 0) return null;
    if (cursor >= pool.length) {
      if (!allowRepeat) return null;
      cursor = 0;
    }
    return pool[cursor++];
  };
}

export function buildItinerary<T extends CityInfo>(allocations: CityAllocation<T>[]): DayPlan<T>[] {
  const days: DayPlan<T>[] = [];
  let dayCounter = 1;

  for (const { city, nights } of allocations) {
    // 명소는 한 번 소진하면 절대 반복하지 않는다 (사용자 요청).
    const nextAttraction = makeSpotQueue(byCategory(city, "attraction"), false);
    // 식사/카페는 데이터가 부족하면 부득이하게 순환 반복을 허용한다.
    const nextLunch = makeSpotQueue(byCategory(city, "lunch"), true);
    const nextCafe = makeSpotQueue(byCategory(city, "cafe"), true);
    const nextDinner = makeSpotQueue(byCategory(city, "dinner"), true);

    for (let i = 0; i < nights; i++) {
      const morningAttraction = nextAttraction();
      const afternoonAttraction = nextAttraction();
      const lunch = nextLunch();
      const cafe = nextCafe();
      const dinner = nextDinner();

      if (!lunch || !cafe || !dinner) {
        // 도시 데이터 자체가 비어있는 예외적인 경우: 빈 일자는 만들지 않는다.
        continue;
      }

      const route = [morningAttraction, lunch, cafe, afternoonAttraction, dinner].filter(
        (s): s is Spot => s !== null
      );

      days.push({
        day: dayCounter++,
        city,
        morningAttraction,
        lunch,
        cafe,
        afternoonAttraction,
        dinner,
        googleMapsUrl: buildGoogleMapsUrl(route),
      });
    }
  }

  return days;
}
