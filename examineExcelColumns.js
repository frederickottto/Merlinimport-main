const xlsx = require("xlsx");

async function examineExcelColumns() {
  try {
    console.log('Untersuche Excel-Spalten für Datumsfelder...');
    
    // Read Excel file
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    
    const sheetName = "Vertriebsliste";
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Anzahl Zeilen im Tabellenblatt "Vertriebsliste": ${sheetJson.length}`);
    
    if (sheetJson.length > 0) {
      console.log('\n=== VERFÜGBARE SPALTEN ===');
      const firstRow = sheetJson[0];
      const columns = Object.keys(firstRow);
      
      columns.forEach((column, index) => {
        console.log(`${index + 1}. ${column}`);
      });
      
      console.log('\n=== BEISPIEL-DATEN (erste 3 Zeilen) ===');
      for (let i = 0; i < Math.min(3, sheetJson.length); i++) {
        const row = sheetJson[i];
        console.log(`\nZeile ${i + 1}:`);
        
        // Show only non-empty values
        Object.entries(row).forEach(([key, value]) => {
          if (value && value !== "n/a" && value !== "tbd") {
            console.log(`  ${key}: ${value} (${typeof value})`);
          }
        });
      }
      
      // Look for date-like columns
      console.log('\n=== DATUMS-ÄHNLICHE SPALTEN ===');
      const dateLikeColumns = columns.filter(col => 
        col.toLowerCase().includes('datum') ||
        col.toLowerCase().includes('frist') ||
        col.toLowerCase().includes('deadline') ||
        col.toLowerCase().includes('termin') ||
        col.toLowerCase().includes('beginn') ||
        col.toLowerCase().includes('ende') ||
        col.toLowerCase().includes('start') ||
        col.toLowerCase().includes('veröffentlichung') ||
        col.toLowerCase().includes('vergabe') ||
        col.toLowerCase().includes('vertrag')
      );
      
      dateLikeColumns.forEach(col => {
        console.log(`📅 ${col}`);
      });
    }
    
  } catch (error) {
    console.error('Fehler beim Untersuchen der Excel-Spalten:', error);
  }
}

examineExcelColumns(); 