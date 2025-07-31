const XLSX = require('xlsx');
require('dotenv').config();

async function checkExcelRevenue() {
  console.log("🔍 Überprüfe Umsatz-Werte in der Excel-Datei...");
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/OrganisationenÜbersicht.xlsx');
    
    // Check if Sheet1 exists
    if (!workbook.Sheets['Sheet1']) {
      console.log("❌ Sheet 'Sheet1' nicht gefunden!");
      return;
    }
    
    const sheet = workbook.Sheets['Sheet1'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`📊 Sheet 'Sheet1' gefunden mit ${data.length} Zeilen`);
    
    // Check revenue values in the first 10 rows
    console.log("\n📋 Umsatz-Werte aus den ersten 10 Zeilen:");
    
    for (let row = 1; row < Math.min(11, data.length); row++) {
      const rowData = data[row];
      if (rowData && rowData[1]) { // Column 1 is "Name"
        const name = rowData[1]?.toString().trim();
        const revenue = rowData[6]; // Column 6 is revenue
        const revenueType = typeof revenue;
        const revenueValue = revenue?.toString().trim() || '';
        
        console.log(`   ${row}. ${name}:`);
        console.log(`      Wert: "${revenueValue}"`);
        console.log(`      Typ: ${revenueType}`);
        console.log(`      Raw: ${JSON.stringify(revenue)}`);
        console.log('');
      }
    }
    
    // Check all revenue values to find patterns
    console.log("\n📊 Analyse aller Umsatz-Werte:");
    const revenueValues = [];
    
    for (let row = 1; row < data.length; row++) {
      const rowData = data[row];
      if (rowData && rowData[1] && rowData[6]) {
        const revenue = rowData[6];
        const revenueValue = revenue?.toString().trim() || '';
        
        if (revenueValue && revenueValue !== '') {
          revenueValues.push({
            row: row,
            value: revenueValue,
            type: typeof revenue,
            raw: revenue
          });
        }
      }
    }
    
    console.log(`   Gefunden: ${revenueValues.length} Umsatz-Werte`);
    
    // Show unique values
    const uniqueValues = [...new Set(revenueValues.map(r => r.value))];
    console.log(`   Eindeutige Werte: ${uniqueValues.length}`);
    
    console.log("\n📋 Eindeutige Umsatz-Werte:");
    uniqueValues.slice(0, 20).forEach((value, index) => {
      console.log(`   ${index + 1}. "${value}"`);
    });
    
    if (uniqueValues.length > 20) {
      console.log(`   ... und ${uniqueValues.length - 20} weitere`);
    }
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  }
}

checkExcelRevenue(); 