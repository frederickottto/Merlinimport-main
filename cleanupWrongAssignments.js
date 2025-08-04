const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function cleanupWrongAssignments() {
  try {
    console.log('Bereinige falsche Zuordnungen...');
    
    // Find the problematic tender (SOC/SIEM)
    const problematicTender = await prisma.callToTender.findFirst({
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

    if (!problematicTender) {
      console.log('❌ Problematic tender not found');
      return;
    }

    console.log(`\n=== PROBLEMATISCHER TENDER ===`);
    console.log(`ID: ${problematicTender.id}`);
    console.log(`Titel: ${problematicTender.title}`);
    console.log(`Organisationen: ${problematicTender.organisations.length}`);
    console.log(`Profile: ${problematicTender.employees.length}`);

    // Keep only the first organization (SWM Services GmbH)
    const firstOrg = problematicTender.organisations.find(org => 
      org.organisation.name === "SWM Services GmbH"
    );

    if (firstOrg) {
      console.log(`\n✅ Behalte Organisation: ${firstOrg.organisation.name}`);
    }

    // Keep only the first few employees (SDZI, NKA, KBR)
    const keepEmployees = ['SDZI', 'NKA', 'KBR'];
    const employeesToKeep = problematicTender.employees.filter(emp => 
      keepEmployees.includes(emp.employee.pseudonym)
    );

    console.log(`\n✅ Behalte Profile: ${employeesToKeep.map(emp => emp.employee.pseudonym).join(', ')}`);

    // Delete all wrong assignments
    console.log(`\n🗑️  Lösche falsche Zuordnungen...`);

    // Delete all organization assignments except the first one
    const orgsToDelete = problematicTender.organisations.filter(org => 
      org.organisation.name !== "SWM Services GmbH"
    );

    if (orgsToDelete.length > 0) {
      await prisma.callToTenderOrganisation.deleteMany({
        where: {
          id: {
            in: orgsToDelete.map(org => org.id)
          }
        }
      });
      console.log(`✅ ${orgsToDelete.length} falsche Organisationen gelöscht`);
    }

    // Delete all employee assignments except the first few
    const employeesToDelete = problematicTender.employees.filter(emp => 
      !keepEmployees.includes(emp.employee.pseudonym)
    );

    if (employeesToDelete.length > 0) {
      await prisma.callToTenderEmployee.deleteMany({
        where: {
          id: {
            in: employeesToDelete.map(emp => emp.id)
          }
        }
      });
      console.log(`✅ ${employeesToDelete.length} falsche Profile gelöscht`);
    }

    // Verify cleanup
    const cleanedTender = await prisma.callToTender.findFirst({
      where: {
        id: problematicTender.id
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

    console.log(`\n=== NACH BEREINIGUNG ===`);
    console.log(`Organisationen: ${cleanedTender.organisations.length}`);
    cleanedTender.organisations.forEach(org => {
      console.log(`  - ${org.organisation.name}`);
    });

    console.log(`\nProfile: ${cleanedTender.employees.length}`);
    cleanedTender.employees.forEach(emp => {
      console.log(`  - ${emp.employee.pseudonym} (${emp.employeeCallToTenderRole})`);
    });

    console.log(`\n✅ Bereinigung abgeschlossen!`);

  } catch (error) {
    console.error('Fehler bei der Bereinigung:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupWrongAssignments(); 