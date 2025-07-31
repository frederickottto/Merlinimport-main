const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const excelsFolder = path.join(__dirname, "excels");

function debugExcelStructure() {
  console.log('🔍 Debugge Excel-Struktur...\n');
  
  // Finde die erste Excel-Datei
  function findFirstExcelFile() {
    const items = fs.readdirSync(excelsFolder);
    
    for (const item of items) {
      const fullPath = path.join(excelsFolder, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const subItems = fs.readdirSync(fullPath);
        for (const subItem of subItems) {
          if (subItem.endsWith('.xlsx') && subItem.includes('EY CSS - Datenerhebung')) {
            return {
              path: path.join(fullPath, subItem),
              filename: subItem,
              directory: item
            };
          }
        }
      }
    }
    return null;
  }
  
  const fileInfo = findFirstExcelFile();
  
  if (!fileInfo) {
    console.log('❌ Keine Excel-Dateien gefunden!');
    return;
  }
  
  console.log(`📁 Analysiere: ${fileInfo.filename} in ${fileInfo.directory}\n`);
  
  try {
    const workbook = xlsx.readFile(fileInfo.path);
    const sheets = workbook.SheetNames;
    
    console.log('📋 Verfügbare Sheets:', sheets);
    
    // Analysiere das Mitarbeiter-Sheet
    if (sheets.includes('Mitarbeiter')) {
      console.log('\n👥 Analysiere "Mitarbeiter" Sheet:');
      const mitarbeiterSheet = workbook.Sheets['Mitarbeiter'];
      
      // Lese alle Zeilen als Array
      const range = xlsx.utils.decode_range(mitarbeiterSheet['!ref']);
      console.log(`📊 Sheet Range: ${range.s.r}-${range.e.r} Zeilen, ${range.s.c}-${range.e.c} Spalten`);
      
      // Lese die ersten 10 Zeilen als Array
      const allData = xlsx.utils.sheet_to_json(mitarbeiterSheet, { header: 1 });
      console.log('\n📝 Alle Zeilen (erste 10):');
      
      for (let i = 0; i < Math.min(10, allData.length); i++) {
        console.log(`Zeile ${i}:`, allData[i]);
      }
      
      // Versuche verschiedene Header-Optionen
      console.log('\n🔍 Versuche verschiedene Header-Konfigurationen:');
      
      // Option 1: Erste Zeile als Header
      const dataWithHeader1 = xlsx.utils.sheet_to_json(mitarbeiterSheet, { header: 1, range: 1 });
      console.log('\n📊 Mit Header (Zeile 1):');
      if (dataWithHeader1.length > 0) {
        console.log('Erste Zeile:', dataWithHeader1[0]);
      }
      
      // Option 2: Zweite Zeile als Header
      const dataWithHeader2 = xlsx.utils.sheet_to_json(mitarbeiterSheet, { header: 1, range: 2 });
      console.log('\n📊 Mit Header (Zeile 2):');
      if (dataWithHeader2.length > 0) {
        console.log('Erste Zeile:', dataWithHeader2[0]);
      }
      
      // Option 3: Dritte Zeile als Header
      const dataWithHeader3 = xlsx.utils.sheet_to_json(mitarbeiterSheet, { header: 1, range: 3 });
      console.log('\n📊 Mit Header (Zeile 3):');
      if (dataWithHeader3.length > 0) {
        console.log('Erste Zeile:', dataWithHeader3[0]);
      }
      
      // Suche nach dem Namenskürzel in verschiedenen Zeilen
      console.log('\n🔍 Suche nach Namenskürzel in verschiedenen Zeilen:');
      for (let i = 0; i < Math.min(5, allData.length); i++) {
        const row = allData[i];
        if (row && row.length > 0) {
          const nameIndex = row.findIndex(cell => 
            cell && typeof cell === 'string' && 
            (cell.toLowerCase().includes('name') || 
             cell.toLowerCase().includes('kürzel') || 
             cell.toLowerCase().includes('pseudo') ||
             cell.toLowerCase().includes('code'))
          );
          
          if (nameIndex !== -1) {
            console.log(`Zeile ${i}, Spalte ${nameIndex}: "${row[nameIndex]}"`);
          }
        }
      }
      
      // Suche nach dem tatsächlichen Namenskürzel-Wert
      console.log('\n🔍 Suche nach Namenskürzel-Werten:');
      for (let i = 0; i < allData.length; i++) {
        const row = allData[i];
        if (row && row.length > 0) {
          for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            if (cell && typeof cell === 'string' && cell.length === 3 && /^[A-Z]{3}$/.test(cell)) {
              console.log(`Mögliches Namenskürzel: "${cell}" in Zeile ${i}, Spalte ${j}`);
            }
          }
        }
      }
      
    } else {
      console.log('\n❌ "Mitarbeiter" Sheet nicht gefunden!');
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Lesen der Excel-Datei:', error);
  }
}

debugExcelStructure(); 