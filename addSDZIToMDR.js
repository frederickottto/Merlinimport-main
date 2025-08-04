const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function addSDZIToMDR() {
  try {
    console.log('Füge SDZI als Vertriebslead zur MDR Ausschreibung hinzu...');
    
    // Find the MDR tender
    const mdrTender = await prisma.callToTender.findFirst({
      where: {
        title: "Managed Detection and Response (MDR)",
        notes: "Managed Detection and Response (MDR)"
      },
      include: {
        employees: {
          include: {
            employee: true
          }
        }
      }
    });
    
    if (!mdrTender) {
      console.log('❌ MDR Ausschreibung nicht gefunden');
      return;
    }
    
    console.log(`✅ MDR Ausschreibung gefunden: "${mdrTender.title}"`);
    console.log(`   ID: ${mdrTender.id}`);
    console.log(`   Status: ${mdrTender.status}`);
    
    // Check if SDZI is already assigned
    const existingSDZI = mdrTender.employees.find(emp => 
      emp.employee.pseudonym === 'SDZI' && emp.employeeCallToTenderRole === 'Lead Vertrieb'
    );
    
    if (existingSDZI) {
      console.log('❌ SDZI ist bereits als Lead Vertrieb zugeordnet');
      return;
    }
    
    // Find SDZI employee
    const sdziEmployee = await prisma.employee.findFirst({
      where: {
        pseudonym: 'SDZI'
      }
    });
    
    if (!sdziEmployee) {
      console.log('❌ Mitarbeiter SDZI nicht gefunden');
      return;
    }
    
    console.log(`✅ Mitarbeiter SDZI gefunden: ${sdziEmployee.pseudonym}`);
    
    // Add SDZI as Lead Vertrieb
    await prisma.callToTenderEmployee.create({
      data: {
        employeeId: sdziEmployee.id,
        callToTenderId: mdrTender.id,
        employeeCallToTenderRole: 'Lead Vertrieb',
        role: 'Lead Vertrieb',
        description: `Lead Vertrieb für ${mdrTender.title}`
      }
    });
    
    console.log('✅ SDZI erfolgreich als Lead Vertrieb hinzugefügt');
    
    // Show updated employee list
    const updatedTender = await prisma.callToTender.findFirst({
      where: { id: mdrTender.id },
      include: {
        employees: {
          include: {
            employee: true
          }
        }
      }
    });
    
    console.log('\nAktualisierte Mitarbeiter-Liste:');
    updatedTender.employees.forEach(emp => {
      console.log(`   - ${emp.employee.pseudonym} (${emp.employeeCallToTenderRole})`);
    });
    
  } catch (error) {
    console.error('Fehler beim Hinzufügen von SDZI:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSDZIToMDR(); 