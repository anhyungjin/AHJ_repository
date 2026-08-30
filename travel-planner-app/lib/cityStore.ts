import fs from "fs";
import path from "path";
import { CityInfo, Spot, cities as seedCities, recommendedCitiesByCountry } from "./data/cities";

const OVERRIDES_PATH = path.join(process.cwd(), "data", "city-overrides.json");

interface CityOverride {
  spots: Spot[];
  updatedAt: string;
}

type Overrides = Record<string, CityOverride>;

function spotKey(s: Spot): string {
  return `${s.category}:${s.name.trim().toLowerCase()}`;
}

function dedupeSpots(spots: Spot[]): Spot[] {
  const seen = new Set<string>();
  const result: Spot[] = [];
  for (const s of spots) {
    const key = spotKey(s);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(s);
  }
  return result;
}

function readOverrides(): Overrides {
  try {
    const raw = fs.readFileSync(OVERRIDES_PATH, "utf-8");
    return JSON.parse(raw) as Overrides;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Overrides) {
  fs.mkdirSync(path.dirname(OVERRIDES_PATH), { recursive: true });
  fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides, null, 2), "utf-8");
}

function findSeedCity(id: string): CityInfo | undefined {
  return seedCities.find((c) => c.id === id);
}

export function getMergedCity(id: string): (CityInfo & { updatedAt: string | null }) | undefined {
  const base = findSeedCity(id);
  if (!base) return undefined;
  const override = readOverrides()[id];
  const spots = dedupeSpots([...base.spots, ...(override?.spots ?? [])]);
  return { ...base, spots, updatedAt: override?.updatedAt ?? null };
}

export function getMergedCitiesForCountry(countryCode: string): (CityInfo & { updatedAt: string | null })[] {
  const ids = recommendedCitiesByCountry[countryCode] ?? [];
  return ids.map(getMergedCity).filter((c): c is CityInfo & { updatedAt: string | null } => Boolean(c));
}

/** 새로 찾은 스팟들을 기존 스팟과 합쳐(중복 제거) 저장하고, 병합된 최신 CityInfo를 반환한다. */
export function appendCitySpots(id: string, newSpots: Spot[]) {
  const base = findSeedCity(id);
  if (!base) throw new Error(`Unknown city id: ${id}`);

  const overrides = readOverrides();
  const existingExtra = overrides[id]?.spots ?? [];
  const mergedExtra = dedupeSpots([...base.spots, ...existingExtra, ...newSpots]).filter(
    (s) => !base.spots.some((b) => spotKey(b) === spotKey(s))
  );

  overrides[id] = { spots: mergedExtra, updatedAt: new Date().toISOString() };
  writeOverrides(overrides);
  return getMergedCity(id)!;
}
