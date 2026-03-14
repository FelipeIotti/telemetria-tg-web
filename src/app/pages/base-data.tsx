import { CardData } from "@/app/components/card-data";
import type { BaseDataDTO } from "@/dtos/base-data-DTO";
import { api } from "@/services/api";
import { usePolling } from "@/hooks/use-polling";

export function BaseData() {
  const { data: baseData, isLoading } = usePolling<BaseDataDTO>({
    fetchFn: async () => {
      const response = await api.get<BaseDataDTO>("/base-data/last");
      return response.data;
    },
    interval: 1000,
    onRequest: (requestId) => {
      console.log(`[BaseData] Request #${requestId} - START`);
    },
    onSuccess: (requestId, fetchTime) => {
      console.log(`[BaseData] Request #${requestId} - SUCCESS | Time: ${fetchTime.toFixed(2)}ms`);
    },
    onError: (requestId, errorTime, error) => {
      console.error(`[BaseData] Request #${requestId} - ERROR | Time: ${errorTime.toFixed(2)}ms`, error);
    },
  });

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex items-center gap-8">
        <h1 className="text-3xl font-bold">Dados Base</h1>
        {isLoading && <div className="h-5 w-5 border-2 border-t-transparent border-primary rounded-full animate-spin" />}
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <CardData value={baseData?.velocity} type="km/h" />
        <CardData value={baseData?.rpm} type="rpm" />
        <CardData value={baseData?.temperature} type="ºC" />
        <CardData value={baseData?.fuel} type="/4" />
      </div>
    </div>
  );
}
