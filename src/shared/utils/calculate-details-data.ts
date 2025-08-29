import type { GpsDetailsDataDTO } from "@/dtos/details-gps-data-DTO";
import type { GpsDTO } from "@/dtos/gps-DTO";
import type { Dispatch, SetStateAction } from "react";
import { formatTime } from "./format-time";
import { haversineDistance } from "./haversine-distance";

export function calculateDetailsData(
  data: GpsDTO[],
  setDetailsData: Dispatch<SetStateAction<GpsDetailsDataDTO>>
) {
  const totalDistance = data.reduce((acc: number, point: GpsDTO, i: number) => {
    if (i === 0) return 0;
    const prev = data[i - 1];
    return (
      acc +
      haversineDistance(
        Number(prev.latitude),
        Number(prev.longitude),
        Number(point.latitude),
        Number(point.longitude)
      )
    );
  }, 0);

  const velocities = data.map((point: GpsDTO) => Number(point.velocity));
  const avgSpeed =
    velocities.reduce((a: number, b: number) => a + b, 0) / velocities.length;

  const startTime = new Date(data[0].created_at).getTime();
  const endTime = new Date(data[data.length - 1].created_at).getTime();
  const timeInSeconds = Math.floor((endTime - startTime) / 1000);

  const initialPoint = data[0];
  let lastLapTime = startTime;
  let laps = 0;

  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const currentTime = new Date(current.created_at).getTime();

    const distance = haversineDistance(
      initialPoint.latitude,
      initialPoint.longitude,
      current.latitude,
      current.longitude
    );

    const timeSinceLastLap = (currentTime - lastLapTime) / 1000;

    if (distance <= 0.03 && timeSinceLastLap >= 60) {
      laps++;
      lastLapTime = currentTime;
    }
  }

  setDetailsData({
    averageSpeed: Number(avgSpeed.toFixed(1)),
    distance: Number(totalDistance.toFixed(2)),
    time: formatTime(timeInSeconds),
    turns: laps,
  });
}
