const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function addMissingEmployeeProfiles() {
  try {
    console.log('👥 Füge fehlende Mitarbeiterprofile zu Tenders hinzu...');
    
    // Read the Excel file
    const xlsx = require("xlsx");
    const mainFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const mainWorkbook = xlsx.readFile(mainFile);
    const mainSheetName = "Vertriebsliste";
    const mainSheet = mainWorkbook.Sheets[mainSheetName];
    const mainJson = xlsx.utils.sheet_to_json(mainSheet, { defval: null, range: 2 });
    
    console.log(`Excel-Daten geladen: ${mainJson.length} Zeilen`);
    
    // Get all existing employees with 3-letter pseudonyms
    const existingEmployees = await prisma.employee.findMany();
    
    // Create a set of valid 3-letter pseudonyms + SDZI exception
    const validPseudonyms = new Set();
    for (const emp of existingEmployees) {
      if (emp.foreName && emp.foreName.length === 3 && /^[A-Z]{3}$/.test(emp.foreName)) {
        validPseudonyms.add(emp.foreName);
      }
      // Special exception for SDZI (4 letters)
      if (emp.foreName === "SDZI") {
        validPseudonyms.add(emp.foreName);
      }
    }
    
    console.log(`Gültige 3-Buchstaben-Pseudonyme gefunden: ${validPseudonyms.size}`);
    console.log(`Beispiele: ${Array.from(validPseudonyms).slice(0, 10).join(', ')}`);
    
    // Get all tenders from database
    const allTenders = await prisma.callToTender.findMany({
      include: {
        employees: {
          include: {
            employee: true
          }
        }
      }
    });
    
    console.log(`Tender in Datenbank: ${allTenders.length}`);
    
    let updatedCount = 0;
    let addedCount = 0;
    let skippedCount = 0;
    
    // Process each Excel row
    for (const row of mainJson) {
      if (!row["#"] || row["#"] === "n/a") continue;
      
      const tenderNumber = row["#"].toString();
      const oppPartner = row["Opp Partner"];
      const vertriebslead = row["Vertriebslead (VL)"];
      const fachverantwortlicher = row["Fachverantwortlicher"];
      
      // Find matching tender by title or notes
      let matchingTender = null;
      
      // Try to find by title first
      if (row["Angefragte Leistung"]) {
        matchingTender = allTenders.find(t => 
          t.title === row["Angefragte Leistung"] || 
          t.shortDescription === row["Angefragte Leistung"]
        );
      }
      
      // If not found by title, try by customer name
      if (!matchingTender && row["Kunde"]) {
        const customerOrganisations = await prisma.callToTenderOrganisation.findMany({
          where: {
            organisation: {
              name: row["Kunde"]
            }
          },
          include: {
            callToTender: {
              include: {
                employees: {
                  include: {
                    employee: true
                  }
                }
              }
            }
          }
        });
        
        if (customerOrganisations.length > 0) {
          matchingTender = customerOrganisations[0].callToTender;
        }
      }
      
      if (!matchingTender) {
        console.log(`⚠️  Kein passender Tender gefunden für Excel-Zeile ${tenderNumber}`);
        continue;
      }
      
      console.log(`📋 Verarbeite Tender: "${matchingTender.title}" (Excel #${tenderNumber})`);
      
      // Add employees based on Excel data - only if they have valid 3-letter pseudonyms
      const employeesToAdd = [];
      
      if (oppPartner && oppPartner !== "nan" && oppPartner.trim() !== "") {
        const cleanOppPartner = oppPartner.trim().toUpperCase();
        if (validPseudonyms.has(cleanOppPartner)) {
          employeesToAdd.push({
            pseudonym: cleanOppPartner,
            role: "Opp Partner"
          });
        } else {
          console.log(`⏭️  Überspringe "${cleanOppPartner}" - kein gültiges 3-Buchstaben-Pseudonym (außer SDZI)`);
          skippedCount++;
        }
      }
      
      if (vertriebslead && vertriebslead !== "nan" && vertriebslead.trim() !== "") {
        const cleanVertriebslead = vertriebslead.trim().toUpperCase();
        if (validPseudonyms.has(cleanVertriebslead)) {
          employeesToAdd.push({
            pseudonym: cleanVertriebslead,
            role: "Vertriebslead (VL)"
          });
        } else {
          console.log(`⏭️  Überspringe "${cleanVertriebslead}" - kein gültiges 3-Buchstaben-Pseudonym (außer SDZI)`);
          skippedCount++;
        }
      }
      
      if (fachverantwortlicher && fachverantwortlicher !== "nan" && fachverantwortlicher.trim() !== "") {
        const cleanFachverantwortlicher = fachverantwortlicher.trim().toUpperCase();
        if (validPseudonyms.has(cleanFachverantwortlicher)) {
          employeesToAdd.push({
            pseudonym: cleanFachverantwortlicher,
            role: "Fachverantwortlicher"
          });
        } else {
          console.log(`⏭️  Überspringe "${cleanFachverantwortlicher}" - kein gültiges 3-Buchstaben-Pseudonym (außer SDZI)`);
          skippedCount++;
        }
      }
      
      // Check which employees are already assigned
      const existingAssignedEmployees = matchingTender.employees.map(e => ({
        pseudonym: e.employee.foreName,
        role: e.employeeCallToTenderRole
      }));
      
      // Add missing employees
      for (const employeeToAdd of employeesToAdd) {
        const alreadyExists = existingAssignedEmployees.some(e => 
          e.pseudonym === employeeToAdd.pseudonym && e.role === employeeToAdd.role
        );
        
        if (!alreadyExists) {
          // Find the existing employee
          const employee = await prisma.employee.findFirst({
            where: { foreName: employeeToAdd.pseudonym }
          });
          
          if (employee) {
            // Add employee to tender
            await prisma.callToTenderEmployee.create({
              data: {
                callToTender: { connect: { id: matchingTender.id } },
                employee: { connect: { id: employee.id } },
                employeeCallToTenderRole: employeeToAdd.role
              }
            });
            
            console.log(`✅ Mitarbeiter hinzugefügt: ${employeeToAdd.pseudonym} als ${employeeToAdd.role}`);
            addedCount++;
          }
        }
      }
      
      updatedCount++;
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Verarbeitete Tender: ${updatedCount}`);
    console.log(`Mitarbeiter hinzugefügt: ${addedCount}`);
    console.log(`Übersprungene ungültige Pseudonyme: ${skippedCount}`);
    
    // Final statistics
    const finalEmployeeCount = await prisma.callToTenderEmployee.count();
    const finalEmployeeAssignments = await prisma.callToTenderEmployee.groupBy({
      by: ['callToTenderId'],
      _count: { callToTenderId: true }
    });
    
    console.log(`\n=== FINALE STATISTIKEN ===`);
    console.log(`Gesamte Mitarbeiter-Zuweisungen: ${finalEmployeeCount}`);
    console.log(`Tender mit Mitarbeitern: ${finalEmployeeAssignments.length}`);
    console.log(`Tender ohne Mitarbeiter: ${allTenders.length - finalEmployeeAssignments.length}`);
    
    console.log(`\n🎉 Mitarbeiterprofile erfolgreich hinzugefügt!`);
    
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Mitarbeiterprofile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingEmployeeProfiles(); 