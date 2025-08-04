const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function importMitarbeitersichtung() {
  console.log('🚀 Starte Import der Mitarbeiter-Sichtung (mit Pseudonym als Name)...\n');
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/EY CSS - Mitarbeitersichtung - 0.01.xlsx');
    
    if (!workbook.Sheets['Sichtung']) {
      console.log("❌ Sheet 'Sichtung' nicht gefunden!");
      return;
    }
    
    const sheet = workbook.Sheets['Sichtung'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    
    console.log(`📊 Gefunden: ${data.length} Zeilen im Sheet 'Sichtung'`);
    
    // Process the first 73 rows (yellow highlighted)
    const yellowHighlightedRows = data.slice(0, 73);
    
    console.log(`🎯 Importiere ${yellowHighlightedRows.length} gelb markierte Zeilen...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let rowIndex = 0; rowIndex < yellowHighlightedRows.length; rowIndex++) {
      const row = yellowHighlightedRows[rowIndex];
      
      if (!row || !row[2]) { // Check for pseudonym (column 2) instead of name
        console.log(`⚠️  Zeile ${rowIndex + 1}: Keine gültigen Pseudonym-Daten, überspringe...`);
        continue;
      }
      
      try {
        // Parse employee data
        const employeeData = parseEmployeeData(row, rowIndex);
        
        if (!employeeData) {
          console.log(`⚠️  Zeile ${rowIndex + 1}: Konnte Daten nicht parsen, überspringe...`);
          continue;
        }
        
        // Import employee
        await importEmployee(employeeData);
        
        console.log(`✅ Zeile ${rowIndex + 1}: ${employeeData.pseudonym} erfolgreich importiert`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Zeile ${rowIndex + 1}: Fehler beim Import - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Import abgeschlossen:`);
    console.log(`   ✅ Erfolgreich: ${successCount}`);
    console.log(`   ❌ Fehler: ${errorCount}`);
    console.log(`   📋 Gesamt: ${yellowHighlightedRows.length}`);
    
  } catch (error) {
    console.error('❌ Fehler beim Import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function parseEmployeeData(row, rowIndex) {
  try {
    // Extract basic information - use pseudonym as both name and pseudonym
    const excelId = row[0] || `SICHTUNG_${rowIndex + 1}`;
    const pseudonym = row[2] || ''; // Column 2 is pseudonym
    const counselor = row[3] || '';
    const employer = row[4] || 'EY Consulting GmbH';
    const position = row[5] || '';
    const location = row[6] || '';
    const startDate = parseDate(row[7]);
    
    // Use pseudonym as both firstName and lastName
    const firstName = pseudonym;
    const lastName = '';
    
    // Experience data
    const experienceIT = parseInt(row[8]) || 0;
    const experienceIS = parseInt(row[9]) || 0;
    const experienceITGrundschutz = parseInt(row[10]) || 0;
    const experiencePublicSector = parseInt(row[11]) || 0;
    const experienceTotal = parseInt(row[12]) || 0;
    
    // Education
    const degree = row[13] || '';
    const fieldOfStudy = row[14] || '';
    const educationInstitution = row[17] || '';
    
    // Certificates (up to 6)
    const certificates = [];
    for (let i = 18; i <= 23; i++) {
      if (row[i] && row[i].toString().trim() !== '') {
        certificates.push(row[i].toString().trim());
      }
    }
    
    // Skills
    const skills = row[25] || '';
    const skillLevel = parseInt(row[26]) || 0;
    
    return {
      excelId: excelId.toString(),
      firstName,
      lastName,
      fullName: pseudonym.trim(),
      pseudonym,
      counselor,
      employer,
      position,
      location,
      startDate,
      experience: {
        it: experienceIT,
        informationSecurity: experienceIS,
        itGrundschutz: experienceITGrundschutz,
        publicSector: experiencePublicSector,
        total: experienceTotal
      },
      education: {
        degree,
        fieldOfStudy,
        institution: educationInstitution
      },
      certificates,
      skills,
      skillLevel,
      source: 'Sichtung Excel (Pseudonym)',
      rowIndex: rowIndex + 1
    };
    
  } catch (error) {
    console.error(`Fehler beim Parsen der Zeile ${rowIndex + 1}:`, error);
    return null;
  }
}

function parseDate(dateString) {
  if (!dateString) return null;
  
  try {
    // Handle different date formats: DD-MM-YYYY, DD.MM.YYYY
    const cleanDate = dateString.toString().replace(/[^\d\-\.]/g, '');
    
    if (cleanDate.includes('-')) {
      const [day, month, year] = cleanDate.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else if (cleanDate.includes('.')) {
      const [day, month, year] = cleanDate.split('.');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    return null;
  } catch (error) {
    console.warn(`Konnte Datum nicht parsen: ${dateString}`);
    return null;
  }
}

async function importEmployee(employeeData) {
  try {
    // Check if employee already exists (by pseudonym)
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [
          { pseudonym: employeeData.pseudonym },
          { 
            AND: [
              { foreName: employeeData.firstName },
              { lastName: employeeData.lastName }
            ]
          }
        ]
      }
    });
    
    if (existingEmployee) {
      console.log(`⚠️  Mitarbeiter ${employeeData.pseudonym} existiert bereits, überspringe...`);
      return;
    }
    
    // Find or create location
    let locationId = null;
    if (employeeData.location) {
      const existingLocation = await prisma.location.findFirst({
        where: { city: employeeData.location }
      });
      
      if (existingLocation) {
        locationId = existingLocation.id;
      } else {
        // Create a basic location entry
        const newLocation = await prisma.location.create({
          data: {
            street: 'Unknown',
            houseNumber: '0',
            postCode: '00000',
            city: employeeData.location,
            region: 'Unknown',
            country: 'Germany'
          }
        });
        locationId = newLocation.id;
      }
    }
    
    // Create employee with pseudonym as name
    const employee = await prisma.employee.create({
      data: {
        foreName: employeeData.firstName, // This will be the pseudonym
        lastName: employeeData.lastName,  // This will be empty
        pseudonym: employeeData.pseudonym,
        employeerCompany: employeeData.employer,
        counselorIDs: null, // Will be set later if counselor exists
        locationIDs: locationId,
        contractStartDate: employeeData.startDate,
        experienceIt: employeeData.experience.it,
        experienceIs: employeeData.experience.informationSecurity,
        experienceItGs: employeeData.experience.itGrundschutz,
        experienceGps: employeeData.experience.publicSector,
        experienceAll: employeeData.experience.total
      }
    });
    
    // Create academic degree if education data exists
    if (employeeData.education.degree || employeeData.education.fieldOfStudy) {
      await prisma.academicDegree.create({
        data: {
          employeeIDs: employee.id,
          degreeTitleShort: employeeData.education.degree,
          degreeTitleLong: employeeData.education.degree,
          study: employeeData.education.fieldOfStudy,
          university: employeeData.education.institution,
          completed: true,
          studyMINT: false // Could be enhanced with logic to detect MINT fields
        }
      });
    }
    
    // Create skills if they exist
    if (employeeData.skills && typeof employeeData.skills === 'string') {
      const skillNames = employeeData.skills.split(',').map(s => s.trim()).filter(s => s);
      
      for (const skillName of skillNames) {
        // Find or create skill
        let skill = await prisma.skills.findFirst({
          where: { title: skillName }
        });
        
        if (!skill) {
          skill = await prisma.skills.create({
            data: {
              title: skillName,
              type: 'Technical',
              description: `Skill imported from Sichtung Excel: ${skillName}`
            }
          });
        }
        
        // Create employee skill relationship
        await prisma.employeeSkills.create({
          data: {
            employeeIDs: [employee.id],
            skillIDs: skill.id,
            niveau: employeeData.skillLevel ? employeeData.skillLevel.toString() : '1'
          }
        });
      }
    }
    
    // Create certificates if they exist
    for (const certificateName of employeeData.certificates) {
      // Find or create certificate
      let certificate = await prisma.certificate.findFirst({
        where: { title: certificateName }
      });
      
      if (!certificate) {
        certificate = await prisma.certificate.create({
          data: {
            title: certificateName,
            description: `Certificate imported from Sichtung Excel: ${certificateName}`,
            type: 'Professional',
            category: 'IT Security'
          }
        });
      }
      
      // Create employee certificate relationship
      await prisma.employeeCertificates.create({
        data: {
          employeeIDs: employee.id,
          certificateIDs: certificate.id,
          issuer: 'Various',
          validUntil: null
        }
      });
    }
    
    console.log(`✅ Mitarbeiter ${employeeData.pseudonym} erfolgreich importiert (ID: ${employee.id})`);
    return employee;
    
  } catch (error) {
    console.error(`Fehler beim Erstellen des Mitarbeiters ${employeeData.pseudonym}:`, error);
    throw error;
  }
}

// Helper function to create database schema if needed
async function ensureDatabaseSchema() {
  try {
    // Check if tables exist by trying to count records
    await prisma.employee.count();
    console.log('✅ Datenbankschema ist bereit');
  } catch (error) {
    console.error('❌ Datenbankschema nicht gefunden. Bitte führen Sie "npx prisma db push" aus.');
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log('🔧 Überprüfe Datenbankschema...');
  await ensureDatabaseSchema();
  
  console.log('🚀 Starte Import mit Pseudonym als Name...');
  await importMitarbeitersichtung();
}

main().catch(console.error); 