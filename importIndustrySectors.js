// Script to import industry sectors from Excel _Daten sheet
const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function importIndustrySectors() {
  console.log("🏭 Importiere Branchen aus Excel...");
  
  try {
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
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
    
    // Find industry sectors in the data
    const industrySectors = new Set();
    
    // Extract industry sectors from column 5 (index 4) - these are the actual branches
    console.log("🔍 Extrahiere Branchen aus Spalte 5...");
    
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
    
    // Import industry sectors to database
    let importedCount = 0;
    let existingCount = 0;
    
    for (const sector of industrySectors) {
      try {
        // Check if industry sector already exists
        const existing = await prisma.industrySector.findFirst({
          where: { industrySector: sector }
        });
        
        if (!existing) {
          await prisma.industrySector.create({
            data: {
              industrySector: sector
            }
          });
          console.log(`✅ Importiert: "${sector}"`);
          importedCount++;
        } else {
          console.log(`⏭️  Bereits vorhanden: "${sector}"`);
          existingCount++;
        }
      } catch (error) {
        console.log(`❌ Fehler beim Import von "${sector}": ${error.message}`);
      }
    }
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Neu importiert: ${importedCount} Branchen`);
    console.log(`   ⏭️  Bereits vorhanden: ${existingCount} Branchen`);
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

importIndustrySectors(); 