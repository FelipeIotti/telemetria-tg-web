import { CardData } from "@/app/components/card-data";
import type { BaseDataDTO } from "@/dtos/base-data-DTO";
import { api } from "@/services/api";
import { getFuelLevel, initFuelTracking, resetFuel } from "@/shared/utils/fuel-tracker";
import { useEffect, useState } from "react";
import { usePolling } from "@/hooks/use-polling";

const FUEL_UPDATE_INTERVAL = 60000;

export function BaseData() {
  const [fuelLevel, setFuelLevel] = useState(4);

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

  useEffect(() => {
    initFuelTracking();
    setFuelLevel(getFuelLevel());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFuelLevel(getFuelLevel());
    }, FUEL_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleResetFuel = () => {
    resetFuel();
    setFuelLevel(4);
  };

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
        <CardData value={fuelLevel} type="/4" />
      </div>

      <button
        onClick={handleResetFuel}
        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 w-fit"
      >
        Resetar Combustível
      </button>
    </div>
  );
}
