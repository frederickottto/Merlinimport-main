require('dotenv').config();
const { MongoClient } = require('mongodb');

async function findAllInvalidRevenue() {
  console.log('🔍 Suche nach ALLEN ungültigen anualReturn Werten...\\n');

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

    console.log('\\n📋 2. Analysiere alle anualReturn Werte...');
    let invalidCount = 0;
    const invalidEntries = [];

    for (const org of allOrganisations) {
      const anualReturn = org.anualReturn;
      const type = typeof anualReturn;
      
      // Prüfe auf ungültige Werte
      let isInvalid = false;
      let reason = '';
      
      if (type === 'string') {
        isInvalid = true;
        reason = 'String-Wert in Float-Feld';
      } else if (type === 'number') {
        if (isNaN(anualReturn)) {
          isInvalid = true;
          reason = 'NaN-Wert';
        }
      } else if (anualReturn !== null && anualReturn !== undefined) {
        isInvalid = true;
        reason = 'Unerwarteter Datentyp: ' + type;
      }

      if (isInvalid) {
        invalidCount++;
        invalidEntries.push({
          id: org._id,
          name: org.name,
          value: anualReturn,
          type: type,
          reason: reason
        });
        
        console.log(`   ❌ ${org.name}: "${anualReturn}" (${type}) - ${reason}`);
      }
    }

    console.log(`\\n📊 ZUSAMMENFASSUNG:`);
    console.log(`   Gesamt: ${allOrganisations.length} Organisationen`);
    console.log(`   Ungültig: ${invalidCount} Organisationen`);
    console.log(`   Gültig: ${allOrganisations.length - invalidCount} Organisationen`);

    if (invalidCount === 0) {
      console.log('\\n✅ Keine ungültigen Einträge gefunden!');
      return;
    }

    console.log(`\\n🗑️  Lösche ${invalidCount} ungültige Einträge...`);
    
    // Lösche alle ungültigen Einträge
    for (const entry of invalidEntries) {
      console.log(`   Lösche: ${entry.name} (${entry.value})`);
      
      // Lösche abhängige Einträge zuerst
      await collection.deleteMany({
        $or: [
          { organisationIDs: entry.id },
          { organisationID: entry.id },
          { wonByOrganisationID: entry.id }
        ]
      });
      
      // Lösche die Organisation
      await collection.deleteOne({ _id: entry.id });
    }

    console.log(`\\n✅ ${invalidCount} ungültige Einträge erfolgreich gelöscht!`);

  } catch (error) {
    console.error('❌ Fehler:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

findAllInvalidRevenue(); 