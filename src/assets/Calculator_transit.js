import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = "gEpNSGZFsrY9tVAewKeJKcxYkY8nV5xddUCEE-YoYZY";
const startPoint = {
  plz: "04177",
  name: "Lindenau",
  lat: 51.3413425,
  lng: 12.3354318,
};

// Import gemeinden_koordinaten data
const gemeinden_koordinaten = JSON.parse(
  await fs.readFile(path.join(__dirname, "gemeinden_koordinaten.json"), "utf-8")
);

async function calculatePublicTransportDurations() {
  const results = [];

  for (const destination of gemeinden_koordinaten) {
    try {
      const response = await axios.get(
        `https://transit.router.hereapi.com/v8/routes`,
        {
          params: {
            apiKey: API_KEY,
            origin: `${startPoint.lat},${startPoint.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            alternatives: 1,
            departureTime: new Date().toISOString(),
          },
        }
      );

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const startTime = new Date(route.sections[0].departure.time);
        const endTime = new Date(
          route.sections[route.sections.length - 1].arrival.time
        );
        const durationInMinutes = Math.round((endTime - startTime) / 60000); // Convert milliseconds to minutes

        results.push({
          name: destination.name,
          plz: destination.plz,
          durationByPublicTransport: durationInMinutes,
        });

        console.log(
          `Calculated duration for ${destination.name}: ${durationInMinutes} minutes`
        );
      } else {
        console.log(`No route found to ${destination.name}`);
        results.push({
          name: destination.name,
          plz: destination.plz,
          durationByPublicTransport: null,
        });
      }
    } catch (error) {
      console.error(
        `Error calculating route for ${destination.name}:`,
        error.response ? error.response.data : error.message
      );
      results.push({
        name: destination.name,
        plz: destination.plz,
        durationByPublicTransport: null,
      });
    }
  }

  // Write results to file
  const outputPath = path.join(__dirname, "public_transport_durations.json");
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
  console.log(`Results written to ${outputPath}`);
}

calculatePublicTransportDurations();
