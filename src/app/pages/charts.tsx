import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { api } from "@/controllers/api";
import type { BaseDataDTO } from "@/dtos/base-data-DTO";
import type { TiresDataDTO } from "@/dtos/tires-data-DTO";
import {
  buildChartConfig,
  chartConfigs,
} from "@/shared/constants/chart-config";
import { chartOptions } from "@/shared/constants/options/chart-options";
import { normalizeTimestamp } from "@/shared/utils/normalize-timestamp";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export const description = "Gráficos de telemetria";

function formatSecondsToTime(value: unknown): string {
  const sec = Number(value);
  if (Number.isNaN(sec) || sec < 0) return "0:00";
  const min = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${min}:${s.toString().padStart(2, "0")}`;
}

export function Charts() {
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("90d");
  const [chartValue, setChartValue] = useState<string>("VelXTemp");
  const [dataChart, setDataChart] = useState<Record<string, string | number>[]>(
    []
  );

  const date = useMemo(() => new Date(), []);
  const config = chartValue
    ? (chartConfigs as Record<
        string,
        (typeof chartConfigs)[keyof typeof chartConfigs]
      >)[chartValue]
    : null;

  const chartConfig = useMemo(
    () => (config ? buildChartConfig(config.yKeys) : {}),
    [config]
  ) satisfies ChartConfig;

  const loadChartData = useCallback(async () => {
    if (!chartValue || !config) return;

    setIsLoading(true);
    try {
      const { data } = await api.get(config.endpoint);
      const normalized = normalizeTimestamp(
        data as (BaseDataDTO | TiresDataDTO)[],
        [...config.yKeys],
        date
      ) as unknown as Record<string, string | number>[];
      setDataChart(normalized);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [chartValue, config, date]);

  useEffect(() => {
    loadChartData();

    const interval = setInterval(() => {
      loadChartData();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadChartData]);
  const selectedOption = chartOptions.find((o) => o.value === chartValue);

  return (
    <div className="flex w-full flex-col gap-8">
      <h1 className="text-3xl font-bold">Gráficos</h1>

      <div className="w-full">
        <Card className="pt-0">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>{selectedOption?.label ?? "Gráfico por tempo"}</CardTitle>
              <CardDescription>
                {config
                  ? `Mostrando ${config.yKeys.map((k) => chartConfig[k]?.label ?? k).join(", ")} ao longo do tempo`
                  : "Selecione um tipo de gráfico"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={chartValue} onValueChange={setChartValue}>
                <SelectTrigger
                  className="w-[200px] rounded-lg"
                  aria-label="Tipo de gráfico"
                >
                  <SelectValue placeholder="Tipo de gráfico" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {chartOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="rounded-lg"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger
                  className="w-[160px] rounded-lg"
                  aria-label="Período"
                >
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="90d" className="rounded-lg">
                    Últimos 3 meses
                  </SelectItem>
                  <SelectItem value="30d" className="rounded-lg">
                    Últimos 30 dias
                  </SelectItem>
                  <SelectItem value="7d" className="rounded-lg">
                    Últimos 7 dias
                  </SelectItem>
                </SelectContent>
              </Select> */}
            </div>
          </CardHeader>
          <CardContent className="relative px-2 pt-4 sm:px-6 sm:pt-6">
         
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={dataChart}>
                <defs>
                  {config?.yKeys.map((key) => (
                    <linearGradient
                      key={key}
                      id={`fill-${key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={`var(--color-${key})`}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={`var(--color-${key})`}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="created_at"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => formatSecondsToTime(value)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        const createdAt =
                          payload?.[0]?.payload?.created_at ?? payload?.[0]?.payload;
                        return formatSecondsToTime(createdAt);
                      }}
                      indicator="dot"
                    />
                  }
                />
                {config?.yKeys.map((key) => (
                  <Area
                    key={key}
                    dataKey={key}
                    type="natural"
                    fill={`url(#fill-${key})`}
                    stroke={`var(--color-${key})`}
                  />
                ))}
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
