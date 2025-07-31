const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

// Test script to verify Excel file structure
const excelsFolder = path.join(__dirname, "excels");

function testSingleFile() {
  console.log('Testing single Excel file structure...');
  
  // Find the first Excel file
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
    console.log('No Excel files found!');
    return;
  }
  
  console.log(`Testing file: ${fileInfo.filename} in ${fileInfo.directory}`);
  
  try {
    const workbook = xlsx.readFile(fileInfo.path);
    const sheets = workbook.SheetNames;
    
    console.log('Available sheets:', sheets);
    
    // Test Mitarbeiter sheet
    if (sheets.includes('Mitarbeiter')) {
      const mitarbeiterSheet = workbook.Sheets['Mitarbeiter'];
      const mitarbeiterData = xlsx.utils.sheet_to_json(mitarbeiterSheet);
      
      console.log(`Mitarbeiter sheet has ${mitarbeiterData.length} rows`);
      
      if (mitarbeiterData.length > 0) {
        const firstRow = mitarbeiterData[0];
        console.log('First row keys:', Object.keys(firstRow));
        console.log('Namenskürzel:', firstRow['Namenskürzel']);
        console.log('Standort:', firstRow['Standort']);
        console.log('Rank:', firstRow['Rank']);
        console.log('Einstelldatum:', firstRow['Einstelldatum']);
      }
    }
    
    // Test other sheets
    const relevantSheets = [
      "BeruflicherWerdegang",
      "AkademischerAbschluss", 
      "Referenz",
      "Private Referenz",
      "Lizensierung",
      "Qualifikation"
    ];
    
    for (const sheetName of relevantSheets) {
      if (sheets.includes(sheetName)) {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = xlsx.utils.sheet_to_json(sheet);
        
        console.log(`${sheetName} sheet has ${sheetData.length} rows`);
        
        if (sheetData.length > 0) {
          console.log(`${sheetName} first row keys:`, Object.keys(sheetData[0]));
        }
      }
    }
    
  } catch (error) {
    console.error('Error reading Excel file:', error);
  }
}

testSingleFile(); 