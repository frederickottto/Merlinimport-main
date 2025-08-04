const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function analyzeMitarbeitersichtungRanks() {
  console.log('🔍 Analysiere Mitarbeitersichtung Excel für Ränge/Positionen...\n');
  
  try {
    const excelPath = path.join(__dirname, 'excels', 'EY CSS - Mitarbeitersichtung - 0.01.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.log('❌ Mitarbeitersichtung Excel-Datei nicht gefunden');
      return;
    }
    
    console.log('📊 Lese Mitarbeitersichtung Excel-Datei...');
    const workbook = XLSX.readFile(excelPath);
    const sheetNames = workbook.SheetNames;
    console.log(`   Verfügbare Sheets: ${sheetNames.join(', ')}`);
    
    // Analyze Sichtung sheet
    if (sheetNames.includes('Sichtung')) {
      const sichtungSheet = workbook.Sheets['Sichtung'];
      const sichtungData = XLSX.utils.sheet_to_json(sichtungSheet);
      
      console.log(`\n📋 **Sichtung Sheet:**`);
      console.log(`   Zeilen: ${sichtungData.length}`);
      
      if (sichtungData.length > 0) {
        console.log('   Spalten:');
        const firstRow = sichtungData[0];
        Object.keys(firstRow).forEach(key => {
          console.log(`      - ${key}: "${firstRow[key]}"`);
        });
        
        // Show first few rows with rank/position data
        console.log('\n   Erste Zeilen mit Rang/Position Daten:');
        sichtungData.slice(0, 5).forEach((row, index) => {
          console.log(`      Zeile ${index + 1}:`);
          console.log(`        Pseudonym: ${row.Pseudonym || 'N/A'}`);
          console.log(`        Name: ${row.Name || 'N/A'}`);
          console.log(`        Rang/Position: ${row.Rang || row.Position || row.Rank || 'N/A'}`);
          console.log(`        Standort: ${row.Standort || 'N/A'}`);
          console.log(`        Erfahrung: ${row.Erfahrung || 'N/A'}`);
        });
        
        // Look for rank/position patterns
        const rankPatterns = {};
        sichtungData.forEach(row => {
          const rank = row.Rang || row.Position || row.Rank;
          if (rank) {
            rankPatterns[rank] = (rankPatterns[rank] || 0) + 1;
          }
        });
        
        console.log('\n   **Gefundene Ränge/Positionen:**');
        Object.entries(rankPatterns).forEach(([rank, count]) => {
          console.log(`      ${rank}: ${count} Mitarbeiter`);
        });
      }
    }
    
    // Check other sheets if they exist
    for (const sheetName of sheetNames) {
      if (sheetName !== 'Sichtung') {
        console.log(`\n📋 **Sheet: ${sheetName}**`);
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        console.log(`   Zeilen: ${data.length}`);
        
        if (data.length > 0) {
          const firstRow = data[0];
          console.log('   Spalten:');
          Object.keys(firstRow).forEach(key => {
            console.log(`      - ${key}: "${firstRow[key]}"`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Analysieren der Mitarbeitersichtung Excel:', error);
  }
}

analyzeMitarbeitersichtungRanks().catch(console.error); 