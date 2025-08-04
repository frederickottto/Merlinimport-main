const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showRecentTenders() {
  try {
    const tenders = await prisma.callToTender.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('Die letzten 10 importierten Tender:');
    console.log('=====================================');
    
    tenders.forEach((tender, index) => {
      console.log(`${index + 1}. Titel: ${tender.title}`);
      console.log(`   Status: ${tender.status}`);
      console.log(`   Typ: ${tender.type}`);
      console.log(`   Opp-ID: ${tender.shortDescription}`);
      console.log(`   Erstellt: ${tender.createdAt}`);
      console.log(`   Volumen: ${tender.volumeEuro ? tender.volumeEuro.toLocaleString() + ' €' : 'Nicht angegeben'}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showRecentTenders(); 