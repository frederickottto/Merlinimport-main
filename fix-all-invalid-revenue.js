const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findAndFixInvalidRevenue() {
  console.log('🔍 Suche nach ALLEN ungültigen anualReturn Werten...\\n');

  try {
    // 1. Verwende MongoDB-Befehle, um alle Organisationen zu finden
    console.log('📋 1. Prüfe alle Organisationen auf ungültige anualReturn Werte...');
    
    const allOrganisations = await prisma.$runCommandRaw({
      find: "Organisation",
      projection: {
        _id: 1,
        name: 1,
        anualReturn: 1
      }
    });

    console.log(`   Gefunden: ${allOrganisations.cursor.firstBatch.length} Organisationen insgesamt`);

    // 2. Identifiziere Organisationen mit ungültigen anualReturn Werten
    const invalidOrganisations = [];
    
    for (const org of allOrganisations.cursor.firstBatch) {
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
        invalidOrganisations.push({
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
    console.log(`   Gesamt: ${allOrganisations.cursor.firstBatch.length} Organisationen`);
    console.log(`   Ungültig: ${invalidOrganisations.length} Organisationen`);
    console.log(`   Gültig: ${allOrganisations.cursor.firstBatch.length - invalidOrganisations.length} Organisationen`);

    if (invalidOrganisations.length === 0) {
      console.log('\\n✅ Keine ungültigen Einträge gefunden!');
      return;
    }

    console.log(`\\n⚠️  GEFUNDENE PROBLEMATISCHE EINTRÄGE:`);
    invalidOrganisations.forEach((org, index) => {
      console.log(`   ${index + 1}. ${org.name}: "${org.value}" (${org.type}) - ${org.reason}`);
    });

    console.log(`\\n❓ MÖCHTEST DU DIESE ${invalidOrganisations.length} EINTRÄGE LÖSCHEN?`);
    console.log('   Antworte mit "ja" um fortzufahren, oder "nein" um abzubrechen.');
    
    // Hier würde normalerweise eine Benutzerabfrage stehen
    // Da wir das nicht direkt implementieren können, zeigen wir die Optionen
    console.log('\\n💡 Um fortzufahren, führe das Skript mit "node fix-all-invalid-revenue.js ja" aus.');
    console.log('   Um abzubrechen, führe das Skript mit "node fix-all-invalid-revenue.js nein" aus.');

    // Prüfe Kommandozeilenargument
    const shouldDelete = process.argv[2] === 'ja';
    
    if (shouldDelete) {
      console.log(`\\n🗑️  Lösche ${invalidOrganisations.length} ungültige Einträge...`);
      
      for (const org of invalidOrganisations) {
        console.log(`   Lösche: ${org.name} (${org.value})`);
        
        // Lösche abhängige Einträge zuerst
        await prisma.$runCommandRaw({
          delete: "CallToTenderOrganisation",
          filter: { organisationIDs: org.id }
        });
        
        await prisma.$runCommandRaw({
          delete: "OrganisationContacts", 
          filter: { organisationIDs: org.id }
        });
        
        await prisma.$runCommandRaw({
          delete: "RiskQualityProcess",
          filter: { organisationID: org.id }
        });
        
        // Lösche die Organisation
        await prisma.$runCommandRaw({
          delete: "Organisation",
          filter: { _id: org.id }
        });
      }

      console.log(`\\n✅ ${invalidOrganisations.length} ungültige Einträge erfolgreich gelöscht!`);
    } else {
      console.log('\\n❌ Löschung abgebrochen.');
    }

  } catch (error) {
    console.error('❌ Fehler:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findAndFixInvalidRevenue(); 