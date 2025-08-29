import { CardData } from "@/app/components/card-data";
import { api } from "@/controllers/api";
import type { BaseDataDTO } from "@/dtos/base-data-DTO";
import { useEffect, useState } from "react";

export function BaseData() {
  const [baseData, setBaseData] = useState<BaseDataDTO>({} as BaseDataDTO);

  useEffect(() => {
    async function handleLoadData() {
      try {
        const { data } = await api.get("/base-data");
        setBaseData(data[data.length - 1]);
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    }
    handleLoadData();

    // const interval = setInterval(() => {
    //   handleLoadData();
    // }, 1000);

    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Dados base</h1>

      <div className="w-full flex flex-wrap gap-3">
        <CardData value={baseData.velocity} type="km/h" />
        <CardData value={baseData.rpm} type="rpm" />
        <CardData value={baseData.temperature} type="ºC" />
        <CardData value={baseData.fuel} type="/4" />
      </div>
    </div>
  );
}
