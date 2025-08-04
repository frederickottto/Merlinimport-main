const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showRecentTendersWithOrganisations() {
  try {
    // Get the most recent 10 tenders with their organisation relationships
    const tenders = await prisma.callToTender.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
              include: {
          organisations: {
            include: {
              organisation: true,
              organisationRole: true
            }
          }
        }
    });
    
    console.log('Die letzten 10 importierten Tender mit Auftraggebern:');
    console.log('==================================================');
    
    tenders.forEach((tender, index) => {
      console.log(`${index + 1}. Titel: ${tender.title}`);
      console.log(`   Status: ${tender.status || 'null'}`);
      console.log(`   Typ: ${tender.type || 'null'}`);
      console.log(`   Opp-ID: ${tender.shortDescription || 'null'}`);
      console.log(`   Volumen: ${tender.volumeEuro ? tender.volumeEuro.toLocaleString() + ' €' : 'Nicht angegeben'}`);
      
      // Show organisation relationships
      if (tender.organisations.length > 0) {
        console.log(`   Auftraggeber:`);
        tender.organisations.forEach((rel, relIndex) => {
          console.log(`     ${relIndex + 1}. ${rel.organisation.name} (Rolle: ${rel.organisationRole.role})`);
        });
      } else {
        console.log(`   Auftraggeber: Keine verknüpft`);
      }
      
      console.log(`   Erstellt: ${tender.createdAt}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('Error showing tenders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showRecentTendersWithOrganisations(); 