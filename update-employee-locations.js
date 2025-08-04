const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Mapping of cities to correct EY addresses
const cityToAddressMapping = {
  'Berlin': {
    street: 'Friedrichstraße',
    houseNumber: '140',
    postCode: '10117',
    city: 'Berlin',
    country: 'Deutschland'
  },
  'Bremen': {
    street: 'Lloydstraße',
    houseNumber: '4-6',
    postCode: '28217',
    city: 'Bremen',
    country: 'Deutschland'
  },
  'Dortmund': {
    street: 'Westfalendamm',
    houseNumber: '11',
    postCode: '44141',
    city: 'Dortmund',
    country: 'Deutschland'
  },
  'Dresden': {
    street: 'Forststraße',
    houseNumber: '2',
    postCode: '01099',
    city: 'Dresden',
    country: 'Deutschland'
  },
  'Düsseldorf': {
    street: 'Graf-Adolf-Platz',
    houseNumber: '15',
    postCode: '40213',
    city: 'Düsseldorf',
    country: 'Deutschland'
  },
  'Eschborn': {
    street: 'Mergenthalerallee',
    houseNumber: '3-5',
    postCode: '65760',
    city: 'Eschborn/Frankfurt (Main)',
    country: 'Deutschland'
  },
  'Frankfurt': {
    street: 'Mergenthalerallee',
    houseNumber: '3-5',
    postCode: '65760',
    city: 'Eschborn/Frankfurt (Main)',
    country: 'Deutschland'
  },
  'Eschborn - Frankfurt/Main': {
    street: 'Mergenthalerallee',
    houseNumber: '3-5',
    postCode: '65760',
    city: 'Eschborn/Frankfurt (Main)',
    country: 'Deutschland'
  },
  'Eschborn/Frankfurt (Main)': {
    street: 'Mergenthalerallee',
    houseNumber: '3-5',
    postCode: '65760',
    city: 'Eschborn/Frankfurt (Main)',
    country: 'Deutschland'
  },
  'Essen': {
    street: 'Wittekindstraße',
    houseNumber: '1a',
    postCode: '45131',
    city: 'Essen',
    country: 'Deutschland'
  },
  'Freiburg': {
    street: 'Bismarckallee',
    houseNumber: '15',
    postCode: '79098',
    city: 'Freiburg',
    country: 'Deutschland'
  },
  'Hamburg': {
    street: 'Rothenbaumchaussee',
    houseNumber: '78',
    postCode: '20148',
    city: 'Hamburg',
    country: 'Deutschland'
  },
  'Hannover': {
    street: 'Landschaftsstraße',
    houseNumber: '8',
    postCode: '30159',
    city: 'Hannover',
    country: 'Deutschland'
  },
  'Heilbronn': {
    street: 'Titotstraße',
    houseNumber: '8',
    postCode: '74072',
    city: 'Heilbronn',
    country: 'Deutschland'
  },
  'Köln': {
    street: 'Börsenplatz',
    houseNumber: '1',
    postCode: '50667',
    city: 'Köln',
    country: 'Deutschland'
  },
  'Leipzig': {
    street: 'Grimmaische Straße',
    houseNumber: '25',
    postCode: '04109',
    city: 'Leipzig',
    country: 'Deutschland'
  },
  'Mannheim': {
    street: 'Glücksteinallee',
    houseNumber: '1',
    postCode: '68163',
    city: 'Mannheim',
    country: 'Deutschland'
  },
  'München': {
    street: 'Arnulfstraße',
    houseNumber: '59',
    postCode: '80636',
    city: 'München',
    country: 'Deutschland'
  },
  'Nürnberg': {
    street: 'Am Tullnaupark',
    houseNumber: '8',
    postCode: '90402',
    city: 'Nürnberg',
    country: 'Deutschland'
  },
  'Ravensburg': {
    street: 'Parkstraße',
    houseNumber: '40',
    postCode: '88212',
    city: 'Ravensburg',
    country: 'Deutschland'
  },
  'Saarbrücken': {
    street: 'Heinrich-Böcking-Straße',
    houseNumber: '6-8',
    postCode: '66121',
    city: 'Saarbrücken',
    country: 'Deutschland'
  },
  'Stuttgart': {
    street: 'Flughafenstraße',
    houseNumber: '61',
    postCode: '70629',
    city: 'Stuttgart',
    country: 'Deutschland'
  },
  'Villingen-Schwenningen': {
    street: 'Max-Planck-Straße',
    houseNumber: '11',
    postCode: '78052',
    city: 'Villingen-Schwenningen',
    country: 'Deutschland'
  }
};

async function updateEmployeeLocations() {
  console.log('🏢 Aktualisiere Mitarbeiter-Standorte...\n');
  
  try {
    // Get all employees
    const employees = await prisma.employee.findMany({
      include: {
        location: true
      },
      orderBy: {
        pseudonym: 'asc'
      }
    });
    
    console.log(`📊 Gefunden: ${employees.length} Mitarbeiter\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const employee of employees) {
      try {
        // Check if employee has a location
        if (!employee.location) {
          console.log(`⚠️  ${employee.pseudonym || 'Kein Pseudonym'}: Kein Standort vorhanden`);
          skippedCount++;
          continue;
        }
        
        const currentCity = employee.location.city;
        const addressMapping = cityToAddressMapping[currentCity];
        
        if (!addressMapping) {
          console.log(`⚠️  ${employee.pseudonym || 'Kein Pseudonym'}: Keine Adress-Mapping für "${currentCity}" gefunden`);
          skippedCount++;
          continue;
        }
        
        // Update the location with correct address
        await prisma.location.update({
          where: {
            id: employee.location.id
          },
          data: {
            street: addressMapping.street,
            houseNumber: addressMapping.houseNumber,
            postCode: addressMapping.postCode,
            city: addressMapping.city,
            country: addressMapping.country
          }
        });
        
        console.log(`✅ ${employee.pseudonym || 'Kein Pseudonym'}: ${currentCity} → ${addressMapping.street} ${addressMapping.houseNumber}, ${addressMapping.postCode} ${addressMapping.city}`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Fehler bei ${employee.pseudonym || 'Kein Pseudonym'}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 **Zusammenfassung:**');
    console.log(`   ✅ Aktualisiert: ${updatedCount} Mitarbeiter`);
    console.log(`   ⚠️  Übersprungen: ${skippedCount} Mitarbeiter`);
    console.log(`   ❌ Fehler: ${errorCount} Mitarbeiter`);
    
    // Show available cities for reference
    console.log('\n🏙️  **Verfügbare Städte für Mapping:**');
    Object.keys(cityToAddressMapping).forEach(city => {
      const mapping = cityToAddressMapping[city];
      console.log(`   - ${city}: ${mapping.street} ${mapping.houseNumber}, ${mapping.postCode} ${mapping.city}`);
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren der Standorte:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEmployeeLocations().catch(console.error); 