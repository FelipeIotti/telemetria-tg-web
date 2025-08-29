import { Map } from "@/app/components/map";
import { api } from "@/controllers/api";
import type { GpsDetailsDataDTO } from "@/dtos/details-gps-data-DTO";
import type { GpsDTO } from "@/dtos/gps-DTO";
import { calculateDetailsData } from "@/shared/utils/calculate-details-data";
import { useEffect, useState } from "react";
import { Loading } from "../components/loading";

export function MapPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [baseData, setBaseData] = useState<GpsDTO[]>([]);

  const [detailsData, setDetailsData] = useState<GpsDetailsDataDTO>({
    averageSpeed: 0,
    distance: 0,
    time: "00:00:00",
    turns: 0,
  });
  async function handleLoadData() {
    try {
      setIsLoading(true);
      const { data } = await api.get("/gps");

      const filteredData = data.filter(
        (point: GpsDTO) =>
          Number(point.latitude) !== 0 && Number(point.longitude) !== 0
      );

      if (filteredData.length > 1) {
        calculateDetailsData(filteredData, setDetailsData);
      }

      setBaseData(filteredData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    handleLoadData();
  }, []);
  return (
    <div className="flex w-full h-full rounded border border-gray-300 shadow">
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-full">
          <Loading className="h-15 w-15" />
        </div>
      ) : (
        <Map
          data={baseData}
          detailsData={detailsData}
          handleLoadData={handleLoadData}
        />
      )}
    </div>
  );
}
