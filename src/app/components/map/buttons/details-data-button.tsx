import type { GpsDetailsDataDTO } from "@/dtos/details-gps-data-DTO";
import { Activity } from "lucide-react";
import { useState } from "react";

interface DetailsDataButton {
  data: GpsDetailsDataDTO;
}

export function DetailsDataButton({ data }: DetailsDataButton) {
  const [show, setShow] = useState(false);
  return (
    <div
      onClick={() => setShow(!show)}
      className="bg-white rounded p-2 shadow cursor-pointer"
    >
      {!show ? (
        <Activity />
      ) : (
        <div>
          <p>Velocidade média: {data.averageSpeed} km/h</p>
          <p>Distância: {data.distance} Km</p>
          <p>Tempo: {"00:03:42"}</p>
          <p>Voltas: {1}</p>
        </div>
      )}
    </div>
  );
}
