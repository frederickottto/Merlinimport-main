// Script to import projects from Book2.xlsx file into the app
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

// Function to parse volume string to number
function parseVolume(volumeString) {
  if (!volumeString || volumeString === '' || volumeString === null) {
    return null;
  }
  
  // Remove currency symbols and spaces
  let cleaned = volumeString.toString().replace(/[€\s]/g, '');
  
  // Convert German number format (comma as decimal separator)
  cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
  
  const number = parseFloat(cleaned);
  return isNaN(number) ? null : number;
}

async function importProjectsFromBook2() {
  console.log("📋 Importiere Projekte aus Book2.xlsx...");
  
  try {
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Read the Excel file
    const workbook = XLSX.readFile('./Projekte/Book2.xlsx');
    
    // Check if Sheet1 exists
    if (!workbook.Sheets['Sheet1']) {
      console.log("❌ Sheet 'Sheet1' nicht gefunden!");
      return;
    }
    
    const sheet = workbook.Sheets['Sheet1'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`📊 Sheet 'Sheet1' gefunden mit ${data.length} Zeilen`);
    
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Start from row 1 (skip header)
    for (let row = 1; row < data.length; row++) {
      const rowData = data[row];
      
      // Skip empty rows
      if (!rowData || !rowData[3]) {
        continue;
      }
      
      try {
        // Parse project data from columns
        const projectNumber = parseInt(rowData[0]) || null;
        const frameworkContract = rowData[1]?.toString().trim() || '';
        const projectTitle = rowData[3]?.toString().trim() || '';
        const contractor = rowData[4]?.toString().trim() || '';
        const referenceApproval = rowData[5]?.toString().trim() || '';
        const teamSize = rowData[6]?.toString().trim() || '';
        const contractStart = parseExcelDate(rowData[7]);
        const contractEnd = parseExcelDate(rowData[8]);
        const itAuditHours = rowData[9] ? parseInt(rowData[9]) || 0 : 0;
        const totalVolumeEuro = parseVolume(rowData[10]);
        const totalVolumePT = rowData[11] ? parseInt(rowData[11]) || 0 : 0;
        const usedVolumeEuro = parseVolume(rowData[12]);
        const usedVolumePT = rowData[13] ? parseInt(rowData[13]) || 0 : 0;
        const isITProject = rowData[14]?.toString().trim() === 'Ja';
        const isISProject = rowData[15]?.toString().trim() === 'Ja';
        const isITGSProject = rowData[16]?.toString().trim() === 'Ja';
        
        // Get description from the second part of the sheet
        const description = rowData[19]?.toString().trim() || '';
        const standards = [
          rowData[20]?.toString().trim(),
          rowData[21]?.toString().trim(),
          rowData[22]?.toString().trim(),
          rowData[23]?.toString().trim()
        ].filter(Boolean);
        
        // Skip if no project title
        if (!projectTitle) {
          console.log(`⏭️  Übersprungen (kein Titel): Zeile ${row}`);
          skippedCount++;
          continue;
        }
        
        // Find or create organisation (contractor)
        let organisation = null;
        if (contractor) {
          organisation = await prisma.organisation.findFirst({
            where: { name: contractor }
          });
          
          if (!organisation) {
            console.log(`🏢 Erstelle neue Organisation: ${contractor}`);
            organisation = await prisma.organisation.create({
              data: {
                name: contractor,
                abbreviation: '',
                anonymousIdentifier: '',
                website: '',
                employeeNumber: 0,
                anualReturn: null,
                legalType: '',
              }
            });
          }
        }
        
        // Check if project already exists
        let existingProject = null;
        if (organisation) {
          existingProject = await prisma.project.findFirst({
            where: {
              title: projectTitle,
              organisationIDs: { has: organisation.id }
            }
          });
        } else {
          existingProject = await prisma.project.findFirst({
            where: { title: projectTitle }
          });
        }
        
        if (existingProject) {
          console.log(`⏭️  Übersprungen (bereits vorhanden): ${projectTitle}`);
          skippedCount++;
          continue;
        }
        
        // Create project
        const projectData = {
          title: projectTitle,
          description: description || null,
          type: frameworkContract || null,
          contractBeginn: contractStart,
          contractEnd: contractEnd,
          volumePTTotal: totalVolumePT > 0 ? totalVolumePT : null,
          keywords: standards.length > 0 ? standards : [],
          referenceApproval: referenceApproval === 'Ja',
          ...(organisation && { organisation: { connect: { id: organisation.id } } })
        };
        
        const newProject = await prisma.project.create({
          data: projectData,
          include: { organisation: true }
        });
        
        console.log(`✅ Importiert: ${projectTitle} - ${contractor || 'Keine Organisation'} (Volumen: ${totalVolumePT} PT, Euro: ${totalVolumeEuro}€)`);
        importedCount++;
        
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

importProjectsFromBook2(); 