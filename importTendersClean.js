const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

// Helper function to convert Excel date to JavaScript date
function excelDateToJSDate(excelDate) {
  if (!excelDate || excelDate === "n/a") return null;
  
  // Excel dates are number of days since 1900-01-01
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) return null;
  
  return date;
}

// Helper function to map status correctly
function mapStatus(excelStatus, art) {
  if (!excelStatus || excelStatus === "n/a") return " ";
  
  const status = excelStatus.toString().trim();
  
  // Special case for "00 Warten auf Veröffentlichung"
  if (status === "00 Warten auf Veröffentlichung") {
    return " ";
  }
  
  // Special case for "20 In Erstellung" with TNA
  if (status === "20 In Erstellung" && art && art.toString().includes("TNA")) {
    return "In Erstellung TNA";
  }
  
  // Special case for "20 In Erstellung" without TNA
  if (status === "20 In Erstellung") {
    return "In Erstellung Angebot";
  }
  
  // Special case for statuses with "90" (Anderer im Lead)
  if (status.includes("90")) {
    return "Anderer im Lead";
  }
  
  // Map other statuses (remove numbers)
  const statusMap = {
    "02 Präqualifizierung": "Präqualifizierung",
    "10 Nicht angeboten": "Nicht angeboten",
    "30 Versendet": "Versendet",
    "41 Gewonnen": "Gewonnen",
    "42 Verloren": "Verloren",
    "43 Zurückgezogen durch Kunde": "Verloren",
    "94 - Anderer im Lead - Zuarbeit CSS": "Anderer im Lead",
    "90 Anderer im Lead - angeboten": "Anderer im Lead"
  };
  
  return statusMap[status] || status.replace(/^\d+\s*/, ""); // Remove leading numbers
}

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

// Helper function to find employee by pseudonym
async function findEmployeeByPseudonym(pseudonym) {
  if (!pseudonym || pseudonym === "n/a") return null;
  
  const cleanPseudonym = pseudonym.toString().trim();
  
  const employee = await prisma.employee.findFirst({
    where: {
      pseudonym: cleanPseudonym
    }
  });
  
  return employee;
}

async function importTendersClean() {
  try {
    console.log('🚀 Starte sauberen Import der Ausschreibungen...');
    
    // Read main tender file
    const mainFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const mainWorkbook = xlsx.readFile(mainFile);
    
    const mainSheetName = "Vertriebsliste";
    const mainSheet = mainWorkbook.Sheets[mainSheetName];
    const mainJson = xlsx.utils.sheet_to_json(mainSheet, { defval: null, range: 2 });
    
    // Read title file
    const titleFile = 'tenders/TitelVertriebe.xlsx';
    const titleWorkbook = xlsx.readFile(titleFile);
    
    const titleSheetName = Object.keys(titleWorkbook.Sheets)[0];
    const titleSheet = titleWorkbook.Sheets[titleSheetName];
    const titleJson = xlsx.utils.sheet_to_json(titleSheet, { defval: null });
    
    console.log(`Hauptdatei Zeilen: ${mainJson.length}`);
    console.log(`Titeldatei Zeilen: ${titleJson.length}`);
    
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each row in main file
    for (const row of mainJson) {
      try {
        // Skip rows without essential data
        if (!row["#"] || !row["Kunde"] || row["#"] === "n/a" || row["Kunde"] === "n/a") {
          skippedCount++;
          continue;
        }
        
        const tenderNumber = row["#"];
        const customerName = row["Kunde"].toString().trim();
        const requestedService = row["Angefragte Leistung"];
        const status = mapStatus(row["Status"], row["Art"]);
        const deadline = excelDateToJSDate(row["Abgabefrist"]);
        const volume = row["ToV in 1.000"];
        const notes = row["Anmerkungen"];
        const link = row["Link Angebotsunterlagen"];
        
        // Find matching title from title file
        const titleRow = titleJson.find(titleRow => titleRow["#"] === tenderNumber);
        let title = titleRow ? titleRow["Titel"] : requestedService;
        
        // Handle "nan" titles
        if (title === "nan" || title === "NaN" || !title) {
          title = requestedService || customerName || "Kein Titel verfügbar";
        }
        
        // Find or create organization
        const organisation = await findOrCreateOrganisation(customerName);
        if (!organisation) {
          console.log(`⚠️  Überspringe Tender ${tenderNumber}: Keine Organisation gefunden`);
          skippedCount++;
          continue;
        }
        
        // Create tender
        const tender = await prisma.callToTender.create({
          data: {
            title: title || "Kein Titel verfügbar",
            status: status,
            offerDeadline: deadline,
            volumeEuro: volume ? parseFloat(volume) * 1000 : null,
            notes: notes || null,
            shortDescription: requestedService || null
          }
        });
        
        // Find or create default organization role
        let organisationRole = await prisma.organisationRole.findFirst({
          where: { role: "Auftraggeber" }
        });
        
        if (!organisationRole) {
          organisationRole = await prisma.organisationRole.create({
            data: { role: "Auftraggeber" }
          });
        }
        
        // Link organization to tender
        await prisma.callToTenderOrganisation.create({
          data: {
            organisation: {
              connect: { id: organisation.id }
            },
            callToTender: {
              connect: { id: tender.id }
            },
            organisationRole: {
              connect: { id: organisationRole.id }
            }
          }
        });
        
        // Add employee profiles
        const employeeFields = [
          { field: "Opp Partner", role: "Opp Partner" },
          { field: "Vertriebslead (VL)", role: "Leadsvertrieb (VL)" },
          { field: "Fachverantwortlicher", role: "Fachverantwortlicher" }
        ];
        
        for (const employeeField of employeeFields) {
          const pseudonym = row[employeeField.field];
          if (pseudonym && pseudonym !== "n/a") {
            const employee = await findEmployeeByPseudonym(pseudonym);
            if (employee) {
              await prisma.callToTenderEmployee.create({
                data: {
                  callToTenderId: tender.id,
                  employeeId: employee.id,
                  employeeCallToTenderRole: employeeField.role
                }
              });
            } else {
              console.log(`⚠️  Mitarbeiter nicht gefunden: ${pseudonym} für Tender ${tenderNumber}`);
            }
          }
        }
        
        importedCount++;
        if (importedCount % 50 === 0) {
          console.log(`📊 Fortschritt: ${importedCount} Tender importiert...`);
        }
        
      } catch (error) {
        console.error(`❌ Fehler bei Tender ${row["#"]}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n=== IMPORT ZUSAMMENFASSUNG ===');
    console.log(`✅ Erfolgreich importiert: ${importedCount}`);
    console.log(`⚠️  Übersprungen: ${skippedCount}`);
    console.log(`❌ Fehler: ${errorCount}`);
    console.log(`📊 Gesamt verarbeitet: ${importedCount + skippedCount + errorCount}`);
    
    // Verify import
    const totalTenders = await prisma.callToTender.count();
    const totalOrganisations = await prisma.callToTenderOrganisation.count();
    const totalEmployees = await prisma.callToTenderEmployee.count();
    
    console.log('\n=== VERIFIZIERUNG ===');
    console.log(`Tender in Datenbank: ${totalTenders}`);
    console.log(`Organisations-Zuweisungen: ${totalOrganisations}`);
    console.log(`Mitarbeiter-Zuweisungen: ${totalEmployees}`);
    
    console.log('\n🎉 Import abgeschlossen!');
    
  } catch (error) {
    console.error('Fehler beim Import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importTendersClean(); 