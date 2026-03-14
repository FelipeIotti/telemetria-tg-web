import { CardData } from "@/app/components/card-data";
import { TireTypeSelector } from "@/app/components/tire-type-selector";
import type { TiresDataDTO } from "@/dtos/tires-data-DTO";
import type { TiresTypeDTO } from "@/dtos/tires-type-DTO";
import { api } from "@/services/api";
import { usePolling } from "@/hooks/use-polling";
import { useMemo, useState } from "react";

export function Tires() {
  const [tiresType, setTiresType] = useState<TiresTypeDTO>("Psi");

  const { data: tiresData, isLoading } = usePolling<TiresDataDTO>({
    fetchFn: async () => {
      const response = await api.get<TiresDataDTO>("/tires/last");
      return response.data;
    },
    interval: 1000,
    onRequest: (requestId) => {
      console.log(`[Tires] Request #${requestId} - START`);
    },
    onSuccess: (requestId, fetchTime) => {
      console.log(`[Tires] Request #${requestId} - SUCCESS | Time: ${fetchTime.toFixed(2)}ms`);
    },
    onError: (requestId, errorTime, error) => {
      console.error(`[Tires] Request #${requestId} - ERROR | Time: ${errorTime.toFixed(2)}ms`, error);
    },
  });

  const cards = useMemo(() => [
    { value: tiresData?.[tiresType === "Psi" ? "press_tire_fl" : "temp_tire_fl"], type: tiresType, tireType: "Pneu dianteiro esquerdo", key: "fl" },
    { value: tiresData?.[tiresType === "Psi" ? "press_tire_fr" : "temp_tire_fr"], type: tiresType, tireType: "Pneu dianteiro direito", key: "fr" },
    { value: tiresData?.[tiresType === "Psi" ? "press_tire_bl" : "temp_tire_bl"], type: tiresType, tireType: "Pneu traseiro esquerdo", key: "bl" },
    { value: tiresData?.[tiresType === "Psi" ? "press_tire_br" : "temp_tire_br"], type: tiresType, tireType: "Pneu traseiro direito", key: "br" },
  ], [tiresData, tiresType]);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex items-center gap-8">
        <h1 className="text-3xl font-bold">Pneus</h1>
        {isLoading && <div className="h-5 w-5 border-2 border-t-transparent border-primary rounded-full animate-spin" />}
      </div>

      <TireTypeSelector tiresType={tiresType} setTiresType={setTiresType} />
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <CardData key={card.key} value={Number(card.value)} type={card.type} tireType={card.tireType} />
        ))}
      </div>
    </div>
  );
}
