import { CityInfo, Spot } from "./data/cities";

export function recommendCityCount(nights: number): number {
  if (nights <= 3) return 1;
  if (nights <= 6) return 2;
  return 3;
}

export interface CityAllocation {
  city: CityInfo;
  nights: number;
}

/** 추천 도시 개수를 실제 보유한 도시 수/숙박일수에 맞게 조정하고, 도시별 숙박일을 배분한다. */
export function allocateCities(availableCities: CityInfo[], totalNights: number): CityAllocation[] {
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

export interface DayPlan {
  day: number;
  city: CityInfo;
  attractions: Spot[];
  lunch: Spot;
  cafe: Spot;
  dinner: Spot;
  googleMapsUrl: string;
}

function byCategory(city: CityInfo, category: Spot["category"]): Spot[] {
  const spots = city.spots.filter((s) => s.category === category);
  return spots.length > 0 ? spots : [{ name: "(정보 없음)", category, mapQuery: city.nameEn }];
}

export function buildGoogleMapsUrl(spots: Spot[]): string {
  const queries = spots.map((s) => encodeURIComponent(s.mapQuery));
  if (queries.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${queries[0]}`;
  }
  const origin = queries[0];
  const destination = queries[queries.length - 1];
  const waypoints = queries.slice(1, -1).join("|");
  const waypointsParam = waypoints ? `&waypoints=${waypoints}` : "";
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointsParam}&travelmode=transit`;
}

export function buildItinerary(allocations: CityAllocation[]): DayPlan[] {
  const days: DayPlan[] = [];
  let dayCounter = 1;

  for (const { city, nights } of allocations) {
    const attractions = byCategory(city, "attraction");
    const lunches = byCategory(city, "lunch");
    const cafes = byCategory(city, "cafe");
    const dinners = byCategory(city, "dinner");

    for (let i = 0; i < nights; i++) {
      const morningAttraction = attractions[(i * 2) % attractions.length];
      const afternoonAttraction =
        attractions.length > 1 ? attractions[(i * 2 + 1) % attractions.length] : morningAttraction;
      const lunch = lunches[i % lunches.length];
      const cafe = cafes[i % cafes.length];
      const dinner = dinners[i % dinners.length];

      const route = [morningAttraction, lunch, cafe];
      if (afternoonAttraction !== morningAttraction) route.push(afternoonAttraction);
      route.push(dinner);

      days.push({
        day: dayCounter++,
        city,
        attractions: afternoonAttraction === morningAttraction ? [morningAttraction] : [morningAttraction, afternoonAttraction],
        lunch,
        cafe,
        dinner,
        googleMapsUrl: buildGoogleMapsUrl(route),
      });
    }
  }

  return days;
}
