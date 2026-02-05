import type { GpsDetailsDataDTO } from "@/dtos/details-gps-data-DTO";
import type { GpsDTO } from "@/dtos/gps-DTO";
import type { LocationCoordsDTO } from "@/dtos/location-coords-DTO";
import { MapStyles } from "@/shared/constants/map-styles";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { DetailsDataButton } from "./buttons/details-data-button";
import { MapTypeButton } from "./buttons/map-type-button";
import { OrientationButton } from "./buttons/orientation-button";
import { ReloadButton } from "./buttons/reload-button";
import { UserLocationButton } from "./buttons/user-location-button";
import { ZoomButton } from "./buttons/zoom-buttons";
import "./styles.css";

// Helper para criar elemento de marcador com ícone SVG
const createMarkerElement = (color: string, iconSvg: string) => {
  const el = document.createElement("div");
  el.className = `w-6 h-6 ${color}`;
  el.innerHTML = iconSvg;
  return el;
};

// SVGs dos ícones
const flagIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M131.79,69.65l-43.63,96A4,4,0,0,1,84.52,168H28.23a8.2,8.2,0,0,1-6.58-3.13,8,8,0,0,1,.43-10.25L57.19,116,22.08,77.38a8,8,0,0,1-.43-10.26A8.22,8.22,0,0,1,28.23,64h99.92A4,4,0,0,1,131.79,69.65ZM237.56,42.24A8.3,8.3,0,0,0,231.77,40H168a8,8,0,0,0-7.28,4.69l-42.57,93.65a4,4,0,0,0,3.64,5.66h57.79l-34.86,76.69a8,8,0,1,0,14.56,6.62l80-176A8,8,0,0,0,237.56,42.24Z"></path></svg>  
`;

const carIconSvg = `

<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M240,104H229.2L201.42,41.5A16,16,0,0,0,186.8,32H69.2a16,16,0,0,0-14.62,9.5L26.8,104H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16v-8h96v8a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V120h8a8,8,0,0,0,0-16ZM80,152H56a8,8,0,0,1,0-16H80a8,8,0,0,1,0,16Zm120,0H176a8,8,0,0,1,0-16h24a8,8,0,0,1,0,16ZM44.31,104,69.2,48H186.8l24.89,56Z"></path></svg>
   `;

interface MapProps {
  data: GpsDTO[];
  detailsData: GpsDetailsDataDTO;
  handleLoadData(): Promise<void>;
}

export function Map({ data, detailsData, handleLoadData }: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentLocation, setCurrentLocation] =
    useState<LocationCoordsDTO | null>(null);
  const [isNorth, setIsNorth] = useState(true);

  const startMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const carMarkerRef = useRef<mapboxgl.Marker | null>(null);

  function checkOrientation() {
    if (mapRef.current) {
      const bearing = Math.abs(mapRef.current.getBearing());
      setIsNorth(bearing < 1);
    }
  }

  const initializeMap = useCallback(() => {
    if (!import.meta.env.VITE_MAP_BOX_API_KEY || mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_API_KEY;

    // Usa o primeiro ponto dos dados se disponível, senão usa um centro padrão
    const centerLng = data?.[0]?.longitude ?? -49.024149;
    const centerLat = data?.[0]?.latitude ?? -22.358062;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: MapStyles.light,
      center: [centerLng, centerLat],
      zoom: 14,
      projection: "globe",
    });

    mapRef.current.on("load", () => {
      if (data.length >= 2) {
        drawRouteAndMarkers(data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawRouteAndMarkers = useCallback((data: GpsDTO[]) => {
    if (!mapRef.current || data.length < 2) return;
    const map = mapRef.current;

    // Atualiza o centro do mapa para o primeiro ponto
    if (data[0]) {
      map.flyTo({
        center: [data[0].longitude, data[0].latitude],
        zoom: 14,
        duration: 1000,
      });
    }

    // rota
    const routeGeoJSON: GeoJSON.GeoJSON = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: data.map((p) => [p.longitude, p.latitude]),
      },
      properties: {},
    };

    if (map.getSource("route")) {
      (map.getSource("route") as mapboxgl.GeoJSONSource).setData(routeGeoJSON);
    } else {
      map.addSource("route", { type: "geojson", data: routeGeoJSON });
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#eee415", "line-width": 4 },
      });
    }

    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];
    setCurrentLocation(lastPoint);

    if (!startMarkerRef.current) {
      const el = createMarkerElement("text-green-600", flagIconSvg);
      startMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([firstPoint.longitude, firstPoint.latitude])
        .addTo(map);
    } else {
      startMarkerRef.current.setLngLat([
        firstPoint.longitude,
        firstPoint.latitude,
      ]);
    }

    if (!carMarkerRef.current) {
      const el = createMarkerElement("text-blue-600", carIconSvg);
      carMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([lastPoint.longitude, lastPoint.latitude])
        .addTo(map);
    } else {
      carMarkerRef.current.setLngLat([lastPoint.longitude, lastPoint.latitude]);
    }
  }, []);

  useEffect(() => {
    if (mapRef.current?.loaded() && data.length >= 2) {
      drawRouteAndMarkers(data);
    } else if (mapRef.current && !mapRef.current.loaded() && data.length >= 2) {
      // Se o mapa ainda não carregou mas temos dados, aguardar o evento 'load'
      const handleLoad = () => {
        drawRouteAndMarkers(data);
      };
      mapRef.current.once("load", handleLoad);
      return () => {
        mapRef.current?.off("load", handleLoad);
      };
    }
  }, [data, drawRouteAndMarkers, mapRef.current?.style]);

  useEffect(() => {
    initializeMap();
    return () => {
      mapRef.current?.remove();
    };
  }, [initializeMap]);

  return (
    <div
      className="relative w-full h-full"
      onMouseMoveCapture={checkOrientation}
    >
      <div ref={mapContainerRef} className="h-full w-full" />

      <div className="absolute top-2 left-2 ">
        <DetailsDataButton data={detailsData} />
      </div>
      <div className="absolute top-2 right-2 ">
        <MapTypeButton mapRef={mapRef} />
      </div>
      <div className="absolute bottom-2 left-2">
        <ReloadButton handleLoadData={handleLoadData} />
      </div>
      <div className="absolute bottom-2 right-2 flex flex-col gap-3">
        <UserLocationButton
          mapRef={mapRef}
          currentLocation={currentLocation}
          setCurrentLocation={setCurrentLocation}
        />
        <ZoomButton type="in" mapRef={mapRef} />
        <ZoomButton type="out" mapRef={mapRef} />
        <OrientationButton mapRef={mapRef} isNorth={isNorth} />
      </div>
    </div>
  );
}
