const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function searchMDRTender() {
  try {
    console.log('Suche nach MDR Ausschreibung...');
    
    // Search for MDR in title or notes
    const mdrTenders = await prisma.callToTender.findMany({
      where: {
        OR: [
          { title: { contains: 'MDR', mode: 'insensitive' } },
          { title: { contains: 'Managed Detection', mode: 'insensitive' } },
          { title: { contains: 'Detection and Response', mode: 'insensitive' } },
          { notes: { contains: 'MDR', mode: 'insensitive' } },
          { notes: { contains: 'Managed Detection', mode: 'insensitive' } },
          { notes: { contains: 'Detection and Response', mode: 'insensitive' } }
        ]
      },
      include: {
        employees: {
          include: {
            employee: true
          }
        },
        organisations: {
          include: {
            organisation: true,
            organisationRole: true
          }
        }
      }
    });
    
    console.log(`Gefundene MDR Ausschreibungen: ${mdrTenders.length}`);
    
    mdrTenders.forEach((tender, index) => {
      console.log(`\n${index + 1}. Titel: ${tender.title}`);
      console.log(`   Status: ${tender.status}`);
      console.log(`   Typ: ${tender.type}`);
      console.log(`   Opp-ID: ${tender.shortDescription}`);
      console.log(`   Weitere Details: ${tender.notes}`);
      console.log(`   Auftraggeber:`);
      tender.organisations.forEach(org => {
        console.log(`     - ${org.organisation.name} (Rolle: ${org.organisationRole.role})`);
      });
      console.log(`   Mitarbeiter:`);
      if (tender.employees.length > 0) {
        tender.employees.forEach(emp => {
          console.log(`     - ${emp.employee.pseudonym} (${emp.employeeCallToTenderRole})`);
        });
      } else {
        console.log(`     - Keine zugewiesen`);
      }
      console.log(`   ---`);
    });
    
  } catch (error) {
    console.error('Fehler bei der Suche:', error);
  } finally {
    await prisma.$disconnect();
  }
}

searchMDRTender(); 