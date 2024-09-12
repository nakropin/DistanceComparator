import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.HERE_API_KEY;

const startPoint = {
  zipcode: "2491",
  province: "Gemeente Den Haag",
  latitude: 52.069,
  longitude: 4.3887,
};

const jsonPath = path.join(__dirname, "zipcodes.nl.json");

async function calculatePublicTransportDurations() {
  let gemeinden_koordinaten = JSON.parse(await fs.readFile(jsonPath, "utf-8"));

  for (const destination of gemeinden_koordinaten) {
    try {
      const response = await axios.get(
        `https://transit.router.hereapi.com/v8/routes`,
        {
          params: {
            apiKey: API_KEY,
            origin: `${startPoint.latitude},${startPoint.longitude}`,
            destination: `${Number(destination.latitude)},${Number(
              destination.longitude
            )}`,
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
        const durationInMinutes = Math.round((endTime - startTime) / 60000);

        destination.durationByPublicTransport = durationInMinutes;

        console.log(
          `Calculated duration for ${destination.place}: ${durationInMinutes} minutes`
        );
      } else {
        console.log(`No route found to ${destination.place}`);
        destination.durationByPublicTransport = null;
      }
    } catch (error) {
      console.error(
        `Error calculating route for ${destination.place}:`,
        error.response ? error.response.data : error.message
      );
      destination.durationByPublicTransport = null;
    }

    // Add a small delay to avoid overwhelming the API
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Write updated data back to the file
  await fs.writeFile(jsonPath, JSON.stringify(gemeinden_koordinaten, null, 2));
  console.log(`Results written to ${jsonPath}`);
}

calculatePublicTransportDurations();
