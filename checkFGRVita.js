const { PrismaClient } = require("@prisma/client");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const prisma = new PrismaClient();

async function checkFGRVita() {
  try {
    console.log('Checking FGR profile professional background...');
    
    // Check database
    const fgrEmployee = await prisma.employee.findFirst({
      where: { pseudonym: 'FGR' },
      include: {
        professionalBackground: true
      }
    });
    
    if (fgrEmployee) {
      console.log('\n=== Database Professional Background ===');
      console.log(`Employee: ${fgrEmployee.pseudonym}`);
      console.log(`ID: ${fgrEmployee.id}`);
      console.log(`Professional Background entries: ${fgrEmployee.professionalBackground.length}`);
      
      for (let i = 0; i < fgrEmployee.professionalBackground.length; i++) {
        const bg = fgrEmployee.professionalBackground[i];
        console.log(`\nEntry ${i + 1}:`);
        console.log(`  ID: ${bg.id}`);
        console.log(`  Employer: "${bg.employer}"`);
        console.log(`  Position: "${bg.position}"`);
        console.log(`  Description: "${bg.description}"`);
        console.log(`  Start: ${bg.professionStart}`);
        console.log(`  End: ${bg.professionEnd}`);
        
        // Check if entry is empty
        const isEmpty = !bg.employer && !bg.position && !bg.description && !bg.professionStart && !bg.professionEnd;
        console.log(`  Is Empty: ${isEmpty}`);
      }
    } else {
      console.log('FGR employee not found in database');
    }
    
    // Check Excel file
    const excelPath = path.join(__dirname, 'excels', 'FGR', 'EY CSS - Datenerhebung FGR - 0.10.xlsx');
    
    if (fs.existsSync(excelPath)) {
      console.log('\n=== Excel File Professional Background ===');
      const workbook = xlsx.readFile(excelPath);
      const sheets = workbook.SheetNames;
      
      if (sheets.includes('BeruflicherWerdegang')) {
        const sheet = workbook.Sheets['BeruflicherWerdegang'];
        const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
        
        console.log('Raw Excel data:');
        for (let i = 0; i < rawRows.length; i++) {
          console.log(`Row ${i}:`, rawRows[i]);
        }
        
        if (rawRows.length > 2) {
          const headers = rawRows[1];
          console.log('\nHeaders:', headers);
          
          const dataRows = rawRows.slice(2);
          console.log('\nData rows:');
          for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const obj = {};
            headers.forEach((header, idx) => {
              obj[header] = row[idx];
            });
            console.log(`Row ${i}:`, obj);
            
            // Check if row is empty
            const isEmpty = Object.values(obj).every(value => !value || value === '' || value === null);
            console.log(`  Is Empty: ${isEmpty}`);
          }
        }
      } else {
        console.log('BeruflicherWerdegang sheet not found');
      }
    } else {
      console.log('Excel file not found:', excelPath);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFGRVita(); 