const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  try {
    console.log('Bereinige Duplikate beim SOC/SIEM Tender...');
    
    // Find the problematic tender
    const tender = await prisma.callToTender.findFirst({
      where: {
        title: "SOC/SIEM"
      },
      include: {
        organisations: {
          include: {
            organisation: true
          }
        },
        employees: {
          include: {
            employee: true
          }
        }
      }
    });

    if (!tender) {
      console.log('❌ Tender nicht gefunden');
      return;
    }

    console.log(`\n=== AKTUELLER ZUSTAND ===`);
    console.log(`Organisationen: ${tender.organisations.length}`);
    console.log(`Profile: ${tender.employees.length}`);

    // Remove all duplicate employee assignments
    const employeeMap = new Map();
    const employeesToDelete = [];

    tender.employees.forEach(emp => {
      const key = `${emp.employee.pseudonym}-${emp.employeeCallToTenderRole}`;
      if (employeeMap.has(key)) {
        employeesToDelete.push(emp.id);
      } else {
        employeeMap.set(key, emp.id);
      }
    });

    console.log(`\n🗑️  Lösche ${employeesToDelete.length} doppelte Profile...`);

    if (employeesToDelete.length > 0) {
      await prisma.callToTenderEmployee.deleteMany({
        where: {
          id: {
            in: employeesToDelete
          }
        }
      });
    }

    // Verify final state
    const finalTender = await prisma.callToTender.findFirst({
      where: {
        id: tender.id
      },
      include: {
        organisations: {
          include: {
            organisation: true
          }
        },
        employees: {
          include: {
            employee: true
          }
        }
      }
    });

    console.log(`\n=== FINALER ZUSTAND ===`);
    console.log(`Organisationen: ${finalTender.organisations.length}`);
    finalTender.organisations.forEach(org => {
      console.log(`  - ${org.organisation.name}`);
    });

    console.log(`\nProfile: ${finalTender.employees.length}`);
    finalTender.employees.forEach(emp => {
      console.log(`  - ${emp.employee.pseudonym} (${emp.employeeCallToTenderRole})`);
    });

    console.log(`\n✅ Bereinigung abgeschlossen!`);

  } catch (error) {
    console.error('Fehler bei der Bereinigung:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates(); 