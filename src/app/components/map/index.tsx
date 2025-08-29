import type { GpsDTO } from "@/dtos/gps-DTO";
import type { LocationCoordsDTO } from "@/dtos/location-coords-DTO";
import { MapStyles } from "@/shared/constants/map-styles";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapTypeButton } from "./buttons/map-type-button";
import { OrientationButton } from "./buttons/orientation-button";
import { UserLocationButton } from "./buttons/user-location-button";
import { ZoomButton } from "./buttons/zoom-buttons";
import "./styles.css";

// Função para calcular distância haversine em km
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface MapProps {
  data: GpsDTO[];
}

export function Map({ data }: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [isNorth, setIsNorth] = useState(true);
  const [currentLocation, setCurrentLocation] =
    useState<LocationCoordsDTO | null>(null);
  const [laps, setLaps] = useState(0);

  // inicializa o mapa
  const initializeMap = useCallback(() => {
    if (!import.meta.env.VITE_MAP_BOX_API_KEY || mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_API_KEY;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: MapStyles.light,
      center: [-49.504039, -14.639174],
      zoom: 3,
      projection: "globe",
    });
  }, []);

  // checa orientação
  function checkOrientation() {
    if (mapRef.current) {
      const bearing = Math.abs(mapRef.current.getBearing());
      setIsNorth(bearing < 1);
    }
  }

  // quando "data" atualizar, redesenha a rota
  useEffect(() => {
    if (!mapRef.current || data.length < 2) return;

    const map = mapRef.current;

    // linha da rota
    const routeGeoJSON = {
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
        paint: { "line-color": "#ff0000", "line-width": 4 },
      });
    }
    // marcador da posição atual
    // marcador da posição atual
    const lastPoint = data[data.length - 1];
    setCurrentLocation(lastPoint);

    const carGeoJSON = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lastPoint.longitude, lastPoint.latitude],
      },
      properties: {}, // ✅ obrigatório
    };

    if (map.getSource("car")) {
      (map.getSource("car") as mapboxgl.GeoJSONSource).setData(carGeoJSON);
    } else {
      map.addSource("car", { type: "geojson", data: carGeoJSON });
      map.addLayer({
        id: "car",
        type: "circle",
        source: "car",
        paint: {
          "circle-radius": 6,
          "circle-color": "#007bff",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });
    }

    // lógica de voltas (finish line = primeiro ponto)
    if (data.length > 2) {
      const first = data[0];
      const dist = haversineDistance(
        first.latitude,
        first.longitude,
        lastPoint.latitude,
        lastPoint.longitude
      );

      const timeDiff =
        new Date(lastPoint.created_at).getTime() -
        new Date(first.created_at).getTime();

      if (dist <= 0.03 && timeDiff >= 60000) {
        setLaps((prev) => prev + 1);
      }
    }
  }, [data]);

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

      {/* UI */}
      <div className="absolute top-2 left-2 bg-white px-3 py-2 rounded shadow">
        <p className="font-bold">Voltas: {laps}</p>
      </div>

      <MapTypeButton mapRef={mapRef} />
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
