import type { BaseDataDTO } from "@/dtos/base-data-DTO";
import type { TiresDataDTO } from "@/dtos/tires-data-DTO";

export type NormalizedChartData = Record<string, number>;

export function normalizeTimestamp(
  data: (BaseDataDTO | TiresDataDTO)[],
  params: string[],
  date: Date
): NormalizedChartData[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const filteredData = data.filter((item) => {
    const ts = new Date(item.created_at).getTime();
    return ts >= dayStart.getTime() && ts <= dayEnd.getTime();
  });

  if (filteredData.length === 0) return [];

  const baseTimestamp = new Date(filteredData[0].created_at).getTime();

  return filteredData.map((item) => {
    const ts = new Date(item.created_at).getTime();
    const result: NormalizedChartData = {
      created_at: Math.floor((ts - baseTimestamp) / 1000),
    };

    params.forEach((param) => {
      const value = item[param as keyof (BaseDataDTO | TiresDataDTO)];
      result[param] = Number(value);
    });

    return result;
  });
}
