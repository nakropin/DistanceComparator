import React, { useRef, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// @ts-ignore
import final from "@/assets/zipcodes.nl.json";
import netherlandsGEO from "@/assets/provinces.json";

type Props = {
  tolerance: number;
  onMapReady: () => void;
  displayLines: boolean;
};

type ZipCodeData = {
  country_code: string;
  zipcode: string;
  place: string;
  state: string;
  state_code: string;
  province: string;
  province_code: string;
  community: string;
  community_code: string;
  latitude: string;
  longitude: string;
  durationByCar: number | undefined;
  durationByPublicTransport: number | undefined;
};

export default function Map({ tolerance, onMapReady, displayLines }: Props) {
  const mapContainer = useRef(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    lines: L.LayerGroup;
    points: L.LayerGroup;
    borders: L.GeoJSON;
  } | null>(null);

  const center = { lng: 5.2913, lat: 52.1326 }; // Centered on Netherlands
  const [zoom] = useState(7);

  const startPoint = {
    zipcode: "2491",
    province: "Gemeente Den Haag",
    latitude: 52.069,
    longitude: 4.3887,
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new L.Map(mapContainer.current!, {
        center: L.latLng(center.lat, center.lng),
        zoom: zoom,
      });

      layersRef.current = {
        lines: L.layerGroup().addTo(mapRef.current),
        points: L.layerGroup().addTo(mapRef.current),
        borders: L.geoJSON(netherlandsGEO as any, {
          style: {
            fillColor: "#FFFFFF",
            weight: 2,
            opacity: 0.2,
            color: "#0000FF",
            dashArray: "1",
            fillOpacity: 0.1,
          },
          onEachFeature: (feature, layer) => {
            layer.on({
              click: (e) => {
                mapRef.current!.fitBounds(e.target.getBounds());
              },
            });
          },
        }).addTo(mapRef.current),
      };

      // Set z-index for each layer
      layersRef.current.lines.setZIndex(1);
      layersRef.current.points.setZIndex(2);
      layersRef.current.borders.setZIndex(3);
    }

    const updateRoutes = () => {
      if (!layersRef.current) return;

      layersRef.current.lines.clearLayers();
      layersRef.current.points.clearLayers();

      (final as ZipCodeData[]).forEach((item) => {
        let color = null;
        let opacity,
          weight = 0;

        const carDuration = item.durationByCar ?? 0;
        const publicTransportDuration = item.durationByPublicTransport ?? 0;

        if (publicTransportDuration < carDuration + tolerance) {
          color = "green";
          opacity = 0.4;
          weight = 0.5;
        } else if (publicTransportDuration > carDuration + tolerance) {
          color = "yellow";
          opacity = 0.4;
          weight = 0.5;
        } else if (publicTransportDuration > carDuration + tolerance * 1.5) {
          color = "red";
          opacity = 0.4;
          weight = 2;
        } else if (publicTransportDuration > tolerance + carDuration * 2) {
          color = "black";
          opacity = 0.4;
          weight = 2;
        }

        if (color) {
          if (displayLines) {
            const line = L.polyline(
              [
                [startPoint.latitude, startPoint.longitude],
                [parseFloat(item.latitude), parseFloat(item.longitude)],
              ],
              { color: color, weight: weight, opacity: opacity }
            );

            line.addTo(layersRef.current!.lines);
          }

          const circle = L.circle(
            [parseFloat(item.latitude), parseFloat(item.longitude)],
            {
              radius: 10,
              color: color,
              fillColor: color,
              fillOpacity: 0.01,
              weight: 2,
            }
          )
            .bindPopup(`${item.place} - ${item.zipcode}`)
            .addTo(layersRef.current!.points);
        }
      });
    };

    updateRoutes();
    mapRef.current.on("load", onMapReady);
  }, [center.lat, center.lng, zoom, tolerance, displayLines]);

  if (typeof window !== "undefined") {
    return (
      <div className="relative h-[90vh] w-full">
        <div
          ref={mapContainer}
          className="absolute h-full w-full"
          style={{ backgroundColor: "white" }}
        />
      </div>
    );
  } else {
    console.log("no window");
    return null;
  }
}
