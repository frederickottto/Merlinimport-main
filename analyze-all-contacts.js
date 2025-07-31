const XLSX = require('xlsx');
require('dotenv').config();

async function analyzeAllContacts() {
  console.log('🔍 Vollständige Analyse aller Kontakte in OrganisationenÜbersicht.xlsx...\n');
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/OrganisationenÜbersicht.xlsx');
    const sheet = workbook.Sheets['Sheet1'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`📊 Gesamtzeilen: ${data.length}`);
    
    // Find all contacts more comprehensively
    const contacts = [];
    
    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      
      // Check if this row has contact data (any of the contact columns)
      if (row[15] && row[15] !== '#' && row[15] !== '') {
        // This is a contact row
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
    
    // Show all contacts
    console.log('\n📋 Alle Kontakte:');
    contacts.forEach((contact, index) => {
      console.log(`   ${index + 1}. #${contact.number}: ${contact.title} ${contact.firstName} ${contact.lastName} (${contact.position || 'keine Position'})`);
      if (contact.email) console.log(`      E-Mail: ${contact.email}`);
      if (contact.phone) console.log(`      Telefon: ${contact.phone}`);
      if (contact.mobile) console.log(`      Handy: ${contact.mobile}`);
      if (contact.department) console.log(`      Abteilung: ${contact.department}`);
      console.log('');
    });
    
    // Show contact number distribution
    const contactNumbers = contacts.map(c => parseInt(c.number)).sort((a, b) => a - b);
    console.log('📊 Kontakt-Nummern Verteilung:');
    console.log(`   Kleinste Nummer: ${Math.min(...contactNumbers)}`);
    console.log(`   Größte Nummer: ${Math.max(...contactNumbers)}`);
    console.log(`   Alle Nummern: ${contactNumbers.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Fehler beim Analysieren:', error);
  }
}

analyzeAllContacts(); 