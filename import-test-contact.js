const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function importTestContact() {
  console.log('🚀 Starte Test-Import...');
  try {
    // Alle Organisationen ausgeben
    const allOrgs = await prisma.organisation.findMany();
    console.log(`Organisationen in DB: ${allOrgs.length}`);
    if (allOrgs.length > 0) {
      console.log('Beispiel-Organisation:', allOrgs[0]);
    }
    // Alle Kontakte vor dem Insert ausgeben
    const beforeContacts = await prisma.organisationContacts.findMany();
    console.log(`Vorher Kontakte in DB: ${beforeContacts.length}`);
    // Test-Kontakt anlegen
    if (allOrgs.length === 0) {
      console.log('❌ Keine Organisation gefunden!');
      return;
    }
    const kontakt = await prisma.organisationContacts.create({
      data: {
        foreName: 'Test',
        lastName: 'Kontakt',
        email: 'test.kontakt@example.com',
        organisationIDs: [allOrgs[0].id],
        position: 'Test-Import',
      }
    });
    console.log('✅ Test-Kontakt angelegt:', kontakt);
    // Alle Kontakte nach dem Insert ausgeben
    const afterContacts = await prisma.organisationContacts.findMany();
    console.log(`Nachher Kontakte in DB: ${afterContacts.length}`);
    if (afterContacts.length > 0) {
      console.log('Beispiel-Kontakt:', afterContacts[afterContacts.length - 1]);
    }
  } catch (err) {
    console.error('❌ Fehler beim Import:', err);
  } finally {
    await prisma.$disconnect();
  }
}

importTestContact(); 