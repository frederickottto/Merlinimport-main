const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

// Helper function to convert Excel date to JavaScript Date
function excelDateToJSDate(excelDate) {
  if (!excelDate || excelDate === "n/a" || excelDate === "tbd") {
    return null;
  }
  
  // If it's already a Date object, return it
  if (excelDate instanceof Date) {
    return excelDate;
  }
  
  // If it's a number (Excel date serial), convert it
  if (typeof excelDate === 'number') {
    const utcDays = Math.floor(excelDate - 25569);
    const utcValue = utcDays * 86400;
    return new Date(utcValue * 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof excelDate === 'string') {
    // Try different date formats
    const dateFormats = [
      /^\d{1,2}\.\d{1,2}\.\d{4}$/, // DD.MM.YYYY
      /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // DD/MM/YYYY
      /^\d{1,2}-\d{1,2}-\d{4}$/, // DD-MM-YYYY
    ];
    
    for (const format of dateFormats) {
      if (format.test(excelDate)) {
        const parsed = new Date(excelDate);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }
  }
  
  return null;
}

async function updateTenderDeadlines() {
  try {
    console.log('Aktualisiere Fristen und Termine für alle Ausschreibungen...');
    
    // Read Excel file
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    
    const sheetName = "Vertriebsliste";
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Anzahl Zeilen im Tabellenblatt "Vertriebsliste": ${sheetJson.length}`);
    
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
    
    console.log(`Anzahl Tender in Datenbank: ${dbTenders.length}`);
    
    let totalProcessed = 0;
    let updatedTenders = 0;
    let errors = 0;
    
    // Process each Excel row
    for (let i = 0; i < sheetJson.length; i++) {
      const row = sheetJson[i];
      const angefragteLeistung = row["Angefragte Leistung"];
      const kunde = row["Kunde"];
      
      if (!angefragteLeistung || !kunde || angefragteLeistung === "n/a" || kunde === "n/a") {
        continue;
      }
      
      totalProcessed++;
      
      try {
        // Find matching tender
        const tender = dbTenders.find(t => 
          (t.title && t.title.includes(angefragteLeistung.toString().trim())) ||
          (t.notes && t.notes.includes(angefragteLeistung.toString().trim())) ||
          (t.title && angefragteLeistung.toString().trim().includes(t.title)) ||
          (t.notes && angefragteLeistung.toString().trim().includes(t.notes)) ||
          // Also check by organisation name
          t.organisations.some(org => org.organisation.name === kunde.toString().trim())
        );
        
        if (!tender) {
          console.log(`⚠️  Tender nicht gefunden für: "${angefragteLeistung}" (${kunde})`);
          continue;
        }
        
        let updateData = {};
        let hasUpdates = false;
        
        // Extract and convert dates from Excel columns
        const dateFields = {
          'offerDeadline': row["Abgabefrist"],
          'questionDeadline': row["Fragefrist"],
          'bindingDeadline': row["Bindefrist"],
          'projectStart': row["Vertragsbeginn"],
          'projectEnd': row["Vertragsende"],
          'releaseDate': row["Datum Bekanntgabe"],
          'firstContactDate': row["Datum Aufnahme in Liste"]
        };
        
        // Process each date field
        for (const [fieldName, excelValue] of Object.entries(dateFields)) {
          const jsDate = excelDateToJSDate(excelValue);
          if (jsDate) {
            updateData[fieldName] = jsDate;
            hasUpdates = true;
            console.log(`📅 ${fieldName}: ${excelValue} → ${jsDate.toISOString().split('T')[0]}`);
          }
        }
        
        // Also check for other relevant fields
        if (row["Volumen"] && row["Volumen"] !== "n/a" && row["Volumen"] !== "tbd") {
          const volume = parseFloat(row["Volumen"]);
          if (!isNaN(volume)) {
            updateData.volumeEuro = volume;
            hasUpdates = true;
            console.log(`💰 Volumen: ${row["Volumen"]} → ${volume}`);
          }
        }
        
        if (row["Status"] && row["Status"] !== "n/a" && row["Status"] !== "tbd") {
          const status = row["Status"].toString().trim();
          if (status && status !== tender.status) {
            updateData.status = status;
            hasUpdates = true;
            console.log(`📊 Status: ${tender.status} → ${status}`);
          }
        }
        
        if (row["Typ"] && row["Typ"] !== "n/a" && row["Typ"] !== "tbd") {
          const type = row["Typ"].toString().trim();
          if (type && type !== tender.type) {
            updateData.type = type;
            hasUpdates = true;
            console.log(`🏷️  Typ: ${tender.type} → ${type}`);
          }
        }
        
        // Update tender if we have changes
        if (hasUpdates) {
          await prisma.callToTender.update({
            where: { id: tender.id },
            data: updateData
          });
          
          console.log(`✅ Tender aktualisiert: "${tender.title}"`);
          updatedTenders++;
        }
        
      } catch (error) {
        console.log(`❌ Fehler bei Zeile ${i + 2}: ${error.message}`);
        errors++;
      }
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Verarbeitete Excel-Einträge: ${totalProcessed}`);
    console.log(`Aktualisierte Tender: ${updatedTenders}`);
    console.log(`Fehler: ${errors}`);
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Fristen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTenderDeadlines(); 