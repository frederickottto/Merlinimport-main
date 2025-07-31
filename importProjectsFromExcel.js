// Script to import projects from Excel file into the app
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();

const prisma = new PrismaClient();

// Function to convert Excel date to JavaScript Date
function parseExcelDate(excelDate) {
  if (!excelDate || excelDate === '' || excelDate === null || excelDate === undefined) {
    return null;
  }
  
  // If it's already a number (Excel date serial number)
  if (typeof excelDate === 'number') {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date;
  }
  
  // If it's a string, try to parse it
  const date = new Date(excelDate);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date;
}

async function importProjectsFromExcel() {
  console.log("📋 Importiere Projekte aus Excel-Datei...");
  
  try {
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Read the Excel file
    const workbook = XLSX.readFile('./projects/EY CSS - Referenzsammlung Kopie - 0.01.xlsx');
    
    // Check if Referenzen sheet exists
    if (!workbook.Sheets['Referenzen']) {
      console.log("❌ Sheet 'Referenzen' nicht gefunden!");
      return;
    }
    
    const sheet = workbook.Sheets['Referenzen'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`📊 Sheet 'Referenzen' gefunden mit ${data.length} Zeilen`);
    
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Start from row 2 (skip header)
    for (let row = 2; row < data.length; row++) {
      const rowData = data[row];
      
      // Skip empty rows
      if (!rowData || !rowData[1]) {
        continue;
      }
      
      try {
        // Parse project data from columns
        const projectNumber = parseInt(rowData[0]) || null;
        const organisationName = rowData[1]?.toString().trim() || '';
        const projectLevel = rowData[2]?.toString().trim() || '';
        const contractor = rowData[3]?.toString().trim() || '';
        const projectTitle = rowData[4]?.toString().trim() || '';
        const projectDescription = rowData[5]?.toString().trim() || '';
        const contractStart = parseExcelDate(rowData[6]);
        const contractEnd = parseExcelDate(rowData[7]);
        const projectVolume = rowData[8] ? parseInt(rowData[8]) || 0 : 0;
        const projectFamily = rowData[9]?.toString().trim() || '';
        const securityManagement = rowData[10]?.toString().trim() || '';
        const securityArchitecture = rowData[11]?.toString().trim() || '';
        const securityTechnology = rowData[12]?.toString().trim() || '';
        const approvalSelection = rowData[13]?.toString().trim() || '';
        const approvalNote = rowData[14]?.toString().trim() || '';
        const contactFirstName = rowData[15]?.toString().trim() || '';
        const contactLastName = rowData[16]?.toString().trim() || '';
        const contactEmail = rowData[17]?.toString().trim() || '';
        const contactPhone = rowData[18]?.toString().trim() || '';
        const contactDepartment = rowData[19]?.toString().trim() || '';
        const eyContactEmail = rowData[20]?.toString().trim() || '';
        const referenceVerification = rowData[21]?.toString().trim() || '';
        const additionalNotes = rowData[22]?.toString().trim() || '';
        const projectStatus = rowData[23]?.toString().trim() || '';
        
        // Skip if no project title or organisation
        if (!projectTitle || !organisationName) {
          console.log(`⏭️  Übersprungen (kein Titel/Organisation): Zeile ${row}`);
          skippedCount++;
          continue;
        }
        
        // Find or create organisation
        let organisation = await prisma.organisation.findFirst({
          where: { name: organisationName }
        });
        
        if (!organisation) {
          console.log(`🏢 Erstelle neue Organisation: ${organisationName}`);
          organisation = await prisma.organisation.create({
            data: {
              name: organisationName,
              abbreviation: '',
              anonymousIdentifier: '',
              website: '',
              employeeNumber: 0,
              anualReturn: null,
              legalType: '',
            }
          });
        }
        
        // Check if project already exists
        const existingProject = await prisma.project.findFirst({
          where: {
            title: projectTitle,
            organisationIDs: { has: organisation.id }
          }
        });
        
        if (existingProject) {
          console.log(`⏭️  Übersprungen (bereits vorhanden): ${projectTitle} - ${organisationName}`);
          skippedCount++;
          continue;
        }
        
        // Create project
        const projectData = {
          title: projectTitle,
          description: projectDescription || null,
          type: projectLevel || null,
          contractBeginn: contractStart,
          contractEnd: contractEnd,
          volumePTTotal: projectVolume > 0 ? projectVolume : null,
          keywords: projectFamily ? [projectFamily] : [],
          referenceApproval: approvalSelection === 'Ja',
          organisation: { connect: { id: organisation.id } }
        };
        
        const newProject = await prisma.project.create({
          data: projectData,
          include: { organisation: true }
        });
        
        console.log(`✅ Importiert: ${projectTitle} - ${organisationName} (Volumen: ${projectVolume} PT)`);
        importedCount++;
        
        // Create contact if contact data is available
        if (contactFirstName || contactLastName || contactEmail) {
          try {
            // Check if contact already exists
            let existingContact = null;
            if (contactEmail) {
              existingContact = await prisma.organisationContacts.findFirst({
                where: {
                  email: contactEmail,
                  organisation: { some: { id: organisation.id } }
                }
              });
            }
            
            if (!existingContact && contactFirstName && contactLastName) {
              existingContact = await prisma.organisationContacts.findFirst({
                where: {
                  foreName: contactFirstName,
                  lastName: contactLastName,
                  organisation: { some: { id: organisation.id } }
                }
              });
            }
            
            if (!existingContact) {
              await prisma.organisationContacts.create({
                data: {
                  foreName: contactFirstName || '',
                  lastName: contactLastName || '',
                  email: contactEmail || null,
                  telephone: contactPhone || null,
                  department: contactDepartment || null,
                  position: contactDepartment || null,
                  organisation: { connect: { id: organisation.id } }
                }
              });
              console.log(`   👤 Kontakt erstellt: ${contactFirstName} ${contactLastName}`);
            }
          } catch (contactError) {
            console.log(`   ⚠️  Fehler beim Erstellen des Kontakts: ${contactError.message}`);
          }
        }
        
      } catch (error) {
        console.log(`❌ Fehler in Zeile ${row}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Importiert: ${importedCount} Projekte`);
    console.log(`   ⏭️  Übersprungen: ${skippedCount} Projekte`);
    console.log(`   ❌ Fehler: ${errorCount} Projekte`);
    
    // Show final count
    const totalProjects = await prisma.project.count();
    console.log(`   📊 Gesamt Projekte in der App: ${totalProjects}`);
    
  } catch (error) {
    console.error('❌ Fehler beim Import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importProjectsFromExcel(); 