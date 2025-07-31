// Script to analyze the _Daten sheet for location data
const XLSX = require('xlsx');
require('dotenv').config();

async function analyzeExcelStandorte() {
  console.log("🔍 Analysiere Excel-Datei für Standorte...");
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/EY CSS - Datenerhebung MM.xlsx');
    
    // Check if _Daten sheet exists
    if (!workbook.Sheets['_Daten']) {
      console.log("❌ Sheet '_Daten' nicht gefunden!");
      return;
    }
    
    const sheet = workbook.Sheets['_Daten'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`📊 Sheet '_Daten' gefunden mit ${data.length} Zeilen`);
    
    // Find location data
    let locations = [];
    let locationColumn = null;
    
    // Look for location-related headers
    for (let row = 0; row < Math.min(10, data.length); row++) {
      const rowData = data[row];
      if (rowData) {
        for (let col = 0; col < rowData.length; col++) {
          const cellValue = rowData[col];
          if (cellValue && typeof cellValue === 'string') {
            const lowerValue = cellValue.toLowerCase();
            if (lowerValue.includes('standort') || 
                lowerValue.includes('ort') || 
                lowerValue.includes('stadt') ||
                lowerValue.includes('location')) {
              console.log(`📍 Mögliche Standort-Spalte gefunden: Spalte ${col} = "${cellValue}"`);
              locationColumn = col;
            }
          }
        }
      }
    }
    
    // Extract location data
    if (locationColumn !== null) {
      console.log(`\n📋 Extrahiere Standorte aus Spalte ${locationColumn}...`);
      
      for (let row = 1; row < data.length; row++) {
        const rowData = data[row];
        if (rowData && rowData[locationColumn]) {
          const location = rowData[locationColumn];
          if (location && typeof location === 'string' && location.trim() !== '') {
            locations.push(location.trim());
          }
        }
      }
      
      // Remove duplicates and sort
      const uniqueLocations = [...new Set(locations)].sort();
      
      console.log(`\n📊 Gefundene Standorte:`);
      console.log(`   Gesamt: ${locations.length}`);
      console.log(`   Eindeutig: ${uniqueLocations.length}`);
      
      console.log(`\n📋 Alle eindeutigen Standorte:`);
      uniqueLocations.forEach((location, index) => {
        console.log(`   ${index + 1}. ${location}`);
      });
      
      // Show first few rows to understand structure
      console.log(`\n📋 Erste 5 Zeilen der Daten:`);
      for (let row = 0; row < Math.min(5, data.length); row++) {
        const rowData = data[row];
        if (rowData) {
          console.log(`   Zeile ${row + 1}: ${rowData.join(' | ')}`);
        }
      }
      
    } else {
      console.log("❌ Keine Standort-Spalte gefunden!");
      
      // Show all headers to help identify
      console.log(`\n📋 Alle Spalten-Header:`);
      if (data[0]) {
        data[0].forEach((header, index) => {
          if (header) {
            console.log(`   Spalte ${index}: "${header}"`);
          }
        });
      }
    }
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  }
}

analyzeExcelStandorte(); 