const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function fixSDZIDuplicate() {
  try {
    console.log('Korrigiere doppelte SDZI-Zuordnung...');
    
    // Find the SOC/SIEM tender
    const tender = await prisma.callToTender.findFirst({
      where: {
        title: "SOC/SIEM"
      },
      include: {
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

    // Find SDZI assignments
    const sdziAssignments = tender.employees.filter(emp => 
      emp.employee.pseudonym === 'SDZI'
    );

    console.log(`\nGefundene SDZI-Zuordnungen:`);
    sdziAssignments.forEach(emp => {
      console.log(`  - ${emp.employee.pseudonym} (${emp.employeeCallToTenderRole}) - ID: ${emp.id}`);
    });

    // Keep only the "Vertriebslead (VL)" assignment and delete the "Lead Vertrieb" one
    const sdziToDelete = sdziAssignments.find(emp => 
      emp.employeeCallToTenderRole === "Lead Vertrieb"
    );

    if (sdziToDelete) {
      console.log(`\n🗑️  Lösche SDZI "Lead Vertrieb" Zuordnung...`);
      
      await prisma.callToTenderEmployee.delete({
        where: {
          id: sdziToDelete.id
        }
      });

      console.log(`✅ SDZI "Lead Vertrieb" Zuordnung gelöscht`);
    }

    // Verify final state
    const finalTender = await prisma.callToTender.findFirst({
      where: {
        id: tender.id
      },
      include: {
        employees: {
          include: {
            employee: true
          }
        }
      }
    });

    console.log(`\n=== FINALER ZUSTAND ===`);
    console.log(`Profile: ${finalTender.employees.length}`);
    finalTender.employees.forEach(emp => {
      console.log(`  - ${emp.employee.pseudonym} (${emp.employeeCallToTenderRole})`);
    });

    console.log(`\n✅ SDZI-Duplikat korrigiert!`);

  } catch (error) {
    console.error('Fehler bei der Korrektur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSDZIDuplicate(); 