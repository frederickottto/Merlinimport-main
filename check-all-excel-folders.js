const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkAllExcelFolders() {
  console.log('🔍 Überprüfe alle Excel-Ordner auf detaillierte Profile...\n');
  
  try {
    const excelsDir = './excels';
    const folders = fs.readdirSync(excelsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`📁 Gefunden: ${folders.length} Ordner im excels Verzeichnis\n`);
    
    const profilesWithExcelFiles = [];
    const profilesWithoutExcelFiles = [];
    
    // Get all employees with 3-letter pseudonyms
    const employees = await prisma.employee.findMany({
      where: {
        pseudonym: {
          not: null
        }
      },
      select: {
        id: true,
        pseudonym: true,
        foreName: true,
        lastName: true,
        experienceIt: true,
        experienceIs: true,
        experienceItGs: true,
        experienceGps: true,
        experienceAll: true
      }
    });
    
    const threeLetterEmployees = employees.filter(emp => emp.pseudonym && emp.pseudonym.length === 3);
    
    console.log(`📊 Gefunden: ${threeLetterEmployees.length} Mitarbeiter mit 3-Buchstaben-Pseudonymen\n`);
    
    // Check each folder
    for (const folder of folders) {
      const folderPath = path.join(excelsDir, folder);
      const files = fs.readdirSync(folderPath);
      
      // Look for Excel files
      const excelFiles = files.filter(file => 
        file.endsWith('.xlsx') && 
        !file.includes('Mitarbeitersichtung') &&
        !file.includes('Überblick')
      );
      
      if (excelFiles.length > 0) {
        console.log(`📁 ${folder}:`);
        console.log(`   Excel-Dateien: ${excelFiles.join(', ')}`);
        
        // Check if this folder corresponds to a pseudonym
        const matchingEmployee = threeLetterEmployees.find(emp => emp.pseudonym === folder);
        
        if (matchingEmployee) {
          console.log(`   ✅ Entspricht Pseudonym: ${matchingEmployee.pseudonym}`);
          
          // Check if employee has experience data
          const hasExperience = matchingEmployee.experienceIt > 0 || 
                               matchingEmployee.experienceIs > 0 || 
                               matchingEmployee.experienceItGs > 0 || 
                               matchingEmployee.experienceGps > 0 || 
                               matchingEmployee.experienceAll > 0;
          
          if (!hasExperience) {
            console.log(`   ⚠️  Mitarbeiter hat keine Erfahrungsdaten - könnte vervollständigt werden`);
            profilesWithExcelFiles.push({
              pseudonym: matchingEmployee.pseudonym,
              id: matchingEmployee.id,
              folder: folder,
              excelFiles: excelFiles,
              hasExperience: hasExperience
            });
          } else {
            console.log(`   ✅ Mitarbeiter hat bereits Erfahrungsdaten`);
          }
        } else {
          console.log(`   ❌ Kein entsprechendes Pseudonym gefunden`);
        }
        console.log('');
      }
    }
    
    // Check employees without Excel files
    for (const employee of threeLetterEmployees) {
      const hasExcelFolder = folders.includes(employee.pseudonym);
      const hasExperience = employee.experienceIt > 0 || 
                           employee.experienceIs > 0 || 
                           employee.experienceItGs > 0 || 
                           employee.experienceGps > 0 || 
                           employee.experienceAll > 0;
      
      if (!hasExcelFolder && !hasExperience) {
        profilesWithoutExcelFiles.push({
          pseudonym: employee.pseudonym,
          id: employee.id,
          hasExperience: hasExperience
        });
      }
    }
    
    console.log('📋 **Zusammenfassung:**');
    console.log(`\n🎯 **Profile mit Excel-Dateien (können vervollständigt werden):**`);
    console.log(`   Anzahl: ${profilesWithExcelFiles.length}`);
    if (profilesWithExcelFiles.length > 0) {
      profilesWithExcelFiles.forEach(profile => {
        console.log(`   - ${profile.pseudonym} (Ordner: ${profile.folder})`);
      });
    }
    
    console.log(`\n⚠️  **Profile ohne Excel-Dateien und ohne Erfahrungsdaten:**`);
    console.log(`   Anzahl: ${profilesWithoutExcelFiles.length}`);
    if (profilesWithoutExcelFiles.length > 0) {
      console.log('   Profile:');
      profilesWithoutExcelFiles.forEach(profile => {
        console.log(`   - ${profile.pseudonym}`);
      });
    }
    
    // Show detailed analysis of one example
    if (profilesWithExcelFiles.length > 0) {
      const example = profilesWithExcelFiles[0];
      console.log(`\n🔍 **Beispiel-Analyse für ${example.pseudonym}:**`);
      
      try {
        const excelPath = path.join(excelsDir, example.folder, example.excelFiles[0]);
        const workbook = XLSX.readFile(excelPath);
        
        console.log(`   Excel-Datei: ${example.excelFiles[0]}`);
        console.log(`   Sheets: ${workbook.SheetNames.join(', ')}`);
        
        // Check if it has similar structure to KBR
        const hasMitarbeiter = workbook.SheetNames.includes('Mitarbeiter');
        const hasBeruflicherWerdegang = workbook.SheetNames.includes('BeruflicherWerdegang');
        const hasQualifikation = workbook.SheetNames.includes('Qualifikation');
        const hasLizensierung = workbook.SheetNames.includes('Lizensierung');
        
        console.log(`   Hat Mitarbeiter-Sheet: ${hasMitarbeiter ? '✅' : '❌'}`);
        console.log(`   Hat BeruflicherWerdegang: ${hasBeruflicherWerdegang ? '✅' : '❌'}`);
        console.log(`   Hat Qualifikation: ${hasQualifikation ? '✅' : '❌'}`);
        console.log(`   Hat Lizensierung: ${hasLizensierung ? '✅' : '❌'}`);
        
        if (hasMitarbeiter && hasBeruflicherWerdegang) {
          console.log(`   ✅ Struktur ähnlich KBR - kann importiert werden`);
        } else {
          console.log(`   ⚠️  Andere Struktur - manuelle Anpassung nötig`);
        }
        
      } catch (error) {
        console.log(`   ❌ Fehler beim Lesen der Excel-Datei: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Überprüfen der Excel-Ordner:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllExcelFolders().catch(console.error); 