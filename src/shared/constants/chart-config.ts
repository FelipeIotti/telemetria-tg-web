export const chartConfigs = {
  VelXTemp: {
    xKey: "created_at",
    yKeys: ["velocity"],
    endpoint: "/base-data",
  },
  TempCVTXTemp: {
    xKey: "created_at",
    yKeys: ["temperature"],
    endpoint: "/base-data",
  },
  PressTPMSXTemp: {
    xKey: "created_at",
    yKeys: ["press_tire_fr", "press_tire_fl", "press_tire_br", "press_tire_bl"],
    endpoint: "/tires",
  },
  TempTPMXTemp: {
    xKey: "created_at",
    yKeys: ["temp_tire_fr", "temp_tire_fl", "temp_tire_br", "temp_tire_bl"],
    endpoint: "/tires",
  },
  FuelXTemp: {
    xKey: "created_at",
    yKeys: ["fuel"],
    endpoint: "/base-data",
  },
} as const;

export const chartMetricLabels: Record<string, string> = {
  velocity: "Velocidade",
  temperature: "Temperatura CVT",
  fuel: "Combustível",
  press_tire_fr: "Pressão FL",
  press_tire_fl: "Pressão FR",
  press_tire_br: "Pressão TR",
  press_tire_bl: "Pressão TL",
  temp_tire_fr: "Temp. FL",
  temp_tire_fl: "Temp. FR",
  temp_tire_br: "Temp. TR",
  temp_tire_bl: "Temp. TL",
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export function buildChartConfig(yKeys: readonly string[]) {
  return yKeys.reduce(
    (acc, key, index) => ({
      ...acc,
      [key]: {
        label: chartMetricLabels[key] ?? key,
        color: CHART_COLORS[index % CHART_COLORS.length],
      },
    }),
    {} as Record<string, { label: string; color: string }>
  );
}
