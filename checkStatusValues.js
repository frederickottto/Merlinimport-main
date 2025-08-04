const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function checkStatusValues() {
  try {
    console.log('🔍 Überprüfe Status-Werte in der Datenbank...');
    
    // Get all tenders with their status
    const tenders = await prisma.callToTender.findMany({
      select: {
        id: true,
        title: true,
        status: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });
    
    console.log(`\n=== ERSTE 20 TENDER MIT STATUS ===`);
    for (const tender of tenders) {
      console.log(`"${tender.title}" - Status: "${tender.status}"`);
    }
    
    // Get unique status values
    const uniqueStatuses = await prisma.callToTender.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    console.log(`\n=== ALLE EINZIGARTIGEN STATUS-WERTE ===`);
    for (const status of uniqueStatuses) {
      console.log(`"${status.status}" - ${status._count.status} Tender`);
    }
    
    // Check if there are any tenders with null or empty status
    const nullStatusCount = await prisma.callToTender.count({
      where: {
        OR: [
          { status: null },
          { status: "" },
          { status: " " }
        ]
      }
    });
    
    console.log(`\n=== STATISTIKEN ===`);
    console.log(`Tender mit null/leerem Status: ${nullStatusCount}`);
    console.log(`Gesamte Tender: ${await prisma.callToTender.count()}`);
    
    // Check organisations
    const tendersWithOrganisations = await prisma.callToTender.findMany({
      include: {
        organisations: {
          include: {
            organisation: true,
            organisationRole: true
          }
        }
      },
      take: 5
    });
    
    console.log(`\n=== BEISPIEL TENDER MIT ORGANISATIONEN ===`);
    for (const tender of tendersWithOrganisations) {
      console.log(`"${tender.title}"`);
      console.log(`  Status: "${tender.status}"`);
      console.log(`  Organisationen: ${tender.organisations.length}`);
      for (const org of tender.organisations) {
        console.log(`    - ${org.organisation.name} (Rolle: ${org.organisationRole?.role || 'keine'})`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('Fehler beim Überprüfen der Status-Werte:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatusValues(); 