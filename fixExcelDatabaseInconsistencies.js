const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

async function fixExcelDatabaseInconsistencies() {
  try {
    console.log('Behebe Inkonsistenzen zwischen Excel und Datenbank...');
    
    // Read Excel file
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    
    const sheetName = "Vertriebsliste";
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Excel-Zeilen: ${sheetJson.length}`);
    
    // Get all tenders from database
    const dbTenders = await prisma.callToTender.findMany({
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
    
    console.log(`Datenbank-Tender: ${dbTenders.length}`);
    
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    let notesUpdated = 0;
    let oppIdsUpdated = 0;
    let employeesAdded = 0;
    
    // Process each Excel row
    for (const row of sheetJson) {
      const angefragteLeistung = row["Angefragte Leistung"];
      const kunde = row["Kunde"];
      const oppId = row["Opp-ID"];
      const leadVertrieb = row["Lead Vertrieb"];
      const fachlicherLead = row["Fachlicher Lead"];
      const oppPartner = row["Opp Partner"];
      
      if (!angefragteLeistung || !kunde || angefragteLeistung === "n/a" || kunde === "n/a") {
        continue;
      }
      
      totalProcessed++;
      
      // Find matching tender using multiple strategies
      let tender = null;
      
      // Strategy 1: Match by organisation name
      tender = dbTenders.find(t => 
        t.organisations.some(org => 
          org.organisation.name === kunde.toString().trim()
        )
      );
      
      // Strategy 2: Match by title or notes content
      if (!tender) {
        tender = dbTenders.find(t => 
          (t.title && t.title.includes(angefragteLeistung.toString().trim())) ||
          (t.notes && t.notes.includes(angefragteLeistung.toString().trim())) ||
          (t.title && angefragteLeistung.toString().trim().includes(t.title)) ||
          (t.notes && angefragteLeistung.toString().trim().includes(t.notes))
        );
      }
      
      // Strategy 3: Match by short description (Opp-ID)
      if (!tender && oppId) {
        tender = dbTenders.find(t => 
          t.shortDescription && t.shortDescription.includes(oppId.toString().trim())
        );
      }
      
      if (!tender) {
        console.log(`⚠️  Tender nicht gefunden für: "${angefragteLeistung}" (${kunde})`);
        continue;
      }
      
      let updateData = {};
      let hasUpdates = false;
      
      // Update notes (Angefragte Leistung) if it's more specific than current
      if (angefragteLeistung && angefragteLeistung !== "n/a") {
        const excelNotes = angefragteLeistung.toString().trim();
        const currentNotes = tender.notes || "";
        
        // Only update if Excel has more specific information
        if (excelNotes.length > currentNotes.length || 
            (excelNotes !== currentNotes && !currentNotes.includes(excelNotes))) {
          updateData.notes = excelNotes;
          hasUpdates = true;
          notesUpdated++;
          console.log(`📝 Notes aktualisiert: "${tender.title}"`);
        }
      }
      
      // Update Opp-ID if missing or different
      if (oppId && oppId !== "n/a" && oppId !== "tbd") {
        const excelOppId = oppId.toString().trim();
        const currentOppId = tender.shortDescription || "";
        
        if (currentOppId !== excelOppId && !currentOppId.includes(excelOppId)) {
          updateData.shortDescription = excelOppId;
          hasUpdates = true;
          oppIdsUpdated++;
          console.log(`🆔 Opp-ID aktualisiert: "${tender.title}"`);
        }
      }
      
      // Update tender if we have changes
      if (hasUpdates) {
        await prisma.callToTender.update({
          where: { id: tender.id },
          data: updateData
        });
        totalUpdated++;
      }
      
      // Add missing employees
      const findEmployeeByPseudonym = async (pseudonym) => {
        if (!pseudonym || pseudonym.length !== 3 || pseudonym === "Threat?" || pseudonym === "?") {
          return null;
        }
        return prisma.employee.findFirst({
          where: { pseudonym: pseudonym.toUpperCase() }
        });
      };
      
      const addEmployeeToTender = async (pseudonym, roleName) => {
        const employee = await findEmployeeByPseudonym(pseudonym);
        if (employee) {
          const existingAssignment = tender.employees.find(
            (emp) => emp.employeeId === employee.id && emp.employeeCallToTenderRole === roleName
          );
          if (!existingAssignment) {
            await prisma.callToTenderEmployee.create({
              data: {
                employee: { connect: { id: employee.id } },
                callToTender: { connect: { id: tender.id } },
                employeeCallToTenderRole: roleName,
                role: roleName,
                description: `${roleName} für ${tender.title}`,
              },
            });
            employeesAdded++;
            console.log(`👤 Mitarbeiter hinzugefügt: ${pseudonym} (${roleName}) zu "${tender.title}"`);
          }
        } else {
          console.log(`⚠️  Mitarbeiter mit Pseudonym "${pseudonym}" nicht gefunden.`);
        }
      };
      
      // Add missing employees
      if (leadVertrieb && leadVertrieb !== "n/a" && leadVertrieb !== "?") {
        await addEmployeeToTender(leadVertrieb, "Vertriebslead (VL)");
      }
      if (fachlicherLead && fachlicherLead !== "n/a" && fachlicherLead !== "?") {
        await addEmployeeToTender(fachlicherLead, "Fachverantwortlicher");
      }
      if (oppPartner && oppPartner !== "n/a" && oppPartner !== "?") {
        await addEmployeeToTender(oppPartner, "Opp Partner");
      }
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Verarbeitete Excel-Einträge: ${totalProcessed}`);
    console.log(`Aktualisierte Tender: ${totalUpdated}`);
    console.log(`Notes aktualisiert: ${notesUpdated}`);
    console.log(`Opp-IDs aktualisiert: ${oppIdsUpdated}`);
    console.log(`Mitarbeiter hinzugefügt: ${employeesAdded}`);
    console.log(`Fehler: ${totalErrors}`);
    
  } catch (error) {
    console.error('Fehler beim Beheben der Inkonsistenzen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExcelDatabaseInconsistencies(); 