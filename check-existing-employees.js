const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkExistingEmployees() {
  console.log('🔍 Überprüfe existierende Mitarbeiterprofile...\n');
  
  try {
    // Get all employees
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        foreName: true,
        lastName: true,
        pseudonym: true,
        employeerCompany: true,
        experienceIt: true,
        experienceIs: true,
        experienceItGs: true,
        experienceGps: true,
        experienceAll: true,
        contractStartDate: true,
        locationIDs: true
      },
      orderBy: {
        foreName: 'asc'
      }
    });
    
    console.log(`📊 Gefunden: ${employees.length} Mitarbeiterprofile in der Datenbank\n`);
    
    // Group by source/type
    const pseudonymEmployees = employees.filter(emp => emp.pseudonym && emp.pseudonym.length === 3);
    const namedEmployees = employees.filter(emp => emp.foreName && emp.foreName.length > 3);
    const otherEmployees = employees.filter(emp => !emp.pseudonym || emp.pseudonym.length !== 3);
    
    console.log('📋 **Pseudonym-basierte Profile (3 Buchstaben):**');
    console.log(`   Anzahl: ${pseudonymEmployees.length}`);
    console.log('   Beispiele:', pseudonymEmployees.slice(0, 10).map(emp => emp.pseudonym).join(', '));
    if (pseudonymEmployees.length > 10) {
      console.log('   ... und weitere');
    }
    
    console.log('\n📋 **Namen-basierte Profile:**');
    console.log(`   Anzahl: ${namedEmployees.length}`);
    console.log('   Beispiele:', namedEmployees.slice(0, 10).map(emp => `${emp.foreName} ${emp.lastName}`.trim()).join(', '));
    if (namedEmployees.length > 10) {
      console.log('   ... und weitere');
    }
    
    console.log('\n📋 **Andere Profile:**');
    console.log(`   Anzahl: ${otherEmployees.length}`);
    if (otherEmployees.length > 0) {
      otherEmployees.forEach(emp => {
        console.log(`   - ${emp.foreName} ${emp.lastName} (Pseudonym: ${emp.pseudonym})`);
      });
    }
    
    // Check for specific profiles mentioned
    const specificProfiles = ['EDO', 'LTH'];
    console.log('\n🔍 **Suche nach spezifischen Profilen:**');
    specificProfiles.forEach(pseudonym => {
      const profile = employees.find(emp => emp.pseudonym === pseudonym);
      if (profile) {
        console.log(`   ✅ ${pseudonym}: Gefunden - ${profile.foreName} ${profile.lastName}`);
      } else {
        console.log(`   ❌ ${pseudonym}: Nicht gefunden`);
      }
    });
    
    // Check for profiles that might be from other sources
    console.log('\n🔍 **Profile mit anderen Pseudonymen (nicht 3 Buchstaben):**');
    const nonThreeLetterProfiles = employees.filter(emp => emp.pseudonym && emp.pseudonym.length !== 3);
    nonThreeLetterProfiles.forEach(emp => {
      console.log(`   - ${emp.pseudonym}: ${emp.foreName} ${emp.lastName}`);
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Überprüfen der Mitarbeiter:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingEmployees().catch(console.error); 