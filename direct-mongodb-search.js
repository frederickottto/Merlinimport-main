require('dotenv').config();
const { MongoClient } = require('mongodb');

async function directMongoDBSearch() {
  console.log('🔍 Direkte MongoDB-Suche nach problematischen Einträgen...\n');

  let client;
  try {
    // Verbinde direkt mit MongoDB
    client = new MongoClient(process.env.DATABASE_URL);
    await client.connect();
    
    const db = client.db();
    const collection = db.collection('Organisation');

    console.log('📋 1. Suche nach allen Organisationen...');
    const allOrganisations = await collection.find({}).toArray();
    console.log(`   Gefunden: ${allOrganisations.length} Organisationen`);

    console.log('\n📋 2. Suche nach String-Werten in anualReturn...');
    let stringCount = 0;
    const problematicEntries = [];

    for (const org of allOrganisations) {
      if (typeof org.anualReturn === 'string') {
        stringCount++;
        console.log(`   ${stringCount}. ${org.name} (${org._id})`);
        console.log(`      anualReturn: "${org.anualReturn}"`);
        console.log(`      Type: ${typeof org.anualReturn}`);
        
        // Prüfe, ob es als Float konvertiert werden kann
        const floatValue = parseFloat(org.anualReturn);
        if (isNaN(floatValue)) {
          console.log(`      ⚠️  KANN NICHT ALS FLOAT KONVERTIERT WERDEN!`);
          problematicEntries.push(org);
        } else {
          console.log(`      ✅ Kann als Float konvertiert werden: ${floatValue}`);
        }
        console.log('');
      }
    }

    if (stringCount === 0) {
      console.log('   Keine String-Werte gefunden!');
    }

    console.log('\n📋 3. Suche nach spezifischen problematischen Werten...');
    const problematicValues = [
      "-   €",
      "- €",
      "-€",
      "€",
      "-",
      "   €",
      " €",
      " -   €",
      " - €",
      " -€"
    ];

    for (const value of problematicValues) {
      const result = await collection.find({ anualReturn: value }).toArray();
      if (result.length > 0) {
        console.log(`   Gefunden: "${value}" in ${result.length} Organisation(en)`);
        result.forEach((org, index) => {
          console.log(`      ${index + 1}. ${org.name} (${org._id})`);
        });
      }
    }

    console.log('\n📋 4. Suche nach Einträgen mit € Symbol...');
    const euroResults = await collection.find({ 
      anualReturn: { $regex: /€/ } 
    }).toArray();
    
    if (euroResults.length > 0) {
      console.log(`   Gefunden: ${euroResults.length} Einträge mit € Symbol`);
      euroResults.forEach((org, index) => {
        console.log(`   ${index + 1}. ${org.name} (${org._id})`);
        console.log(`      anualReturn: "${org.anualReturn}"`);
        console.log(`      Type: ${typeof org.anualReturn}`);
        console.log('');
      });
    } else {
      console.log('   Keine Einträge mit € Symbol gefunden');
    }

    console.log('\n📋 5. Suche nach Einträgen mit Minus-Zeichen...');
    const minusResults = await collection.find({ 
      anualReturn: { $regex: /-/ } 
    }).toArray();
    
    if (minusResults.length > 0) {
      console.log(`   Gefunden: ${minusResults.length} Einträge mit Minus-Zeichen`);
      minusResults.forEach((org, index) => {
        console.log(`   ${index + 1}. ${org.name} (${org._id})`);
        console.log(`      anualReturn: "${org.anualReturn}"`);
        console.log(`      Type: ${typeof org.anualReturn}`);
        console.log('');
      });
    } else {
      console.log('   Keine Einträge mit Minus-Zeichen gefunden');
    }

    // 6. Lösche die problematischen Einträge
    if (problematicEntries.length > 0) {
      console.log(`\n⚠️  Lösche ${problematicEntries.length} problematische Einträge...`);
      
      for (const org of problematicEntries) {
        console.log(`   Lösche: ${org.name} (${org._id})`);
        
        // Lösche abhängige Einträge zuerst
        await db.collection('CallToTenderOrganisation').deleteMany({
          organisationIDs: org._id.toString()
        });
        
        await db.collection('OrganisationContacts').deleteMany({
          organisationIDs: { $in: [org._id.toString()] }
        });
        
        await db.collection('RiskQualityProcess').deleteMany({
          organisationID: org._id.toString()
        });
        
        // Lösche die Organisation
        await collection.deleteOne({ _id: org._id });
        console.log(`   ✅ ${org.name} gelöscht`);
      }
      
      console.log('\n✅ Bereinigung abgeschlossen!');
    } else {
      console.log('\n✅ Keine problematischen Einträge gefunden!');
    }

  } catch (error) {
    console.error('❌ Fehler bei der direkten MongoDB-Suche:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

directMongoDBSearch(); 