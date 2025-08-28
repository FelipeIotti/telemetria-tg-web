import { ChartData } from "@/components/chart-data";

export function Charts() {
  return (
    <div className="flex w-full  flex-col gap-8">
      <h1 className="text-3xl font-bold">Gráficos</h1>

      <div className="w-full">
        <ChartData />
      </div>
    </div>
  );
}
