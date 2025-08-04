const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
require("dotenv").config();

const prisma = new PrismaClient();

async function deleteTendersFromExcel() {
  try {
    console.log('Lösche Ausschreibungen, die in der Excel-Datei existieren...');
    
    // Read Excel file to get tender titles
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    const sheetName = "Vertriebsliste";
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Anzahl Zeilen im Tabellenblatt "Vertriebsliste": ${sheetJson.length}`);
    
    // Create a set of tender titles from Excel
    const excelTenderTitles = new Set();
    for (const row of sheetJson) {
      if (row["Angefragte Leistung"]) {
        excelTenderTitles.add(row["Angefragte Leistung"].toString().trim());
      }
    }
    
    console.log(`Gefundene Tender-Titel in Excel: ${excelTenderTitles.size}`);
    
    // Get all existing tenders
    const existingTenders = await prisma.callToTender.findMany({
      select: { id: true, title: true, notes: true }
    });
    
    console.log(`Anzahl existierender Tender in der Datenbank: ${existingTenders.length}`);
    
    // Find tenders to delete (those that match Excel titles)
    const tendersToDelete = [];
    for (const tender of existingTenders) {
      // Check if tender title or notes matches any Excel title
      const matchesExcel = Array.from(excelTenderTitles).some(excelTitle => 
        tender.title.includes(excelTitle) || 
        excelTitle.includes(tender.title) ||
        (tender.notes && (tender.notes.includes(excelTitle) || excelTitle.includes(tender.notes)))
      );
      
      if (matchesExcel) {
        tendersToDelete.push(tender);
      }
    }
    
    console.log(`Tender zum Löschen gefunden: ${tendersToDelete.length}`);
    
    // Delete tenders and their related records
    let deletedCount = 0;
    for (const tender of tendersToDelete) {
      try {
        console.log(`Lösche Tender: ${tender.title}`);
        
        // Delete related records first
        await prisma.callToTenderEmployee.deleteMany({
          where: { callToTenderId: tender.id }
        });
        
        await prisma.callToTenderOrganisation.deleteMany({
          where: { callToTenderIDs: tender.id }
        });
        
        // Delete the tender
        await prisma.callToTender.delete({
          where: { id: tender.id }
        });
        
        deletedCount++;
        console.log(`✅ Tender "${tender.title}" erfolgreich gelöscht`);
      } catch (error) {
        console.log(`❌ Fehler beim Löschen von "${tender.title}": ${error.message}`);
      }
    }
    
    console.log(`\nLöschung abgeschlossen! ${deletedCount} Tender gelöscht.`);
    
  } catch (error) {
    console.error('Fehler beim Löschen der Tender:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTendersFromExcel(); 