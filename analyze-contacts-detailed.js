const XLSX = require('xlsx');
require('dotenv').config();

async function analyzeContactsDetailed() {
  console.log('🔍 Detaillierte Analyse der Kontakte in OrganisationenÜbersicht.xlsx...\n');
  
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
      if (row[15] && row[15] !== '#' && row[16]) {
        contacts.push({
          rowIndex,
          number: row[15],
          title: row[16],
          firstName: row[17],
          lastName: row[18],
          department: row[19],
          email: row[20],
          phone: row[21],
          mobile: row[22],
          position: row[23]
        });
      }
    }
    
    console.log(`🏢 Organisationen gefunden: ${organizations.length}`);
    console.log(`👥 Kontakte gefunden: ${contacts.length}`);
    
    // Show first few organizations
    console.log('\n📋 Erste 5 Organisationen:');
    organizations.slice(0, 5).forEach((org, index) => {
      console.log(`   ${index + 1}. ${org.name} (${org.abbreviation || 'keine Abkürzung'})`);
    });
    
    // Show first few contacts
    console.log('\n📋 Erste 5 Kontakte:');
    contacts.slice(0, 5).forEach((contact, index) => {
      console.log(`   ${index + 1}. #${contact.number}: ${contact.title} ${contact.firstName} ${contact.lastName} (${contact.position || 'keine Position'})`);
    });
    
    // Analyze contact-organization mapping
    console.log('\n🔗 Kontakt-Organisation Zuordnung:');
    
    // Find the organization for each contact
    for (let i = 0; i < Math.min(10, contacts.length); i++) {
      const contact = contacts[i];
      const contactNumber = parseInt(contact.number);
      
      // Find organization with matching number
      const matchingOrg = organizations.find(org => {
        // Check if organization row has a number that matches contact number
        return org.rowIndex === contactNumber || org.name.includes(contactNumber.toString());
      });
      
      if (matchingOrg) {
        console.log(`   Kontakt #${contact.number} → ${matchingOrg.name}`);
      } else {
        console.log(`   Kontakt #${contact.number} → Keine Organisation gefunden`);
      }
    }
    
    // Show contact structure
    console.log('\n📊 Kontakt-Spalten Mapping:');
    console.log('   Spalte 15: Nummer (#)');
    console.log('   Spalte 16: Titel');
    console.log('   Spalte 17: Vorname');
    console.log('   Spalte 18: Nachname');
    console.log('   Spalte 19: Abteilung');
    console.log('   Spalte 20: E-Mail');
    console.log('   Spalte 21: Telefon');
    console.log('   Spalte 22: Handy');
    console.log('   Spalte 23: Position');
    
  } catch (error) {
    console.error('❌ Fehler beim Analysieren:', error);
  }
}

analyzeContactsDetailed(); 