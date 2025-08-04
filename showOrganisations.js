const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showOrganisations() {
  try {
    // Get all organisations
    const organisations = await prisma.organisation.findMany({
      include: {
        callToTenderOrganisation: {
          include: {
            callToTender: true,
            organisationRole: true
          }
        }
      }
    });
    
    console.log('Alle Organisationen und ihre Beziehungen zu Ausschreibungen:');
    console.log('==========================================================');
    
    organisations.forEach((org, index) => {
      console.log(`${index + 1}. Organisation: ${org.name}`);
      console.log(`   Abkürzung: ${org.abbreviation}`);
      console.log(`   Anzahl Ausschreibungen: ${org.callToTenderOrganisation.length}`);
      
      if (org.callToTenderOrganisation.length > 0) {
        console.log('   Verknüpfte Ausschreibungen:');
        org.callToTenderOrganisation.forEach((rel, relIndex) => {
          console.log(`     ${relIndex + 1}. ${rel.callToTender.title} (Rolle: ${rel.organisationRole.role})`);
        });
      }
      console.log('   ---');
    });
    
    console.log(`\nGesamt: ${organisations.length} Organisationen gefunden.`);
    
  } catch (error) {
    console.error('Error showing organisations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showOrganisations(); 