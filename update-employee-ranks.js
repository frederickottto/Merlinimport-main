const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function updateEmployeeRanks() {
  console.log('🔧 Aktualisiere Mitarbeiter-Ränge aus Mitarbeitersichtung...\n');
  
  try {
    // Read Mitarbeitersichtung Excel file
    const excelPath = path.join(__dirname, 'excels', 'EY CSS - Mitarbeitersichtung - 0.01.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.log('❌ Mitarbeitersichtung Excel-Datei nicht gefunden');
      return;
    }
    
    console.log('📊 Lese Mitarbeitersichtung Excel-Datei...');
    const workbook = XLSX.readFile(excelPath);
    
    if (!workbook.SheetNames.includes('Sichtung')) {
      console.log('❌ Sichtung Sheet nicht gefunden');
      return;
    }
    
    const sichtungSheet = workbook.Sheets['Sichtung'];
    const sichtungData = XLSX.utils.sheet_to_json(sichtungSheet);
    
    console.log(`📋 Gefunden: ${sichtungData.length} Mitarbeiter in der Excel-Datei`);
    
    // Get all existing employees from database
    const existingEmployees = await prisma.employee.findMany({
      select: {
        id: true,
        pseudonym: true,
        foreName: true,
        lastName: true,
        employeeRankIDs: true
      }
    });
    
    console.log(`📋 Gefunden: ${existingEmployees.length} Mitarbeiter in der Datenbank`);
    
    // Create rank mapping
    const rankMapping = {
      'Senior': 'Senior',
      'Staff/Assistant': 'Staff/Assistant', 
      'Manager': 'Manager',
      'Senior Manager': 'Senior Manager',
      'Executive Director': 'Executive Director',
      'Partner/Principal': 'Partner/Principal',
      'Intern (CS)': 'Intern (CS)',
      'MFD/Director': 'MFD/Director'
    };
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each row from Excel
    for (const row of sichtungData) {
      try {
        const pseudonym = row.Pseudonym;
        const position = row.Position;
        
        if (!pseudonym || !position) {
          console.log(`⚠️  Zeile übersprungen: Pseudonym=${pseudonym}, Position=${position}`);
          skippedCount++;
          continue;
        }
        
        // Find employee in database
        const employee = existingEmployees.find(emp => emp.pseudonym === pseudonym);
        
        if (!employee) {
          console.log(`⚠️  Mitarbeiter nicht gefunden: ${pseudonym}`);
          skippedCount++;
          continue;
        }
        
        // Find or create rank
        let rank = await prisma.employeeRank.findFirst({
          where: {
            employeePositionShort: position
          }
        });
        
        if (!rank) {
          // Create new rank
          rank = await prisma.employeeRank.create({
            data: {
              employeePositionShort: position,
              employeePositionLong: position,
              employeeCostStraight: null
            }
          });
          console.log(`   ✅ Neuer Rang erstellt: ${position}`);
        }
        
        // Update employee with rank
        await prisma.employee.update({
          where: { id: employee.id },
          data: { employeeRankIDs: rank.id }
        });
        
        console.log(`✅ ${pseudonym}: ${position} aktualisiert`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Fehler bei ${row.Pseudonym || 'Unbekannt'}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 **Zusammenfassung:**');
    console.log(`   ✅ Aktualisiert: ${updatedCount} Profile`);
    console.log(`   ⚠️  Übersprungen: ${skippedCount} Profile`);
    console.log(`   ❌ Fehler: ${errorCount} Profile`);
    
    // Verify updates
    console.log('\n🔍 **Überprüfung der Aktualisierungen:**');
    const updatedEmployees = await prisma.employee.findMany({
      include: {
        employeeRank: true
      },
      orderBy: { pseudonym: 'asc' }
    });
    
    const employeesWithRanks = updatedEmployees.filter(emp => emp.employeeRank);
    const employeesWithoutRanks = updatedEmployees.filter(emp => !emp.employeeRank);
    
    console.log(`   Profile mit Rang: ${employeesWithRanks.length}`);
    console.log(`   Profile ohne Rang: ${employeesWithoutRanks.length}`);
    
    if (employeesWithoutRanks.length > 0) {
      console.log('\n   **Profile ohne Rang:**');
      employeesWithoutRanks.slice(0, 10).forEach(emp => {
        console.log(`      - ${emp.pseudonym || 'Kein Pseudonym'} (${emp.foreName} ${emp.lastName})`);
      });
      if (employeesWithoutRanks.length > 10) {
        console.log(`      ... und ${employeesWithoutRanks.length - 10} weitere`);
      }
    }
    
    // Show rank distribution
    const rankDistribution = {};
    employeesWithRanks.forEach(emp => {
      const rank = emp.employeeRank.employeePositionShort;
      rankDistribution[rank] = (rankDistribution[rank] || 0) + 1;
    });
    
    console.log('\n   **Rang-Verteilung:**');
    Object.entries(rankDistribution).forEach(([rank, count]) => {
      console.log(`      ${rank}: ${count} Mitarbeiter`);
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren der Mitarbeiter-Ränge:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEmployeeRanks().catch(console.error); 