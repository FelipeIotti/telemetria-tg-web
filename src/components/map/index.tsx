import type { LocationCoordsDTO } from "@/dtos/location-coords-DTO";
import { MapStyles } from "@/shared/constants/map-styles";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapTypeButton } from "./buttons/map-type-button";
import { OrientationButton } from "./buttons/orientation-button";
import { UserLocationButton } from "./buttons/user-location-button";
import { ZoomButton } from "./buttons/zoom-buttons";
import "./styles.css";

export function Map() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [isNorth, setIsNorth] = useState(true);
  const [currentLocation, setCurrentLocation] =
    useState<LocationCoordsDTO | null>(null);

  function checkOrientation() {
    if (mapRef.current) {
      const bearing = Math.abs(mapRef.current.getBearing());
      setIsNorth(bearing < 1);
    }
    if (!isUserCentered()) {
      setCurrentLocation(null);
    }
  }

  function isUserCentered(): boolean {
    if (!mapRef.current || !currentLocation) return false;
    const center = mapRef.current.getCenter();
    return (
      Math.abs(center.lat - currentLocation.latitude) < 0.0001 &&
      Math.abs(center.lng - currentLocation.longitude) < 0.0001
    );
  }

  const initializeMap = useCallback(async () => {
    if (!import.meta.env.VITE_MAP_BOX_API_KEY || mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_API_KEY;

    const getUserLocation = () =>
      new Promise<GeolocationCoordinates | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          (error) => {
            console.log("Erro ao obter localização:", error);
            alert("Não foi possível obter sua localização.");
            resolve(null);
          }
        );
      });

    const userLocation = await getUserLocation();

    const centerCoordinates: [number, number] = userLocation
      ? [userLocation.longitude, userLocation.latitude]
      : [-49.504039, -14.639174];

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: MapStyles.light,
      center: centerCoordinates,
      zoom: userLocation ? 12 : 3,
      projection: "globe",
    });
  }, []);

  useEffect(() => {
    initializeMap();
    return () => {
      mapRef.current?.remove();
    };
  }, [initializeMap]);

  return (
    <div
      className={`relative w-full h-full`}
      onMouseMoveCapture={checkOrientation}
    >
      <div ref={mapContainerRef} className={`h-full w-full`} />

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
