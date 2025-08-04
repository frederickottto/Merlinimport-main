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
    "91 Anderer im Lead - verloren": "Anderer im Lead",
    "00 Warten auf Veröffentlichung": " ",
    "43 Zurückgezogen durch Kunde": "Zurückgezogen",
    "43 Decliend": "Zurückgezogen",
    "43 Zurückgezogen": "Zurückgezogen",
    "01 Lead": " ",
  };

  // Handle specific "In Erstellung TNA" if it somehow got a number prefix
  if (statusStr.includes("In Erstellung TNA")) return "In Erstellung TNA";
  if (statusStr.includes("In Erstellung Angebot")) return "In Erstellung Angebot";

  return statusMap[statusStr] || statusStr;
}

async function fixRemainingStatusNumbers() {
  try {
    console.log('Korrigiere verbleibende Status-Werte mit numerischen Präfixen...');
    
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
    let statusesWithNumbers = [];

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

        // Check if status still contains numbers
        if (oldStatus && /^\d/.test(oldStatus.toString())) {
          statusesWithNumbers.push({
            title: tender.title,
            status: oldStatus
          });
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

    if (statusesWithNumbers.length > 0) {
      console.log(`\n⚠️  VERBLEIBENDE STATUS MIT ZAHLEN (${statusesWithNumbers.length}):`);
      statusesWithNumbers.forEach(item => {
        console.log(`  - "${item.title}": "${item.status}"`);
      });
    } else {
      console.log(`\n✅ Alle Status-Werte sind korrekt!`);
    }

  } catch (error) {
    console.error('Fehler beim Korrigieren der Status-Werte:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRemainingStatusNumbers(); 