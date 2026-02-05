import type { LocationCoordsDTO } from "@/dtos/location-coords-DTO";
import { LocateFixed } from "lucide-react";
import mapboxgl from "mapbox-gl";
import { type RefObject, useRef } from "react";

interface UserLocationButtonProps {
  mapRef: RefObject<mapboxgl.Map | null>;
  currentLocation: LocationCoordsDTO | null;
  setCurrentLocation: (value: LocationCoordsDTO | null) => void;
}

export function UserLocationButton({
  mapRef,
  currentLocation,
  setCurrentLocation,
}: UserLocationButtonProps) {
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  function createCustomMarker() {
    const markerElement = document.createElement("div");
    markerElement.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="rgb(0, 149, 197)"/>
        <path d="M13 4.069V2H11V4.069C9.2403 4.29368 7.60497 5.09617 6.35057 6.35057C5.09617 7.60497 4.29368 9.2403 4.069 11H2V13H4.069C4.29335 14.7598 5.09574 16.3953 6.3502 17.6498C7.60466 18.9043 9.24017 19.7066 11 19.931V22H13V19.931C14.7599 19.7068 16.3955 18.9045 17.65 17.65C18.9045 16.3955 19.7068 14.7599 19.931 13H22V11H19.931C19.7066 9.24017 18.9043 7.60466 17.6498 6.3502C16.3953 5.09574 14.7598 4.29335 13 4.069ZM12 18C8.691 18 6 15.309 6 12C6 8.691 8.691 6 12 6C15.309 6 18 8.691 18 12C18 15.309 15.309 18 12 18Z" fill="rgb(0, 149, 197)"/>
      </svg>
    `;
    return markerElement;
  }

  function handleLocateUser() {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        //const { latitude, longitude } = position.coords;
        const fakeUserLocation = {latitude: -22.358621, longitude: -49.023953}
        setCurrentLocation(fakeUserLocation);

        if (mapRef.current) {
          mapRef.current.flyTo({ center: [fakeUserLocation.longitude, fakeUserLocation.latitude], zoom: 14 });

          if (!userMarkerRef.current) {
            userMarkerRef.current = new mapboxgl.Marker({
              element: createCustomMarker(),
            })
              .setLngLat([fakeUserLocation.longitude, fakeUserLocation.latitude])
              .addTo(mapRef.current);
          } else {
            userMarkerRef.current.setLngLat([fakeUserLocation.longitude, fakeUserLocation.latitude]);
          }
        }
      },
      (error) => {
        console.log("Erro ao obter localização:", error);
        alert("Não foi possível obter sua localização.");
      }
    );
  }

  return (
    <div
      className="bg-white rounded p-2 shadow cursor-pointer"
      onClick={handleLocateUser}
    >
      <LocateFixed
        className={currentLocation ? "stroke-primary" : "stroke-gray-200"}
      />
    </div>
  );
}
