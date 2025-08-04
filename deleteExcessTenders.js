const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function deleteExcessTenders() {
  try {
    console.log('🗑️  Lösche überschüssige Tender (Nummern > 792)...');
    
    // First, let's see how many tenders we have
    const totalTenders = await prisma.callToTender.count();
    console.log(`Aktuelle Tender in Datenbank: ${totalTenders}`);
    
    // Get all tenders with their titles to identify which ones to delete
    const allTenders = await prisma.callToTender.findMany({
      select: {
        id: true,
        title: true,
        notes: true,
        shortDescription: true
      }
    });
    
    console.log(`Alle Tender geladen: ${allTenders.length}`);
    
    // Read the Excel file to get the valid tender numbers
    const xlsx = require("xlsx");
    const mainFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const mainWorkbook = xlsx.readFile(mainFile);
    const mainSheetName = "Vertriebsliste";
    const mainSheet = mainWorkbook.Sheets[mainSheetName];
    const mainJson = xlsx.utils.sheet_to_json(mainSheet, { defval: null, range: 2 });
    
    // Create a set of valid tender numbers from Excel
    const validTenderNumbers = new Set();
    for (const row of mainJson) {
      if (row["#"] && row["#"] !== "n/a") {
        validTenderNumbers.add(row["#"].toString());
      }
    }
    
    console.log(`Gültige Tender-Nummern aus Excel: ${validTenderNumbers.size}`);
    console.log(`Höchste Tender-Nummer in Excel: ${Math.max(...Array.from(validTenderNumbers).map(Number))}`);
    
    // Read title file to get the mapping
    const titleFile = 'tenders/TitelVertriebe.xlsx';
    const titleWorkbook = xlsx.readFile(titleFile);
    const titleSheetName = Object.keys(titleWorkbook.Sheets)[0];
    const titleSheet = titleWorkbook.Sheets[titleSheetName];
    const titleJson = xlsx.utils.sheet_to_json(titleSheet, { defval: null });
    
    // Create a mapping from title to tender number
    const titleToTenderNumber = new Map();
    for (const row of titleJson) {
      if (row["#"] && row["Titel"]) {
        titleToTenderNumber.set(row["Titel"], row["#"].toString());
      }
    }
    
    console.log(`Titel-zu-Tender-Nummer Mapping: ${titleToTenderNumber.size} Einträge`);
    
    let tendersToDelete = [];
    let tendersToKeep = [];
    
    // Check each tender in the database
    for (const tender of allTenders) {
      // Try to find the tender number by matching the title
      const tenderNumber = titleToTenderNumber.get(tender.title);
      
      if (tenderNumber) {
        // Check if this tender number is valid (exists in Excel)
        if (validTenderNumbers.has(tenderNumber)) {
          tendersToKeep.push({
            id: tender.id,
            title: tender.title,
            tenderNumber: tenderNumber
          });
        } else {
          tendersToDelete.push({
            id: tender.id,
            title: tender.title,
            tenderNumber: tenderNumber
          });
        }
      } else {
        // If no title match, check if it's a valid tender by other means
        // For now, we'll keep tenders that don't have a title match
        // as they might be valid but not in the title file
        tendersToKeep.push({
          id: tender.id,
          title: tender.title,
          tenderNumber: "unknown"
        });
      }
    }
    
    console.log(`\n=== ANALYSE ===`);
    console.log(`Tender zum Behalten: ${tendersToKeep.length}`);
    console.log(`Tender zum Löschen: ${tendersToDelete.length}`);
    
    if (tendersToDelete.length > 0) {
      console.log(`\n=== TENDER ZUM LÖSCHEN ===`);
      for (const tender of tendersToDelete) {
        console.log(`- "${tender.title}" (Tender #${tender.tenderNumber})`);
      }
      
      console.log(`\n🗑️  Starte Löschvorgang...`);
      
      let deletedCount = 0;
      for (const tender of tendersToDelete) {
        try {
          // Delete related records first
          await prisma.callToTenderEmployee.deleteMany({
            where: { callToTenderId: tender.id }
          });
          
          await prisma.callToTenderOrganisation.deleteMany({
            where: { callToTenderId: tender.id }
          });
          
          // Delete the tender itself
          await prisma.callToTender.delete({
            where: { id: tender.id }
          });
          
          deletedCount++;
          console.log(`✅ Gelöscht: "${tender.title}" (Tender #${tender.tenderNumber})`);
        } catch (error) {
          console.error(`❌ Fehler beim Löschen von "${tender.title}":`, error.message);
        }
      }
      
      console.log(`\n=== LÖSCHVORGANG ABGESCHLOSSEN ===`);
      console.log(`Gelöschte Tender: ${deletedCount}`);
    } else {
      console.log(`\n✅ Keine überschüssigen Tender gefunden!`);
    }
    
    // Final verification
    const finalTenderCount = await prisma.callToTender.count();
    const finalOrganisationCount = await prisma.organisation.count();
    const finalEmployeeCount = await prisma.callToTenderEmployee.count();
    const finalOrganisationAssignmentCount = await prisma.callToTenderOrganisation.count();
    
    console.log(`\n=== FINALE VERIFIZIERUNG ===`);
    console.log(`Tender in Datenbank: ${finalTenderCount}`);
    console.log(`Organisationen in Datenbank: ${finalOrganisationCount}`);
    console.log(`Mitarbeiter-Zuweisungen: ${finalEmployeeCount}`);
    console.log(`Organisations-Zuweisungen: ${finalOrganisationAssignmentCount}`);
    
    if (finalTenderCount <= 792) {
      console.log(`\n🎉 Erfolgreich! Datenbank enthält jetzt maximal ${finalTenderCount} Tender (≤ 792)`);
    } else {
      console.log(`\n⚠️  Warnung: Datenbank enthält noch ${finalTenderCount} Tender (sollte ≤ 792 sein)`);
    }
    
  } catch (error) {
    console.error('Fehler beim Löschen der überschüssigen Tender:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteExcessTenders(); 