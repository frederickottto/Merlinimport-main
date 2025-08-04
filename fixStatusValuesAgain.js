const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

function mapStatus(status) {
  if (!status) return null;

  const statusStr = status.toString().trim();

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

  // Handle specific "In Erstellung TNA" if it somehow got a number prefix
  if (statusStr.includes("In Erstellung TNA")) return "In Erstellung TNA";
  if (statusStr.includes("In Erstellung Angebot")) return "In Erstellung Angebot";

  return statusMap[statusStr] || statusStr;
}

async function fixStatusValuesAgain() {
  try {
    console.log('Korrigiere alle Status-Werte erneut...');
    
    // Get all tenders
    const tenders = await prisma.callToTender.findMany({
      select: {
        id: true,
        title: true,
        status: true
      }
    });

    console.log(`Gefundene Tender: ${tenders.length}`);

    let updatedCount = 0;
    let errors = 0;

    for (const tender of tenders) {
      try {
        const oldStatus = tender.status;
        const newStatus = mapStatus(oldStatus);

        if (newStatus !== oldStatus) {
          await prisma.callToTender.update({
            where: { id: tender.id },
            data: { status: newStatus }
          });

          console.log(`✅ "${tender.title}": "${oldStatus}" → "${newStatus}"`);
          updatedCount++;
        }
      } catch (error) {
        console.log(`❌ Fehler bei Tender "${tender.title}": ${error.message}`);
        errors++;
      }
    }

    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Aktualisierte Tender: ${updatedCount}`);
    console.log(`Fehler: ${errors}`);
    console.log(`Unverändert: ${tenders.length - updatedCount - errors}`);

  } catch (error) {
    console.error('Fehler beim Korrigieren der Status-Werte:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStatusValuesAgain(); 