// Script to import skills from JSON file into the database
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function importSkills() {
  console.log("🚀 Skills-Import");
  console.log("📋 Importiere Skills aus der JSON-Datei...\n");
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Read the JSON file - try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, '../Downloads/all_skills_full.json'),
      path.join(__dirname, '../../Downloads/all_skills_full.json'),
      '/Users/frederickotto/Downloads/all_skills_full.json'
    ];
    
    let jsonPath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        jsonPath = testPath;
        break;
      }
    }
    
    if (!jsonPath) {
      console.log(`❌ Datei nicht gefunden in folgenden Pfaden:`);
      possiblePaths.forEach(p => console.log(`   - ${p}`));
      console.log("💡 Bitte stelle sicher, dass die Datei im Downloads-Ordner liegt");
      return;
    }
    
    console.log(`📂 Lese Datei: ${jsonPath}`);
    
    const skillsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📊 Gefundene Skills: ${skillsData.length}`);
    
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const skillData of skillsData) {
      try {
        // Check if skill already exists
        const existing = await prisma.skills.findFirst({
          where: {
            title: skillData.name
          }
        });
        
        if (existing) {
          console.log(`⏭️  Übersprungen: "${skillData.name}" (bereits vorhanden)`);
          skippedCount++;
        } else {
          // Import skill with the correct structure
          await prisma.skills.create({
            data: {
              title: skillData.name,
              type: skillData.type,
              description: skillData.description || ""
            }
          });
          console.log(`✅ Importiert: "${skillData.name}" (${skillData.type})`);
          importedCount++;
        }
      } catch (error) {
        console.log(`❌ Fehler bei "${skillData.name}": ${error.message}`);
        errorCount++;
      }
    }
    
    // Count skills by type
    const typeStats = {};
    skillsData.forEach(skill => {
      typeStats[skill.type] = (typeStats[skill.type] || 0) + 1;
    });
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Importiert: ${importedCount} Skills`);
    console.log(`   ⏭️  Übersprungen: ${skippedCount} Skills`);
    console.log(`   ❌ Fehler: ${errorCount} Skills`);
    console.log(`   📊 Gesamt: ${skillsData.length} Skills`);
    
    console.log(`\n📂 Typen:`);
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   📁 ${type}: ${count} Skills`);
    });
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

importSkills(); 