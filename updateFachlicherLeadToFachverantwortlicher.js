const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function updateFachlicherLeadToFachverantwortlicher() {
  try {
    console.log('Ändere "Fachlicher Lead" zu "Fachverantwortlicher"...');
    
    // Find all CallToTenderEmployee records with "Fachlicher Lead" role
    const fachlicherLeadRecords = await prisma.callToTenderEmployee.findMany({
      where: {
        employeeCallToTenderRole: 'Fachlicher Lead'
      },
      include: {
        employee: true,
        callToTender: true
      }
    });
    
    console.log(`Gefundene "Fachlicher Lead" Einträge: ${fachlicherLeadRecords.length}`);
    
    if (fachlicherLeadRecords.length === 0) {
      console.log('Keine "Fachlicher Lead" Einträge gefunden.');
      return;
    }
    
    let updatedCount = 0;
    
    for (const record of fachlicherLeadRecords) {
      try {
        // Update the role
        await prisma.callToTenderEmployee.update({
          where: {
            id: record.id
          },
          data: {
            employeeCallToTenderRole: 'Fachverantwortlicher',
            role: 'Fachverantwortlicher',
            description: `Fachverantwortlicher für ${record.callToTender.title}`
          }
        });
        
        console.log(`✅ "${record.employee.pseudonym}" → "Fachverantwortlicher" für "${record.callToTender.title}"`);
        updatedCount++;
        
      } catch (error) {
        console.log(`❌ Fehler bei Update von ${record.employee.pseudonym}: ${error.message}`);
      }
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Aktualisierte Einträge: ${updatedCount}`);
    console.log(`Fehler: ${fachlicherLeadRecords.length - updatedCount}`);
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Rollen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFachlicherLeadToFachverantwortlicher(); 