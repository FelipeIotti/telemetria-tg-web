import { Compass } from "lucide-react";
import type { RefObject } from "react";

interface OrientationButtonProps {
  mapRef: RefObject<mapboxgl.Map | null>;
  isNorth: boolean;
}

export function OrientationButton({ mapRef, isNorth }: OrientationButtonProps) {
  function fixOrientation() {
    if (mapRef.current) {
      mapRef.current.easeTo({
        bearing: 0,
        pitch: 0,
        duration: 1000,
      });
    }
  }

  const baseStyle = `bg-white rounded p-2 shadow cursor-pointer`;

  return (
    <div className={baseStyle} onClick={fixOrientation}>
      <Compass className={isNorth ? "stroke-primary" : "stroke-gray-300"} />
    </div>
  );
}
