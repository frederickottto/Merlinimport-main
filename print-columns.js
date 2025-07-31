const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const excelFolder = path.join(__dirname, "excels");
const file = fs.readdirSync(excelFolder).find(f => f.includes("PKA") && f.endsWith(".xlsx") && !f.startsWith("~$"));
if (!file) {
  console.log("No file found with 'PKA' in the name.");
  process.exit(1);
}
const workbook = xlsx.readFile(path.join(excelFolder, file));
["Mitarbeiter", "BeruflicherWerdegang"].forEach(sheetName => {
  if (workbook.SheetNames.includes(sheetName)) {
    const sheetJson = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
    if (sheetJson.length > 0) {
      console.log(`Columns in ${sheetName}:`, Object.keys(sheetJson[0]));
    } else {
      console.log(`No data in ${sheetName}`);
    }
  } else {
    console.log(`Sheet ${sheetName} not found`);
  }
}); 