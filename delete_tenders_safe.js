const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteTendersSafe() {
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
      try {
        // Delete all related records first
        await prisma.callToTenderEmployee.deleteMany({
          where: { callToTenderId: tender.id }
        });
        
        await prisma.callToTenderOrganisation.deleteMany({
          where: { callToTenderIDs: tender.id }
        });
        
        await prisma.callToTenderProject.deleteMany({
          where: { callToTenderIDs: tender.id }
        });
        
        await prisma.conditionsOfParticipation.deleteMany({
          where: { callToTenderIDs: tender.id }
        });
        
        await prisma.lot.deleteMany({
          where: { callToTenderIDs: tender.id }
        });
        
        await prisma.callToTenderDeliverables.deleteMany({
          where: { callToTenderIDs: tender.id }
        });
        
        await prisma.riskQualityProcess.deleteMany({
          where: { callToTenderIDs: tender.id }
        });
        
        await prisma.task.deleteMany({
          where: { callToTenderIDs: tender.id }
        });
        
        await prisma.lessonsLearned.deleteMany({
          where: { callToTenderIDs: tender.id }
        });
        
        await prisma.conditionsOfParticipationType.deleteMany({
          where: { callToTenderIDs: tender.id }
        });
        
        await prisma.organisationContactTender.deleteMany({
          where: { callToTenderIDs: tender.id }
        });
        
        // Now delete the tender
        await prisma.callToTender.delete({
          where: { id: tender.id }
        });
        
        console.log(`Deleted: ${tender.title}`);
      } catch (error) {
        console.log(`Error deleting ${tender.title}:`, error.message);
      }
    }
    
    console.log('Successfully deleted recent tenders!');
    
  } catch (error) {
    console.error('Error deleting tenders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTendersSafe(); 