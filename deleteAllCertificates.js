// Script to delete all certificates from the database
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function deleteAllCertificates() {
  console.log("🗑️  Zertifikat-Löschung");
  console.log("📋 Lösche alle Zertifikate aus der Datenbank...\n");
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Count existing certificates
    const count = await prisma.certificate.count();
    console.log(`📊 Gefundene Zertifikate: ${count}`);
    
    if (count === 0) {
      console.log("ℹ️  Keine Zertifikate zum Löschen gefunden");
      return;
    }
    
    // Delete all certificates
    const result = await prisma.certificate.deleteMany({});
    
    console.log(`✅ Erfolgreich gelöscht: ${result.count} Zertifikate`);
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllCertificates(); 