const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// Function to find all Excel files
function findExcelFiles() {
  const excelsDir = path.join(__dirname, 'excels');
  const excelFiles = [];
  
  function scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.xlsx') && item.includes('EY CSS - Datenerhebung')) {
        const subdirectory = path.basename(dirPath);
        excelFiles.push({
          filepath: fullPath,
          filename: item,
          subdirectory: subdirectory
        });
      }
    }
  }
  
  scanDirectory(excelsDir);
  return excelFiles;
}

// Function to check Excel structure
function checkExcelStructure(fileInfo) {
  try {
    const workbook = xlsx.readFile(fileInfo.filepath);
    const sheets = workbook.SheetNames;
    
    if (sheets.includes('AkademischerAbschluss')) {
      console.log(`\n=== ${fileInfo.subdirectory} ===`);
      const sheet = workbook.Sheets['AkademischerAbschluss'];
      
      // Get raw data
      const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
      
      console.log('Raw rows structure:');
      for (let i = 0; i < Math.min(5, rawRows.length); i++) {
        console.log(`Row ${i}:`, rawRows[i]);
      }
      
      // Try to get headers
      if (rawRows.length > 1) {
        const headers = rawRows[1];
        console.log('Headers:', headers);
        
        // Show first few data rows
        if (rawRows.length > 2) {
          console.log('First data rows:');
          for (let i = 2; i < Math.min(5, rawRows.length); i++) {
            const row = rawRows[i];
            const obj = {};
            headers.forEach((header, idx) => {
              obj[header] = row[idx];
            });
            console.log(`Row ${i}:`, obj);
          }
        }
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${fileInfo.filename}:`, error);
    return false;
  }
}

// Main function
function main() {
  const excelFiles = findExcelFiles();
  console.log(`Found ${excelFiles.length} Excel files`);
  
  // Check first 3 files with academic degrees
  let checked = 0;
  for (const fileInfo of excelFiles) {
    if (checked >= 3) break;
    
    if (checkExcelStructure(fileInfo)) {
      checked++;
    }
  }
}

main(); 