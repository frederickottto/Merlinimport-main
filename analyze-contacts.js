const XLSX = require('xlsx');

async function analyzeContacts() {
  console.log('🔍 Analysiere Kontakte aus der Excel-Datei...\n');
  
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
        const orgNumber = row[0];
        organizations.push({
          rowIndex,
          number: orgNumber,
          name: row[1],
          abbreviation: row[2] || '',
          legalType: row[3] || '',
          industry: row[4] || '',
          employeeCount: row[5] || '',
          revenue: row[6] || '',
          website: row[7] || '',
          street: row[9] || '',
          houseNumber: row[10] || '',
          postCode: row[11] || '',
          city: row[12] || '',
          role: row[13] || ''
        });
      }
      
      // Check if this is a contact row (has contact data in column P)
      if (row[15] && row[15] !== '#' && row[15] !== 'Organisation #') {
        const contact = {
          rowIndex,
          orgNumber: row[15],
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
    
    // Show organizations
    console.log('\n📋 Organisationen:');
    organizations.forEach((org, index) => {
      console.log(`   ${index + 1}. #${org.number}: ${org.name} (${org.abbreviation})`);
    });
    
    // Show contacts with their organization matches
    console.log('\n📋 Kontakte mit Organisationszuordnung:');
    contacts.forEach((contact, index) => {
      const matchingOrg = organizations.find(org => org.number == contact.orgNumber);
      const orgName = matchingOrg ? matchingOrg.name : '❌ KEINE ORGANISATION GEFUNDEN';
      console.log(`   ${index + 1}. ${contact.firstName} ${contact.lastName} (${contact.position || 'keine Position'}) → ${orgName} (#${contact.orgNumber})`);
    });
    
    // Show statistics
    console.log('\n📊 Statistiken:');
    console.log(`   - Organisationen ohne Kontakte: ${organizations.filter(org => !contacts.find(c => c.orgNumber == org.number)).length}`);
    console.log(`   - Kontakte ohne Organisation: ${contacts.filter(c => !organizations.find(org => org.number == c.orgNumber)).length}`);
    
    // Show contacts by organization
    console.log('\n👥 Kontakte nach Organisation:');
    organizations.forEach(org => {
      const orgContacts = contacts.filter(c => c.orgNumber == org.number);
      if (orgContacts.length > 0) {
        console.log(`\n   #${org.number}: ${org.name}`);
        orgContacts.forEach(contact => {
          console.log(`     - ${contact.firstName} ${contact.lastName} (${contact.position || 'keine Position'})`);
        });
      }
    });
    
    // Show organizations without contacts
    const orgsWithoutContacts = organizations.filter(org => !contacts.find(c => c.orgNumber == org.number));
    if (orgsWithoutContacts.length > 0) {
      console.log('\n🏢 Organisationen ohne Kontakte:');
      orgsWithoutContacts.forEach(org => {
        console.log(`   - #${org.number}: ${org.name}`);
      });
    }
    
    // Show contacts without organizations
    const contactsWithoutOrgs = contacts.filter(c => !organizations.find(org => org.number == c.orgNumber));
    if (contactsWithoutOrgs.length > 0) {
      console.log('\n❌ Kontakte ohne Organisation:');
      contactsWithoutOrgs.forEach(contact => {
        console.log(`   - ${contact.firstName} ${contact.lastName} (Org #${contact.orgNumber})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Analysieren:', error);
  }
}

analyzeContacts(); 