"use client";
import React, { useRef, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// @ts-ignore
import final from "@/assets/FINAL.json";
import sachsenGeoJSON from "@/assets/sachsen_grenzen.json";

type Props = {
  tolerance: number;
  onMapReady: () => void;
  displayLines: boolean;
};

export default function Map({ tolerance, onMapReady, displayLines }: Props) {
  const mapContainer = useRef(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    blackLines: L.LayerGroup;
    redLines: L.LayerGroup;
    yellowLines: L.LayerGroup;
    greenLines: L.LayerGroup;
    points: L.LayerGroup;
  } | null>(null);

  const center = { lng: 13.3779264, lat: 51.0098256 };
  const [zoom] = useState(8);

  const startPoint = {
    plz: "04177",
    name: "Lindenau",
    lat: 51.3413425,
    lng: 12.3354318,
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new L.Map(mapContainer.current!, {
        center: L.latLng(center.lat, center.lng),
        zoom: zoom,
      });

      L.geoJSON(sachsenGeoJSON as any, {
        style: {
          fillColor: "#FFFFFF",
          weight: 2,
          opacity: 0.2,
          color: "#0000FF",
          dashArray: "3",
          fillOpacity: 0.9,
        },
        onEachFeature: (feature, layer) => {
          layer.on({
            click: (e) => {
              mapRef.current!.fitBounds(e.target.getBounds());
            },
          });
        },
      }).addTo(mapRef.current);

      layersRef.current = {
        blackLines: L.layerGroup().addTo(mapRef.current),
        redLines: L.layerGroup().addTo(mapRef.current),
        yellowLines: L.layerGroup().addTo(mapRef.current),
        greenLines: L.layerGroup().addTo(mapRef.current),
        points: L.layerGroup().addTo(mapRef.current),
      };
    }

    // Funktion zum Aktualisieren der Routen und Punkte
    const updateRoutes = () => {
      if (!layersRef.current) return;

      // Entferne alle bestehenden Linien und Punkte
      Object.values(layersRef.current).forEach((layer) => layer.clearLayers());

      final.forEach((item) => {
        let color = null;
        let opacity,
          weight = 0;

        if (item.durationByPublicTransport! < item.durationByCar + tolerance) {
          color = "green";
          opacity = 0.4;
          weight = 3.5;
        }
        if (item.durationByPublicTransport! > item.durationByCar + tolerance) {
          color = "yellow";
          opacity = 0.4;
          weight = 3.5;
        }
        if (
          item.durationByPublicTransport! >
          item.durationByCar + tolerance * 1.5
        ) {
          color = "red";
          opacity = 0.2;
          weight = 2;
        }
        if (
          item.durationByPublicTransport! >
          tolerance + item.durationByCar * 2
        ) {
          color = "black";
          opacity = 0.1;
          weight = 2;
        }

        if (color) {
          // Zeichne die Linie nur, wenn displayLines true ist
          if (displayLines) {
            const line = L.polyline(
              [
                [startPoint.lat, startPoint.lng],
                [item.lat, item.lng],
              ],
              { color: color, weight: weight, opacity: opacity }
            );

            const layerKey = `${color}Lines` as keyof typeof layersRef.current;
            line.addTo(layersRef.current![layerKey]);
          }

          // Zeichne immer den Punkt, unabhängig von displayLines
          const circle = L.circle([item.lat, item.lng], {
            radius: 100,
            color: color,
            fillColor: color,
            fillOpacity: 0.5,
            weight: 5,
          })
            .bindPopup(item.name + " - " + item.plz)
            .addTo(layersRef.current!.points);
        }
      });
    };

    // Aktualisiere die Routen bei Änderungen der Toleranz oder displayLines
    updateRoutes();
    mapRef.current.on("load", onMapReady);
  }, [center.lng, center.lat, zoom, tolerance, displayLines]);

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
