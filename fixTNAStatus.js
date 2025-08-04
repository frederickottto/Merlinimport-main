const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

async function fixTNAStatus() {
  try {
    console.log('Korrigiere TNA-Status basierend auf Excel-Daten...');
    
    // Read Excel file
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    
    const sheetName = "Vertriebsliste";
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Excel-Zeilen: ${sheetJson.length}`);
    
    // Get all tenders from database
    const dbTenders = await prisma.callToTender.findMany({
      include: {
        organisations: {
          include: {
            organisation: true
          }
        }
      }
    });
    
    let tnaEntries = [];
    let updatedCount = 0;
    let notFoundCount = 0;
    
    // Find TNA entries in Excel
    for (const row of sheetJson) {
      const angefragteLeistung = row["Angefragte Leistung"];
      const kunde = row["Kunde"];
      const status = row["Status"];
      const art = row["Art"];
      
      if (!angefragteLeistung || !kunde || angefragteLeistung === "n/a" || kunde === "n/a") {
        continue;
      }
      
      // Check if this should be TNA based on status and art
      const shouldBeTNA = (status === "20 In Erstellung" && art === "TNA") ||
                          (status && status.toString().includes("TNA")) ||
                          (art && art.toString().includes("TNA"));
      
      if (shouldBeTNA) {
        tnaEntries.push({
          angefragteLeistung: angefragteLeistung.toString().trim(),
          kunde: kunde.toString().trim(),
          status: status ? status.toString().trim() : null,
          art: art ? art.toString().trim() : null
        });
      }
    }
    
    console.log(`Gefundene TNA-Einträge in Excel: ${tnaEntries.length}`);
    
    // Process each TNA entry
    for (const excelEntry of tnaEntries) {
      // Find matching tender in database
      const matchingTender = dbTenders.find(t => 
        t.organisations.some(org => 
          org.organisation.name === excelEntry.kunde
        ) ||
        (t.notes && t.notes.includes(excelEntry.angefragteLeistung)) ||
        (t.title && t.title.includes(excelEntry.angefragteLeistung))
      );
      
      if (matchingTender) {
        // Check if this tender should have "In Erstellung TNA" status
        const shouldHaveTNAStatus = excelEntry.status === "20 In Erstellung" && excelEntry.art === "TNA";
        
        if (shouldHaveTNAStatus && matchingTender.status !== "In Erstellung TNA") {
          console.log(`🔄 Aktualisiere "${matchingTender.title}":`);
          console.log(`   Von: ${matchingTender.status}`);
          console.log(`   Zu: In Erstellung TNA`);
          console.log(`   Excel: Status=${excelEntry.status}, Art=${excelEntry.art}`);
          console.log('');
          
          await prisma.callToTender.update({
            where: { id: matchingTender.id },
            data: { status: "In Erstellung TNA" }
          });
          
          updatedCount++;
        }
      } else {
        console.log(`❓ Kein Tender gefunden für: ${excelEntry.kunde} - ${excelEntry.angefragteLeistung}`);
        notFoundCount++;
      }
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`TNA Einträge in Excel: ${tnaEntries.length}`);
    console.log(`Aktualisierte Tender: ${updatedCount}`);
    console.log(`Nicht gefunden: ${notFoundCount}`);
    
    // Verify the changes
    const tnaTenders = await prisma.callToTender.findMany({
      where: {
        status: "In Erstellung TNA"
      },
      select: {
        id: true,
        title: true,
        status: true
      }
    });
    
    console.log(`\n=== TNA STATUS IN DATENBANK NACH UPDATE (${tnaTenders.length}) ===`);
    tnaTenders.forEach((tender, index) => {
      console.log(`${index + 1}. "${tender.title}"`);
    });
    
    console.log(`\n✅ TNA-Status-Korrektur abgeschlossen!`);
    
  } catch (error) {
    console.error('Fehler bei der TNA-Status-Korrektur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTNAStatus(); 