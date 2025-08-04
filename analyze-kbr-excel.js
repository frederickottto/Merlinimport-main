const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function analyzeKBRExcel() {
  console.log('🔍 Analysiere KBR Excel-Datei...\n');
  
  try {
    const kbrExcelPath = path.join(__dirname, 'excels', 'KBR', 'EY CSS -  Datenerhebung KBR - 0.10.xlsx');
    
    if (!fs.existsSync(kbrExcelPath)) {
      console.log('❌ KBR Excel-Datei nicht gefunden');
      return;
    }
    
    console.log('📊 Lese KBR Excel-Datei...');
    const workbook = XLSX.readFile(kbrExcelPath);
    const sheetNames = workbook.SheetNames;
    console.log(`   Verfügbare Sheets: ${sheetNames.join(', ')}`);
    
    // Analyze each sheet
    for (const sheetName of sheetNames) {
      console.log(`\n📋 **Sheet: ${sheetName}**`);
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      console.log(`   Zeilen: ${data.length}`);
      
      if (data.length > 0) {
        console.log('   Spalten:');
        const firstRow = data[0];
        Object.keys(firstRow).forEach(key => {
          console.log(`      - ${key}: "${firstRow[key]}"`);
        });
        
        // Show first few rows
        console.log('   Erste Zeilen:');
        data.slice(0, 3).forEach((row, index) => {
          console.log(`      Zeile ${index + 1}:`);
          Object.keys(row).forEach(key => {
            console.log(`        ${key}: "${row[key]}"`);
          });
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Analysieren der KBR Excel-Datei:', error);
  }
}

analyzeKBRExcel().catch(console.error); 