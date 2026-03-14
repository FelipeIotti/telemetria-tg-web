import { Loading } from "@/app/components/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import type { BaseDataDTO } from "@/dtos/base-data-DTO";
import type { TiresDataDTO } from "@/dtos/tires-data-DTO";
import { api } from "@/services/api";
import {
  buildChartConfig,
  chartConfigs,
} from "@/shared/constants/chart-config";
import { chartOptions } from "@/shared/constants/options/chart-options";
import {
  normalizeTimestamp,
  type NormalizedChartData,
} from "@/shared/utils/normalize-timestamp";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const POLLING_INTERVAL = 5000;

const periodOptions = [
  { label: "Última hora", value: "1h" },
  { label: "Último dia", value: "1d" },
  { label: "Última semana", value: "7d" },
  { label: "Último mês", value: "30d" },
  { label: "Todo período", value: "all" },
] as const;

const PERIOD_MS: Record<string, number> = {
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function filterDataByPeriod<T extends { created_at: Date | string }>(
  data: T[],
  period: string
): T[] {
  if (period === "all") return data;
  const since = Date.now() - (PERIOD_MS[period] ?? 0);
  return data.filter((item) => new Date(item.created_at).getTime() >= since);
}

function formatSecondsByPeriod(value: unknown, period: string): string {
  const totalSeconds = Number(value);
  if (Number.isNaN(totalSeconds) || totalSeconds < 0) return "0s";

  const secondsInMinute = 60;
  const secondsInHour = 60 * 60;
  const secondsInDay = 24 * 60 * 60;

  switch (period) {
    case "1h": {
      const mins = Math.floor(totalSeconds / secondsInMinute);
      return `${mins}m`;
    }
    case "1d": {
      const hours = Math.floor(totalSeconds / secondsInHour);
      return `${hours}h`;
    }
    case "7d":
    case "30d":
    case "all": {
      const days = Math.floor(totalSeconds / secondsInDay);
      const remainingHours = Math.floor((totalSeconds % secondsInDay) / secondsInHour);
      if (days > 0) {
        return `${days}d ${remainingHours}h`;
      }
      return `${remainingHours}h`;
    }
    default: {
      const mins = Math.floor(totalSeconds / secondsInMinute);
      return `${mins}m`;
    }
  }
}

interface ChartDataState {
  data: NormalizedChartData[];
  isLoading: boolean;
}

function ChartCard({
  configKey,
  config,
  period,
  tick,
}: {
  configKey: string;
  config: (typeof chartConfigs)[keyof typeof chartConfigs];
  period: string;
  tick: number;
}) {
  const [state, setState] = useState<ChartDataState>({
    data: [],
    isLoading: true,
  });
  const requestCountRef = useRef(0);

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    requestCountRef.current += 1;

    const startTime = performance.now();
    console.log(`[Chart:${configKey}] Request #${requestCountRef.current} START | Endpoint: ${config.endpoint} | Period: ${period}`);

    try {
      const { data, status } = await api.get(config.endpoint);
      const fetchTime = performance.now() - startTime;
      console.log(`[Chart:${configKey}] Request SUCCESS | Status: ${status} | Time: ${fetchTime.toFixed(2)}ms | Records: ${data.length}`);

      const raw = data as (BaseDataDTO | TiresDataDTO)[];
      const filtered = period === "all" ? raw : filterDataByPeriod(raw, period);
      const normalized = normalizeTimestamp(filtered, [...config.yKeys], new Date(), {
        skipDateFilter: true,
      });

      setState({ data: normalized, isLoading: false });
      console.log(`[Chart:${configKey}] Processed | Filtered: ${filtered.length} | Normalized: ${normalized.length}`);
    } catch (error) {
      const errorTime = performance.now() - startTime;
      console.error(`[Chart:${configKey}] Request ERROR | Time: ${errorTime.toFixed(2)}ms`, error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [config, configKey, period]);

  useEffect(() => {
    loadData();
  }, [loadData, tick]);

  const chartConfig = useMemo(
    () => buildChartConfig(config.yKeys),
    [config.yKeys]
  ) satisfies ChartConfig;

  const selectedOption = useMemo(
    () => chartOptions.find((o) => o.value === configKey),
    [configKey]
  );

  const xAxisFormatter = useMemo(
    () => (value: unknown) => formatSecondsByPeriod(value, period),
    [period]
  );

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{selectedOption?.label ?? configKey}</CardTitle>
          <CardDescription>
            {config.yKeys.map((k) => chartConfig[k]?.label ?? k).join(", ")} ao longo do tempo
          </CardDescription>
        </div>
        {state.isLoading && <Loading className="h-5 w-5" />}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={state.data}>
            <defs>
              {config.yKeys.map((key) => (
                <linearGradient key={key} id={`fill-${configKey}-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
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
              tickFormatter={xAxisFormatter}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const createdAt = payload?.[0]?.payload?.created_at ?? payload?.[0]?.payload;
                    return xAxisFormatter(createdAt);
                  }}
                  indicator="dot"
                />
              }
            />
            {config.yKeys.map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`url(#fill-${configKey}-${key})`}
                stroke={`var(--color-${key})`}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function Charts() {
  const [period, setPeriod] = useState<string>("all");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const configKeys = useMemo(
    () => Object.keys(chartConfigs) as (keyof typeof chartConfigs)[],
    []
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gráficos</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px] rounded-lg" aria-label="Período">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {periodOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {configKeys.map((configKey) => {
          const config = chartConfigs[configKey];
          return (
            <ChartCard
              key={configKey}
              configKey={configKey}
              config={config}
              period={period}
              tick={tick}
            />
          );
        })}
      </div>
    </div>
  );
}
