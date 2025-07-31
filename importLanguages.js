const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { PrismaClient } = require("./generated/prisma");
require("dotenv").config();

const prisma = new PrismaClient();

async function importLanguages() {
  try {
    console.log("🚀 Starte Importprozess für Sprachen...");
    
    // Read the Excel file
    const workbook = xlsx.readFile("EY CSS - Datenerhebung NKA.xlsx");
    const sheet = workbook.Sheets["_Daten"];
    
    if (!sheet) {
      console.log("❌ Sheet '_Daten' nicht gefunden");
      return;
    }
    
    // Convert sheet to JSON
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    if (data.length < 2) {
      console.log("❌ Keine Daten im Sheet '_Daten' gefunden");
      return;
    }
    
    // Get headers from first row
    const headers = data[0];
    console.log("📋 Gefundene Spalten:", headers);
    
    // Find language and level columns
    const spracheIndex = headers.findIndex(header => header === "Sprache");
    const sprachniveauIndex = headers.findIndex(header => header === "Sprachniveau");
    
    if (spracheIndex === -1) {
      console.log("❌ Spalte 'Sprache' nicht gefunden");
      return;
    }
    
    console.log(`✅ Spalte 'Sprache' gefunden an Position ${spracheIndex}`);
    console.log(`✅ Spalte 'Sprachniveau' gefunden an Position ${sprachniveauIndex}`);
    
    // Extract unique language combinations
    const languageSkills = new Set();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row && row[spracheIndex] && row[spracheIndex].trim()) {
        const language = row[spracheIndex].trim();
        const level = row[sprachniveauIndex] ? row[sprachniveauIndex].trim() : "";
        
        // Create skill title with language and level
        const skillTitle = level ? `${language} (${level})` : language;
        languageSkills.add(skillTitle);
      }
    }
    
    console.log(`📊 Gefundene Sprachen: ${languageSkills.size}`);
    
    // Import each language as a skill
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const skillTitle of languageSkills) {
      try {
        // Check if skill already exists
        const existingSkill = await prisma.skills.findFirst({
          where: {
            title: skillTitle
          }
        });
        
        if (existingSkill) {
          console.log(`⏭️  Skill bereits vorhanden: ${skillTitle}`);
          skippedCount++;
          continue;
        }
        
        // Create new skill
        const newSkill = await prisma.skills.create({
          data: {
            title: skillTitle,
            type: "language",
            description: `Sprachkenntnis: ${skillTitle}`
          }
        });
        
        console.log(`✅ Skill importiert: ${skillTitle} (ID: ${newSkill.id})`);
        importedCount++;
        
      } catch (error) {
        console.log(`❌ Fehler beim Import von Skill '${skillTitle}':`, error.message);
      }
    }
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Importiert: ${importedCount}`);
    console.log(`   ⏭️  Übersprungen: ${skippedCount}`);
    console.log(`   📊 Gesamt: ${languageSkills.size}`);
    
  } catch (error) {
    console.log("❌ Fehler beim Importprozess:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importLanguages().catch(console.error); 