const xlsx = require('xlsx');
require("dotenv").config();

async function examineTenderEmployees() {
  try {
    console.log('Untersuche Excel-Datei auf Mitarbeiter-Informationen...');
    
    // Read the tender file
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    const sheetName = "Vertriebsliste";

    if (!workbook.SheetNames.includes(sheetName)) {
      console.log(`Tabellenblatt "${sheetName}" nicht gefunden.`);
      return;
    }

    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Anzahl Zeilen im Tabellenblatt "Vertriebsliste": ${sheetJson.length}`);
    
    // Show first few rows to understand structure
    console.log('\nErste 5 Zeilen:');
    console.log('================');
    
    for (let i = 0; i < Math.min(5, sheetJson.length); i++) {
      const row = sheetJson[i];
      console.log(`\nZeile ${i + 1}:`);
      Object.keys(row).forEach(key => {
        console.log(`  ${key}: ${row[key]}`);
      });
    }
    
    // Look for employee-related columns
    console.log('\nSuche nach Mitarbeiter-Spalten...');
    const firstRow = sheetJson[0];
    const employeeColumns = Object.keys(firstRow).filter(key => 
      key.toLowerCase().includes('partner') || 
      key.toLowerCase().includes('lead') || 
      key.toLowerCase().includes('mitarbeiter') ||
      key.toLowerCase().includes('opp')
    );
    
    console.log('Gefundene Mitarbeiter-Spalten:', employeeColumns);
    
    // Show unique values in employee columns
    employeeColumns.forEach(col => {
      const uniqueValues = [...new Set(sheetJson.map(row => row[col]).filter(val => val))];
      console.log(`\n${col} - Eindeutige Werte:`);
      uniqueValues.forEach(val => console.log(`  - ${val}`));
    });
    
  } catch (error) {
    console.error('Error examining tender employees:', error);
  }
}

examineTenderEmployees(); 