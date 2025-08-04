const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
require("dotenv").config();

const prisma = new PrismaClient();

async function addEmployeesToTenders() {
  try {
    console.log('Füge Mitarbeiter zu Ausschreibungen hinzu...');
    
    // Read the tender file
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    const sheetName = "Vertriebsliste";

    if (!workbook.SheetNames.includes(sheetName)) {
      console.log(`Tabellenblatt "${sheetName}" nicht gefunden.`);
      return;
    }

    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Anzahl Zeilen im Tabellenblatt "Vertriebsliste": ${sheetJson.length}`);
    
    // Get all employees for mapping
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        foreName: true,
        lastName: true,
        pseudonym: true
      }
    });
    
    // Create a map of employee names/pseudonyms to employee IDs
    const employeeMap = new Map();
    employees.forEach(emp => {
      const fullName = `${emp.foreName} ${emp.lastName}`.trim();
      const pseudonym = emp.pseudonym ? emp.pseudonym.trim() : '';
      
      // Map by full name
      employeeMap.set(fullName, emp.id);
      // Map by pseudonym
      if (pseudonym) {
        employeeMap.set(pseudonym, emp.id);
      }
      // Map by last name only
      employeeMap.set(emp.lastName.trim(), emp.id);
    });
    
    console.log(`Employee map created with ${employeeMap.size} entries`);
    
    let processedCount = 0;
    let addedCount = 0;
    
    for (const row of sheetJson) {
      try {
        // Find the tender by Opp-ID or title
        let tender = null;
        
        if (row["Opp-ID"] && row["Opp-ID"] !== "n/a") {
          tender = await prisma.callToTender.findFirst({
            where: {
              shortDescription: row["Opp-ID"].toString().trim()
            }
          });
        }
        
        // If not found by Opp-ID, try by title
        if (!tender && row["Angefragte Leistung"]) {
          tender = await prisma.callToTender.findFirst({
            where: {
              notes: row["Angefragte Leistung"].toString().trim()
            }
          });
        }
        
        if (!tender) {
          console.log(`Tender nicht gefunden für: ${row["Opp-ID"] || row["Angefragte Leistung"]}`);
          continue;
        }
        
        // Check if employees are already assigned
        const existingEmployees = await prisma.callToTenderEmployee.findMany({
          where: {
            callToTenderId: tender.id
          }
        });
        
        if (existingEmployees.length > 0) {
          console.log(`Tender "${tender.title}" hat bereits ${existingEmployees.length} Mitarbeiter, überspringe...`);
          continue;
        }
        
        // Add Opp Partner
        if (row["Opp Partner"] && row["Opp Partner"] !== "n/a" && row["Opp Partner"] !== "tbd") {
          const oppPartnerNames = row["Opp Partner"].toString().split(/[,/]/).map(name => name.trim());
          
          for (const name of oppPartnerNames) {
            const employeeId = employeeMap.get(name);
            if (employeeId) {
              await prisma.callToTenderEmployee.create({
                data: {
                  employeeId: employeeId,
                  callToTenderId: tender.id,
                  employeeCallToTenderRole: "Opp Partner",
                  role: "Opp Partner",
                  description: `Opp Partner für ${tender.title}`
                }
              });
              console.log(`Hinzugefügt: ${name} als Opp Partner zu "${tender.title}"`);
              addedCount++;
            } else {
              console.log(`Mitarbeiter nicht gefunden: ${name} (Opp Partner)`);
            }
          }
        }
        
        // Add Fachlicher Lead
        if (row["Fachlicher Lead"] && row["Fachlicher Lead"] !== "n/a" && row["Fachlicher Lead"] !== "tbd") {
          const fachlicherLeadNames = row["Fachlicher Lead"].toString().split(/[,/]/).map(name => name.trim());
          
          for (const name of fachlicherLeadNames) {
            const employeeId = employeeMap.get(name);
            if (employeeId) {
              await prisma.callToTenderEmployee.create({
                data: {
                  employeeId: employeeId,
                  callToTenderId: tender.id,
                  employeeCallToTenderRole: "Fachlicher Lead",
                  role: "Fachlicher Lead",
                  description: `Fachlicher Lead für ${tender.title}`
                }
              });
              console.log(`Hinzugefügt: ${name} als Fachlicher Lead zu "${tender.title}"`);
              addedCount++;
            } else {
              console.log(`Mitarbeiter nicht gefunden: ${name} (Fachlicher Lead)`);
            }
          }
        }
        
        // Add Lead Vertrieb
        if (row["Lead Vertrieb"] && row["Lead Vertrieb"] !== "n/a" && row["Lead Vertrieb"] !== "tbd") {
          const vertriebLeadNames = row["Lead Vertrieb"].toString().split(/[,/]/).map(name => name.trim());
          
          for (const name of vertriebLeadNames) {
            const employeeId = employeeMap.get(name);
            if (employeeId) {
              await prisma.callToTenderEmployee.create({
                data: {
                  employeeId: employeeId,
                  callToTenderId: tender.id,
                  employeeCallToTenderRole: "Lead Vertrieb",
                  role: "Lead Vertrieb",
                  description: `Lead Vertrieb für ${tender.title}`
                }
              });
              console.log(`Hinzugefügt: ${name} als Lead Vertrieb zu "${tender.title}"`);
              addedCount++;
            } else {
              console.log(`Mitarbeiter nicht gefunden: ${name} (Lead Vertrieb)`);
            }
          }
        }
        
        processedCount++;
        
      } catch (error) {
        console.log(`Fehler bei Zeile: ${error.message}`);
      }
    }
    
    console.log(`\nVerarbeitung abgeschlossen!`);
    console.log(`Verarbeitete Zeilen: ${processedCount}`);
    console.log(`Hinzugefügte Mitarbeiter-Beziehungen: ${addedCount}`);
    
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Mitarbeiter:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEmployeesToTenders(); 