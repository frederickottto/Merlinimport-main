const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function debugStatusDisplay() {
  try {
    console.log('🔍 Debug Status-Anzeige in der Detailansicht...');
    
    // Get a few tenders with their status
    const tenders = await prisma.callToTender.findMany({
      select: {
        id: true,
        title: true,
        status: true
      },
      take: 5
    });
    
    console.log(`\n=== TENDER MIT STATUS ===`);
    for (const tender of tenders) {
      console.log(`ID: ${tender.id}`);
      console.log(`Titel: "${tender.title}"`);
      console.log(`Status: "${tender.status}"`);
      console.log(`Status Type: ${typeof tender.status}`);
      console.log(`Status Length: ${tender.status ? tender.status.length : 0}`);
      console.log(`Status === null: ${tender.status === null}`);
      console.log(`Status === undefined: ${tender.status === undefined}`);
      console.log(`Status === "": ${tender.status === ""}`);
      console.log(`Status === " ": ${tender.status === " "}`);
      console.log('---');
    }
    
    // Test the status mapping logic
    const statusMap = {
      // Schema values
      "praequalifikation": "Präqualifikation",
      "teilnahmeantrag": "Teilnahmeantrag",
      "angebotsphase": "Angebotsphase",
      "warten_auf_entscheidung": "Warten auf Entscheidung",
      "gewonnen": "Gewonnen",
      "verloren": "Verloren",
      "nicht angeboten": "Nicht angeboten",
      
      // Imported values (from Excel) - different from schema values
      "Warten auf Entscheidung": "Warten auf Entscheidung",
      "In Erstellung TNA": "In Erstellung TNA",
      "In Erstellung Angebot": "In Erstellung Angebot",
      "Anderer im Lead": "Anderer im Lead",
      "nicht_angeboten": "Nicht angeboten",
      "in_erstellung_angebot": "In Erstellung Angebot",
      
      // Corrected status values (after fixStatusValues.js)
      "Gewonnen": "Gewonnen",
      "Verloren": "Verloren",
      "Nicht angeboten": "Nicht angeboten",
      "Versendet": "Versendet",
      "Angebotsphase": "Angebotsphase",
      "Verhandlungsphase": "Verhandlungsphase",
      "Warten auf Veröffentlichen": " ",
      "00 Warten auf Veröffentlichen": " ",
      "00 Warten auf Veröffentlichung": " ",
      "01 Lead": " ",
      "Zurückgezogen": "Zurückgezogen",
      "Lead": "Lead",
      "Teilnahmeantrag": "Teilnahmeantrag",
      "Präqualifizierung": "Präqualifizierung",
      "Decliend": "Nicht angeboten",
      "Anderer im Lead - gewonnen": "Anderer im Lead",
      "Anderer im Lead - verloren": "Anderer im Lead",
    };
    
    console.log(`\n=== STATUS MAPPING TEST ===`);
    for (const tender of tenders) {
      const statusValue = tender.status;
      if (!statusValue) {
        console.log(`"${tender.title}" - Status: null/undefined -> "-"`);
        continue;
      }
      
      // Handle empty or space values
      if (statusValue === " " || statusValue === "" || statusValue === "null") {
        console.log(`"${tender.title}" - Status: "${statusValue}" -> "-"`);
        continue;
      }
      
      // Return the mapped value or the original value if not found
      const mappedValue = statusMap[statusValue];
      const result = mappedValue || statusValue;
      console.log(`"${tender.title}" - Status: "${statusValue}" -> "${result}"`);
    }
    
    // Check if there are any tenders with empty status
    const emptyStatusTenders = await prisma.callToTender.findMany({
      where: {
        OR: [
          { status: null },
          { status: "" },
          { status: " " }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true
      },
      take: 3
    });
    
    console.log(`\n=== TENDER MIT LEEREM STATUS ===`);
    for (const tender of emptyStatusTenders) {
      console.log(`"${tender.title}" - Status: "${tender.status}"`);
    }
    
  } catch (error) {
    console.error('Fehler beim Debuggen der Status-Anzeige:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugStatusDisplay(); 