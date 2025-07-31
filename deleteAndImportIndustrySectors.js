// Script to delete all existing industry sectors and import the 35 branches from _Daten sheet
const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function deleteAndImportIndustrySectors() {
  console.log("🏭 Lösche alle Branchen und importiere neu aus Excel...");
  
  try {
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Step 1: Delete all existing industry sectors
    console.log("\n🗑️  Lösche alle bestehenden Branchen...");
    
    // First, check how many exist
    const existingCount = await prisma.industrySector.count();
    console.log(`📊 Gefundene bestehende Branchen: ${existingCount}`);
    
    if (existingCount > 0) {
      // Delete all industry sectors
      await prisma.industrySector.deleteMany({});
      console.log(`✅ ${existingCount} Branchen gelöscht`);
    } else {
      console.log("ℹ️  Keine bestehenden Branchen gefunden");
    }
    
    // Step 2: Import new industry sectors from Excel
    console.log("\n📥 Importiere Branchen aus Excel...");
    
    const excelFile = './excels/EY CSS - Datenerhebung MM.xlsx';
    const workbook = xlsx.readFile(excelFile);
    
    if (!workbook.SheetNames.includes('_Daten')) {
      console.log("❌ Kein '_Daten' Sheet in der Excel-Datei gefunden");
      console.log(`📋 Verfügbare Sheets: ${workbook.SheetNames.join(', ')}`);
      return;
    }
    
    console.log("📊 '_Daten' Sheet gefunden");
    
    const sheet = workbook.Sheets['_Daten'];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
    
    console.log(`📋 Raw Data Zeilen: ${rawData.length}`);
    
    // Extract industry sectors from column 5 (index 4) - these are the actual branches
    console.log("🔍 Extrahiere Branchen aus Spalte 5...");
    
    const industrySectors = new Set();
    
    for (const row of rawData) {
      if (row && Array.isArray(row) && row.length > 4) {
        const sector = row[4]; // Column 5 (index 4)
        if (sector && typeof sector === 'string') {
          const sectorTrimmed = sector.trim();
          if (sectorTrimmed && sectorTrimmed.length > 0 && sectorTrimmed !== 'Branche') {
            industrySectors.add(sectorTrimmed);
            console.log(`📍 Branche gefunden: "${sectorTrimmed}"`);
          }
        }
      }
    }
    
    console.log(`\n📊 Gefundene Branchen: ${industrySectors.size}`);
    for (const sector of industrySectors) {
      console.log(`   - ${sector}`);
    }
    
    // Import all industry sectors to database
    let importedCount = 0;
    
    for (const sector of industrySectors) {
      try {
        await prisma.industrySector.create({
          data: {
            industrySector: sector
          }
        });
        console.log(`✅ Importiert: "${sector}"`);
        importedCount++;
      } catch (error) {
        console.log(`❌ Fehler beim Import von "${sector}": ${error.message}`);
      }
    }
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Importiert: ${importedCount} Branchen`);
    
    // Verify the import
    const finalCount = await prisma.industrySector.count();
    console.log(`   📊 Gesamt Branchen in der App: ${finalCount}`);
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAndImportIndustrySectors(); 