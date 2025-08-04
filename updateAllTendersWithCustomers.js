const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

// Helper function to find or create organization
async function findOrCreateOrganisation(organisationName) {
  if (!organisationName || organisationName === "n/a") return null;
  
  const cleanName = organisationName.toString().trim();
  
  // Try to find existing organization
  let organisation = await prisma.organisation.findFirst({
    where: {
      name: cleanName
    }
  });
  
  // If not found, create new one
  if (!organisation) {
    organisation = await prisma.organisation.create({
      data: {
        name: cleanName,
        abbreviation: cleanName.substring(0, 3).toUpperCase()
      }
    });
    console.log(`✅ Neue Organisation erstellt: ${cleanName}`);
  }
  
  return organisation;
}

// Helper function to find or create organization role
async function findOrCreateOrganisationRole(roleName) {
  let organisationRole = await prisma.organisationRole.findFirst({
    where: { role: roleName }
  });
  
  if (!organisationRole) {
    organisationRole = await prisma.organisationRole.create({
      data: { role: roleName }
    });
  }
  
  return organisationRole;
}

async function updateAllTendersWithCustomers() {
  try {
    console.log('🚀 Aktualisiere alle Ausschreibungen mit Kunden...');
    
    // Read main tender file
    const mainFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const mainWorkbook = xlsx.readFile(mainFile);
    
    const mainSheetName = "Vertriebsliste";
    const mainSheet = mainWorkbook.Sheets[mainSheetName];
    const mainJson = xlsx.utils.sheet_to_json(mainSheet, { defval: null, range: 2 });
    
    // Read title file to get the mapping
    const titleFile = 'tenders/TitelVertriebe.xlsx';
    const titleWorkbook = xlsx.readFile(titleFile);
    const titleSheetName = Object.keys(titleWorkbook.Sheets)[0];
    const titleSheet = titleWorkbook.Sheets[titleSheetName];
    const titleJson = xlsx.utils.sheet_to_json(titleSheet, { defval: null });
    
    console.log(`Excel-Zeilen gelesen: ${mainJson.length}`);
    console.log(`Titel-Zeilen gelesen: ${titleJson.length}`);
    
    // Create a mapping from tender number to customer name
    const tenderToCustomerMap = new Map();
    for (const row of mainJson) {
      if (row["#"] && row["Kunde"] && row["#"] !== "n/a" && row["Kunde"] !== "n/a") {
        tenderToCustomerMap.set(row["#"].toString(), row["Kunde"].toString().trim());
      }
    }
    
    console.log(`Kunden-Mapping erstellt: ${tenderToCustomerMap.size} Einträge`);
    
    // Get or create "Auftraggeber" role
    const auftraggeberRole = await findOrCreateOrganisationRole("Auftraggeber");
    
    let processedCount = 0;
    let updatedTenders = 0;
    let createdAssignments = 0;
    let notFoundCount = 0;
    
    // Process each tender in the database
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
    
    console.log(`Tender in Datenbank gefunden: ${allTenders.length}`);
    
    for (const tender of allTenders) {
      try {
        let tenderNumber = null;
        let customerName = null;
        
        // First try to find the corresponding title row in the title file
        const titleRow = titleJson.find(titleRow => {
          if (!titleRow["#"] || !titleRow["Titel"]) return false;
          return titleRow["Titel"] === tender.title;
        });
        
        if (titleRow) {
          tenderNumber = titleRow["#"].toString();
          customerName = tenderToCustomerMap.get(tenderNumber);
          console.log(`✅ Titel-Match gefunden: "${tender.title}" -> #${tenderNumber}`);
        } else {
          // If no title match, try to find by "Angefragte Leistung" in main file
          const mainRow = mainJson.find(mainRow => {
            if (!mainRow["#"] || !mainRow["Angefragte Leistung"]) return false;
            return mainRow["Angefragte Leistung"] === tender.title;
          });
          
          if (mainRow) {
            tenderNumber = mainRow["#"].toString();
            customerName = tenderToCustomerMap.get(tenderNumber);
            console.log(`✅ Angefragte Leistung-Match gefunden: "${tender.title}" -> #${tenderNumber}`);
          } else {
            console.log(`⚠️  Kein Match gefunden für: ${tender.title}`);
            notFoundCount++;
            continue;
          }
        }
        
        if (!customerName) {
          console.log(`⚠️  Kein Kunde gefunden für Tender-Nummer: ${tenderNumber} (Titel: ${tender.title})`);
          notFoundCount++;
          continue;
        }
        
        // Find or create organization
        const organisation = await findOrCreateOrganisation(customerName);
        if (!organisation) {
          console.log(`⚠️  Organisation konnte nicht erstellt werden für: ${customerName}`);
          notFoundCount++;
          continue;
        }
        
        // Check if this organization is already assigned to this tender
        const existingAssignment = tender.organisations.find(
          org => org.organisation.name === customerName && org.organisationRole.role === "Auftraggeber"
        );
        
        if (!existingAssignment) {
          // Create the organization assignment
          await prisma.callToTenderOrganisation.create({
            data: {
              organisation: {
                connect: { id: organisation.id }
              },
              callToTender: {
                connect: { id: tender.id }
              },
              organisationRole: {
                connect: { id: auftraggeberRole.id }
              }
            }
          });
          
          createdAssignments++;
          console.log(`✅ Auftraggeber hinzugefügt: ${customerName} zu Tender "${tender.title}" (${tenderNumber})`);
        } else {
          console.log(`ℹ️  Auftraggeber bereits vorhanden: ${customerName} für Tender "${tender.title}"`);
        }
        
        updatedTenders++;
        processedCount++;
        
        if (processedCount % 50 === 0) {
          console.log(`📊 Fortschritt: ${processedCount} Tender verarbeitet...`);
        }
        
      } catch (error) {
        console.error(`❌ Fehler bei Tender "${tender.title}":`, error.message);
        processedCount++;
      }
    }
    
    console.log('\n=== AKTUALISIERUNG ZUSAMMENFASSUNG ===');
    console.log(`📊 Verarbeitete Tender: ${processedCount}`);
    console.log(`🔄 Aktualisierte Tender: ${updatedTenders}`);
    console.log(`👥 Neue Auftraggeber-Zuweisungen: ${createdAssignments}`);
    console.log(`⚠️  Nicht gefunden: ${notFoundCount}`);
    
    // Final verification
    const totalTenders = await prisma.callToTender.count();
    const totalOrganisations = await prisma.organisation.count();
    const totalAssignments = await prisma.callToTenderOrganisation.count();
    
    console.log('\n=== VERIFIZIERUNG ===');
    console.log(`Tender in Datenbank: ${totalTenders}`);
    console.log(`Organisationen in Datenbank: ${totalOrganisations}`);
    console.log(`Organisations-Zuweisungen: ${totalAssignments}`);
    
    console.log('\n🎉 Aktualisierung abgeschlossen!');
    
  } catch (error) {
    console.error('Fehler bei der Aktualisierung:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllTendersWithCustomers(); 