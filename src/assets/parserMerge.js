import fs from "fs";

console.log("running");

// Die beiden JSON-Datensätze
const jsonWithCoordinates = JSON.parse(
  fs.readFileSync("src/assets/koordinaten.json", "utf8")
);

const jsonWithNames = JSON.parse(
  fs.readFileSync("src/assets/gemeinden_data.json", "utf8")
);

const jsonWithCarTimes = JSON.parse(
  fs.readFileSync("src/assets/car_durations.json", "utf8")
);

const jsonWithPublicTransportTimes = JSON.parse(
  fs.readFileSync("src/assets/public_transport_durations.json", "utf8")
);

// Funktion zum Zusammenführen der JSONs
function mergeJsonDatasets(dataset1, dataset2) {
  const mergedData = new Map();

  // Funktion zum Zusammenführen von Objekten
  function mergeObjects(obj1, obj2) {
    return { ...obj1, ...obj2 };
  }

  // Verarbeite den ersten Datensatz
  for (const item of dataset1) {
    mergedData.set(item.plz, item);
  }

  // Verarbeite den zweiten Datensatz und führe die Daten zusammen
  for (const item of dataset2) {
    if (mergedData.has(item.plz)) {
      mergedData.set(item.plz, mergeObjects(mergedData.get(item.plz), item));
    } else {
      mergedData.set(item.plz, item);
    }
  }

  return Array.from(mergedData.values());
}

// Führe die JSONs zusammen
// const mergedJson = mergeJsons(jsonWithCoordinates, jsonWithNames);

const mergedJson = mergeJsonDatasets(
  jsonWithCarTimes,
  jsonWithPublicTransportTimes
);

const filteredJson = mergedJson.filter(
  (item) => item.name && item.name.trim() !== "" && item.durationByCar != null
);

// Konvertiere das Ergebnis in einen JSON-String
const mergedJsonString = JSON.stringify(filteredJson, null, 2);

// Schreibe das Ergebnis in eine Datei
fs.writeFileSync("src/assets/FINAL2.json", mergedJsonString);

// Gib das Ergebnis aus
console.log(
  "Merge complete. Data written to src/assets/gemeinden_koordinaten.json"
);
console.log(`${mergedJson.length} entries processed.`);
