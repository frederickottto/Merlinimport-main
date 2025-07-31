// Script to import locations from Standorte.json into the app
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();

const prisma = new PrismaClient();

async function importStandorte() {
  console.log("🏢 Importiere Standorte aus Standorte.json...");
  
  try {
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Read the JSON file
    const jsonData = fs.readFileSync('./Standorte.json', 'utf8');
    const standorte = JSON.parse(jsonData);
    
    console.log(`📊 Gefundene Standorte: ${standorte.length}`);
    
    // First, check if we want to delete existing locations
    const existingCount = await prisma.location.count();
    console.log(`📊 Bestehende Standorte in der App: ${existingCount}`);
    
    if (existingCount > 0) {
      console.log("🗑️  Lösche alle bestehenden Standorte...");
      await prisma.location.deleteMany({});
      console.log(`✅ ${existingCount} Standorte gelöscht`);
    }
    
    // Import all locations
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const standort of standorte) {
      try {
        // Check if location already exists (by street, house number, and city)
        const existing = await prisma.location.findFirst({
          where: {
            street: standort.Straße,
            houseNumber: standort.Hausnummer,
            city: standort.Ort
          }
        });
        
        if (!existing) {
          await prisma.location.create({
            data: {
              street: standort.Straße,
              houseNumber: standort.Hausnummer,
              postCode: standort.Postleitzahl,
              city: standort.Ort,
              region: 'Unknown', // Default region
              country: 'Deutschland' // Set country to Deutschland as requested
            }
          });
          console.log(`✅ Importiert: ${standort.Straße} ${standort.Hausnummer}, ${standort.Postleitzahl} ${standort.Ort}`);
          importedCount++;
        } else {
          console.log(`⏭️  Übersprungen (bereits vorhanden): ${standort.Straße} ${standort.Hausnummer}, ${standort.Ort}`);
          skippedCount++;
        }
      } catch (error) {
        console.log(`❌ Fehler beim Import von ${standort.Straße} ${standort.Hausnummer}, ${standort.Ort}: ${error.message}`);
      }
    }
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Importiert: ${importedCount} Standorte`);
    console.log(`   ⏭️  Übersprungen: ${skippedCount} Standorte`);
    
    // Verify the import
    const finalCount = await prisma.location.count();
    console.log(`   📊 Gesamt Standorte in der App: ${finalCount}`);
    
    // Show some examples of imported locations
    const sampleLocations = await prisma.location.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n📋 Beispiele importierter Standorte:`);
    for (const location of sampleLocations) {
      console.log(`   - ${location.street} ${location.houseNumber}, ${location.postCode} ${location.city}`);
    }
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

importStandorte(); 