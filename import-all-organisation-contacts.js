const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();

const prisma = new PrismaClient();

async function importAllOrganisationContacts() {
  console.log('🚀 Starte Import aller Organisations-Kontakte...\n');
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/OrganisationenÜbersicht.xlsx');
    const sheet = workbook.Sheets['Sheet1'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`📊 Gesamtzeilen: ${data.length}`);
    
    // Find organization and contact data
    const organizations = [];
    const contacts = [];
    
    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      
      // Check if this is an organization row (has organization name)
      if (row[1] && row[1] !== '#') {
        organizations.push({
          rowIndex,
          name: row[1],
          abbreviation: row[2],
          legalType: row[3],
          industry: row[4],
          employeeCount: row[5],
          revenue: row[6],
          website: row[7],
          street: row[9],
          houseNumber: row[10],
          postCode: row[11],
          city: row[12],
          role: row[13]
        });
      }
      
      // Check if this is a contact row (has contact data)
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
    
    console.log(`🏢 Organisationen gefunden: ${organizations.length}`);
    console.log(`👥 Kontakte gefunden: ${contacts.length}`);
    
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each contact
    for (const contact of contacts) {
      try {
        const contactNumber = parseInt(contact.number);
        
        // Find the corresponding organization
        const matchingOrg = organizations.find(org => {
          // The contact number corresponds to the organization's row number
          return org.rowIndex === contactNumber;
        });
        
        if (!matchingOrg) {
          console.log(`⚠️  Keine Organisation für Kontakt #${contact.number} gefunden`);
          skippedCount++;
          continue;
        }
        
        // Find the organization in the database
        const existingOrg = await prisma.organisation.findFirst({
          where: {
            name: matchingOrg.name
          }
        });
        
        if (!existingOrg) {
          console.log(`⚠️  Organisation "${matchingOrg.name}" nicht in der Datenbank gefunden`);
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
          console.log(`⏭️  Kontakt bereits vorhanden: ${contact.firstName} ${contact.lastName} bei ${matchingOrg.name}`);
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
        
        console.log(`✅ Kontakt importiert: ${contact.firstName} ${contact.lastName} (${contact.position || 'keine Position'}) → ${matchingOrg.name}`);
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
    
    // Show some examples of newly added contacts
    const newContacts = await prisma.organisationContacts.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        organisation: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log(`\n📋 Beispiele neu hinzugefügter Kontakte:`);
    for (const contact of newContacts) {
      console.log(`   - ${contact.foreName} ${contact.lastName} (${contact.position || 'keine Position'}) bei ${contact.organisation.name}`);
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importAllOrganisationContacts(); 