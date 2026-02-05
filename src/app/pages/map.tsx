import { Map } from "@/app/components/map";
import { api } from "@/controllers/api";
import type { GpsDetailsDataDTO } from "@/dtos/details-gps-data-DTO";
import type { GpsDTO } from "@/dtos/gps-DTO";
import { calculateDetailsData } from "@/shared/utils/calculate-details-data";
import { useEffect, useState } from "react";



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

    
      if (data.length > 1) {
        calculateDetailsData(data, setDetailsData);
      }

      setBaseData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    handleLoadData();

    // const interval = setInterval(() => {
    //   handleLoadData();
    // }, 1000);

    // return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex w-full h-full rounded border border-gray-300 shadow">
     
        <Map
          data={baseData}
          detailsData={detailsData}
          handleLoadData={handleLoadData}
        />
    
    </div>
  );
}


