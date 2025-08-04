const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

async function compareExcelWithDatabase() {
  try {
    console.log('Vergleiche Excel-Daten mit Datenbank...');
    
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
    
    let totalExcelEntries = 0;
    let foundInDatabase = 0;
    let notFoundInDatabase = 0;
    let incorrectData = 0;
    let missingEntries = [];
    let incorrectEntries = [];
    
    // Process each Excel row
    for (const row of sheetJson) {
      const angefragteLeistung = row["Angefragte Leistung"];
      const kunde = row["Kunde"];
      const oppId = row["Opp-ID"];
      const leadVertrieb = row["Lead Vertrieb"];
      const fachlicherLead = row["Fachlicher Lead"];
      const oppPartner = row["Opp Partner"];
      const status = row["Status"];
      const art = row["Art"];
      const nummer = row["#"];
      
      if (!angefragteLeistung || !kunde || angefragteLeistung === "n/a" || kunde === "n/a") {
        continue;
      }
      
      totalExcelEntries++;
      
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
        notFoundInDatabase++;
        missingEntries.push({
          angefragteLeistung: angefragteLeistung.toString().trim(),
          kunde: kunde.toString().trim(),
          oppId: oppId ? oppId.toString().trim() : null,
          leadVertrieb: leadVertrieb ? leadVertrieb.toString().trim() : null,
          fachlicherLead: fachlicherLead ? fachlicherLead.toString().trim() : null,
          oppPartner: oppPartner ? oppPartner.toString().trim() : null,
          status: status ? status.toString().trim() : null,
          art: art ? art.toString().trim() : null,
          nummer: nummer ? nummer.toString().trim() : null
        });
        continue;
      }
      
      foundInDatabase++;
      
      // Check for data inconsistencies
      let hasInconsistencies = false;
      let inconsistencies = [];
      
      // Check if Opp-ID matches
      if (oppId && oppId !== "n/a" && tender.shortDescription !== oppId.toString().trim()) {
        hasInconsistencies = true;
        inconsistencies.push(`Opp-ID: Excel="${oppId}" vs DB="${tender.shortDescription}"`);
      }
      
      // Check if notes (Angefragte Leistung) matches
      if (angefragteLeistung && angefragteLeistung !== "n/a" && tender.notes !== angefragteLeistung.toString().trim()) {
        hasInconsistencies = true;
        inconsistencies.push(`Angefragte Leistung: Excel="${angefragteLeistung}" vs DB="${tender.notes}"`);
      }
      
      // Check if employees are missing
      const expectedEmployees = [];
      if (leadVertrieb && leadVertrieb !== "n/a" && leadVertrieb !== "?") {
        expectedEmployees.push({ pseudonym: leadVertrieb.toString().trim(), role: "Vertriebslead (VL)" });
      }
      if (fachlicherLead && fachlicherLead !== "n/a" && fachlicherLead !== "?") {
        expectedEmployees.push({ pseudonym: fachlicherLead.toString().trim(), role: "Fachverantwortlicher" });
      }
      if (oppPartner && oppPartner !== "n/a" && oppPartner !== "?") {
        expectedEmployees.push({ pseudonym: oppPartner.toString().trim(), role: "Opp Partner" });
      }
      
      for (const expectedEmp of expectedEmployees) {
        const hasEmployee = tender.employees.some(emp => 
          emp.employee.pseudonym === expectedEmp.pseudonym && 
          emp.employeeCallToTenderRole === expectedEmp.role
        );
        
        if (!hasEmployee) {
          hasInconsistencies = true;
          inconsistencies.push(`Fehlender Mitarbeiter: ${expectedEmp.pseudonym} (${expectedEmp.role})`);
        }
      }
      
      // Check if organization is missing
      const hasOrganization = tender.organisations.some(org => 
        org.organisation.name === kunde.toString().trim()
      );
      
      if (!hasOrganization) {
        hasInconsistencies = true;
        inconsistencies.push(`Fehlende Organisation: ${kunde}`);
      }
      
      if (hasInconsistencies) {
        incorrectData++;
        incorrectEntries.push({
          tenderTitle: tender.title,
          tenderId: tender.id,
          angefragteLeistung: angefragteLeistung.toString().trim(),
          kunde: kunde.toString().trim(),
          inconsistencies: inconsistencies
        });
      }
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Excel-Einträge verarbeitet: ${totalExcelEntries}`);
    console.log(`In Datenbank gefunden: ${foundInDatabase}`);
    console.log(`Nicht in Datenbank gefunden: ${notFoundInDatabase}`);
    console.log(`Mit inkorrekten Daten: ${incorrectData}`);
    
    if (missingEntries.length > 0) {
      console.log(`\n⚠️  FEHLENDE EINTRÄGE (${missingEntries.length}):`);
      missingEntries.forEach((entry, index) => {
        console.log(`\n${index + 1}. Kunde: ${entry.kunde}`);
        console.log(`   Angefragte Leistung: ${entry.angefragteLeistung}`);
        if (entry.oppId) console.log(`   Opp-ID: ${entry.oppId}`);
        if (entry.leadVertrieb) console.log(`   Lead Vertrieb: ${entry.leadVertrieb}`);
        if (entry.fachlicherLead) console.log(`   Fachlicher Lead: ${entry.fachlicherLead}`);
        if (entry.oppPartner) console.log(`   Opp Partner: ${entry.oppPartner}`);
        if (entry.status) console.log(`   Status: ${entry.status}`);
        if (entry.art) console.log(`   Art: ${entry.art}`);
        if (entry.nummer) console.log(`   Nummer: ${entry.nummer}`);
      });
    }
    
    if (incorrectEntries.length > 0) {
      console.log(`\n⚠️  EINTRÄGE MIT INKORREKTEN DATEN (${incorrectEntries.length}):`);
      incorrectEntries.forEach((entry, index) => {
        console.log(`\n${index + 1}. Tender: "${entry.tenderTitle}" (ID: ${entry.tenderId})`);
        console.log(`   Kunde: ${entry.kunde}`);
        console.log(`   Angefragte Leistung: ${entry.angefragteLeistung}`);
        console.log(`   Inkonsistenzen:`);
        entry.inconsistencies.forEach(inc => {
          console.log(`     - ${inc}`);
        });
      });
    }
    
    if (missingEntries.length === 0 && incorrectEntries.length === 0) {
      console.log(`\n✅ Alle Excel-Einträge sind korrekt in der Datenbank vorhanden!`);
    }
    
  } catch (error) {
    console.error('Fehler beim Vergleichen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

compareExcelWithDatabase(); 