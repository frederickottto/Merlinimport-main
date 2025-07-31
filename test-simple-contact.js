const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testSimpleContact() {
  console.log('🚀 Teste einfachen Kontakt-Import...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Gesetzt' : '❌ Nicht gesetzt');
  
  try {
    // Test 1: Verbindung testen
    console.log('\n1️⃣ Teste Datenbankverbindung...');
    await prisma.$connect();
    console.log('✅ Verbindung erfolgreich');
    
    // Test 2: Organisationen zählen
    console.log('\n2️⃣ Teste Organisationen...');
    const orgCount = await prisma.organisation.count();
    console.log(`✅ Organisationen gefunden: ${orgCount}`);
    
    // Test 3: Erste Organisation finden
    console.log('\n3️⃣ Finde erste Organisation...');
    const firstOrg = await prisma.organisation.findFirst();
    if (firstOrg) {
      console.log(`✅ Erste Organisation: ${firstOrg.name} (ID: ${firstOrg.id})`);
      
      // Test 4: Test-Kontakt erstellen
      console.log('\n4️⃣ Erstelle Test-Kontakt...');
      const testContact = await prisma.organisationContact.create({
        data: {
          foreName: 'Test',
          lastName: 'Kontakt',
          email: 'test.kontakt@example.com',
          organisationIDs: [firstOrg.id],
          position: 'Test-Import',
        }
      });
      console.log(`✅ Test-Kontakt erstellt: ${testContact.foreName} ${testContact.lastName}`);
      console.log(`   ID: ${testContact.id}`);
      console.log(`   Organisation: ${firstOrg.name}`);
      
      // Test 5: Kontakt löschen (Cleanup)
      console.log('\n5️⃣ Lösche Test-Kontakt...');
      await prisma.organisationContact.delete({
        where: { id: testContact.id }
      });
      console.log('✅ Test-Kontakt gelöscht');
      
    } else {
      console.log('❌ Keine Organisationen gefunden');
    }
    
  } catch (error) {
    console.log('❌ Fehler:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSimpleContact(); 