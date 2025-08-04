const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function checkTender785() {
  try {
    console.log('🔍 Überprüfe Tender #785...');
    
    // Search for the specific tender
    const tender = await prisma.callToTender.findFirst({
      where: {
        OR: [
          { title: "ISO-Audit & Sicherheitstests" },
          { title: { contains: "ISO-Audit" } },
          { title: { contains: "Sicherheitstests" } }
        ]
      },
      include: {
        organisations: {
          include: {
            organisation: true,
            organisationRole: true
          }
        },
        employees: {
          include: {
            employee: true
          }
        }
      }
    });
    
    if (tender) {
      console.log(`✅ Tender gefunden:`);
      console.log(`  ID: ${tender.id}`);
      console.log(`  Titel: "${tender.title}"`);
      console.log(`  Status: "${tender.status}"`);
      console.log(`  Kurzbeschreibung: "${tender.shortDescription}"`);
      console.log(`  Notizen: "${tender.notes}"`);
      console.log(`  Typ: "${tender.type}"`);
      console.log(`  Volumen: ${tender.volumeEuro}`);
      console.log(`  Angebotsfrist: ${tender.offerDeadline}`);
      
      console.log(`\n  Organisationen:`);
      for (const org of tender.organisations) {
        console.log(`    - ${org.organisation.name} (Rolle: ${org.organisationRole?.role || 'keine'})`);
      }
      
      console.log(`\n  Mitarbeiter:`);
      for (const emp of tender.employees) {
        console.log(`    - ${emp.employee.foreName} (Rolle: ${emp.employeeCallToTenderRole})`);
      }
    } else {
      console.log(`❌ Tender nicht gefunden`);
      
      // Show similar tenders
      const similarTenders = await prisma.callToTender.findMany({
        where: {
          OR: [
            { title: { contains: "ISO" } },
            { title: { contains: "Audit" } },
            { title: { contains: "Sicherheit" } }
          ]
        },
        select: {
          id: true,
          title: true,
          status: true
        },
        take: 5
      });
      
      console.log(`\nÄhnliche Tender:`);
      for (const t of similarTenders) {
        console.log(`  - "${t.title}" (Status: "${t.status}")`);
      }
    }
    
    // Check total tender count
    const totalCount = await prisma.callToTender.count();
    console.log(`\nGesamte Tender in Datenbank: ${totalCount}`);
    
  } catch (error) {
    console.error('Fehler beim Überprüfen des Tenders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTender785(); 