const { PrismaClient } = require("@prisma/client");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const prisma = new PrismaClient();

async function checkFGR() {
  try {
    console.log('Checking FGR profile...');
    
    // Check database
    const fgrEmployee = await prisma.employee.findFirst({
      where: { pseudonym: 'FGR' },
      include: {
        academicDegree: true
      }
    });
    
    if (fgrEmployee) {
      console.log('\n=== Database Entry ===');
      console.log(`Employee: ${fgrEmployee.pseudonym}`);
      console.log(`ID: ${fgrEmployee.id}`);
      console.log(`Academic Degrees: ${fgrEmployee.academicDegree.length}`);
      
      for (const degree of fgrEmployee.academicDegree) {
        console.log(`  - ${degree.degreeTitleLong} at ${degree.university}`);
        console.log(`    ID: ${degree.id}`);
        console.log(`    Study: ${degree.study}`);
        console.log(`    StudyEnd: ${degree.studyEnd}`);
      }
    } else {
      console.log('FGR employee not found in database');
    }
    
    // Check Excel file
    const excelPath = path.join(__dirname, 'excels', 'FGR', 'EY CSS - Datenerhebung FGR - 0.10.xlsx');
    
    if (fs.existsSync(excelPath)) {
      console.log('\n=== Excel File ===');
      const workbook = xlsx.readFile(excelPath);
      const sheets = workbook.SheetNames;
      
      if (sheets.includes('AkademischerAbschluss')) {
        const sheet = workbook.Sheets['AkademischerAbschluss'];
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
          }
        }
      } else {
        console.log('AkademischerAbschluss sheet not found');
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

checkFGR(); 