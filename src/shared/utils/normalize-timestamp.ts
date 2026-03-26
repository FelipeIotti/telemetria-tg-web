import type { BaseDataDTO } from "@/dtos/base-data-DTO";
import type { TiresDataDTO } from "@/dtos/tires-data-DTO";

export type NormalizedChartData = Record<string, number>;

export type NormalizeTimestampOptions = {
  period?: string;
  fillGaps?: boolean;
};

const PERIOD_MS: Record<string, number> = {
  "15m": 15 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export function normalizeTimestamp(
  data: (BaseDataDTO | TiresDataDTO)[],
  params: string[],
  _date: Date,
  options?: NormalizeTimestampOptions
): NormalizedChartData[] {
  let filteredData = data;
  const isAllPeriod = options?.period === "all";

  if (options?.period && options.period !== "all") {
    const since = Date.now() - (PERIOD_MS[options.period] ?? 0);
    filteredData = data.filter((item) => new Date(item.created_at).getTime() >= since);
  }

  if (filteredData.length === 0) return [];

  const now = Date.now();
  const baseTime = !isAllPeriod
    ? // For relative charts (15m/30m/1h/6h), normalize to a 0..N seconds domain.
      options?.period
      ? now - (PERIOD_MS[options.period] ?? 0)
      : new Date(filteredData[0].created_at).getTime()
    : 0;

  const normalized = filteredData.map((item) => {
    const ts = new Date(item.created_at).getTime();
    const result: NormalizedChartData = {
      created_at: Math.floor(
        isAllPeriod ? ts / 1000 : (ts - baseTime) / 1000
      ),
    };

    params.forEach((param) => {
      const value = item[param as keyof (BaseDataDTO | TiresDataDTO)];
      result[param] = Number(value);
    });

    return result;
  });

  if (options?.fillGaps && options.period && options.period !== "all") {
    return fillGapsWithZeros(normalized, params, options.period);
  }

  return normalized;
}

function fillGapsWithZeros(data: NormalizedChartData[], params: string[], period: string): NormalizedChartData[] {
  const periodSeconds = Math.floor((PERIOD_MS[period] ?? 0) / 1000);
  
  const dataMap = new Map<number, NormalizedChartData>();
  data.forEach((item) => {
    dataMap.set(item.created_at, item);
  });

  const filled: NormalizedChartData[] = [];

  for (let t = 0; t <= periodSeconds; t++) {
    if (dataMap.has(t)) {
      filled.push(dataMap.get(t)!);
    } else {
      const gapEntry: NormalizedChartData = { created_at: t };
      params.forEach((param) => {
        gapEntry[param] = 0;
      });
      filled.push(gapEntry);
    }
  }

  return filled;
}
