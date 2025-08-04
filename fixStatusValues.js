const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

function mapStatus(status) {
  if (!status) return null;
  
  const statusStr = status.toString().trim();
  
  // Remove numbers and map to correct values
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
    "30 Versendet": "Versendet"
  };
  
  return statusMap[statusStr] || statusStr;
}

async function fixStatusValues() {
  try {
    console.log('Korrigiere Status-Werte...');
    
    // Get all tenders with their current status
    const tenders = await prisma.callToTender.findMany({
      select: { id: true, title: true, status: true }
    });
    
    console.log(`Anzahl Tender gefunden: ${tenders.length}`);
    
    let updatedCount = 0;
    let unchangedCount = 0;
    
    for (const tender of tenders) {
      const oldStatus = tender.status;
      const newStatus = mapStatus(oldStatus);
      
      if (oldStatus !== newStatus) {
        try {
          await prisma.callToTender.update({
            where: { id: tender.id },
            data: { status: newStatus }
          });
          
          console.log(`✅ "${tender.title}"`);
          console.log(`   Alt: "${oldStatus}" → Neu: "${newStatus}"`);
          updatedCount++;
        } catch (error) {
          console.log(`❌ Fehler bei "${tender.title}": ${error.message}`);
        }
      } else {
        unchangedCount++;
      }
    }
    
    console.log(`\nStatus-Korrektur abgeschlossen!`);
    console.log(`Aktualisierte Tender: ${updatedCount}`);
    console.log(`Unveränderte Tender: ${unchangedCount}`);
    
  } catch (error) {
    console.error('Fehler beim Korrigieren der Status-Werte:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStatusValues(); 