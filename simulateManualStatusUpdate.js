const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simulateManualStatusUpdate() {
  try {
    console.log('🚀 Simulating manual status update with correct format...');
    
    // First, let's check the current state
    const currentTender = await prisma.callToTender.findUnique({
      where: { id: '688fa3c25dd9356b3d7d0634' },
      include: {
        organisations: {
          include: {
            organisation: true,
            organisationRole: true
          }
        }
      }
    });
    
    console.log('📊 Current tender state:');
    console.log('- Status:', currentTender?.status);
    console.log('- UpdatedAt:', currentTender?.updatedAt);
    console.log('- Organisations:', currentTender?.organisations?.length || 0);
    
    // Now simulate the EXACT same update that happens when you manually edit and save
    // Using the format that the frontend expects: "nicht_angeboten"
    const updatedTender = await prisma.callToTender.update({
      where: { id: '688fa3c25dd9356b3d7d0634' },
      data: {
        status: 'nicht_angeboten', // Using the frontend's expected format
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
    
    console.log('✅ Manual update simulation completed!');
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
    
    console.log('\n🎯 This should now trigger the same behavior as manual edit!');
    console.log('💡 Using "nicht_angeboten" format that frontend expects');
    
  } catch (error) {
    console.error('❌ Error simulating manual update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateManualStatusUpdate(); 