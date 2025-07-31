const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findAllOrganisations() {
  console.log('🔍 Suche nach allen Organisationen mit verschiedenen Ansätzen...\n');

  try {
    // 1. Verwende einen anderen MongoDB-Befehl
    console.log('📋 1. Suche mit find-Befehl...');
    
    const result1 = await prisma.$runCommandRaw({
      find: "Organisation",
      filter: {},
      projection: {
        _id: 1,
        name: 1,
        anualReturn: 1
      }
    });

    console.log(`   Gefunden: ${result1.cursor.firstBatch.length} Organisationen`);

    // 2. Suche nach allen Einträgen mit anualReturn
    console.log('\n📋 2. Suche nach Einträgen mit anualReturn...');
    
    const result2 = await prisma.$runCommandRaw({
      find: "Organisation",
      filter: {
        anualReturn: { $exists: true }
      },
      projection: {
        _id: 1,
        name: 1,
        anualReturn: 1
      }
    });

    console.log(`   Gefunden: ${result2.cursor.firstBatch.length} Organisationen mit anualReturn`);

    // 3. Zeige alle Einträge mit String-Werten
    console.log('\n📋 3. Alle Einträge mit String-Werten in anualReturn:');
    let stringCount = 0;
    
    for (const org of result2.cursor.firstBatch) {
      if (typeof org.anualReturn === 'string') {
        stringCount++;
        console.log(`   ${stringCount}. ${org.name} (${org._id})`);
        console.log(`      anualReturn: "${org.anualReturn}"`);
        console.log(`      Type: ${typeof org.anualReturn}`);
        console.log('');
      }
    }

    if (stringCount === 0) {
      console.log('   Keine String-Werte gefunden!');
    }

    // 4. Suche nach dem spezifischen problematischen Wert mit verschiedenen Varianten
    console.log('\n📋 4. Suche nach problematischen Werten...');
    
    const problematicValues = [
      "-   €",
      "- €",
      "-€",
      "€",
      "-",
      "   €",
      " €"
    ];

    for (const value of problematicValues) {
      const result = await prisma.$runCommandRaw({
        find: "Organisation",
        filter: {
          anualReturn: value
        },
        projection: {
          _id: 1,
          name: 1,
          anualReturn: 1
        }
      });

      if (result.cursor.firstBatch.length > 0) {
        console.log(`   Gefunden: "${value}" in ${result.cursor.firstBatch.length} Organisation(en)`);
        result.cursor.firstBatch.forEach((org, index) => {
          console.log(`      ${index + 1}. ${org.name} (${org._id})`);
        });
      }
    }

    // 5. Suche nach allen Einträgen, die nicht als Float konvertiert werden können
    console.log('\n📋 5. Prüfe alle Einträge auf Float-Konvertierung...');
    
    let problematicCount = 0;
    for (const org of result2.cursor.firstBatch) {
      if (typeof org.anualReturn === 'string') {
        const floatValue = parseFloat(org.anualReturn);
        if (isNaN(floatValue)) {
          problematicCount++;
          console.log(`   ${problematicCount}. ${org.name} (${org._id})`);
          console.log(`      anualReturn: "${org.anualReturn}"`);
          console.log(`      ⚠️  KANN NICHT ALS FLOAT KONVERTIERT WERDEN!`);
          console.log('');
        }
      }
    }

    if (problematicCount === 0) {
      console.log('   Keine problematischen Einträge gefunden!');
    }

  } catch (error) {
    console.error('❌ Fehler beim Suchen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findAllOrganisations(); 