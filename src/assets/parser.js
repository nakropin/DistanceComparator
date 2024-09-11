/* import fs from "fs";

// JSON-Datei lesen
const data = JSON.parse(fs.readFileSync("src/assets/data.json", "utf8"));

// Set verwenden, um Duplikate zu vermeiden
const uniqueOrte = new Set();

// map() Funktion auf jedes innere Array anwenden
data.sachsen.flatMap((innerArray) =>
  innerArray.forEach((entry) => {
    if (entry["1_Auspraegung_Label"]) {
      uniqueOrte.add(entry["1_Auspraegung_Label"]);
    }
  })
);

// Set in Array umwandeln und in das gewünschte Format bringen
const jsonData = Array.from(uniqueOrte).map((ort) => ({ ort }));

console.log(jsonData);

// In JSON umwandeln
const jsonString = JSON.stringify(jsonData, null, 2);

// Datei speichern
fs.writeFileSync("src/assets/gemeinden_data.json", jsonString);
 */

import fs from "fs";

// JSON-Datei lesen
const data = JSON.parse(fs.readFileSync("src/assets/csvjson.json", "utf8"));

// Nur PLZ und Gemeindeteil extrahieren
const jsonData = data.map(({ PLZ: plz, Gemeindeteil: gemeindeteil }) => ({
  plz,
  gemeindeteil,
}));

// In JSON umwandeln
const jsonString = JSON.stringify(jsonData, null, 2);

// Datei speichern
fs.writeFileSync("src/assets/gemeinden_data.json", jsonString);

console.log("lol");
