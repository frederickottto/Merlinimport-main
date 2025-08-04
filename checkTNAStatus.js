const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

async function checkTNAStatus() {
  try {
    console.log('Überprüfe TNA-Status in Excel und Datenbank...');
    
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
    let tnaInDatabase = [];
    
    // Check Excel for TNA entries
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
    
    console.log(`\n=== TNA EINTRÄGE IN EXCEL (${tnaEntries.length}) ===`);
    tnaEntries.forEach((entry, index) => {
      console.log(`${index + 1}. Kunde: ${entry.kunde}`);
      console.log(`   Leistung: ${entry.angefragteLeistung}`);
      console.log(`   Status: ${entry.status}`);
      console.log(`   Art: ${entry.art}`);
      console.log('');
    });
    
    // Check database for TNA status
    const tnaTenders = dbTenders.filter(t => 
      t.status && t.status.includes("In Erstellung TNA")
    );
    
    console.log(`\n=== TNA STATUS IN DATENBANK (${tnaTenders.length}) ===`);
    tnaTenders.forEach((tender, index) => {
      console.log(`${index + 1}. "${tender.title}"`);
      console.log(`   Status: ${tender.status}`);
      console.log(`   Kunde: ${tender.organisations.map(org => org.organisation.name).join(", ")}`);
      console.log('');
    });
    
    // Check for tenders that should be TNA but aren't
    console.log(`\n=== ÜBERPRÜFUNG TNA-ZUORDNUNG ===`);
    let missingTNA = 0;
    
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
        if (!matchingTender.status || !matchingTender.status.includes("In Erstellung TNA")) {
          console.log(`⚠️  "${matchingTender.title}" sollte TNA sein:`);
          console.log(`   Excel: Status=${excelEntry.status}, Art=${excelEntry.art}`);
          console.log(`   DB: Status=${matchingTender.status}`);
          console.log('');
          missingTNA++;
        }
      } else {
        console.log(`❓ Kein Tender gefunden für: ${excelEntry.kunde} - ${excelEntry.angefragteLeistung}`);
      }
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`TNA Einträge in Excel: ${tnaEntries.length}`);
    console.log(`TNA Status in Datenbank: ${tnaTenders.length}`);
    console.log(`Fehlende TNA-Zuordnungen: ${missingTNA}`);
    
  } catch (error) {
    console.error('Fehler bei der TNA-Überprüfung:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTNAStatus(); 