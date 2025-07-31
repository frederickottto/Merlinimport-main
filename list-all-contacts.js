const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function listAllContacts() {
  console.log('📋 Alle Kontakte aus der Datenbank:');
  try {
    const contacts = await prisma.organisationContacts.findMany({
      include: { organisations: true },
    });
    console.log(contacts);
  } catch (err) {
    console.error('❌ Fehler beim Auslesen:', err);
  } finally {
    await prisma.$disconnect();
  }
}

listAllContacts(); 