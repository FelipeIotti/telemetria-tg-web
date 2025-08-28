import { Minus, Plus } from "lucide-react";
import { type RefObject } from "react";

interface ZoomButtonProps {
  type: "in" | "out";
  mapRef: RefObject<mapboxgl.Map | null>;
}

export function ZoomButton({ type, mapRef }: ZoomButtonProps) {
  function zoom() {
    if (mapRef?.current) {
      if (type === "in") {
        mapRef.current.zoomIn();
      } else if (type === "out") {
        mapRef.current.zoomOut();
      }
    }
  }

  const zoomStyles = {
    in: {
      Icon: Plus,
    },
    out: {
      Icon: Minus,
    },
  };

  const { Icon } = zoomStyles[type];

  const baseStyle = `bg-white rounded p-2 shadow cursor-pointer`;

  return (
    <div className={baseStyle} onClick={zoom}>
      <Icon />
    </div>
  );
}
