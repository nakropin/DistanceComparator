/* import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import { useGeolocation } from "react-use";
import { csv } from "d3-fetch";

interface Ort {
  plz: string;
  name: string;
  lat: number;
  lng: number;
}

interface Route {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  autoDauer: number;
  bahnDauer: number;
}

const colorScale = (time: number): string => {
  if (time <= 20) {
    return "green";
  } else if (time <= 45) {
    return "yellow";
  } else {
    return "red";
  }
};

const DashboardComponent: React.FC = () => {
  const [postleitzahlen, setPostleitzahlen] = useState<Ort[]>([]);
  const [bahnrouten, setBahnrouten] = useState<Route[]>([]);
  const { latitude, longitude } = useGeolocation();

  useEffect(() => {
    const fetchPostleitzahlen = async () => {
      const data = await csv<Ort>("/api/postleitzahlen");
      setPostleitzahlen(data);
    };
    fetchPostleitzahlen();

    const fetchBahnrouten = async () => {
      const data = await csv<Route>("/api/bahnrouten");
      setBahnrouten(data);
    };
    fetchBahnrouten();
  }, []);

  return (
    <MapContainer center={[latitude, longitude]} zoom={8}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {postleitzahlen.map((ort) => (
        <Marker position={[ort.lat, ort.lng]} key={ort.plz}>
          <Popup>
            {ort.name} ({ort.plz})
          </Popup>
        </Marker>
      ))}

      {bahnrouten.map((route) => (
        <Polyline
          positions={[
            [route.startLat, route.startLng],
            [route.endLat, route.endLng],
          ]}
          color={colorScale(route.autoDauer - route.bahnDauer)}
          weight={4}
          opacity={0.5}
          key={`${route.startLat}-${route.startLng}-${route.endLat}-${route.endLng}`}
        />
      ))}
    </MapContainer>
  );
};
export default DashboardComponent; */
