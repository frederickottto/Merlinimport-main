// Script to analyze the OrganisationenÜbersicht Excel file
const XLSX = require('xlsx');
require('dotenv').config();

async function analyzeOrganisationen() {
  console.log("🏢 Analysiere OrganisationenÜbersicht Excel-Datei...");
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/OrganisationenÜbersicht.xlsx');
    
    console.log(`📊 Gefundene Sheets: ${Object.keys(workbook.Sheets).join(', ')}`);
    
    // Analyze each sheet
    for (const sheetName of Object.keys(workbook.Sheets)) {
      console.log(`\n📋 Analysiere Sheet: "${sheetName}"`);
      
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      console.log(`   Zeilen: ${data.length}`);
      
      if (data.length > 0) {
        // Show headers
        console.log(`   📋 Header (erste Zeile):`);
        if (data[0]) {
          data[0].forEach((header, index) => {
            if (header) {
              console.log(`      Spalte ${index}: "${header}"`);
            }
          });
        }
        
        // Show first few data rows
        console.log(`   📊 Erste 5 Datenzeilen:`);
        for (let row = 1; row < Math.min(6, data.length); row++) {
          const rowData = data[row];
          if (rowData) {
            console.log(`      Zeile ${row}: ${rowData.join(' | ')}`);
          }
        }
        
        // Count non-empty cells in each column
        console.log(`   📈 Spalten-Analyse:`);
        if (data[0]) {
          for (let col = 0; col < data[0].length; col++) {
            let nonEmptyCount = 0;
            for (let row = 1; row < data.length; row++) {
              if (data[row] && data[row][col] && data[row][col].toString().trim() !== '') {
                nonEmptyCount++;
              }
            }
            const header = data[0][col] || `Spalte ${col}`;
            console.log(`      ${header}: ${nonEmptyCount} Einträge`);
          }
        }
      }
    }
    
    // Detailed analysis of the first sheet
    const firstSheetName = Object.keys(workbook.Sheets)[0];
    if (firstSheetName) {
      console.log(`\n🔍 Detaillierte Analyse von Sheet "${firstSheetName}":`);
      
      const sheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // Look for organization-related columns
      const orgColumns = [];
      if (data[0]) {
        data[0].forEach((header, index) => {
          if (header && typeof header === 'string') {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader.includes('organisation') || 
                lowerHeader.includes('firma') || 
                lowerHeader.includes('unternehmen') ||
                lowerHeader.includes('name') ||
                lowerHeader.includes('company')) {
              orgColumns.push({ index, header });
            }
          }
        });
      }
      
      if (orgColumns.length > 0) {
        console.log(`   🏢 Mögliche Organisations-Spalten:`);
        orgColumns.forEach(col => {
          console.log(`      Spalte ${col.index}: "${col.header}"`);
        });
        
        // Extract organization names
        const organizations = [];
        for (let row = 1; row < data.length; row++) {
          const rowData = data[row];
          if (rowData) {
            orgColumns.forEach(col => {
              if (rowData[col.index] && typeof rowData[col.index] === 'string' && rowData[col.index].trim() !== '') {
                organizations.push(rowData[col.index].trim());
              }
            });
          }
        }
        
        const uniqueOrganizations = [...new Set(organizations)].sort();
        console.log(`\n   📊 Gefundene Organisationen: ${organizations.length} (${uniqueOrganizations.length} eindeutig)`);
        
        console.log(`   📋 Eindeutige Organisationen (erste 20):`);
        uniqueOrganizations.slice(0, 20).forEach((org, index) => {
          console.log(`      ${index + 1}. ${org}`);
        });
      }
    }
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  }
}

analyzeOrganisationen(); 