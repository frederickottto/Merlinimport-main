const xlsx = require("xlsx");
require("dotenv").config();

async function analyzeExcelFiles() {
  try {
    console.log('📊 Analysiere Excel-Dateien...');
    
    // 1. Analyze main tender file
    console.log('\n=== HAUPTDATEI: Copy of EY CSS - Überblick Vertriebsprozess ===');
    const mainFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const mainWorkbook = xlsx.readFile(mainFile);
    
    const mainSheetName = "Vertriebsliste";
    const mainSheet = mainWorkbook.Sheets[mainSheetName];
    const mainJson = xlsx.utils.sheet_to_json(mainSheet, { defval: null, range: 2 });
    
    console.log(`Hauptdatei Zeilen: ${mainJson.length}`);
    
    // Show first few rows to understand structure
    console.log('\nErste 3 Zeilen der Hauptdatei:');
    mainJson.slice(0, 3).forEach((row, index) => {
      console.log(`\nZeile ${index + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        if (value && value !== "n/a") {
          console.log(`  ${key}: ${value}`);
        }
      });
    });
    
    // 2. Analyze title file
    console.log('\n=== TITELDATEI: TitelVertriebe ===');
    const titleFile = 'tenders/TitelVertriebe.xlsx';
    const titleWorkbook = xlsx.readFile(titleFile);
    
    const titleSheetName = Object.keys(titleWorkbook.Sheets)[0]; // First sheet
    const titleSheet = titleWorkbook.Sheets[titleSheetName];
    const titleJson = xlsx.utils.sheet_to_json(titleSheet, { defval: null });
    
    console.log(`Titeldatei Zeilen: ${titleJson.length}`);
    console.log(`Titeldatei Sheet: ${titleSheetName}`);
    
    // Show first few rows to understand structure
    console.log('\nErste 3 Zeilen der Titeldatei:');
    titleJson.slice(0, 3).forEach((row, index) => {
      console.log(`\nZeile ${index + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        if (value && value !== "n/a") {
          console.log(`  ${key}: ${value}`);
        }
      });
    });
    
    // 3. Check for matching numbers
    console.log('\n=== PRÜFE ZAHLEN-MATCHING ===');
    
    // Get all numbers from main file
    const mainNumbers = mainJson
      .filter(row => row["#"] && row["#"] !== "n/a")
      .map(row => row["#"]);
    
    // Get all numbers from title file
    const titleNumbers = titleJson
      .filter(row => row["#"] && row["#"] !== "n/a")
      .map(row => row["#"]);
    
    console.log(`Zahlen in Hauptdatei: ${mainNumbers.length}`);
    console.log(`Zahlen in Titeldatei: ${titleNumbers.length}`);
    
    // Find matches
    const matches = mainNumbers.filter(num => titleNumbers.includes(num));
    console.log(`Gefundene Matches: ${matches.length}`);
    
    if (matches.length > 0) {
      console.log('\nBeispiel-Matches:');
      matches.slice(0, 5).forEach(matchNum => {
        const mainRow = mainJson.find(row => row["#"] === matchNum);
        const titleRow = titleJson.find(row => row["#"] === matchNum);
        
        console.log(`\nNummer ${matchNum}:`);
        console.log(`  Hauptdatei - Kunde: ${mainRow["Kunde"]}`);
        console.log(`  Hauptdatei - Status: ${mainRow["Status"]}`);
        console.log(`  Hauptdatei - Art: ${mainRow["Art"]}`);
        console.log(`  Titeldatei - Titel: ${titleRow["Titel"]}`);
      });
    }
    
    // 4. Check status mapping examples
    console.log('\n=== STATUS MAPPING BEISPIELE ===');
    const statusExamples = mainJson
      .filter(row => row["Status"] && row["Status"] !== "n/a")
      .slice(0, 10);
    
    statusExamples.forEach((row, index) => {
      console.log(`${index + 1}. Status: "${row["Status"]}", Art: "${row["Art"]}"`);
    });
    
  } catch (error) {
    console.error('Fehler bei der Analyse:', error);
  }
}

analyzeExcelFiles(); 