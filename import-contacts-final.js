const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();

const prisma = new PrismaClient();

async function importContactsFinal() {
  console.log('🚀 Starte finalen Import der Organisations-Kontakte...\n');
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/OrganisationenÜbersicht.xlsx');
    const sheet = workbook.Sheets['Sheet1'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`📊 Gesamtzeilen: ${data.length}`);
    
    // Collect organizations and contacts
    const organizations = [];
    const contacts = [];
    
    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      
      // Check if this is an organization row (has organization name in column B)
      if (row[1] && row[1] !== '#' && row[1] !== 'Name') {
        const orgNumber = row[0]; // Column A contains the organization number
        const orgName = row[1];   // Column B contains the organization name
        
        if (orgNumber && orgName) {
          organizations.push({
            number: orgNumber,
            name: orgName,
            rowIndex: rowIndex
          });
        }
      }
      
      // Check if this is a contact row (has contact data in column P)
      if (row[15] && row[15] !== 'Kontakte' && row[15] !== '') {
        const contactName = row[15];
        const orgNumber = row[0]; // Column A contains the organization number
        
        if (contactName && orgNumber) {
          contacts.push({
            name: contactName,
            orgNumber: orgNumber,
            rowIndex: rowIndex
          });
        }
      }
    }
    
    console.log(`\n📋 Gefundene Organisationen: ${organizations.length}`);
    console.log(`👥 Gefundene Kontakte: ${contacts.length}`);
    
    // Show first few organizations and contacts
    console.log('\n🏢 Erste 5 Organisationen:');
    organizations.slice(0, 5).forEach(org => {
      console.log(`  ${org.number}: ${org.name}`);
    });
    
    console.log('\n👤 Erste 5 Kontakte:');
    contacts.slice(0, 5).forEach(contact => {
      console.log(`  ${contact.name} -> Org #${contact.orgNumber}`);
    });
    
    // Now import contacts to database
    console.log('\n💾 Importiere Kontakte in die Datenbank...');
    
    let importedCount = 0;
    let errorCount = 0;
    
    for (const contact of contacts) {
      try {
        // Find the organization by number
        const organization = organizations.find(org => org.number == contact.orgNumber);
        
        if (!organization) {
          console.log(`❌ Keine Organisation gefunden für Kontakt ${contact.name} (Org #${contact.orgNumber})`);
          errorCount++;
          continue;
        }
        
        // Check if contact already exists
        const existingContact = await prisma.contact.findFirst({
          where: {
            name: contact.name,
            organizationId: organization.number
          }
        });
        
        if (existingContact) {
          console.log(`⏭️  Kontakt ${contact.name} existiert bereits`);
          continue;
        }
        
        // Create new contact
        const newContact = await prisma.contact.create({
          data: {
            name: contact.name,
            organizationId: organization.number
          }
        });
        
        console.log(`✅ Importiert: ${contact.name} -> ${organization.name} (#${organization.number})`);
        importedCount++;
        
      } catch (error) {
        console.log(`❌ Fehler beim Import von ${contact.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Import abgeschlossen!`);
    console.log(`✅ Erfolgreich importiert: ${importedCount}`);
    console.log(`❌ Fehler: ${errorCount}`);
    console.log(`⏭️  Übersprungen (bereits vorhanden): ${contacts.length - importedCount - errorCount}`);
    
  } catch (error) {
    console.error('❌ Fehler beim Import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importContactsFinal(); 