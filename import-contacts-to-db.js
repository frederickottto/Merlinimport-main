const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();

const prisma = new PrismaClient();

async function importContactsToDatabase() {
  console.log('🚀 Starte Import der Kontakte in die Datenbank...\n');
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/OrganisationenÜbersicht.xlsx');
    const sheet = workbook.Sheets['Sheet1'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`📊 Gesamtzeilen: ${data.length}`);
    
    // Collect all contacts
    const contacts = [];
    
    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      
      // Check if this is a contact row (has contact data in column P)
      if (row[15] && row[15] !== 'Kontakt' && row[15] !== '') {
        const contactName = row[15];
        const orgNumber = row[0]; // Organization number from column A
        
        if (contactName && orgNumber) {
          contacts.push({
            name: contactName,
            organisationNumber: orgNumber
          });
        }
      }
    }
    
    console.log(`📋 Gefundene Kontakte: ${contacts.length}`);
    
    // Import contacts to database
    let importedCount = 0;
    let errorCount = 0;
    
    for (const contact of contacts) {
      try {
        // Find the organization by number
        const organization = await prisma.organisation.findFirst({
          where: {
            name: {
              contains: `#${contact.organisationNumber}`
            }
          }
        });
        
        if (organization) {
          // Create the contact
          await prisma.organisationContact.create({
            data: {
              name: contact.name,
              organisationId: organization.id
            }
          });
          
          console.log(`✅ Kontakt "${contact.name}" zu Organisation #${contact.organisationNumber} hinzugefügt`);
          importedCount++;
        } else {
          console.log(`❌ Organisation #${contact.organisationNumber} nicht gefunden für Kontakt "${contact.name}"`);
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ Fehler beim Import von "${contact.name}": ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Import abgeschlossen:`);
    console.log(`✅ Erfolgreich importiert: ${importedCount}`);
    console.log(`❌ Fehler: ${errorCount}`);
    console.log(`📋 Gesamt: ${contacts.length}`);
    
  } catch (error) {
    console.error('❌ Fehler beim Import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importContactsToDatabase(); 