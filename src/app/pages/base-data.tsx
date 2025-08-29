import { CardData } from "@/app/components/card-data";
import { api } from "@/controllers/api";
import type { BaseDataDTO } from "@/dtos/base-data-DTO";
import { useEffect, useState } from "react";
import { Loading } from "../components/loading";

export function BaseData() {
  const [isLoading, setIsLoading] = useState(false);
  const [baseData, setBaseData] = useState<BaseDataDTO>({} as BaseDataDTO);

  useEffect(() => {
    async function handleLoadData() {
      try {
        setIsLoading(true);
        const { data } = await api.get("/base-data");
        setBaseData(data[data.length - 1]);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    handleLoadData();

    // const interval = setInterval(() => {
    //   handleLoadData();
    // }, 1000);

    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex items-center gap-8">
        <h1 className="text-3xl font-bold">Dados Base</h1>

        {isLoading && <Loading className="h-5 w-5 border-2" />}
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <CardData value={Number(baseData.velocity)} type="km/h" />
        <CardData value={Number(baseData.rpm)} type="rpm" />
        <CardData value={Number(baseData.temperature)} type="ºC" />
        <CardData value={Number(baseData.fuel)} type="/4" />
      </div>
    </div>
  );
}
