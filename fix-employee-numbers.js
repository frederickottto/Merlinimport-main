const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function fixEmployeeNumbers() {
  try {
    console.log('🔧 Starte Korrektur der Mitarbeiterzahlen...\n');

    // Finde alle Organisationen mit employeeNumber: 0
    const organisationsWithZero = await prisma.organisation.findMany({
      where: {
        employeeNumber: 0
      },
      select: {
        id: true,
        name: true,
        employeeNumber: true
      }
    });

    console.log(`📊 Gefunden: ${organisationsWithZero.length} Organisationen mit employeeNumber: 0`);

    if (organisationsWithZero.length === 0) {
      console.log('✅ Keine Organisationen mit employeeNumber: 0 gefunden!');
      return;
    }

    // Zeige die gefundenen Organisationen
    console.log('\n📋 Organisationen mit employeeNumber: 0:');
    for (const org of organisationsWithZero) {
      console.log(`   - ${org.name} (ID: ${org.id})`);
    }

    // Update alle Organisationen mit employeeNumber: 0 zu null
    const updateResult = await prisma.organisation.updateMany({
      where: {
        employeeNumber: 0
      },
      data: {
        employeeNumber: null
      }
    });

    console.log(`\n✅ Erfolgreich aktualisiert: ${updateResult.count} Organisationen`);
    console.log('   employeeNumber: 0 → employeeNumber: null');

    // Verifiziere die Änderungen
    const remainingWithZero = await prisma.organisation.findMany({
      where: {
        employeeNumber: 0
      },
      select: {
        id: true,
        name: true
      }
    });

    if (remainingWithZero.length === 0) {
      console.log('\n✅ Verifikation erfolgreich: Keine Organisationen mehr mit employeeNumber: 0');
    } else {
      console.log(`\n⚠️  Warnung: ${remainingWithZero.length} Organisationen haben immer noch employeeNumber: 0`);
      for (const org of remainingWithZero) {
        console.log(`   - ${org.name} (ID: ${org.id})`);
      }
    }

    console.log('\n🎉 Mitarbeiterzahlen-Korrektur abgeschlossen!');

  } catch (error) {
    console.error('❌ Fehler beim Korrigieren der Mitarbeiterzahlen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEmployeeNumbers(); 