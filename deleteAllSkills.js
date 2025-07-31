// Script to delete all skills from the database
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function deleteAllSkills() {
  console.log("🗑️  Skills-Löschung");
  console.log("📋 Lösche alle Skills/Fähigkeiten aus der Datenbank...\n");
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Count existing skills
    const count = await prisma.skills.count();
    console.log(`📊 Gefundene Skills: ${count}`);
    
    if (count === 0) {
      console.log("ℹ️  Keine Skills zum Löschen gefunden");
      return;
    }
    
    // Delete all skills
    const result = await prisma.skills.deleteMany({});
    
    console.log(`✅ Erfolgreich gelöscht: ${result.count} Skills`);
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllSkills(); 