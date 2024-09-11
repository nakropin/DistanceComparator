import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.ORS_API_KEY;
const BASE_URL = "https://api.openrouteservice.org/v2/matrix";

const startPoint = {
  plz: "04177",
  name: "Lindenau",
  lat: 51.3413425,
  lng: 12.3354318,
};

const jsonPath = path.join(
  __dirname,
  "..",
  "..",
  "src/assets/gemeinden_koordinaten.json"
);
console.log("Versuche, die Datei zu lesen von:", jsonPath);

let gemeinden_koordinaten;
try {
  const rawData = fs.readFileSync(jsonPath, "utf8");
  gemeinden_koordinaten = JSON.parse(rawData);
  console.log("Datei erfolgreich gelesen.");
} catch (error) {
  console.error("Fehler beim Lesen der Datei:", error);
  process.exit(1);
}

async function calculateTravelTimes(profile, chunk) {
  const locations = [
    [startPoint.lng, startPoint.lat],
    ...chunk.map((dest) => [dest.lng, dest.lat]),
  ];

  const config = {
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json",
    },
    timeout: 30000, // 30 Sekunden Timeout
  };

  const data = {
    locations: locations,
    metrics: ["duration"],
    sources: [0],
    destinations: Array.from({ length: chunk.length }, (_, i) => i + 1),
  };

  try {
    const response = await axios.post(`${BASE_URL}/${profile}`, data, config);
    return response.data.durations[0];
  } catch (error) {
    if (error.response) {
      console.error(
        `API-Fehler: ${error.response.status} - ${
          error.response.data.message || error.response.statusText
        }`
      );
    } else if (error.request) {
      console.error("Keine Antwort vom Server erhalten");
    } else {
      console.error("Fehler beim Erstellen der Anfrage:", error.message);
    }
    throw error;
  }
}

async function processInChunks(profile, chunkSize = 50) {
  for (let i = 0; i < gemeinden_koordinaten.length; i += chunkSize) {
    const chunk = gemeinden_koordinaten.slice(i, i + chunkSize);
    console.log(
      `Verarbeite Chunk ${i / chunkSize + 1} von ${Math.ceil(
        gemeinden_koordinaten.length / chunkSize
      )}`
    );

    let retries = 3;
    while (retries > 0) {
      try {
        const durations = await calculateTravelTimes(profile, chunk);
        chunk.forEach((dest, index) => {
          dest.durationByCar = Math.round(durations[index] / 60);
          console.log(
            `Von ${startPoint.name} nach ${dest.name} (${profile}): ${dest.durationByCar} Minuten`
          );
        });
        break; // Erfolgreich, verlasse die Schleife
      } catch (error) {
        retries--;
        if (retries > 0) {
          console.log(
            `Fehler aufgetreten. Versuche erneut in 5 Sekunden... (${retries} Versuche übrig)`
          );
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          console.error(
            "Alle Versuche fehlgeschlagen. Überspringe diesen Chunk."
          );
        }
      }
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(gemeinden_koordinaten, null, 2));
  console.log(
    "Aktualisierte Daten wurden in gemeinde_koordinaten.json gespeichert."
  );
}

async function main() {
  console.log("Berechne Reisezeiten mit dem Auto...");
  await processInChunks("driving-car");
}

main();
