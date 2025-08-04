const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllTenders() {
  try {
    // Delete all tenders
    const result = await prisma.callToTender.deleteMany({});
    console.log(`Deleted ${result.count} tenders`);
    
  } catch (error) {
    console.error('Error deleting tenders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllTenders(); 