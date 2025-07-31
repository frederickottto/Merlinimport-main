// Script to add new locations from Standorte.json without deleting existing ones
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();

const prisma = new PrismaClient();

async function addStandorte() {
  console.log("🏢 Füge neue Standorte aus Standorte.json hinzu...");
  
  try {
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Read the JSON file
    const jsonData = fs.readFileSync('./Standorte.json', 'utf8');
    const standorte = JSON.parse(jsonData);
    
    console.log(`📊 Gefundene Standorte in JSON: ${standorte.length}`);
    
    // Check existing locations
    const existingCount = await prisma.location.count();
    console.log(`📊 Bestehende Standorte in der App: ${existingCount}`);
    
    // Import only new locations
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
          console.log(`✅ Hinzugefügt: ${standort.Straße} ${standort.Hausnummer}, ${standort.Postleitzahl} ${standort.Ort}`);
          importedCount++;
        } else {
          console.log(`⏭️  Bereits vorhanden: ${standort.Straße} ${standort.Hausnummer}, ${standort.Ort}`);
          skippedCount++;
        }
      } catch (error) {
        console.log(`❌ Fehler beim Hinzufügen von ${standort.Straße} ${standort.Hausnummer}, ${standort.Ort}: ${error.message}`);
      }
    }
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Neue Standorte hinzugefügt: ${importedCount}`);
    console.log(`   ⏭️  Bereits vorhanden (übersprungen): ${skippedCount}`);
    
    // Verify the final count
    const finalCount = await prisma.location.count();
    console.log(`   📊 Gesamt Standorte in der App: ${finalCount}`);
    
    // Show some examples of newly added locations
    const newLocations = await prisma.location.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n📋 Beispiele neu hinzugefügter Standorte:`);
    for (const location of newLocations) {
      console.log(`   - ${location.street} ${location.houseNumber}, ${location.postCode} ${location.city}`);
    }
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

addStandorte(); 