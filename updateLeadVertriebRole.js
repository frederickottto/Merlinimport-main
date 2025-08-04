const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function updateLeadVertriebRole() {
  try {
    console.log('Ändere "Lead Vertrieb" zu "Leadsvertrieb (VL)"...');
    
    // Find all CallToTenderEmployee records with "Lead Vertrieb" role
    const leadVertriebRecords = await prisma.callToTenderEmployee.findMany({
      where: {
        employeeCallToTenderRole: "Lead Vertrieb"
      },
      include: {
        employee: true,
        callToTender: {
          select: {
            title: true
          }
        }
      }
    });
    
    console.log(`Gefundene "Lead Vertrieb" Einträge: ${leadVertriebRecords.length}`);
    
    if (leadVertriebRecords.length === 0) {
      console.log('Keine "Lead Vertrieb" Einträge gefunden.');
      return;
    }
    
    // Display current records
    console.log('\n=== AKTUELLE "LEAD VERTRIEB" EINTRÄGE ===');
    leadVertriebRecords.forEach((record, index) => {
      console.log(`${index + 1}. Mitarbeiter: ${record.employee.pseudonym}`);
      console.log(`   Tender: "${record.callToTender.title}"`);
      console.log(`   Aktuelle Rolle: ${record.employeeCallToTenderRole}`);
      console.log('');
    });
    
    // Update all records
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const record of leadVertriebRecords) {
      try {
        await prisma.callToTenderEmployee.update({
          where: { id: record.id },
          data: {
            employeeCallToTenderRole: "Leadsvertrieb (VL)",
            role: "Leadsvertrieb (VL)"
          }
        });
        
        console.log(`✅ Aktualisiert: ${record.employee.pseudonym} in "${record.callToTender.title}"`);
        console.log(`   Von: "Lead Vertrieb" → "Leadsvertrieb (VL)"`);
        updatedCount++;
        
      } catch (error) {
        console.log(`❌ Fehler bei ${record.employee.pseudonym} in "${record.callToTender.title}": ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Gefundene Einträge: ${leadVertriebRecords.length}`);
    console.log(`Erfolgreich aktualisiert: ${updatedCount}`);
    console.log(`Fehler: ${errorCount}`);
    
    // Verify the changes
    const updatedRecords = await prisma.callToTenderEmployee.findMany({
      where: {
        employeeCallToTenderRole: "Leadsvertrieb (VL)"
      },
      include: {
        employee: true,
        callToTender: {
          select: {
            title: true
          }
        }
      }
    });
    
    console.log(`\n=== VERIFIZIERUNG: "LEADSVERTRIEB (VL)" EINTRÄGE (${updatedRecords.length}) ===`);
    updatedRecords.forEach((record, index) => {
      console.log(`${index + 1}. Mitarbeiter: ${record.employee.pseudonym}`);
      console.log(`   Tender: "${record.callToTender.title}"`);
      console.log(`   Rolle: ${record.employeeCallToTenderRole}`);
      console.log('');
    });
    
    // Check if any "Lead Vertrieb" records still exist
    const remainingLeadVertrieb = await prisma.callToTenderEmployee.findMany({
      where: {
        employeeCallToTenderRole: "Lead Vertrieb"
      }
    });
    
    if (remainingLeadVertrieb.length > 0) {
      console.log(`\n⚠️  VERBLEIBENDE "LEAD VERTRIEB" EINTRÄGE (${remainingLeadVertrieb.length}):`);
      remainingLeadVertrieb.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record.id}`);
      });
    } else {
      console.log(`\n✅ Alle "Lead Vertrieb" Einträge wurden erfolgreich zu "Leadsvertrieb (VL)" geändert!`);
    }
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Rollen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateLeadVertriebRole(); 