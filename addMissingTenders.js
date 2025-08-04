const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function addMissingTenders() {
  try {
    console.log('🔍 Füge fehlende Tender hinzu...');
    
    // Read the Excel files
    const xlsx = require("xlsx");
    
    // Read main Excel file
    const mainFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const mainWorkbook = xlsx.readFile(mainFile);
    const mainSheetName = "Vertriebsliste";
    const mainSheet = mainWorkbook.Sheets[mainSheetName];
    const mainJson = xlsx.utils.sheet_to_json(mainSheet, { defval: null, range: 2 });
    
    // Read title Excel file
    const titleFile = 'tenders/TitelVertriebe.xlsx';
    const titleWorkbook = xlsx.readFile(titleFile);
    const titleSheet = titleWorkbook.Sheets["Sheet1"];
    const titleJson = xlsx.utils.sheet_to_json(titleSheet, { defval: null });
    
    console.log(`Excel-Daten geladen: ${mainJson.length} Zeilen (Haupt), ${titleJson.length} Zeilen (Titel)`);
    
    // Create title mapping
    const titleMap = new Map();
    for (const row of titleJson) {
      if (row["#"] && row["Titel"]) {
        titleMap.set(row["#"].toString(), row["Titel"]);
      }
    }
    
    console.log(`Titel-Mapping erstellt: ${titleMap.size} Einträge`);
    
    // Get all existing tenders
    const existingTenders = await prisma.callToTender.findMany({
      select: {
        id: true,
        title: true,
        shortDescription: true
      }
    });
    
    console.log(`Bestehende Tender: ${existingTenders.length}`);
    
    // Function to map status
    const mapStatus = (status, art) => {
      if (!status || status === "null") return null;
      
      // Remove numerical prefixes
      let cleanStatus = status.replace(/^\d+\s+/, "");
      
      // Special handling for TNA
      if (cleanStatus === "In Erstellung" && art === "TNA") {
        return "In Erstellung TNA";
      }
      
      // Map specific statuses
      const statusMap = {
        "Präqualifizierung": "Präqualifizierung",
        "Nicht angeboten": "Nicht angeboten",
        "Gewonnen": "Gewonnen",
        "Verloren": "Verloren",
        "Versendet": "Versendet",
        "Warten auf Veröffentlichen": " ",
        "00 Warten auf Veröffentlichen": " ",
        "00 Warten auf Veröffentlichung": " ",
        "01 Lead": " ",
        "Decliend": "Nicht angeboten"
      };
      
      return statusMap[cleanStatus] || cleanStatus;
    };
    
    // Function to convert Excel date
    const excelDateToJSDate = (excelDate) => {
      if (!excelDate || excelDate === "null" || excelDate === "n/a") return null;
      
      try {
        // If it's already a date object
        if (excelDate instanceof Date) return excelDate;
        
        // If it's a number (Excel date)
        if (typeof excelDate === 'number') {
          const date = new Date((excelDate - 25569) * 86400 * 1000);
          return isNaN(date.getTime()) ? null : date;
        }
        
        // If it's a string, try to parse it
        if (typeof excelDate === 'string') {
          const date = new Date(excelDate);
          return isNaN(date.getTime()) ? null : date;
        }
        
        return null;
      } catch (error) {
        return null;
      }
    };
    
    let addedCount = 0;
    let skippedCount = 0;
    
    // Process problematic entries
    const problematicNumbers = [785, 793, 781, 780, 778, 763];
    
    for (const number of problematicNumbers) {
      const excelRow = mainJson.find(row => row["#"] && row["#"].toString() === number.toString());
      
      if (!excelRow) {
        console.log(`⚠️  Excel #${number}: nicht in Haupt-Excel gefunden`);
        continue;
      }
      
      console.log(`\n📋 Verarbeite Excel #${number}:`);
      console.log(`  Kunde: "${excelRow["Kunde"]}"`);
      console.log(`  Angefragte Leistung: "${excelRow["Angefragte Leistung"]}"`);
      console.log(`  Status: "${excelRow["Status"]}"`);
      console.log(`  Art: "${excelRow["Art"]}"`);
      
      // Check if tender already exists
      const existingTender = existingTenders.find(t => 
        t.title === excelRow["Angefragte Leistung"] ||
        t.shortDescription === excelRow["Angefragte Leistung"]
      );
      
      if (existingTender) {
        console.log(`  ⏭️  Tender bereits vorhanden: "${existingTender.title}"`);
        skippedCount++;
        continue;
      }
      
      // Get title from title Excel
      const titleFromTitleExcel = titleMap.get(number.toString());
      const finalTitle = titleFromTitleExcel || excelRow["Angefragte Leistung"] || excelRow["Kunde"];
      
      if (!finalTitle || finalTitle === "null") {
        console.log(`  ❌ Kein Titel verfügbar`);
        skippedCount++;
        continue;
      }
      
      console.log(`  📝 Verwende Titel: "${finalTitle}"`);
      
      // Create organisation if needed
      let organisation = null;
      if (excelRow["Kunde"] && excelRow["Kunde"] !== "null") {
        organisation = await prisma.organisation.findFirst({
          where: { name: excelRow["Kunde"] }
        });
        
        if (!organisation) {
          organisation = await prisma.organisation.create({
            data: {
              name: excelRow["Kunde"],
              abbreviation: excelRow["Kunde"].substring(0, 3).toUpperCase()
            }
          });
          console.log(`  ✅ Organisation erstellt: "${organisation.name}"`);
        }
      }
      
      // Create organisation role if needed
      let organisationRole = null;
      if (organisation) {
        organisationRole = await prisma.organisationRole.findFirst({
          where: { role: "Auftraggeber" }
        });
        
        if (!organisationRole) {
          organisationRole = await prisma.organisationRole.create({
            data: {
              role: "Auftraggeber",
              abbreviation: "AUF"
            }
          });
        }
      }
      
      // Create tender
      const tender = await prisma.callToTender.create({
        data: {
          title: finalTitle,
          shortDescription: excelRow["Angefragte Leistung"] || null,
          notes: excelRow["Anmerkungen"] || null,
          status: mapStatus(excelRow["Status"], excelRow["Art"]),
          type: excelRow["Art"] || null,
          volumeEuro: excelRow["ToV in 1.000"] ? parseFloat(excelRow["ToV in 1.000"]) * 1000 : null,
          offerDeadline: excelDateToJSDate(excelRow["Abgabefrist"]),
          questionDeadline: excelDateToJSDate(excelRow["Fragefrist"]),
          bindingDeadline: excelDateToJSDate(excelRow["Bindefrist"])
        }
      });
      
      console.log(`  ✅ Tender erstellt: "${tender.title}"`);
      
      // Link organisation if available
      if (organisation && organisationRole) {
        await prisma.callToTenderOrganisation.create({
          data: {
            callToTender: { connect: { id: tender.id } },
            organisation: { connect: { id: organisation.id } },
            organisationRole: { connect: { id: organisationRole.id } }
          }
        });
        console.log(`  ✅ Organisation verknüpft: "${organisation.name}"`);
      }
      
      addedCount++;
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Neue Tender erstellt: ${addedCount}`);
    console.log(`Übersprungene Tender: ${skippedCount}`);
    
    // Final statistics
    const finalTenderCount = await prisma.callToTender.count();
    console.log(`Gesamte Tender in Datenbank: ${finalTenderCount}`);
    
  } catch (error) {
    console.error('Fehler beim Hinzufügen der fehlenden Tender:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingTenders(); 