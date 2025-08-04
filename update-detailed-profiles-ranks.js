const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function updateDetailedProfilesRanks() {
  console.log('🔧 Aktualisiere Ränge für Profile mit eigenen Excel-Dateien...\n');
  
  try {
    // Get all subdirectories in excels folder
    const excelsDir = path.join(__dirname, 'excels');
    const subdirs = fs.readdirSync(excelsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`📁 Gefunden: ${subdirs.length} Unterordner im excels Verzeichnis`);
    
    // Get all employees from database
    const allEmployees = await prisma.employee.findMany({
      select: {
        id: true,
        pseudonym: true,
        foreName: true,
        lastName: true,
        employeeRankIDs: true
      }
    });
    
    console.log(`📋 Gefunden: ${allEmployees.length} Mitarbeiter in der Datenbank`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each subdirectory
    for (const subdir of subdirs) {
      try {
        const subdirPath = path.join(excelsDir, subdir);
        const files = fs.readdirSync(subdirPath);
        
        // Find Excel file
        const excelFile = files.find(file => file.endsWith('.xlsx') && file.includes('Datenerhebung'));
        
        if (!excelFile) {
          console.log(`⚠️  Keine Excel-Datei gefunden in ${subdir}`);
          skippedCount++;
          continue;
        }
        
        const excelPath = path.join(subdirPath, excelFile);
        console.log(`📊 Verarbeite: ${subdir}/${excelFile}`);
        
        // Read Excel file
        const workbook = XLSX.readFile(excelPath);
        const sheetNames = workbook.SheetNames;
        
        // Look for data in different sheets
        let employeeData = null;
        let rankData = null;
        
        // Try to find employee data in different sheets
        for (const sheetName of sheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet);
          
          if (data.length > 0) {
            const firstRow = data[0];
            const keys = Object.keys(firstRow);
            
            // Check if this sheet contains employee data
            const hasPseudonym = keys.some(key => key.toLowerCase().includes('pseudonym') || key.toLowerCase().includes('kürzel'));
            const hasRank = keys.some(key => key.toLowerCase().includes('rang') || key.toLowerCase().includes('position') || key.toLowerCase().includes('rank'));
            const hasName = keys.some(key => key.toLowerCase().includes('name') || key.toLowerCase().includes('vorname'));
            
            if (hasPseudonym && hasRank) {
              employeeData = data;
              console.log(`   ✅ Daten gefunden in Sheet: ${sheetName}`);
              break;
            }
          }
        }
        
        if (!employeeData) {
          console.log(`   ⚠️  Keine Mitarbeiterdaten gefunden in ${subdir}`);
          skippedCount++;
          continue;
        }
        
        // Process employee data
        for (const row of employeeData) {
          try {
            // Find pseudonym and rank in the row
            const pseudonym = row.Pseudonym || row.Kürzel || row['Namenskürzel'] || row['Kürzel'] || row['Pseudonym'];
            const rank = row.Rang || row.Position || row.Rank || row['Position'] || row['Rang'];
            
            if (!pseudonym || !rank) {
              continue; // Skip rows without pseudonym or rank
            }
            
            // Find employee in database
            const employee = allEmployees.find(emp => emp.pseudonym === pseudonym);
            
            if (!employee) {
              console.log(`   ⚠️  Mitarbeiter nicht gefunden: ${pseudonym}`);
              continue;
            }
            
            // Find or create rank
            let rankRecord = await prisma.employeeRank.findFirst({
              where: {
                employeePositionShort: rank
              }
            });
            
            if (!rankRecord) {
              // Create new rank
              rankRecord = await prisma.employeeRank.create({
                data: {
                  employeePositionShort: rank,
                  employeePositionLong: rank,
                  employeeCostStraight: null
                }
              });
              console.log(`   ✅ Neuer Rang erstellt: ${rank}`);
            }
            
            // Update employee with rank
            await prisma.employee.update({
              where: { id: employee.id },
              data: { employeeRankIDs: rankRecord.id }
            });
            
            console.log(`   ✅ ${pseudonym}: ${rank} aktualisiert`);
            updatedCount++;
            
          } catch (error) {
            console.error(`   ❌ Fehler bei ${row.Pseudonym || 'Unbekannt'}:`, error.message);
            errorCount++;
          }
        }
        
      } catch (error) {
        console.error(`❌ Fehler beim Verarbeiten von ${subdir}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 **Zusammenfassung:**');
    console.log(`   ✅ Aktualisiert: ${updatedCount} Profile`);
    console.log(`   ⚠️  Übersprungen: ${skippedCount} Profile`);
    console.log(`   ❌ Fehler: ${errorCount} Profile`);
    
    // Verify final state
    console.log('\n🔍 **Finale Überprüfung:**');
    const finalEmployees = await prisma.employee.findMany({
      include: {
        employeeRank: true
      },
      orderBy: { pseudonym: 'asc' }
    });
    
    const employeesWithRanks = finalEmployees.filter(emp => emp.employeeRank);
    const employeesWithoutRanks = finalEmployees.filter(emp => !emp.employeeRank);
    
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
    
    // Show final rank distribution
    const rankDistribution = {};
    employeesWithRanks.forEach(emp => {
      const rank = emp.employeeRank.employeePositionShort;
      rankDistribution[rank] = (rankDistribution[rank] || 0) + 1;
    });
    
    console.log('\n   **Finale Rang-Verteilung:**');
    Object.entries(rankDistribution).forEach(([rank, count]) => {
      console.log(`      ${rank}: ${count} Mitarbeiter`);
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren der detaillierten Profile-Ränge:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDetailedProfilesRanks().catch(console.error); 