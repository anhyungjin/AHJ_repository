import fs from "fs";
import path from "path";

function cachePath(name: string): string {
  return path.join(process.cwd(), "data", `${name}.json`);
}

function readCache(name: string): Record<string, unknown> {
  try {
    return JSON.parse(fs.readFileSync(cachePath(name), "utf-8"));
  } catch {
    return {};
  }
}

function writeCache(name: string, data: Record<string, unknown>) {
  fs.mkdirSync(path.dirname(cachePath(name)), { recursive: true });
  fs.writeFileSync(cachePath(name), JSON.stringify(data, null, 2), "utf-8");
}

/** 동일한 입력으로 Claude API를 다시 호출하지 않도록 결과를 파일에 캐싱한다. */
export function getCached<T>(cacheName: string, key: string): T | undefined {
  return readCache(cacheName)[key] as T | undefined;
}

export function setCached<T>(cacheName: string, key: string, value: T): void {
  const cache = readCache(cacheName);
  cache[key] = value;
  writeCache(cacheName, cache);
}

export function normalizeCacheKey(...parts: string[]): string {
  return parts.map((p) => p.trim().toLowerCase().replace(/\s+/g, " ")).join("::");
}
