const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function fixVolumeValues() {
  try {
    console.log('🔧 Korrigiere Volumen-Werte in bestehenden Tendern...');
    
    // Get all tenders with volume data
    const tenders = await prisma.callToTender.findMany({
      where: {
        volumeEuro: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        volumeEuro: true
      }
    });
    
    console.log(`Tender mit Volumen-Daten gefunden: ${tenders.length}`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const tender of tenders) {
      const currentVolume = tender.volumeEuro;
      
      // Check if volume is a small number (likely in thousands)
      // If volume is less than 10000, it's probably in thousands and needs to be multiplied
      if (currentVolume && currentVolume < 10000 && currentVolume > 0) {
        const correctedVolume = currentVolume * 1000;
        
        await prisma.callToTender.update({
          where: { id: tender.id },
          data: { volumeEuro: correctedVolume }
        });
        
        console.log(`✅ "${tender.title}": ${currentVolume} → ${correctedVolume}`);
        updatedCount++;
      } else {
        console.log(`⏭️  "${tender.title}": ${currentVolume} (bereits korrekt oder 0/null)`);
        skippedCount++;
      }
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Korrigierte Tender: ${updatedCount}`);
    console.log(`Übersprungene Tender: ${skippedCount}`);
    console.log(`Gesamt verarbeitet: ${updatedCount + skippedCount}`);
    
    // Show some examples of corrected values
    if (updatedCount > 0) {
      console.log(`\n=== BEISPIELE KORRIGIERTER WERTE ===`);
      const correctedTenders = await prisma.callToTender.findMany({
        where: {
          volumeEuro: {
            gte: 10000
          }
        },
        select: {
          title: true,
          volumeEuro: true
        },
        take: 5
      });
      
      for (const tender of correctedTenders) {
        console.log(`"${tender.title}": ${tender.volumeEuro.toLocaleString()} €`);
      }
    }
    
    console.log(`\n🎉 Volumen-Korrektur abgeschlossen!`);
    
  } catch (error) {
    console.error('Fehler beim Korrigieren der Volumen-Werte:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixVolumeValues(); 