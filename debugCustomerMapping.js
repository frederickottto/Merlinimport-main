const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

async function debugCustomerMapping() {
  try {
    console.log('🔍 Debugge Kunden-Mapping...');
    
    // Read main tender file
    const mainFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const mainWorkbook = xlsx.readFile(mainFile);
    
    const mainSheetName = "Vertriebsliste";
    const mainSheet = mainWorkbook.Sheets[mainSheetName];
    const mainJson = xlsx.utils.sheet_to_json(mainSheet, { defval: null, range: 2 });
    
    // Read title file
    const titleFile = 'tenders/TitelVertriebe.xlsx';
    const titleWorkbook = xlsx.readFile(titleFile);
    const titleSheetName = Object.keys(titleWorkbook.Sheets)[0];
    const titleSheet = titleWorkbook.Sheets[titleSheetName];
    const titleJson = xlsx.utils.sheet_to_json(titleSheet, { defval: null });
    
    console.log(`Haupt-Datei Zeilen: ${mainJson.length}`);
    console.log(`Titel-Datei Zeilen: ${titleJson.length}`);
    
    // Create a mapping from tender number to customer name
    const tenderToCustomerMap = new Map();
    let validEntries = 0;
    let invalidEntries = 0;
    
    console.log('\n=== VERARBEITE ALLE EXCEL-ZEILEN ===');
    for (const row of mainJson) {
      if (row["#"] && row["Kunde"] && row["#"] !== "n/a" && row["Kunde"] !== "n/a") {
        const tenderNumber = row["#"].toString();
        const customerName = row["Kunde"].toString().trim();
        tenderToCustomerMap.set(tenderNumber, customerName);
        validEntries++;
      } else {
        invalidEntries++;
      }
    }
    
    console.log(`Gültige Einträge: ${validEntries}`);
    console.log(`Ungültige Einträge: ${invalidEntries}`);
    console.log(`Map-Größe: ${tenderToCustomerMap.size}`);
    
    // Get some database tenders to test
    const dbTenders = await prisma.callToTender.findMany({
      select: { id: true, title: true },
      take: 10
    });
    
    console.log('\n=== TESTE TITEL-MATCHING MIT DATENBANK-TENDERN ===');
    for (const dbTender of dbTenders) {
      // Try to find the corresponding title row in the title file
      const titleRow = titleJson.find(titleRow => {
        if (!titleRow["#"] || !titleRow["Titel"]) return false;
        return titleRow["Titel"] === dbTender.title;
      });
      
      if (titleRow) {
        const tenderNumber = titleRow["#"];
        const customer = tenderToCustomerMap.get(tenderNumber);
        if (customer) {
          console.log(`✅ MATCH: "${dbTender.title}" -> #${tenderNumber} -> "${customer}"`);
        } else {
          console.log(`❌ KEIN KUNDE: "${dbTender.title}" -> #${tenderNumber} -> NICHT IN EXCEL`);
        }
      } else {
        console.log(`❌ KEIN TITEL-MATCH: "${dbTender.title}"`);
      }
    }
    
    // Check what tender numbers are actually in the Excel
    console.log('\n=== ERSTE 20 TENDER-NUMMERN AUS EXCEL ===');
    let count = 0;
    for (const [tenderNumber, customerName] of tenderToCustomerMap) {
      if (count >= 20) break;
      console.log(`#${tenderNumber} -> "${customerName}"`);
      count++;
    }
    
    // Check what tender numbers are in the title file
    console.log('\n=== ERSTE 20 TENDER-NUMMERN AUS TITEL-DATEI ===');
    count = 0;
    for (const titleRow of titleJson) {
      if (count >= 20) break;
      if (titleRow["#"] && titleRow["Titel"]) {
        console.log(`#${titleRow["#"]} -> "${titleRow["Titel"]}"`);
        count++;
      }
    }
    
  } catch (error) {
    console.error('Fehler beim Debuggen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCustomerMapping(); 