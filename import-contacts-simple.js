const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();

const prisma = new PrismaClient();

async function importContactsSimple() {
  console.log('🚀 Starte einfachen Import der Organisations-Kontakte...\n');
  
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
      if (row[15] && row[15] !== '#' && row[15] !== '') {
        const contact = {
          rowIndex,
          number: row[15],
          title: row[16] || '',
          firstName: row[17] || '',
          lastName: row[18] || '',
          department: row[19] || '',
          email: row[20] || '',
          phone: row[21] || '',
          mobile: row[22] || '',
          position: row[23] || ''
        };
        
        // Only add if it has at least a name
        if (contact.firstName || contact.lastName) {
          contacts.push(contact);
        }
      }
    }
    
    console.log(`👥 Kontakte gefunden: ${contacts.length}`);
    
    // Show first few contacts
    console.log('\n📋 Erste 10 Kontakte:');
    contacts.slice(0, 10).forEach((contact, index) => {
      console.log(`   ${index + 1}. #${contact.number}: ${contact.firstName} ${contact.lastName} (${contact.position || 'keine Position'})`);
    });
    
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each contact
    for (const contact of contacts) {
      try {
        const contactNumber = parseInt(contact.number);
        
        // Find the organization with the same number
        const existingOrg = await prisma.organisation.findFirst({
          where: {
            name: {
              contains: contactNumber.toString()
            }
          }
        });
        
        if (!existingOrg) {
          console.log(`⚠️  Keine Organisation für Kontakt #${contact.number} gefunden`);
          skippedCount++;
          continue;
        }
        
        // Check if contact already exists
        const existingContact = await prisma.organisationContacts.findFirst({
          where: {
            organisationID: existingOrg.id,
            foreName: contact.firstName,
            lastName: contact.lastName
          }
        });
        
        if (existingContact) {
          console.log(`⏭️  Kontakt bereits vorhanden: ${contact.firstName} ${contact.lastName} bei ${existingOrg.name}`);
          skippedCount++;
          continue;
        }
        
        // Create the contact
        const newContact = await prisma.organisationContacts.create({
          data: {
            organisationID: existingOrg.id,
            salutation: contact.title || null,
            foreName: contact.firstName || '',
            lastName: contact.lastName || '',
            department: contact.department || null,
            email: contact.email || null,
            telephone: contact.phone || null,
            mobile: contact.mobile || null,
            position: contact.position || null
          }
        });
        
        console.log(`✅ Kontakt importiert: ${contact.firstName} ${contact.lastName} (${contact.position || 'keine Position'}) → ${existingOrg.name}`);
        importedCount++;
        
      } catch (error) {
        console.log(`❌ Fehler beim Import von Kontakt #${contact.number}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Neue Kontakte hinzugefügt: ${importedCount}`);
    console.log(`   ⏭️  Bereits vorhanden (übersprungen): ${skippedCount}`);
    console.log(`   ❌ Fehler: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Fehler beim Import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importContactsSimple(); 