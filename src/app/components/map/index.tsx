import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GpsDetailsDataDTO } from "@/dtos/details-gps-data-DTO";
import type { GpsDTO } from "@/dtos/gps-DTO";
import type { LocationCoordsDTO } from "@/dtos/location-coords-DTO";
import { MAP_ICONS, createMarkerElement } from "@/shared/constants/map-icons";
import { MapStyles } from "@/shared/constants/map-styles";

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
  handleLoadData: () => Promise<void>;
}

const DEFAULT_CENTER: [number, number] = [-49.024149, -22.358062];

function buildRouteGeoJSON(gpsData: GpsDTO[]): GeoJSON.Feature {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: gpsData.map((p) => [p.longitude, p.latitude]),
    },
    properties: {},
  };
}

function addRouteLayer(map: mapboxgl.Map, routeGeoJSON: GeoJSON.Feature) {
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
}

function updateMarkerPosition(
  marker: mapboxgl.Marker | null,
  position: { longitude: number; latitude: number },
  iconSvg: string,
  colorClass: string,
  map: mapboxgl.Map
): mapboxgl.Marker {
  if (!marker) {
    const el = createMarkerElement(colorClass, iconSvg);
    return new mapboxgl.Marker({ element: el })
      .setLngLat([position.longitude, position.latitude])
      .addTo(map);
  }
  marker.setLngLat([position.longitude, position.latitude]);
  return marker;
}

function MapControls({
  mapRef,
  data,
  detailsData,
  handleLoadData,
}: {
  mapRef: React.RefObject<mapboxgl.Map | null>;
  data: GpsDTO[];
  detailsData: GpsDetailsDataDTO;
  handleLoadData: () => Promise<void>;
}) {
  const [currentLocation, setCurrentLocation] = useState<LocationCoordsDTO | null>(null);
  const [isNorth, setIsNorth] = useState(true);

  const startMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const carMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const prevDataLengthRef = useRef(0);

  const checkOrientation = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      setIsNorth(Math.abs(map.getBearing()) < 1);
    }
  }, [mapRef]);

  const drawRouteAndMarkers = useCallback((gpsData: GpsDTO[]) => {
    const map = mapRef.current;
    if (!map || gpsData.length < 2) return;

    const firstPoint = gpsData[0];
    const lastPoint = gpsData[gpsData.length - 1];

    if (prevDataLengthRef.current === 0 || gpsData.length > prevDataLengthRef.current) {
      map.flyTo({
        center: [firstPoint.longitude, firstPoint.latitude],
        zoom: 14,
        duration: 1000,
      });
    }
    prevDataLengthRef.current = gpsData.length;

    const routeGeoJSON = buildRouteGeoJSON(gpsData);
    addRouteLayer(map, routeGeoJSON);

    setCurrentLocation(lastPoint);
    startMarkerRef.current = updateMarkerPosition(
      startMarkerRef.current,
      firstPoint,
      MAP_ICONS.flag,
      "text-green-600",
      map
    );
    carMarkerRef.current = updateMarkerPosition(
      carMarkerRef.current,
      lastPoint,
      MAP_ICONS.car,
      "text-blue-600",
      map
    );
  }, [mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || data.length < 2) return;

    drawRouteAndMarkers(data);
  }, [data, drawRouteAndMarkers, mapRef]);

  const controls = useMemo(() => (
    <>
      <div className="absolute top-2 left-2">
        <DetailsDataButton data={detailsData} />
      </div>
      <div className="absolute top-2 right-2">
        <MapTypeButton mapRef={mapRef} />
      </div>
      <div className="absolute bottom-2 left-2">
        <ReloadButton handleLoadData={handleLoadData} />
      </div>
      <div className="absolute bottom-2 right-2 flex flex-col gap-2">
        <UserLocationButton mapRef={mapRef} currentLocation={currentLocation} setCurrentLocation={setCurrentLocation} />
        <ZoomButton type="in" mapRef={mapRef} />
        <ZoomButton type="out" mapRef={mapRef} />
        <OrientationButton mapRef={mapRef} isNorth={isNorth} />
      </div>
    </>
  ), [mapRef, detailsData, handleLoadData, currentLocation, isNorth]);

  return (
    <div  onMouseMoveCapture={checkOrientation}>
     {controls}
    </div>
  );
}

export function Map({ data, detailsData, handleLoadData }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!import.meta.env.VITE_MAP_BOX_API_KEY) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_API_KEY;

    const center = data.length > 0
      ? [data[0].longitude, data[0].latitude] as [number, number]
      : DEFAULT_CENTER;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: MapStyles.light,
      center,
      zoom: 14,
      projection: "globe",
    });

    if (mapRef.current.loaded()) {
      setIsMapReady(true);
    } else {
      mapRef.current.on("load", () => {
        setIsMapReady(true);
      });
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
      {isMapReady && mapRef.current && (
        <MapControls
          mapRef={mapRef}
          data={data}
          detailsData={detailsData}
          handleLoadData={handleLoadData}
        />
      )}
    </div>
  );
}
