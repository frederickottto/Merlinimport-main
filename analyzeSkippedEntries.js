const xlsx = require("xlsx");
require("dotenv").config();

async function analyzeSkippedEntries() {
  try {
    console.log("Analysiere übersprungene Einträge...");
    
    // Read main Excel file
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    const sheetName = "Vertriebsliste";
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Anzahl Zeilen im Tabellenblatt "Vertriebsliste": ${sheetJson.length}`);
    
    let skippedEntries = [];
    
    for (let i = 0; i < sheetJson.length; i++) {
      const obj = sheetJson[i];
      
      // Check for entries that would be skipped
      if (!obj["Angefragte Leistung"] || obj["Angefragte Leistung"] === "n/a") {
        skippedEntries.push({
          row: i + 2, // +2 because we start from row 2 and i is 0-based
          reason: "Keine angefragte Leistung",
          data: {
            "Angefragte Leistung": obj["Angefragte Leistung"],
            "Kunde": obj["Kunde"],
            "Opp-ID": obj["Opp-ID"],
            "Status": obj["Status"]
          }
        });
      } else if (!obj["Kunde"] || obj["Kunde"] === "n/a" || obj["Kunde"] === "tbd") {
        skippedEntries.push({
          row: i + 2,
          reason: "Kein Kunde/Organisation",
          data: {
            "Angefragte Leistung": obj["Angefragte Leistung"],
            "Kunde": obj["Kunde"],
            "Opp-ID": obj["Opp-ID"],
            "Status": obj["Status"]
          }
        });
      }
    }
    
    console.log(`\nÜbersprungene Einträge (${skippedEntries.length}):`);
    console.log("================================================");
    
    skippedEntries.forEach((entry, index) => {
      console.log(`\n${index + 1}. Zeile ${entry.row}: ${entry.reason}`);
      console.log(`   Angefragte Leistung: "${entry.data["Angefragte Leistung"]}"`);
      console.log(`   Kunde: "${entry.data["Kunde"]}"`);
      console.log(`   Opp-ID: "${entry.data["Opp-ID"]}"`);
      console.log(`   Status: "${entry.data["Status"]}"`);
    });
    
    // Group by reason
    const groupedByReason = {};
    skippedEntries.forEach(entry => {
      if (!groupedByReason[entry.reason]) {
        groupedByReason[entry.reason] = [];
      }
      groupedByReason[entry.reason].push(entry);
    });
    
    console.log(`\nZusammenfassung nach Grund:`);
    console.log("==========================");
    Object.entries(groupedByReason).forEach(([reason, entries]) => {
      console.log(`${reason}: ${entries.length} Einträge`);
    });
    
  } catch (error) {
    console.error("Fehler bei der Analyse:", error);
  }
}

analyzeSkippedEntries(); 