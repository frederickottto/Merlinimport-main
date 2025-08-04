const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateGorehaTender() {
  try {
    console.log('🚀 Updating C5 Beratung tender status...');
    
    // Use the correct tender ID that was found
    const tenderId = '688fa3bf5dd9356b3d7d0629';
    
    // First, let's check the current state
    const currentTender = await prisma.callToTender.findUnique({
      where: { id: tenderId },
      include: {
        organisations: {
          include: {
            organisation: true,
            organisationRole: true
          }
        }
      }
    });
    
    if (!currentTender) {
      console.log('❌ Tender not found');
      return;
    }
    
    console.log('📊 Current tender state:');
    console.log('- ID:', currentTender.id);
    console.log('- Title:', currentTender.title);
    console.log('- Status:', currentTender?.status);
    console.log('- UpdatedAt:', currentTender?.updatedAt);
    console.log('- Organisations:', currentTender?.organisations?.length || 0);
    
    // Update the status to the frontend-compatible format
    const updatedTender = await prisma.callToTender.update({
      where: { id: tenderId },
      data: {
        status: 'anderer_im_lead', // Using the frontend's expected format
        updatedAt: new Date() // Force update timestamp to trigger cache invalidation
      },
      include: {
        organisations: {
          include: {
            organisation: true,
            organisationRole: true
          }
        }
      }
    });
    
    console.log('✅ Tender update completed!');
    console.log('📊 Updated tender state:');
    console.log('- Status:', updatedTender?.status);
    console.log('- UpdatedAt:', updatedTender?.updatedAt);
    console.log('- Organisations:', updatedTender?.organisations?.length || 0);
    
    // Verify the organisations are still there
    if (updatedTender?.organisations) {
      console.log('🏢 Organisations:');
      updatedTender.organisations.forEach((org, index) => {
        console.log(`  ${index + 1}. ${org.organisation.name} (${org.organisationRole.role})`);
      });
    }
    
    console.log('\n🎯 Status changed from "Anderer im Lead" to "anderer_im_lead"');
    console.log('💡 This should now display correctly in the frontend!');
    
  } catch (error) {
    console.error('❌ Error updating tender:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateGorehaTender(); 