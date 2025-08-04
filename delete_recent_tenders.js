const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteRecentTenders() {
  try {
    // Get the most recent 10 tenders
    const recentTenders = await prisma.callToTender.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`Found ${recentTenders.length} recent tenders to delete:`);
    recentTenders.forEach((tender, index) => {
      console.log(`${index + 1}. ${tender.title} (Opp-ID: ${tender.shortDescription})`);
    });
    
    // Delete each tender and its relationships
    for (const tender of recentTenders) {
      // Delete organisation relationships first
      await prisma.callToTenderOrganisation.deleteMany({
        where: { callToTenderIDs: tender.id }
      });
      
      // Delete the tender
      await prisma.callToTender.delete({
        where: { id: tender.id }
      });
      
      console.log(`Deleted: ${tender.title}`);
    }
    
    console.log('Successfully deleted recent tenders!');
    
  } catch (error) {
    console.error('Error deleting tenders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteRecentTenders(); 