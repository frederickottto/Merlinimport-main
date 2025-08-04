const XLSX = require('xlsx');
const path = require('path');

async function analyzeMitarbeitersichtung() {
  console.log('🔍 Analysiere EY CSS - Mitarbeitersichtung - 0.01.xlsx...\n');
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/EY CSS - Mitarbeitersichtung - 0.01.xlsx');
    
    console.log(`📊 Gefundene Sheets: ${workbook.SheetNames.join(', ')}`);
    
    // Check if "Sichtung" sheet exists
    if (!workbook.Sheets['Sichtung']) {
      console.log("❌ Sheet 'Sichtung' nicht gefunden!");
      return;
    }
    
    const sheet = workbook.Sheets['Sichtung'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    
    console.log(`📋 Sheet 'Sichtung' gefunden mit ${data.length} Zeilen`);
    
    // Analyze the first 73 rows (yellow highlighted rows)
    console.log('\n📊 Analyse der gelb markierten Zeilen (1-73):');
    console.log('=' .repeat(80));
    
    // Show headers first
    if (data[0]) {
      console.log('\n📋 Header (erste Zeile):');
      data[0].forEach((header, index) => {
        if (header) {
          console.log(`   Spalte ${index}: "${header}"`);
        }
      });
    }
    
    // Analyze rows 1-73 (yellow highlighted)
    console.log('\n📊 Daten der gelb markierten Zeilen (1-73):');
    console.log('=' .repeat(80));
    
    for (let rowIndex = 0; rowIndex < Math.min(73, data.length); rowIndex++) {
      const row = data[rowIndex];
      if (row) {
        console.log(`\n📋 Zeile ${rowIndex + 1}:`);
        row.forEach((cell, colIndex) => {
          if (cell !== null && cell !== undefined && cell !== '') {
            console.log(`   Spalte ${colIndex}: "${cell}"`);
          }
        });
      }
    }
    
    // Look for specific patterns or important data
    console.log('\n🔍 Suche nach wichtigen Datenfeldern:');
    console.log('=' .repeat(80));
    
    // Check for employee-related fields
    const employeeFields = ['Name', 'Vorname', 'Nachname', 'Email', 'Telefon', 'Position', 'Abteilung', 'Standort'];
    const foundFields = [];
    
    if (data[0]) {
      data[0].forEach((header, index) => {
        if (header) {
          const lowerHeader = header.toLowerCase();
          employeeFields.forEach(field => {
            if (lowerHeader.includes(field.toLowerCase())) {
              foundFields.push({ column: index, header: header });
            }
          });
        }
      });
    }
    
    if (foundFields.length > 0) {
      console.log('✅ Gefundene Mitarbeiter-relevante Felder:');
      foundFields.forEach(field => {
        console.log(`   - Spalte ${field.column}: "${field.header}"`);
      });
    } else {
      console.log('❌ Keine offensichtlichen Mitarbeiter-Felder gefunden');
    }
    
    // Analyze data structure
    console.log('\n📈 Datenstruktur-Analyse:');
    console.log('=' .repeat(80));
    
    // Count non-empty cells in each column for the first 73 rows
    if (data[0]) {
      for (let col = 0; col < data[0].length; col++) {
        let nonEmptyCount = 0;
        for (let row = 0; row < Math.min(73, data.length); row++) {
          if (data[row] && data[row][col] && data[row][col].toString().trim() !== '') {
            nonEmptyCount++;
          }
        }
        const header = data[0][col] || `Spalte ${col}`;
        console.log(`   ${header}: ${nonEmptyCount} Einträge in den ersten 73 Zeilen`);
      }
    }
    
    // Look for any special formatting or patterns
    console.log('\n🎨 Formatierungs-Analyse:');
    console.log('=' .repeat(80));
    
    // Check if there are any cells with specific formatting or patterns
    let hasSpecialFormatting = false;
    for (let row = 0; row < Math.min(73, data.length); row++) {
      if (data[row]) {
        for (let col = 0; col < data[row].length; col++) {
          const cell = data[row][col];
          if (cell && typeof cell === 'string') {
            // Look for patterns like dates, emails, phone numbers
            if (cell.includes('@')) {
              console.log(`   📧 Email gefunden in Zeile ${row + 1}, Spalte ${col}: "${cell}"`);
              hasSpecialFormatting = true;
            }
            if (cell.match(/\d{2,3}[-\s]?\d{2,3}[-\s]?\d{2,4}/)) {
              console.log(`   📞 Telefonnummer gefunden in Zeile ${row + 1}, Spalte ${col}: "${cell}"`);
              hasSpecialFormatting = true;
            }
            if (cell.match(/\d{2}[.\/-]\d{2}[.\/-]\d{4}/)) {
              console.log(`   📅 Datum gefunden in Zeile ${row + 1}, Spalte ${col}: "${cell}"`);
              hasSpecialFormatting = true;
            }
          }
        }
      }
    }
    
    if (!hasSpecialFormatting) {
      console.log('   Keine spezielle Formatierung (Emails, Telefonnummern, Daten) in den ersten 73 Zeilen gefunden');
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Analysieren der Excel-Datei:', error);
  }
}

analyzeMitarbeitersichtung(); 