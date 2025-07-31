const path = require("path");
const xlsx = require("xlsx");

const tendersFile = path.join(__dirname, "tenders", "Ausschreibungs-Liste.xlsx");

function analyzeExcel() {
  try {
    const workbook = xlsx.readFile(tendersFile);

    console.log("Gefundene Tabellenblätter:", workbook.SheetNames);

    if (workbook.SheetNames.length === 0) {
      console.log("Keine Tabellenblätter in der Datei gefunden.");
      return;
    }

    const sheetName = "Vertriebsliste"; // Gezielt das richtige Blatt auswählen
    if (!workbook.SheetNames.includes(sheetName)) {
      console.log(`Tabellenblatt "${sheetName}" nicht gefunden.`);
      return;
    }

    console.log(`\n--- Analyse von Tabellenblatt: "${sheetName}" ---`);

    const sheet = workbook.Sheets[sheetName];
    
    // Konvertiere das Blatt in ein Array von Arrays (jede innere Array ist eine Zeile)
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });

    console.log("\nInhalt der ersten 20 Zeilen (roh):");
    data.slice(0, 20).forEach((row, index) => {
      console.log(`Zeile ${index + 1}:`, row);
    });

  } catch (error) {
    console.error("Fehler beim Analysieren der Excel-Datei:", error);
  }
}

analyzeExcel(); 