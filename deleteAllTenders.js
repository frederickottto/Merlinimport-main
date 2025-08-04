const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function deleteAllTenders() {
  try {
    console.log('🗑️  Lösche alle Ausschreibungen...');
    
    // First, get count of existing tenders
    const tenderCount = await prisma.callToTender.count();
    console.log(`Gefundene Ausschreibungen: ${tenderCount}`);
    
    if (tenderCount === 0) {
      console.log('Keine Ausschreibungen zum Löschen gefunden.');
      return;
    }
    
    // Delete all related records first (in correct order to avoid foreign key constraints)
    console.log('\n=== LÖSCHE VERWANDTE DATEN ===');
    
    // 1. Delete CallToTenderEmployee records
    const employeeAssignments = await prisma.callToTenderEmployee.deleteMany({});
    console.log(`CallToTenderEmployee Einträge gelöscht: ${employeeAssignments.count}`);
    
    // 2. Delete CallToTenderOrganisation records
    const organisationAssignments = await prisma.callToTenderOrganisation.deleteMany({});
    console.log(`CallToTenderOrganisation Einträge gelöscht: ${organisationAssignments.count}`);
    
    // 3. Delete Lot records (this is the missing piece!)
    try {
      const lotRecords = await prisma.lot.deleteMany({});
      console.log(`Lot Einträge gelöscht: ${lotRecords.count}`);
    } catch (error) {
      console.log('Lot Tabelle existiert nicht oder ist leer');
    }
    
    // 4. Delete CallToTenderLot records (if they exist)
    try {
      const lotAssignments = await prisma.callToTenderLot.deleteMany({});
      console.log(`CallToTenderLot Einträge gelöscht: ${lotAssignments.count}`);
    } catch (error) {
      console.log('CallToTenderLot Tabelle existiert nicht oder ist leer');
    }
    
    // 5. Delete Task records (if they exist)
    try {
      const taskRecords = await prisma.task.deleteMany({});
      console.log(`Task Einträge gelöscht: ${taskRecords.count}`);
    } catch (error) {
      console.log('Task Tabelle existiert nicht oder ist leer');
    }
    
    // 6. Delete CallToTenderDeliverables records (if they exist)
    try {
      const deliverablesRecords = await prisma.callToTenderDeliverables.deleteMany({});
      console.log(`CallToTenderDeliverables Einträge gelöscht: ${deliverablesRecords.count}`);
    } catch (error) {
      console.log('CallToTenderDeliverables Tabelle existiert nicht oder ist leer');
    }
    
    // 7. Delete CallToTenderProject records (if they exist)
    try {
      const projectRecords = await prisma.callToTenderProject.deleteMany({});
      console.log(`CallToTenderProject Einträge gelöscht: ${projectRecords.count}`);
    } catch (error) {
      console.log('CallToTenderProject Tabelle existiert nicht oder ist leer');
    }
    
    // 8. Delete Workpackage records (if they exist)
    try {
      const workpackageRecords = await prisma.workpackage.deleteMany({});
      console.log(`Workpackage Einträge gelöscht: ${workpackageRecords.count}`);
    } catch (error) {
      console.log('Workpackage Tabelle existiert nicht oder ist leer');
    }
    
    // 9. Delete ConditionsOfParticipation records (if they exist)
    try {
      const conditionsRecords = await prisma.conditionsOfParticipation.deleteMany({});
      console.log(`ConditionsOfParticipation Einträge gelöscht: ${conditionsRecords.count}`);
    } catch (error) {
      console.log('ConditionsOfParticipation Tabelle existiert nicht oder ist leer');
    }
    
    // 10. Delete ConditionsOfParticipationType records (if they exist)
    try {
      const conditionsTypeRecords = await prisma.conditionsOfParticipationType.deleteMany({});
      console.log(`ConditionsOfParticipationType Einträge gelöscht: ${conditionsTypeRecords.count}`);
    } catch (error) {
      console.log('ConditionsOfParticipationType Tabelle existiert nicht oder ist leer');
    }
    
    // 11. Delete RiskQualityProcess records (if they exist)
    try {
      const riskQualityRecords = await prisma.riskQualityProcess.deleteMany({});
      console.log(`RiskQualityProcess Einträge gelöscht: ${riskQualityRecords.count}`);
    } catch (error) {
      console.log('RiskQualityProcess Tabelle existiert nicht oder ist leer');
    }
    
    // 12. Delete Template records (if they exist)
    try {
      const templateRecords = await prisma.template.deleteMany({});
      console.log(`Template Einträge gelöscht: ${templateRecords.count}`);
    } catch (error) {
      console.log('Template Tabelle existiert nicht oder ist leer');
    }
    
    // 13. Finally delete all CallToTender records
    console.log('\n=== LÖSCHE AUSSCHREIBUNGEN ===');
    const deletedTenders = await prisma.callToTender.deleteMany({});
    console.log(`Ausschreibungen gelöscht: ${deletedTenders.count}`);
    
    // Verify deletion
    const remainingTenders = await prisma.callToTender.count();
    const remainingEmployeeAssignments = await prisma.callToTenderEmployee.count();
    const remainingOrganisationAssignments = await prisma.callToTenderOrganisation.count();
    
    console.log('\n=== VERIFIZIERUNG ===');
    console.log(`Verbleibende Ausschreibungen: ${remainingTenders}`);
    console.log(`Verbleibende Mitarbeiter-Zuweisungen: ${remainingEmployeeAssignments}`);
    console.log(`Verbleibende Organisations-Zuweisungen: ${remainingOrganisationAssignments}`);
    
    if (remainingTenders === 0 && remainingEmployeeAssignments === 0 && remainingOrganisationAssignments === 0) {
      console.log('\n✅ Alle Ausschreibungen und verwandte Daten erfolgreich gelöscht!');
      console.log('Die Datenbank ist bereit für einen neuen Import.');
    } else {
      console.log('\n⚠️  Es sind noch Daten vorhanden. Bitte überprüfen Sie die Datenbank.');
    }
    
  } catch (error) {
    console.error('Fehler beim Löschen der Ausschreibungen:', error);
    console.log('\nVersuche alternative Löschmethode...');
    
    // Alternative: Delete tenders one by one
    try {
      const allTenders = await prisma.callToTender.findMany({
        select: { id: true }
      });
      
      console.log(`Lösche ${allTenders.length} Ausschreibungen einzeln...`);
      
      for (const tender of allTenders) {
        try {
          await prisma.callToTender.delete({
            where: { id: tender.id }
          });
        } catch (deleteError) {
          console.log(`Fehler beim Löschen von Tender ${tender.id}: ${deleteError.message}`);
        }
      }
      
      console.log('✅ Alternative Löschung abgeschlossen.');
      
    } catch (alternativeError) {
      console.error('Auch alternative Löschmethode fehlgeschlagen:', alternativeError);
    }
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllTenders(); 