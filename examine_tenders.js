const xlsx = require('xlsx');

// Examine the main tender list
console.log('=== Examining Ausschreibungs-Liste.xlsx ===');
const workbook = xlsx.readFile('tenders/Ausschreibungs-Liste.xlsx');
console.log('Sheets:', workbook.SheetNames);

const vertriebsliste = workbook.Sheets['Vertriebsliste'];
const data = xlsx.utils.sheet_to_json(vertriebsliste, { header: 1 });

console.log('\nFirst 3 rows of Vertriebsliste:');
data.slice(0, 3).forEach((row, i) => {
  console.log(`Row ${i}:`, row);
});

// Examine the title file
console.log('\n=== Examining Copy of Vertrieb_mit_laengeren_Titeln.xlsx ===');
const titleWorkbook = xlsx.readFile('tenders/Copy of Vertrieb_mit_laengeren_Titeln.xlsx');
console.log('Title file sheets:', titleWorkbook.SheetNames);

const titleSheet = titleWorkbook.Sheets[titleWorkbook.SheetNames[0]];
const titleData = xlsx.utils.sheet_to_json(titleSheet, { header: 1 });

console.log('\nFirst 3 rows of title file:');
titleData.slice(0, 3).forEach((row, i) => {
  console.log(`Row ${i}:`, row);
}); 