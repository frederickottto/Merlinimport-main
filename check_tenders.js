const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTenders() {
  try {
    const tenders = await prisma.callToTender.findMany();
    console.log('Current tenders in database:', tenders.length);
    console.log('First 5 tenders:');
    tenders.slice(0, 5).forEach((tender, i) => {
      console.log(`${i+1}. ${tender.title} - Status: ${tender.status}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTenders(); 