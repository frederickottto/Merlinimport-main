// Script to analyze the Excel file for actual city locations
const XLSX = require('xlsx');
require('dotenv').config();

async function analyzeExcelCities() {
  console.log("🏙️ Analysiere Excel-Datei für Städte/Standorte...");
  
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
    
    // Look for city/street data in columns 8, 9, 10, 11 (Straße, Hausnummer, Postleitzahl, Ort)
    const cities = [];
    const streets = [];
    const postCodes = [];
    
    // Extract data from relevant columns
    for (let row = 1; row < data.length; row++) {
      const rowData = data[row];
      if (rowData) {
        // Column 8: Straße
        if (rowData[8] && typeof rowData[8] === 'string' && rowData[8].trim() !== '') {
          streets.push(rowData[8].trim());
        }
        
        // Column 9: Hausnummer
        if (rowData[9] && typeof rowData[9] === 'string' && rowData[9].trim() !== '') {
          // This is house number, not a city
        }
        
        // Column 10: Postleitzahl
        if (rowData[10] && typeof rowData[10] === 'string' && rowData[10].trim() !== '') {
          postCodes.push(rowData[10].trim());
        }
        
        // Column 11: Ort (City)
        if (rowData[11] && typeof rowData[11] === 'string' && rowData[11].trim() !== '') {
          cities.push(rowData[11].trim());
        }
      }
    }
    
    // Remove duplicates and sort
    const uniqueCities = [...new Set(cities)].sort();
    const uniqueStreets = [...new Set(streets)].sort();
    const uniquePostCodes = [...new Set(postCodes)].sort();
    
    console.log(`\n📊 Gefundene Daten:`);
    console.log(`   Städte: ${cities.length} (${uniqueCities.length} eindeutig)`);
    console.log(`   Straßen: ${streets.length} (${uniqueStreets.length} eindeutig)`);
    console.log(`   Postleitzahlen: ${postCodes.length} (${uniquePostCodes.length} eindeutig)`);
    
    console.log(`\n🏙️ Eindeutige Städte:`);
    uniqueCities.forEach((city, index) => {
      console.log(`   ${index + 1}. ${city}`);
    });
    
    console.log(`\n🏢 Eindeutige Straßen (erste 20):`);
    uniqueStreets.slice(0, 20).forEach((street, index) => {
      console.log(`   ${index + 1}. ${street}`);
    });
    
    console.log(`\n📮 Eindeutige Postleitzahlen (erste 20):`);
    uniquePostCodes.slice(0, 20).forEach((postCode, index) => {
      console.log(`   ${index + 1}. ${postCode}`);
    });
    
    // Create location objects
    const locations = [];
    for (let row = 1; row < data.length; row++) {
      const rowData = data[row];
      if (rowData && rowData[8] && rowData[9] && rowData[10] && rowData[11]) {
        const location = {
          street: rowData[8].trim(),
          houseNumber: rowData[9].trim(),
          postCode: rowData[10].trim(),
          city: rowData[11].trim(),
          country: 'Deutschland'
        };
        
        // Check if this location already exists
        const exists = locations.find(loc => 
          loc.street === location.street && 
          loc.houseNumber === location.houseNumber && 
          loc.city === location.city
        );
        
        if (!exists) {
          locations.push(location);
        }
      }
    }
    
    console.log(`\n📍 Eindeutige Standorte aus Excel: ${locations.length}`);
    console.log(`\n📋 Beispiele der Standorte:`);
    locations.slice(0, 10).forEach((location, index) => {
      console.log(`   ${index + 1}. ${location.street} ${location.houseNumber}, ${location.postCode} ${location.city}`);
    });
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  }
}

analyzeExcelCities(); 