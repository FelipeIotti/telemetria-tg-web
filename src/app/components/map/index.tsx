import type { GpsDetailsDataDTO } from "@/dtos/details-gps-data-DTO";
import type { GpsDTO } from "@/dtos/gps-DTO";
import type { LocationCoordsDTO } from "@/dtos/location-coords-DTO";
import { MapStyles } from "@/shared/constants/map-styles";
import { Car, Flag } from "lucide-react"; // Ícones
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

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: MapStyles.light,
      center: [data?.[0]?.longitude ?? 0, data?.[0]?.latitude ?? 0],
      zoom: 14,
      projection: "globe",
    });

    mapRef.current.on("load", () => {
      drawRouteAndMarkers(data);
    });
  }, []);

  const drawRouteAndMarkers = useCallback((data: GpsDTO[]) => {
    if (!mapRef.current || data.length < 2) return;
    const map = mapRef.current;

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
        paint: { "line-color": "#3b82f6", "line-width": 4 },
      });
    }

    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];
    setCurrentLocation(lastPoint);

    if (!startMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "w-6 h-6 text-green-600";
      el.innerHTML = (Flag({ size: 24, strokeWidth: 2 }) as any).props.children;
      startMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([firstPoint.longitude, firstPoint.latitude])
        .addTo(map);
    } else {
      startMarkerRef.current.setLngLat([
        firstPoint.longitude,
        firstPoint.latitude,
      ]);
    }

    // marcador final (car)
    if (!carMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "w-6 h-6 text-blue-600";
      el.innerHTML = (Car({ size: 24, strokeWidth: 2 }) as any).props.children;
      carMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([lastPoint.longitude, lastPoint.latitude])
        .addTo(map);
    } else {
      carMarkerRef.current.setLngLat([lastPoint.longitude, lastPoint.latitude]);
    }
  }, []);

  useEffect(() => {
    if (mapRef.current?.loaded()) {
      drawRouteAndMarkers(data);
    }
  }, [data, drawRouteAndMarkers]);

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
