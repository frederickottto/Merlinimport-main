const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function checkRemainingTenders() {
  try {
    console.log('🔍 Prüfe verbleibende Ausschreibungen...');
    
    const tenderCount = await prisma.callToTender.count();
    console.log(`Verbleibende Ausschreibungen: ${tenderCount}`);
    
    if (tenderCount > 0) {
      const remainingTenders = await prisma.callToTender.findMany({
        select: {
          id: true,
          title: true,
          status: true
        }
      });
      
      console.log('\nVerbleibende Ausschreibungen:');
      remainingTenders.forEach((tender, index) => {
        console.log(`${index + 1}. "${tender.title}" (Status: ${tender.status})`);
      });
    } else {
      console.log('✅ Alle Ausschreibungen wurden erfolgreich gelöscht!');
    }
    
  } catch (error) {
    console.error('Fehler beim Prüfen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRemainingTenders(); 