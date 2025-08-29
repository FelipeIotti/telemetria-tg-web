export const normalizeTimestamp = (
  data: any[],
  params: string[],
  date: Date
): Record<string, any>[] => {
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
    const result: any = {
      created_at: Math.floor((ts - baseTimestamp) / 1000),
    };

    params.forEach((param) => {
      result[param] =
        param === "fuel" ? Number(item[param]) : Number(item[param]);
    });

    return result;
  });
};
