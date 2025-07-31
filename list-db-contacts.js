const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function listContacts() {
  console.log('🔍 Lese alle Kontakte aus der Datenbank...');
  try {
    const contacts = await prisma.organisationContacts.findMany({
      take: 10,
      include: { organisations: true },
    });
    if (contacts.length === 0) {
      console.log('❌ Keine Kontakte gefunden!');
    } else {
      console.log('✅ Gefundene Kontakte:');
      contacts.forEach((c, i) => {
        console.log(`${i + 1}. ${c.foreName} ${c.lastName} | Email: ${c.email} | Orga-IDs: ${c.organisationIDs}`);
      });
    }
  } catch (err) {
    console.error('Fehler beim Lesen der Kontakte:', err);
  } finally {
    await prisma.$disconnect();
  }
}

listContacts(); 