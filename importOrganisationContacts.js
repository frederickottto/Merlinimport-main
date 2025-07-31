// Script to import organization contacts from Excel file and match them with organizations
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();

const prisma = new PrismaClient();

async function importOrganisationContacts() {
  console.log("👥 Importiere Organisations-Kontakte aus Excel-Datei...");
  
  try {
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/OrganisationenÜbersicht.xlsx');
    
    // Check if Sheet1 exists
    if (!workbook.Sheets['Sheet1']) {
      console.log("❌ Sheet 'Sheet1' nicht gefunden!");
      return;
    }
    
    const sheet = workbook.Sheets['Sheet1'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`📊 Sheet 'Sheet1' gefunden mit ${data.length} Zeilen`);
    
    // First, create a mapping of organization numbers to organization IDs
    const orgNumberToId = new Map();
    
    // Parse organizations (left side of the sheet)
    for (let row = 1; row < data.length; row++) {
      const rowData = data[row];
      if (rowData && rowData[0] && rowData[1]) { // Column 0 is "Organisation #", Column 1 is "Name"
        const orgNumber = parseInt(rowData[0]);
        const orgName = rowData[1]?.toString().trim();
        
        if (orgNumber && orgName) {
          // Find the organization in the database
          const existingOrg = await prisma.organisation.findFirst({
            where: { name: orgName }
          });
          
          if (existingOrg) {
            orgNumberToId.set(orgNumber, existingOrg.id);
            console.log(`📋 Organisation gefunden: #${orgNumber} - ${orgName} (ID: ${existingOrg.id})`);
          } else {
            console.log(`⚠️  Organisation nicht gefunden: #${orgNumber} - ${orgName}`);
          }
        }
      }
    }
    
    console.log(`\n📊 Organisations-Mapping erstellt: ${orgNumberToId.size} Organisationen gefunden`);
    
    // Now import contacts (right side of the sheet)
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (let row = 1; row < data.length; row++) {
      const rowData = data[row];
      if (rowData && rowData[15] && rowData[17] && rowData[18]) { // Contact columns
        const contactOrgNumber = parseInt(rowData[15]); // "Organisation #"
        const contactTitle = rowData[16]?.toString().trim() || '';
        const contactForeName = rowData[17]?.toString().trim() || '';
        const contactLastName = rowData[18]?.toString().trim() || '';
        const contactDepartment = rowData[19]?.toString().trim() || '';
        const contactEmail = rowData[20]?.toString().trim() || '';
        const contactPhone = rowData[21]?.toString().trim() || '';
        const contactMobile = rowData[22]?.toString().trim() || '';
        const contactPosition = rowData[23]?.toString().trim() || '';
        
        // Skip if no name or organization number
        if (!contactForeName && !contactLastName) {
          continue;
        }
        
        if (!contactOrgNumber) {
          console.log(`⚠️  Keine Organisationsnummer für Kontakt: ${contactForeName} ${contactLastName}`);
          continue;
        }
        
        // Get organization ID from mapping
        const orgId = orgNumberToId.get(contactOrgNumber);
        if (!orgId) {
          console.log(`⚠️  Keine Organisation gefunden für Nummer #${contactOrgNumber} - Kontakt: ${contactForeName} ${contactLastName}`);
          errorCount++;
          continue;
        }
        
        try {
          // Check if contact already exists (by email or name + organization)
          let existingContact = null;
          if (contactEmail) {
            existingContact = await prisma.organisationContacts.findFirst({
              where: {
                email: contactEmail,
                organisation: { some: { id: orgId } }
              }
            });
          }
          
          if (!existingContact && contactForeName && contactLastName) {
            existingContact = await prisma.organisationContacts.findFirst({
              where: {
                foreName: contactForeName,
                lastName: contactLastName,
                organisation: { some: { id: orgId } }
              }
            });
          }
          
          if (!existingContact) {
            // Create new contact
            await prisma.organisationContacts.create({
              data: {
                foreName: contactForeName || '',
                lastName: contactLastName || '',
                email: contactEmail || null,
                telephone: contactPhone || null,
                mobile: contactMobile || null,
                department: contactDepartment || null,
                position: contactPosition || null,
                organisation: { connect: { id: orgId } }
              }
            });
            
            console.log(`✅ Importiert: ${contactForeName} ${contactLastName} - ${contactEmail} - Organisation #${contactOrgNumber}`);
            importedCount++;
          } else {
            console.log(`⏭️  Übersprungen (bereits vorhanden): ${contactForeName} ${contactLastName} - ${contactEmail}`);
            skippedCount++;
          }
        } catch (error) {
          console.log(`❌ Fehler beim Import von ${contactForeName} ${contactLastName}: ${error.message}`);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Importiert: ${importedCount} Kontakte`);
    console.log(`   ⏭️  Übersprungen: ${skippedCount} Kontakte`);
    console.log(`   ❌ Fehler: ${errorCount} Kontakte`);
    
    // Show final count
    const totalContacts = await prisma.organisationContacts.count();
    console.log(`   📊 Gesamt Kontakte in der App: ${totalContacts}`);
    
  } catch (error) {
    console.error('❌ Fehler beim Import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importOrganisationContacts(); 