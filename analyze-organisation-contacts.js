const XLSX = require('xlsx');
require('dotenv').config();

async function analyzeOrganisationContacts() {
  console.log('🔍 Analysiere OrganisationenÜbersicht.xlsx für Kontakte...\n');
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/OrganisationenÜbersicht.xlsx');
    
    console.log('📊 Verfügbare Sheets:');
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`   ${index + 1}. ${sheetName}`);
    });
    
    // Analyze each sheet
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n📋 Analysiere Sheet: "${sheetName}"`);
      
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      console.log(`   📊 Zeilen: ${data.length}`);
      
      if (data.length > 0) {
        console.log(`   📋 Erste Zeile (Header):`);
        console.log(`      ${data[0].map((cell, index) => `${index}: "${cell}"`).join(', ')}`);
        
        if (data.length > 1) {
          console.log(`   📋 Zweite Zeile (Beispieldaten):`);
          console.log(`      ${data[1].map((cell, index) => `${index}: "${cell}"`).join(', ')}`);
        }
        
        // Look for contact-related columns
        const contactKeywords = ['kontakt', 'contact', 'name', 'email', 'telefon', 'phone', 'position', 'rolle', 'role'];
        const contactColumns = [];
        
        if (data[0]) {
          data[0].forEach((header, index) => {
            if (header && typeof header === 'string') {
              const headerLower = header.toLowerCase();
              if (contactKeywords.some(keyword => headerLower.includes(keyword))) {
                contactColumns.push({ index, header });
              }
            }
          });
        }
        
        if (contactColumns.length > 0) {
          console.log(`   👥 Kontakt-Spalten gefunden:`);
          contactColumns.forEach(col => {
            console.log(`      Spalte ${col.index}: "${col.header}"`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Analysieren der Excel-Datei:', error);
  }
}

analyzeOrganisationContacts(); 