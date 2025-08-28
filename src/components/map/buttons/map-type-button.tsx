import { useState, type RefObject } from "react";

const MapStyles = {
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  light: "mapbox://styles/mapbox/standard",
  dark: "mapbox://styles/mapbox/navigation-night-v1",
};

export type MapStylesDTO = keyof typeof MapStyles;

interface MapTypeButtonProps {
  mapRef: RefObject<mapboxgl.Map | null>;
}

export function MapTypeButton({ mapRef }: MapTypeButtonProps) {
  const [mapStyle, setMapStyle] = useState<MapStylesDTO>("light");

  function handleMapStyleChange(style: MapStylesDTO) {
    if (mapRef.current) {
      mapRef.current.setStyle(MapStyles[style]);
      setMapStyle(style);
    }
  }

  return (
    <div className="absolute top-2 right-2 bg-white rounded p-[2px] shadow-lg ">
      <div className="flex gap-2 rounded">
        <div
          className={`px-2 py-1 cursor-pointer ${
            mapStyle !== "satellite" ? "bg-gray-300 rounded" : ""
          }`}
          onClick={() => handleMapStyleChange("light")}
        >
          <p>Mapa</p>
        </div>
        <div
          className={`px-2 py-1 cursor-pointer ${
            mapStyle === "satellite" ? "bg-gray-300 rounded" : ""
          }`}
          onClick={() => handleMapStyleChange("satellite")}
        >
          <p>Satelite</p>
        </div>
      </div>
    </div>
  );
}
