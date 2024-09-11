"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

// Dynamischer Import der Map-Komponente mit deaktiviertem SSR
const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
});

export default function Home() {
  const [tolerance, setTolerance] = useState(30);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const handleToleranceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value, 10);
    setTolerance(isNaN(value) ? 0 : value);
  };

  const captureMap = async () => {
    if (mapRef.current && isMapReady) {
      try {
        const canvas = await html2canvas(mapRef.current, {
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: true,
          scrollY: -window.scrollY,
          scale: 2, // Increase resolution
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "map-screenshot.png";
        link.click();
      } catch (error) {
        console.error("Error capturing map:", error);
      }
    } else {
      console.log("Map is not ready yet");
    }
  };

  useEffect(() => {
    // This effect will run after the map is rendered
    setIsMapReady(true);
  }, []);

  return (
    <div>
      <div ref={mapRef} style={{ width: "100%", height: "90vh" }}>
        <Map tolerance={tolerance} onMapReady={() => setIsMapReady(true)} />
      </div>
      <div className="w-full h-[10vh] flex flex-row bg-slate-400 justify-center items-center gap-8">
        <label htmlFor="toleranceInput" className="text-white">
          Tolerance:
        </label>
        <input
          id="toleranceInput"
          type="number"
          value={tolerance}
          onChange={handleToleranceChange}
          className="px-2 py-1 rounded"
        />
        <button
          onClick={captureMap}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={!isMapReady}
        >
          Capture Map
        </button>
      </div>
    </div>
  );
}
