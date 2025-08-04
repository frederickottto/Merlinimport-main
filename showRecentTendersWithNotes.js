const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showRecentTendersWithNotes() {
  try {
    // Get the most recent 10 tenders
    const tenders = await prisma.callToTender.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        shortDescription: true,
        notes: true,
        status: true,
        type: true,
        volumeEuro: true,
        createdAt: true
      }
    });
    
    console.log('Die letzten 10 importierten Tender mit Details:');
    console.log('==============================================');
    
    tenders.forEach((tender, index) => {
      console.log(`${index + 1}. Titel: ${tender.title}`);
      console.log(`   Status: ${tender.status || 'null'}`);
      console.log(`   Typ: ${tender.type || 'null'}`);
      console.log(`   Opp-ID: ${tender.shortDescription || 'null'}`);
      console.log(`   Volumen: ${tender.volumeEuro ? tender.volumeEuro.toLocaleString() + ' €' : 'Nicht angegeben'}`);
      console.log(`   Weitere Details: ${tender.notes || 'Keine'}`);
      console.log(`   Erstellt: ${tender.createdAt}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('Error showing tenders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showRecentTendersWithNotes(); 