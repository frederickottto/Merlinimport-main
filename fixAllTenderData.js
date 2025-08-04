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

async function fixAllTenderData() {
  try {
    console.log('Überprüfe alle Ausschreibungen gegen Excel-Daten...');
    
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
    
    console.log(`Datenbank-Tender: ${dbTenders.length}`);
    
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    let totalNotFound = 0;
    
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
        // Find matching tender using multiple strategies
        let tender = null;
        
        // Strategy 1: Match by organisation name
        tender = dbTenders.find(t => 
          t.organisations.some(org => 
            org.organisation.name === kunde.toString().trim()
          )
        );
        
        // Strategy 2: Match by title or notes content
        if (!tender) {
          tender = dbTenders.find(t => 
            (t.title && t.title.includes(angefragteLeistung.toString().trim())) ||
            (t.notes && t.notes.includes(angefragteLeistung.toString().trim())) ||
            (t.title && angefragteLeistung.toString().trim().includes(t.title)) ||
            (t.notes && angefragteLeistung.toString().trim().includes(t.notes))
          );
        }
        
        // Strategy 3: Match by short description
        if (!tender) {
          tender = dbTenders.find(t => 
            t.shortDescription && t.shortDescription.includes(angefragteLeistung.toString().trim())
          );
        }
        
        if (!tender) {
          console.log(`⚠️  Tender nicht gefunden für: "${angefragteLeistung}" (${kunde})`);
          totalNotFound++;
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
            const currentValue = tender[fieldName];
            const newDateStr = jsDate.toISOString().split('T')[0];
            
            if (!currentValue || currentValue.toISOString().split('T')[0] !== newDateStr) {
              updateData[fieldName] = jsDate;
              hasUpdates = true;
              console.log(`📅 ${fieldName}: ${excelValue} → ${newDateStr}`);
            }
          }
        }
        
        // Check for other relevant fields
        if (row["Volumen"] && row["Volumen"] !== "n/a" && row["Volumen"] !== "tbd") {
          const volume = parseFloat(row["Volumen"]) * 1000;
          if (!isNaN(volume) && tender.volumeEuro !== volume) {
            updateData.volumeEuro = volume;
            hasUpdates = true;
            console.log(`💰 Volumen: ${row["Volumen"]} → ${volume} (in Tausend Euro)`);
          }
        }
        
        // Check status
        if (row["Status"] && row["Status"] !== "n/a" && row["Status"] !== "tbd") {
          const status = row["Status"].toString().trim();
          if (status && status !== tender.status) {
            // Apply status mapping
            const statusMap = {
              "10 Präqualifizierung": "Präqualifizierung",
              "02 Präqualifizierung": "Präqualifizierung",
              "20 In Erstellung": "In Erstellung Angebot",
              "30 Nicht angeboten": "Nicht angeboten",
              "10 Nicht angeboten": "Nicht angeboten",
              "40 Anderer im Lead": "Anderer im Lead",
              "42 Verloren": "Verloren",
              "41 Gewonnen": "Gewonnen",
              "50 Angebotsphase": "Angebotsphase",
              "60 Verhandlungsphase": "Verhandlungsphase",
              "70 Gewonnen": "Gewonnen",
              "80 Verloren": "Verloren",
              "90 Anderer im Lead - angeboten": "Anderer im Lead",
              "93 Anderer im Lead - gewonnen": "Anderer im Lead",
              "94 - Anderer im Lead - Zuarbeit CSS": "Anderer im Lead",
              "30 Versendet": "Versendet",
              "00 Warten auf Veröffentlichen": " ",
              "Warten auf Veröffentlichen": " ",
            };
            
            const mappedStatus = statusMap[status] || status;
            if (mappedStatus !== tender.status) {
              updateData.status = mappedStatus;
              hasUpdates = true;
              console.log(`📊 Status: ${tender.status} → ${mappedStatus}`);
            }
          }
        }
        
        // Check type
        if (row["Typ"] && row["Typ"] !== "n/a" && row["Typ"] !== "tbd") {
          const type = row["Typ"].toString().trim();
          if (type && type !== tender.type) {
            updateData.type = type;
            hasUpdates = true;
            console.log(`🏷️  Typ: ${tender.type} → ${type}`);
          }
        }
        
        // Check award criteria
        if (row["Vergabekriterien"] && row["Vergabekriterien"] !== "n/a" && row["Vergabekriterien"] !== "tbd") {
          const awardCriteria = row["Vergabekriterien"].toString().trim();
          if (awardCriteria && awardCriteria !== tender.awardCriteria) {
            updateData.awardCriteria = awardCriteria;
            hasUpdates = true;
            console.log(`🎯 Vergabekriterien: ${awardCriteria}`);
          }
        }
        
        // Check success chance
        if (row["Erfolgschance"] && row["Erfolgschance"] !== "n/a" && row["Erfolgschance"] !== "tbd") {
          const successChance = row["Erfolgschance"].toString().trim();
          if (successChance && successChance !== tender.successChance) {
            updateData.successChance = successChance;
            hasUpdates = true;
            console.log(`🎲 Erfolgschance: ${successChance}`);
          }
        }
        
        // Update tender if we have changes
        if (hasUpdates) {
          await prisma.callToTender.update({
            where: { id: tender.id },
            data: updateData
          });
          
          console.log(`✅ Tender aktualisiert: "${tender.title}" (${kunde})`);
          totalUpdated++;
        }
        
      } catch (error) {
        console.log(`❌ Fehler bei Zeile ${i + 2}: ${error.message}`);
        totalErrors++;
      }
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Verarbeitete Excel-Einträge: ${totalProcessed}`);
    console.log(`Aktualisierte Tender: ${totalUpdated}`);
    console.log(`Tender nicht gefunden: ${totalNotFound}`);
    console.log(`Fehler: ${totalErrors}`);
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Tender-Daten:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllTenderData(); 