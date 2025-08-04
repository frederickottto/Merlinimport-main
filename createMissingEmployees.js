const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

// Helper function to extract 3-letter pseudonyms from text
function extractThreeLetterPseudonyms(text) {
  if (!text || text === "n/a" || text === "nan") return [];
  
  const pseudonyms = [];
  const words = text.toString().split(/[,\s\/]+/);
  
  for (const word of words) {
    const cleanWord = word.trim().toUpperCase();
    // Check if it's exactly 3 letters and all uppercase
    if (cleanWord.length === 3 && /^[A-Z]{3}$/.test(cleanWord)) {
      pseudonyms.push(cleanWord);
    }
  }
  
  return [...new Set(pseudonyms)]; // Remove duplicates
}

// Helper function to find or create employee by pseudonym
async function findOrCreateEmployee(pseudonym) {
  if (!pseudonym) return null;
  
  const cleanPseudonym = pseudonym.toString().trim().toUpperCase();
  
  // Try to find existing employee
  let employee = await prisma.employee.findFirst({
    where: {
      pseudonym: cleanPseudonym
    }
  });
  
  // If not found, create new one
  if (!employee) {
    employee = await prisma.employee.create({
      data: {
        pseudonym: cleanPseudonym,
        foreName: cleanPseudonym,
        lastName: cleanPseudonym
      }
    });
    console.log(`✅ Neuer Mitarbeiter erstellt: ${cleanPseudonym}`);
  }
  
  return employee;
}

async function createMissingEmployees() {
  try {
    console.log('🚀 Erstelle fehlende Mitarbeiter-Profile...');
    
    // Read main tender file
    const mainFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const mainWorkbook = xlsx.readFile(mainFile);
    
    const mainSheetName = "Vertriebsliste";
    const mainSheet = mainWorkbook.Sheets[mainSheetName];
    const mainJson = xlsx.utils.sheet_to_json(mainSheet, { defval: null, range: 2 });
    
    console.log(`Excel-Zeilen gelesen: ${mainJson.length}`);
    
    const allPseudonyms = new Set();
    const employeeFields = ["Opp Partner", "Vertriebslead (VL)", "Fachverantwortlicher"];
    
    // Extract all 3-letter pseudonyms from employee fields
    for (const row of mainJson) {
      for (const field of employeeFields) {
        const value = row[field];
        if (value && value !== "n/a" && value !== "nan") {
          const pseudonyms = extractThreeLetterPseudonyms(value);
          pseudonyms.forEach(p => allPseudonyms.add(p));
        }
      }
    }
    
    console.log(`Gefundene 3-Buchstaben-Pseudonyme: ${allPseudonyms.size}`);
    console.log('Pseudonyme:', Array.from(allPseudonyms).sort());
    
    // Create employees for all pseudonyms
    let createdCount = 0;
    for (const pseudonym of allPseudonyms) {
      await findOrCreateEmployee(pseudonym);
      createdCount++;
    }
    
    console.log(`\n✅ ${createdCount} Mitarbeiter-Profile erstellt/überprüft`);
    
    // Now update all tenders with the new employees
    console.log('\n🔄 Aktualisiere Tender mit neuen Mitarbeitern...');
    
    let updatedTenders = 0;
    let updatedAssignments = 0;
    
    for (const row of mainJson) {
      try {
        if (!row["#"] || !row["Kunde"] || row["#"] === "n/a" || row["Kunde"] === "n/a") {
          continue;
        }
        
        const tenderNumber = row["#"];
        const customerName = row["Kunde"].toString().trim();
        
        // Find the tender by matching customer name and title/notes
        const tender = await prisma.callToTender.findFirst({
          where: {
            OR: [
              { title: { contains: customerName } },
              { notes: { contains: customerName } },
              { shortDescription: { contains: customerName } }
            ]
          },
          include: {
            employees: true
          }
        });
        
        if (!tender) {
          console.log(`⚠️  Tender nicht gefunden für: ${customerName} (${tenderNumber})`);
          continue;
        }
        
        // Process each employee field
        for (const employeeField of employeeFields) {
          const value = row[employeeField];
          if (value && value !== "n/a" && value !== "nan") {
            const pseudonyms = extractThreeLetterPseudonyms(value);
            
            for (const pseudonym of pseudonyms) {
              const employee = await findOrCreateEmployee(pseudonym);
              if (employee) {
                // Check if assignment already exists
                const existingAssignment = await prisma.callToTenderEmployee.findFirst({
                  where: {
                    callToTenderId: tender.id,
                    employeeId: employee.id,
                    employeeCallToTenderRole: employeeField === "Vertriebslead (VL)" ? "Leadsvertrieb (VL)" : employeeField
                  }
                });
                
                if (!existingAssignment) {
                  await prisma.callToTenderEmployee.create({
                    data: {
                      callToTenderId: tender.id,
                      employeeId: employee.id,
                      employeeCallToTenderRole: employeeField === "Vertriebslead (VL)" ? "Leadsvertrieb (VL)" : employeeField
                    }
                  });
                  updatedAssignments++;
                }
              }
            }
          }
        }
        
        updatedTenders++;
        if (updatedTenders % 50 === 0) {
          console.log(`📊 Fortschritt: ${updatedTenders} Tender aktualisiert...`);
        }
        
      } catch (error) {
        console.error(`❌ Fehler bei Tender ${row["#"]}:`, error.message);
      }
    }
    
    console.log('\n=== AKTUALISIERUNG ZUSAMMENFASSUNG ===');
    console.log(`✅ Mitarbeiter-Profile erstellt: ${createdCount}`);
    console.log(`🔄 Tender aktualisiert: ${updatedTenders}`);
    console.log(`👥 Neue Mitarbeiter-Zuweisungen: ${updatedAssignments}`);
    
    // Final verification
    const totalEmployees = await prisma.employee.count();
    const totalAssignments = await prisma.callToTenderEmployee.count();
    
    console.log('\n=== VERIFIZIERUNG ===');
    console.log(`Mitarbeiter in Datenbank: ${totalEmployees}`);
    console.log(`Mitarbeiter-Zuweisungen: ${totalAssignments}`);
    
    console.log('\n🎉 Aktualisierung abgeschlossen!');
    
  } catch (error) {
    console.error('Fehler bei der Aktualisierung:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingEmployees(); 