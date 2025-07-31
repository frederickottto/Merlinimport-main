// Test script for volume parsing function
const XLSX = require('xlsx');

// Function to parse volume string to number (correctly handling American number format)
function parseVolume(volumeString) {
  if (!volumeString || volumeString === '' || volumeString === null) {
    return null;
  }
  
  // Remove currency symbols and spaces
  let cleaned = volumeString.toString().replace(/[€\s]/g, '');
  
  // Handle American number format: "800,000.00" means 800,000.00 in American format
  // Remove commas (thousands separators) and keep dots as decimal separators
  cleaned = cleaned.replace(/,/g, '');
  
  const number = parseFloat(cleaned);
  return isNaN(number) ? null : number;
}

// Test the function
console.log("🧪 Teste Volumen-Parsing:");
console.log(`"800,000.00 €" -> ${parseVolume("800,000.00 €")}`);
console.log(`"350,000.00 €" -> ${parseVolume("350,000.00 €")}`);
console.log(`"1,234,567.89 €" -> ${parseVolume("1,234,567.89 €")}`);
console.log(`"100.50 €" -> ${parseVolume("100.50 €")}`);
console.log(`"0 €" -> ${parseVolume("0 €")}`);
console.log(`"" -> ${parseVolume("")}`);
console.log(`null -> ${parseVolume(null)}`);

// Test with actual Excel data
console.log("\n📊 Teste mit echten Excel-Daten:");
const workbook = XLSX.readFile('./Projekte/Book2.xlsx');
const sheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

data.slice(1, 5).forEach((row, index) => {
  const projectTitle = row[3] || 'Unbekannt';
  const volumeString = row[10];
  const parsedVolume = parseVolume(volumeString);
  console.log(`Projekt: ${projectTitle}`);
  console.log(`  Original: "${volumeString}"`);
  console.log(`  Geparst: ${parsedVolume}`);
  console.log(`  Typ: ${typeof parsedVolume}`);
  console.log('');
}); 