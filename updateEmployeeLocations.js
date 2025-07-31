const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

// EY Standorte mit korrekten Adressen
const eyLocations = {
  'Berlin': {
    street: 'Friedrichstraße',
    houseNumber: '140',
    postCode: '10117',
    city: 'Berlin',
    region: 'Berlin',
    country: 'Deutschland'
  },
  'Bremen': {
    street: 'Lloydstraße',
    houseNumber: '4-6',
    postCode: '28217',
    city: 'Bremen',
    region: 'Bremen',
    country: 'Deutschland'
  },
  'Dortmund': {
    street: 'Westfalendamm',
    houseNumber: '11',
    postCode: '44141',
    city: 'Dortmund',
    region: 'Nordrhein-Westfalen',
    country: 'Deutschland'
  },
  'Dresden': {
    street: 'Forststraße',
    houseNumber: '2',
    postCode: '01099',
    city: 'Dresden',
    region: 'Sachsen',
    country: 'Deutschland'
  },
  'Düsseldorf': {
    street: 'Graf-Adolf-Platz',
    houseNumber: '15',
    postCode: '40213',
    city: 'Düsseldorf',
    region: 'Nordrhein-Westfalen',
    country: 'Deutschland'
  },
  'Eschborn': {
    street: 'Mergenthalerallee',
    houseNumber: '3-5',
    postCode: '65760',
    city: 'Eschborn/Frankfurt (Main)',
    region: 'Hessen',
    country: 'Deutschland'
  },
  'Frankfurt': {
    street: 'Mergenthalerallee',
    houseNumber: '3-5',
    postCode: '65760',
    city: 'Eschborn/Frankfurt (Main)',
    region: 'Hessen',
    country: 'Deutschland'
  },
  'Essen': {
    street: 'Wittekindstraße',
    houseNumber: '1a',
    postCode: '45131',
    city: 'Essen',
    region: 'Nordrhein-Westfalen',
    country: 'Deutschland'
  },
  'Freiburg': {
    street: 'Bismarckallee',
    houseNumber: '15',
    postCode: '79098',
    city: 'Freiburg',
    region: 'Baden-Württemberg',
    country: 'Deutschland'
  },
  'Hamburg': {
    street: 'Rothenbaumchaussee',
    houseNumber: '78',
    postCode: '20148',
    city: 'Hamburg',
    region: 'Hamburg',
    country: 'Deutschland'
  },
  'Hannover': {
    street: 'Landschaftsstraße',
    houseNumber: '8',
    postCode: '30159',
    city: 'Hannover',
    region: 'Niedersachsen',
    country: 'Deutschland'
  },
  'Heilbronn': {
    street: 'Titotstraße',
    houseNumber: '8',
    postCode: '74072',
    city: 'Heilbronn',
    region: 'Baden-Württemberg',
    country: 'Deutschland'
  },
  'Köln': {
    street: 'Börsenplatz',
    houseNumber: '1',
    postCode: '50667',
    city: 'Köln',
    region: 'Nordrhein-Westfalen',
    country: 'Deutschland'
  },
  'Leipzig': {
    street: 'Grimmaische Straße',
    houseNumber: '25',
    postCode: '04109',
    city: 'Leipzig',
    region: 'Sachsen',
    country: 'Deutschland'
  },
  'Mannheim': {
    street: 'Glücksteinallee',
    houseNumber: '1',
    postCode: '68163',
    city: 'Mannheim',
    region: 'Baden-Württemberg',
    country: 'Deutschland'
  },
  'München': {
    street: 'Arnulfstraße',
    houseNumber: '59',
    postCode: '80636',
    city: 'München',
    region: 'Bayern',
    country: 'Deutschland'
  },
  'Nürnberg': {
    street: 'Am Tullnaupark',
    houseNumber: '8',
    postCode: '90402',
    city: 'Nürnberg',
    region: 'Bayern',
    country: 'Deutschland'
  },
  'Ravensburg': {
    street: 'Parkstraße',
    houseNumber: '40',
    postCode: '88212',
    city: 'Ravensburg',
    region: 'Baden-Württemberg',
    country: 'Deutschland'
  },
  'Saarbrücken': {
    street: 'Heinrich-Böcking-Straße',
    houseNumber: '6-8',
    postCode: '66121',
    city: 'Saarbrücken',
    region: 'Saarland',
    country: 'Deutschland'
  },
  'Stuttgart': {
    street: 'Flughafenstraße',
    houseNumber: '61',
    postCode: '70629',
    city: 'Stuttgart',
    region: 'Baden-Württemberg',
    country: 'Deutschland'
  },
  'Villingen-Schwenningen': {
    street: 'Max-Planck-Straße',
    houseNumber: '11',
    postCode: '78052',
    city: 'Villingen-Schwenningen',
    region: 'Baden-Württemberg',
    country: 'Deutschland'
  }
};

// Helper function to find matching location
function findMatchingLocation(standort) {
  if (!standort) return null;
  
  const standortStr = standort.toString().toLowerCase().trim();
  
  // Direct matches
  for (const [city, location] of Object.entries(eyLocations)) {
    if (standortStr === city.toLowerCase()) {
      return { city, location };
    }
  }
  
  // Partial matches
  for (const [city, location] of Object.entries(eyLocations)) {
    if (standortStr.includes(city.toLowerCase()) || city.toLowerCase().includes(standortStr)) {
      return { city, location };
    }
  }
  
  // Special cases
  if (standortStr.includes('frankfurt') || standortStr.includes('eschborn')) {
    return { city: 'Frankfurt', location: eyLocations['Frankfurt'] };
  }
  
  return null;
}

// Helper function to find or create location
async function findOrCreateLocation(locationData) {
  if (!locationData) return null;
  
  // Try to find existing location with exact match
  let location = await prisma.location.findFirst({
    where: {
      city: locationData.city,
      street: locationData.street,
      houseNumber: locationData.houseNumber
    }
  });
  
  if (!location) {
    // Try to find by city only
    location = await prisma.location.findFirst({
      where: { city: locationData.city }
    });
    
    if (location) {
      // Update existing location with correct data
      location = await prisma.location.update({
        where: { id: location.id },
        data: locationData
      });
    } else {
      // Create new location
      location = await prisma.location.create({
        data: locationData
      });
    }
  }
  
  return location;
}

async function updateEmployeeLocations() {
  try {
    console.log('🔄 Starte Update der Mitarbeiter-Standorte...');
    
    // Get all employees with location information
    const employees = await prisma.employee.findMany({
      where: {
        locationIDs: { not: null }
      },
      include: {
        location: true
      }
    });
    
    console.log(`📊 Gefunden: ${employees.length} Mitarbeiter mit Standort-Informationen`);
    
    let updatedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const employee of employees) {
      try {
        // Get the current location
        const currentLocation = employee.location;
        
        if (!currentLocation) {
          console.log(`⚠️  Mitarbeiter ${employee.pseudonym} hat keinen Standort`);
          skippedCount++;
          continue;
        }
        
        // Find matching EY location
        const matchingLocation = findMatchingLocation(currentLocation.city);
        
        if (!matchingLocation) {
          console.log(`❓ Keine Übereinstimmung für Standort: ${currentLocation.city} (Mitarbeiter: ${employee.pseudonym})`);
          skippedCount++;
          continue;
        }
        
        console.log(`🔄 Update ${employee.pseudonym}: ${currentLocation.city} → ${matchingLocation.city}`);
        
        // Find or create the correct location
        const correctLocation = await findOrCreateLocation(matchingLocation.location);
        
        if (correctLocation) {
          // Update employee with correct location
          await prisma.employee.update({
            where: { id: employee.id },
            data: { locationIDs: correctLocation.id }
          });
          
          if (correctLocation.id === currentLocation.id) {
            console.log(`✅ Standort bereits korrekt: ${employee.pseudonym}`);
            updatedCount++;
          } else {
            console.log(`✅ Standort aktualisiert: ${employee.pseudonym} (${currentLocation.city} → ${correctLocation.city})`);
            createdCount++;
          }
        }
        
      } catch (error) {
        console.error(`❌ Fehler beim Update von ${employee.pseudonym}:`, error.message);
      }
    }
    
    console.log('\n📊 Update-Statistik:');
    console.log(`✅ Aktualisiert: ${updatedCount}`);
    console.log(`🆕 Neue Standorte erstellt: ${createdCount}`);
    console.log(`⏭️  Übersprungen: ${skippedCount}`);
    console.log(`📈 Gesamt verarbeitet: ${updatedCount + createdCount + skippedCount}`);
    
    // Also update employees without location but with location information in their data
    console.log('\n🔍 Suche nach Mitarbeitern ohne Standort-Referenz...');
    
    const employeesWithoutLocation = await prisma.employee.findMany({
      where: {
        locationIDs: null
      }
    });
    
    console.log(`📊 Gefunden: ${employeesWithoutLocation.length} Mitarbeiter ohne Standort-Referenz`);
    
    // For these employees, we would need to check if they have location data in their Excel files
    // This would require re-running the import script or checking the original data
    
  } catch (error) {
    console.error('❌ Fehler beim Update der Standorte:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateEmployeeLocations(); 