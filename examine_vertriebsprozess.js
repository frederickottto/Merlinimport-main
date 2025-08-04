const xlsx = require('xlsx');

// Examine the Vertriebsprozess file
console.log('=== Examining Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx ===');
const workbook = xlsx.readFile('tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx');
console.log('Sheets:', workbook.SheetNames);

// Check each sheet
workbook.SheetNames.forEach(sheetName => {
  console.log(`\n--- Sheet: ${sheetName} ---`);
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  console.log(`Rows: ${data.length}`);
  if (data.length > 0) {
    console.log('First 3 rows:');
    data.slice(0, 3).forEach((row, i) => {
      console.log(`Row ${i}:`, row);
    });
  }
}); 