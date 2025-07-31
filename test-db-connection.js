const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('🔍 Teste Datenbankverbindung...\n');
  
  try {
    // Test 1: Verbindung testen
    console.log('1️⃣ Teste Prisma-Verbindung...');
    await prisma.$connect();
    console.log('✅ Prisma-Verbindung erfolgreich');
    
    // Test 2: Organisationen zählen
    console.log('\n2️⃣ Teste Organisationen-Tabelle...');
    const orgCount = await prisma.organisation.count();
    console.log(`✅ Organisationen gefunden: ${orgCount}`);
    
    // Test 3: Kontakte zählen
    console.log('\n3️⃣ Teste Kontakte-Tabelle...');
    const contactCount = await prisma.organisationContact.count();
    console.log(`✅ Kontakte gefunden: ${contactCount}`);
    
    // Test 4: Erste Organisation anzeigen
    console.log('\n4️⃣ Zeige erste Organisation...');
    const firstOrg = await prisma.organisation.findFirst({
      select: {
        id: true,
        name: true,
        abbreviation: true
      }
    });
    
    if (firstOrg) {
      console.log(`✅ Erste Organisation: ${firstOrg.name} (${firstOrg.abbreviation})`);
    } else {
      console.log('❌ Keine Organisationen gefunden');
    }
    
    // Test 5: Erste Kontakte anzeigen
    console.log('\n5️⃣ Zeige erste Kontakte...');
    const firstContacts = await prisma.organisationContact.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        organisationId: true
      }
    });
    
    if (firstContacts.length > 0) {
      console.log(`✅ Erste ${firstContacts.length} Kontakte:`);
      firstContacts.forEach((contact, index) => {
        console.log(`   ${index + 1}. ${contact.name} (Org ID: ${contact.organisationId})`);
      });
    } else {
      console.log('❌ Keine Kontakte gefunden');
    }
    
    console.log('\n🎉 Datenbankverbindung erfolgreich getestet!');
    
  } catch (error) {
    console.error('❌ Datenbankfehler:', error.message);
    console.error('Details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection(); 