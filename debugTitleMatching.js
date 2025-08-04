const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function debugTitleMatching() {
  try {
    console.log('🔍 Debug Titel-Matching zwischen Excel und Datenbank...');
    
    // Read the Excel files
    const xlsx = require("xlsx");
    
    // Read main Excel file
    const mainFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const mainWorkbook = xlsx.readFile(mainFile);
    const mainSheetName = "Vertriebsliste";
    const mainSheet = mainWorkbook.Sheets[mainSheetName];
    const mainJson = xlsx.utils.sheet_to_json(mainSheet, { defval: null, range: 2 });
    
    // Read title Excel file - try different sheet names
    const titleFile = 'tenders/TitelVertriebe.xlsx';
    const titleWorkbook = xlsx.readFile(titleFile);
    console.log(`Titel-Excel Sheets: ${Object.keys(titleWorkbook.Sheets).join(', ')}`);
    
    let titleJson = [];
    let titleSheetName = null;
    
    // Try different possible sheet names
    const possibleSheetNames = ["TitelVertriebe", "Sheet1", "Tabelle1", "Titel"];
    for (const sheetName of possibleSheetNames) {
      if (titleWorkbook.Sheets[sheetName]) {
        titleSheetName = sheetName;
        titleJson = xlsx.utils.sheet_to_json(titleWorkbook.Sheets[sheetName], { defval: null, range: 2 });
        console.log(`Verwende Sheet: "${sheetName}" mit ${titleJson.length} Zeilen`);
        break;
      }
    }
    
    if (titleJson.length === 0) {
      // Try without range parameter
      titleJson = xlsx.utils.sheet_to_json(titleWorkbook.Sheets[Object.keys(titleWorkbook.Sheets)[0]], { defval: null });
      console.log(`Fallback: ${titleJson.length} Zeilen ohne range`);
    }
    
    console.log(`Excel-Daten geladen: ${mainJson.length} Zeilen (Haupt), ${titleJson.length} Zeilen (Titel)`);
    
    // Show first few title entries
    console.log(`\n=== ERSTE 5 TITEL-EINTRÄGE ===`);
    titleJson.slice(0, 5).forEach((row, index) => {
      console.log(`${index + 1}: #${row["#"]}, Titel: "${row["Titel"]}"`);
    });
    
    // Create title mapping
    const titleMap = new Map();
    for (const row of titleJson) {
      if (row["#"] && row["Titel"]) {
        titleMap.set(row["#"].toString(), row["Titel"]);
      }
    }
    
    console.log(`Titel-Mapping erstellt: ${titleMap.size} Einträge`);
    
    // Get all tenders from database
    const allTenders = await prisma.callToTender.findMany({
      select: {
        id: true,
        title: true,
        shortDescription: true,
        notes: true
      }
    });
    
    console.log(`Tender in Datenbank: ${allTenders.length}`);
    
    // Check specific problematic entries
    const problematicNumbers = [785, 793, 781, 780, 778, 763];
    
    console.log(`\n=== PROBLEMATISCHE EXCEL-EINTRÄGE ===`);
    for (const number of problematicNumbers) {
      const excelRow = mainJson.find(row => row["#"] && row["#"].toString() === number.toString());
      if (excelRow) {
        console.log(`\nExcel #${number}:`);
        console.log(`  Kunde: "${excelRow["Kunde"]}"`);
        console.log(`  Angefragte Leistung: "${excelRow["Angefragte Leistung"]}"`);
        console.log(`  Status: "${excelRow["Status"]}"`);
        console.log(`  Art: "${excelRow["Art"]}"`);
        
        // Check if there's a title in the title Excel
        const titleFromTitleExcel = titleMap.get(number.toString());
        if (titleFromTitleExcel) {
          console.log(`  Titel aus Titel-Excel: "${titleFromTitleExcel}"`);
        } else {
          console.log(`  Titel aus Titel-Excel: nicht gefunden`);
        }
        
        // Try to find matching tender
        let matchingTender = null;
        
        // Try by "Angefragte Leistung"
        if (excelRow["Angefragte Leistung"] && excelRow["Angefragte Leistung"] !== "null") {
          matchingTender = allTenders.find(t => 
            t.title === excelRow["Angefragte Leistung"] || 
            t.shortDescription === excelRow["Angefragte Leistung"]
          );
          if (matchingTender) {
            console.log(`  ✅ Gefunden über "Angefragte Leistung": "${matchingTender.title}"`);
          }
        }
        
        // Try by title from title Excel
        if (!matchingTender && titleFromTitleExcel) {
          matchingTender = allTenders.find(t => 
            t.title === titleFromTitleExcel
          );
          if (matchingTender) {
            console.log(`  ✅ Gefunden über Titel-Excel: "${matchingTender.title}"`);
          }
        }
        
        // Try by customer name
        if (!matchingTender && excelRow["Kunde"]) {
          const customerOrganisations = await prisma.callToTenderOrganisation.findMany({
            where: {
              organisation: {
                name: excelRow["Kunde"]
              }
            },
            include: {
              callToTender: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          });
          
          if (customerOrganisations.length > 0) {
            matchingTender = customerOrganisations[0].callToTender;
            console.log(`  ✅ Gefunden über Kunde: "${matchingTender.title}"`);
          }
        }
        
        if (!matchingTender) {
          console.log(`  ❌ Kein passender Tender gefunden`);
          
          // Show similar titles for debugging
          const searchTerm = titleFromTitleExcel || excelRow["Angefragte Leistung"] || excelRow["Kunde"];
          if (searchTerm && searchTerm !== "null") {
            const similarTenders = allTenders.filter(t => 
              t.title && t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              t.shortDescription && t.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (similarTenders.length > 0) {
              console.log(`  🔍 Ähnliche Titel gefunden:`);
              similarTenders.slice(0, 3).forEach(t => {
                console.log(`    - "${t.title}"`);
              });
            }
          }
        }
      } else {
        console.log(`\nExcel #${number}: nicht in Haupt-Excel gefunden`);
      }
    }
    
    // Check for tenders that might be duplicates or have wrong titles
    console.log(`\n=== TENDER MIT ÄHNLICHEN TITELN ===`);
    const similarTitles = allTenders.filter(t => 
      t.title && (
        t.title.includes("ISO") ||
        t.title.includes("Audit") ||
        t.title.includes("Sicherheitstest")
      )
    );
    
    for (const tender of similarTitles) {
      console.log(`"${tender.title}"`);
    }
    
  } catch (error) {
    console.error('Fehler beim Debuggen des Titel-Matchings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTitleMatching(); 