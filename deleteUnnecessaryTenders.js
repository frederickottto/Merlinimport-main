const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function deleteUnnecessaryTenders() {
  try {
    console.log('🗑️  Lösche unnötige Tender (ohne Auftraggeber oder Duplikate)...');
    
    // First, let's see how many tenders we have
    const totalTenders = await prisma.callToTender.count();
    console.log(`Aktuelle Tender in Datenbank: ${totalTenders}`);
    
    // Get all tenders with their organizations
    const allTenders = await prisma.callToTender.findMany({
      include: {
        organisations: {
          include: {
            organisation: true,
            organisationRole: true
          }
        }
      }
    });
    
    console.log(`Alle Tender geladen: ${allTenders.length}`);
    
    let tendersToDelete = [];
    let tendersToKeep = [];
    
    // Check each tender
    for (const tender of allTenders) {
      // Check if tender has any organizations assigned
      const hasOrganizations = tender.organisations.length > 0;
      
      // Check if tender has any employees assigned
      const employeeCount = await prisma.callToTenderEmployee.count({
        where: { callToTenderId: tender.id }
      });
      
      const hasEmployees = employeeCount > 0;
      
      // Check if tender has meaningful data
      const hasTitle = tender.title && tender.title.trim() !== '';
      const hasNotes = tender.notes && tender.notes.trim() !== '';
      const hasShortDescription = tender.shortDescription && tender.shortDescription.trim() !== '';
      
      const hasMeaningfulData = hasTitle || hasNotes || hasShortDescription;
      
      // Determine if tender should be deleted
      let shouldDelete = false;
      let reason = '';
      
      if (!hasOrganizations && !hasEmployees && !hasMeaningfulData) {
        shouldDelete = true;
        reason = 'Keine Organisationen, keine Mitarbeiter, keine aussagekräftigen Daten';
      } else if (!hasOrganizations && !hasMeaningfulData) {
        shouldDelete = true;
        reason = 'Keine Organisationen und keine aussagekräftigen Daten';
      } else if (!hasTitle && !hasNotes && !hasShortDescription) {
        shouldDelete = true;
        reason = 'Keine aussagekräftigen Daten (Titel, Notizen, Beschreibung)';
      }
      
      if (shouldDelete) {
        tendersToDelete.push({
          id: tender.id,
          title: tender.title || 'Kein Titel',
          reason: reason,
          hasOrganizations: hasOrganizations,
          hasEmployees: hasEmployees,
          hasMeaningfulData: hasMeaningfulData
        });
      } else {
        tendersToKeep.push({
          id: tender.id,
          title: tender.title || 'Kein Titel',
          hasOrganizations: hasOrganizations,
          hasEmployees: hasEmployees,
          hasMeaningfulData: hasMeaningfulData
        });
      }
    }
    
    // Check for duplicates based on title
    const titleCounts = {};
    for (const tender of allTenders) {
      const title = tender.title || 'Kein Titel';
      if (!titleCounts[title]) {
        titleCounts[title] = [];
      }
      titleCounts[title].push(tender);
    }
    
    // Find duplicates
    for (const [title, tenders] of Object.entries(titleCounts)) {
      if (tenders.length > 1) {
        console.log(`\n⚠️  Duplikate gefunden für Titel: "${title}" (${tenders.length} Tender)`);
        
        // Keep the one with the most data, delete the others
        const sortedTenders = tenders.sort((a, b) => {
          const aScore = (a.organisations.length * 10) + (a.employees?.length || 0) + (a.title ? 5 : 0) + (a.notes ? 3 : 0) + (a.shortDescription ? 2 : 0);
          const bScore = (b.organisations.length * 10) + (b.employees?.length || 0) + (b.title ? 5 : 0) + (b.notes ? 3 : 0) + (b.shortDescription ? 2 : 0);
          return bScore - aScore;
        });
        
        // Keep the first one (highest score), delete the rest
        for (let i = 1; i < sortedTenders.length; i++) {
          const tenderToDelete = sortedTenders[i];
          const existingInDeleteList = tendersToDelete.find(t => t.id === tenderToDelete.id);
          
          if (!existingInDeleteList) {
            tendersToDelete.push({
              id: tenderToDelete.id,
              title: tenderToDelete.title || 'Kein Titel',
              reason: `Duplikat von "${title}" (behaltene Version hat mehr Daten)`,
              hasOrganizations: tenderToDelete.organisations.length > 0,
              hasEmployees: false, // We'll check this separately
              hasMeaningfulData: true
            });
          }
        }
      }
    }
    
    console.log(`\n=== ANALYSE ===`);
    console.log(`Tender zum Behalten: ${tendersToKeep.length}`);
    console.log(`Tender zum Löschen: ${tendersToDelete.length}`);
    
    if (tendersToDelete.length > 0) {
      console.log(`\n=== TENDER ZUM LÖSCHEN ===`);
      for (const tender of tendersToDelete) {
        console.log(`- "${tender.title}" (Grund: ${tender.reason})`);
      }
      
      console.log(`\n🗑️  Starte Löschvorgang...`);
      
      let deletedCount = 0;
      for (const tender of tendersToDelete) {
        try {
          // Delete related records first
          await prisma.callToTenderEmployee.deleteMany({
            where: { callToTenderId: tender.id }
          });
          
          await prisma.callToTenderOrganisation.deleteMany({
            where: { callToTenderIDs: tender.id }
          });
          
          // Delete the tender itself
          await prisma.callToTender.delete({
            where: { id: tender.id }
          });
          
          deletedCount++;
          console.log(`✅ Gelöscht: "${tender.title}"`);
        } catch (error) {
          console.error(`❌ Fehler beim Löschen von "${tender.title}":`, error.message);
        }
      }
      
      console.log(`\n=== LÖSCHVORGANG ABGESCHLOSSEN ===`);
      console.log(`Gelöschte Tender: ${deletedCount}`);
    } else {
      console.log(`\n✅ Keine unnötigen Tender gefunden!`);
    }
    
    // Final verification
    const finalTenderCount = await prisma.callToTender.count();
    const finalOrganisationCount = await prisma.organisation.count();
    const finalEmployeeCount = await prisma.callToTenderEmployee.count();
    const finalOrganisationAssignmentCount = await prisma.callToTenderOrganisation.count();
    
    console.log(`\n=== FINALE VERIFIZIERUNG ===`);
    console.log(`Tender in Datenbank: ${finalTenderCount}`);
    console.log(`Organisationen in Datenbank: ${finalOrganisationCount}`);
    console.log(`Mitarbeiter-Zuweisungen: ${finalEmployeeCount}`);
    console.log(`Organisations-Zuweisungen: ${finalOrganisationAssignmentCount}`);
    
    // Show some statistics about remaining tenders
    const remainingTenders = await prisma.callToTender.findMany({
      include: {
        organisations: {
          include: {
            organisation: true,
            organisationRole: true
          }
        }
      }
    });
    
    const tendersWithOrganizations = remainingTenders.filter(t => t.organisations.length > 0).length;
    const tendersWithEmployees = await prisma.callToTenderEmployee.groupBy({
      by: ['callToTenderId'],
      _count: { callToTenderId: true }
    });
    
    console.log(`\n=== STATISTIKEN DER VERBLEIBENDEN TENDER ===`);
    console.log(`Tender mit Organisationen: ${tendersWithOrganizations}`);
    console.log(`Tender mit Mitarbeitern: ${tendersWithEmployees.length}`);
    console.log(`Tender ohne Organisationen: ${finalTenderCount - tendersWithOrganizations}`);
    
    console.log(`\n🎉 Bereinigung abgeschlossen!`);
    
  } catch (error) {
    console.error('Fehler beim Löschen der unnötigen Tender:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUnnecessaryTenders(); 