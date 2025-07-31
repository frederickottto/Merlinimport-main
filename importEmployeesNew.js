// New Employee Import Script
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
require('dotenv').config();

const prisma = new PrismaClient();

async function importEmployees() {
  console.log("🚀 Employee-Import");
  console.log("📋 Importiere Employees aus Excel-Dateien...\n");
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Check if excels folder exists
    const excelFolder = path.join(__dirname, 'excels');
    if (!fs.existsSync(excelFolder)) {
      console.log(`❌ Excel-Ordner nicht gefunden: ${excelFolder}`);
      console.log("💡 Bitte erstelle einen 'excels' Ordner mit den Excel-Dateien");
      return;
    }
    
    // Get all Excel files
    const files = fs.readdirSync(excelFolder)
      .filter(file => file.endsWith('.xlsx') && !file.startsWith('~$'));
    
    if (files.length === 0) {
      console.log("❌ Keine Excel-Dateien im 'excels' Ordner gefunden");
      return;
    }
    
    console.log(`📂 Gefundene Excel-Dateien: ${files.length}`);
    
    let totalEmployees = 0;
    let totalErrors = 0;
    
    for (const file of files) {
      console.log(`\n📄 Verarbeite: ${file}`);
      
      try {
        const workbook = xlsx.readFile(path.join(excelFolder, file));
        
        // Check if 'Mitarbeiter' sheet exists
        if (!workbook.SheetNames.includes('Mitarbeiter')) {
          console.log(`⚠️  Kein 'Mitarbeiter' Sheet in ${file} gefunden`);
          continue;
        }
        
        // Read employee data
        const sheetJson = xlsx.utils.sheet_to_json(workbook.Sheets['Mitarbeiter'], { defval: null });
        
        // Transform to employee object
        const employeeData = {};
        sheetJson.forEach(row => {
          if (row['Allgemeine Mitarbeiterdaten'] && row['__EMPTY'] !== null && row['__EMPTY'] !== undefined) {
            employeeData[row['Allgemeine Mitarbeiterdaten'].trim()] = row['__EMPTY'];
          }
        });
        
        // Map Excel fields to Prisma fields
        const mappedData = {
          foreName: employeeData['Vorname'] || '',
          lastName: employeeData['Nachname'] || '',
          pseudonym: employeeData['Namenskürzel'] || null,
          employeerCompany: employeeData['Arbeitgeber'] || 'Ernst & Young GmbH WPG',
          telephone: employeeData['Telefon-Nr'] || null,
          mobile: employeeData['Handy-Nr'] || null,
          linkedInURL: employeeData['Linkedin-URL'] || null,
          xingURL: employeeData['Xing-URL'] || null,
          discoverURL: employeeData['Discover-URL'] || null,
          experienceIt: parseInt(employeeData['Berufserfahrung IT Allgemein [In Jahren]']) || 0,
          experienceIs: parseInt(employeeData['Berufserfahrung Informationssicherheit [In Jahren]']) || 0,
          experienceItGs: parseInt(employeeData['Berufserfahrung IT-Grundschutz [In Jahren]']) || 0,
          experienceGps: parseInt(employeeData['Berufserfahrung Public Sector (seit)']) || 0,
          description: employeeData['Kurzbeschreibung'] || null
        };
        
        // Parse contract start date
        if (employeeData['Einstelldatum']) {
          if (typeof employeeData['Einstelldatum'] === 'number') {
            mappedData.contractStartDate = new Date((employeeData['Einstelldatum'] - 25569) * 86400 * 1000);
          } else if (typeof employeeData['Einstelldatum'] === 'string') {
            const parsed = new Date(employeeData['Einstelldatum']);
            if (!isNaN(parsed.getTime())) {
              mappedData.contractStartDate = parsed;
            }
          }
        }
        
        // Handle location
        if (employeeData['Standort']) {
          let location = await prisma.location.findFirst({
            where: { city: employeeData['Standort'] }
          });
          
          if (!location) {
            location = await prisma.location.create({
              data: {
                city: employeeData['Standort'],
                street: 'Unknown',
                houseNumber: 'Unknown',
                postCode: 'Unknown',
                region: 'Unknown',
                country: 'Germany'
              }
            });
          }
          
          mappedData.locationIDs = location.id;
        }
        
        // Handle employee rank
        if (employeeData['Rank']) {
          let employeeRank = await prisma.employeeRank.findFirst({
            where: { employeePositionShort: employeeData['Rank'] }
          });
          
          if (!employeeRank) {
            employeeRank = await prisma.employeeRank.create({
              data: {
                employeePositionShort: employeeData['Rank'],
                employeePositionLong: employeeData['Rank']
              }
            });
          }
          
          mappedData.employeeRankIDs = employeeRank.id;
        }
        
        // Create employee
        const employee = await prisma.employee.create({
          data: mappedData
        });
        
        console.log(`✅ Employee erstellt: ${employee.foreName} ${employee.lastName} (${employee.pseudonym})`);
        totalEmployees++;
        
        // Import related data (certificates, skills, etc.)
        await importRelatedData(workbook, employee);
        
      } catch (error) {
        console.log(`❌ Fehler bei ${file}: ${error.message}`);
        totalErrors++;
      }
    }
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Importiert: ${totalEmployees} Employees`);
    console.log(`   ❌ Fehler: ${totalErrors} Dateien`);
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function importRelatedData(workbook, employee) {
  // Import certificates
  if (workbook.SheetNames.includes('Lizensierung')) {
    const certSheet = xlsx.utils.sheet_to_json(workbook.Sheets['Lizensierung'], { defval: null });
    
    for (const row of certSheet) {
      if (row['Bezeichnung'] && row['Bezeichnung'].trim()) {
        try {
          // Find or create certificate
          let certificate = await prisma.certificate.findFirst({
            where: { title: row['Bezeichnung'] }
          });
          
          if (!certificate) {
            certificate = await prisma.certificate.create({
              data: { title: row['Bezeichnung'] }
            });
          }
          
          // Parse valid until date
          let validUntil = null;
          if (row['Ablaufdatum']) {
            if (typeof row['Ablaufdatum'] === 'number') {
              validUntil = new Date((row['Ablaufdatum'] - 25569) * 86400 * 1000);
            } else if (typeof row['Ablaufdatum'] === 'string') {
              const parsed = new Date(row['Ablaufdatum']);
              if (!isNaN(parsed.getTime())) {
                validUntil = parsed;
              }
            }
          }
          
          // Create employee certificate
          await prisma.employeeCertificates.create({
            data: {
              employeeIDs: employee.id,
              certificateIDs: certificate.id,
              validUntil: validUntil,
              issuer: row['Aussteller'] || null
            }
          });
          
        } catch (error) {
          console.log(`⚠️  Fehler beim Certificate Import: ${error.message}`);
        }
      }
    }
  }
  
  // Import skills
  if (workbook.SheetNames.includes('Qualifikation')) {
    const skillSheet = xlsx.utils.sheet_to_json(workbook.Sheets['Qualifikation'], { defval: null });
    
    for (const row of skillSheet) {
      if (row['Skills'] && row['Skills'].trim()) {
        try {
          // Find or create skill
          let skill = await prisma.skills.findFirst({
            where: { title: row['Skills'] }
          });
          
          if (!skill) {
            skill = await prisma.skills.create({
              data: { 
                title: row['Skills'],
                type: 'Technisch',
                description: 'Importiert aus Excel'
              }
            });
          }
          
          // Create employee skill
          await prisma.employeeSkills.create({
            data: {
              employeeIDs: [employee.id],
              skillIDs: skill.id,
              niveau: row['Mit Niveau'] ? String(row['Mit Niveau']) : null
            }
          });
          
        } catch (error) {
          console.log(`⚠️  Fehler beim Skill Import: ${error.message}`);
        }
      }
    }
  }
}

importEmployees(); 