import { Map } from "@/app/components/map";
import type { GpsDetailsDataDTO } from "@/dtos/details-gps-data-DTO";
import type { GpsDTO } from "@/dtos/gps-DTO";
import { api } from "@/services/api";
import { calculateDetailsData } from "@/shared/utils/calculate-details-data";
import { usePolling } from "@/hooks/use-polling";
import { useCallback, useMemo, useRef, useState } from "react";

export function MapPage() {
  const [, setTick] = useState(0);
  const detailsDataRef = useRef<GpsDetailsDataDTO>({
    averageSpeed: 0,
    distance: 0,
    time: "00:00:00",
    turns: 0,
  });

  const { data: gpsList, refetch } = usePolling<GpsDTO[]>({
    fetchFn: async () => {
      const response = await api.get<GpsDTO[]>("/gps");
      return response.data;
    },
    interval: 5000,
    onRequest: (requestId) => {
      console.log(`[Map] Request #${requestId} - START`);
    },
    onSuccess: (requestId, fetchTime, data) => {
      console.log(`[Map] Request #${requestId} - SUCCESS | Time: ${fetchTime.toFixed(2)}ms | Records: ${data.length}`);
    },
    onError: (requestId, errorTime, error) => {
      console.error(`[Map] Request #${requestId} - ERROR | Time: ${errorTime.toFixed(2)}ms`, error);
    },
  });

  const gpsData = useMemo(() => gpsList || [], [gpsList]);

  const calculateAndUpdate = useCallback((data: GpsDTO[]) => {
    if (data.length > 1) {
      detailsDataRef.current = calculateDetailsData(data);
      setTick((t) => t + 1);
    }
  }, []);

  useMemo(() => {
    calculateAndUpdate(gpsData);
  }, [gpsData, calculateAndUpdate]);

  const detailsData = detailsDataRef.current;

  const mapProps = useMemo(() => ({
    data: gpsData,
    detailsData,
    handleLoadData: refetch,
  }), [gpsData, detailsData, refetch]);

  return (
    <div className="flex w-full h-full rounded border border-gray-300 shadow">
      <Map {...mapProps} />
    </div>
  );
}
