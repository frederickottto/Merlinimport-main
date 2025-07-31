// Script to analyze Excel files and check Standort column
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

function analyzeExcelLocations() {
  console.log("🔍 Analysiere Excel-Dateien für Standort-Informationen");
  
  const excelsDir = './excels';
  const files = fs.readdirSync(excelsDir).filter(file => file.endsWith('.xlsx') && !file.startsWith('~$'));
  
  for (const file of files) {
    console.log(`\n📄 Analysiere: ${file}`);
    
    try {
      const filePath = path.join(excelsDir, file);
      const workbook = xlsx.readFile(filePath);
      
      if (workbook.SheetNames.includes('Mitarbeiter')) {
        const sheet = workbook.Sheets['Mitarbeiter'];
        
        // Read raw data to understand the vertical structure
        const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
        console.log(`   📊 Mitarbeiter Sheet gefunden mit ${rawData.length} Zeilen`);
        
        // Convert vertical structure to key-value pairs
        const employeeData = {};
        for (const row of rawData) {
          if (row && row.length >= 2 && row[0] && row[1]) {
            const key = row[0].toString().trim();
            const value = row[1];
            if (key && value !== null && value !== undefined) {
              employeeData[key] = value;
            }
          }
        }
        
        console.log(`   📋 Gefundene Datenfelder:`);
        Object.keys(employeeData).forEach(key => {
          console.log(`      - "${key}": "${employeeData[key]}"`);
        });
        
        // Look for Standort-related fields
        const standortKeys = Object.keys(employeeData).filter(key => 
          key.toLowerCase().includes('standort') || 
          key.toLowerCase().includes('location') ||
          key.toLowerCase().includes('ort')
        );
        
        if (standortKeys.length > 0) {
          console.log(`   📍 Standort-bezogene Felder gefunden:`);
          standortKeys.forEach(key => {
            console.log(`      - "${key}": "${employeeData[key]}"`);
          });
        } else {
          console.log(`   ⚠️  Keine Standort-bezogenen Felder gefunden`);
        }
        
      } else {
        console.log(`   ⚠️  Kein Mitarbeiter Sheet gefunden`);
        console.log(`   📋 Verfügbare Sheets: ${workbook.SheetNames.join(', ')}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Fehler beim Lesen von ${file}: ${error.message}`);
    }
  }
}

analyzeExcelLocations(); 