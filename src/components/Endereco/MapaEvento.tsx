"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/css/leaflet.css";

const marcadorIcone = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type MapaEventoProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
};

function CentralizarMapa({
  latitude,
  longitude,
  zoom,
}: {
  latitude: number;
  longitude: number;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], zoom);
  }, [latitude, longitude, zoom, map]);

  return null;
}

/**
 * Mapa OSM com pin controlado por coordenadas (sem iframe do Google).
 */
export default function MapaEvento({
  latitude,
  longitude,
  zoom = 17,
}: MapaEventoProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={zoom}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={marcadorIcone} />
      <CentralizarMapa latitude={latitude} longitude={longitude} zoom={zoom} />
    </MapContainer>
  );
}
