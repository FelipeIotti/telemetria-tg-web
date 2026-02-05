import { CardData } from "@/app/components/card-data";
import { TireTypeSelector } from "@/app/components/tire-type-selector";
import { api } from "@/controllers/api";
import type { TiresDataDTO } from "@/dtos/tires-data-DTO";
import type { TiresTypeDTO } from "@/dtos/tires-type-DTO";
import { useEffect, useState } from "react";
import { Loading } from "../components/loading";

export function Tires() {
  const [isLoading, setIsLoading] = useState(false);
  const [tiresType, setTiresType] = useState<TiresTypeDTO>("Psi");
  const [tiresData, setTiresData] = useState<TiresDataDTO>();

  useEffect(() => {
    async function handleLoadData() {
      try {
        setIsLoading(true);
        const { data } = await api.get("/tires");
      

        setTiresData(data[data.length - 1]);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    handleLoadData();

    const interval = setInterval(() => {
      handleLoadData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex items-center gap-8">
        <h1 className="text-3xl font-bold">Pneus</h1>

        {isLoading && <Loading className="h-5 w-5 border-2" />}
      </div>

      <TireTypeSelector tiresType={tiresType} setTiresType={setTiresType} />
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <CardData
          value={
            tiresType === "Psi"
              ? Number(tiresData?.press_tire_fl)
              : Number(tiresData?.temp_tire_fl)
          }
          type={tiresType}
          tireType="Pneu dianteiro esquerdo"
        />
        <CardData
          value={
            tiresType === "Psi"
              ? Number(tiresData?.press_tire_fr)
              : Number(tiresData?.temp_tire_fr)
          }
          type={tiresType}
          tireType="Pneu dianteiro direito"
        />
        <CardData
          value={
            tiresType === "Psi"
              ? Number(tiresData?.press_tire_bl)
              : Number(tiresData?.temp_tire_bl)
          }
          type={tiresType}
          tireType="Pneu traseiro esquerdo"
        />
        <CardData
          value={
            tiresType === "Psi"
              ? Number(tiresData?.press_tire_br)
              : Number(tiresData?.temp_tire_br)
          }
          type={tiresType}
          tireType="Pneu traseiro direito"
        />
      </div>
    </div>
  );
}
