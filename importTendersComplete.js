const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

function excelDateToJSDate(excelDate) {
  if (!excelDate || excelDate === "n/a" || excelDate === "tbd") return null;
  
  try {
    // If it's already a number (Excel date), convert it
    if (typeof excelDate === 'number') {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date;
    }
    
    // If it's a string, try to parse it
    if (typeof excelDate === 'string') {
      const date = new Date(excelDate);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

function mapStatus(status, art) {
  if (!status) return null;
  
  const statusStr = status.toString().trim();
  
  // Special handling for "20 In Erstellung"
  if (statusStr === "20 In Erstellung") {
    if (art && art.toString().trim() === "TNA") {
      return "In Erstellung TNA";
    } else {
      return "In Erstellung Angebot";
    }
  }
  
  // Map other statuses
  const statusMap = {
    "10 Präqualifizierung": "Präqualifizierung",
    "30 Nicht angeboten": "Nicht angeboten",
    "40 Anderer im Lead": "Anderer im Lead",
    "50 Angebotsphase": "Angebotsphase",
    "60 Verhandlungsphase": "Verhandlungsphase",
    "70 Gewonnen": "Gewonnen",
    "80 Verloren": "Verloren"
  };
  
  return statusMap[statusStr] || statusStr;
}

async function findOrCreateOrganisation(organisationName) {
  if (!organisationName) return null;
  
  const name = organisationName.toString().trim();
  if (!name || name === "n/a" || name === "tbd") return null;
  
  let organisation = await prisma.organisation.findFirst({
    where: { name: name }
  });
  
  if (!organisation) {
    organisation = await prisma.organisation.create({
      data: {
        name: name,
        abbreviation: name.substring(0, 3).toUpperCase()
      }
    });
  }
  
  return organisation;
}

async function findOrCreateOrganisationRole(roleName) {
  if (!roleName) return null;
  
  const role = roleName.toString().trim();
  if (!role || role === "n/a" || role === "tbd") return null;
  
  let organisationRole = await prisma.organisationRole.findFirst({
    where: { role: role }
  });
  
  if (!organisationRole) {
    organisationRole = await prisma.organisationRole.create({
      data: { role: role }
    });
  }
  
  return organisationRole;
}

async function findEmployeeByPseudonym(pseudonym) {
  if (!pseudonym) return null;
  
  const pseudo = pseudonym.toString().trim();
  if (!pseudo || pseudo === "n/a" || pseudo === "tbd" || pseudo === "?" || pseudo.includes("?")) return null;
  
  // Only accept 3-letter pseudonyms
  if (pseudo.length !== 3) return null;
  
  const employee = await prisma.employee.findFirst({
    where: { pseudonym: pseudo }
  });
  
  return employee;
}

async function importTenders() {
  try {
    console.log("Starte Import aller Ausschreibungen...");
    
    // Read title mapping file
    const titleWorkbook = xlsx.readFile('tenders/Copy of Vertrieb_mit_laengeren_Titeln.xlsx');
    const titleSheet = titleWorkbook.Sheets[titleWorkbook.SheetNames[0]];
    const titleData = xlsx.utils.sheet_to_json(titleSheet, { header: 1 });
    
    // Create title map
    const titleMap = new Map();
    for (let i = 1; i < titleData.length; i++) {
      const row = titleData[i];
      if (row && row.length >= 6) {
        const number = row[0]; // # column (index 0)
        const customerName = row[3]; // Kunde column (index 3)
        const title = row[5]; // Titel column (index 5)
        if (customerName && title && title !== 'nan') {
          // Create key with customer name + number
          const key = `${customerName.toString().trim()}_${number ? number.toString().trim() : ''}`;
          titleMap.set(key, title.toString().trim());
          // Also store just customer name as fallback
          titleMap.set(customerName.toString().trim(), title.toString().trim());
        }
      }
    }
    
    console.log(`Title map created with ${titleMap.size} entries`);
    
    // Read main Excel file
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    const sheetName = "Vertriebsliste";
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Anzahl Zeilen im Tabellenblatt "Vertriebsliste": ${sheetJson.length}`);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const obj of sheetJson) {
      try {
        if (!obj["Angefragte Leistung"] || obj["Angefragte Leistung"] === "n/a") {
          skippedCount++;
          continue;
        }
        
        // Find or create organisation
        const organisation = await findOrCreateOrganisation(obj["Kunde"]);
        if (!organisation) {
          console.log(`Skipping tender without organisation: ${obj["Angefragte Leistung"]}`);
          skippedCount++;
          continue;
        }
        
        // Find or create organisation role
        const organisationRole = await findOrCreateOrganisationRole("Client");
        
        // Determine title
        let title = obj["Angefragte Leistung"] ? obj["Angefragte Leistung"].toString().trim() : "Untitled Tender";
        if (obj["Kunde"]) {
          const customerName = obj["Kunde"].toString().trim();
          const number = obj["#"] ? obj["#"].toString().trim() : "";
          const keyWithNumber = `${customerName}_${number}`;
          let betterTitle = titleMap.get(keyWithNumber);
          if (!betterTitle) {
            betterTitle = titleMap.get(customerName);
          }
          if (betterTitle) {
            title = betterTitle;
          }
        }
        
        // Create tender data
        const data = {
          title: title,
          type: obj["Art"] ? obj["Art"].toString() : undefined,
          shortDescription: obj["Opp-ID"] ? obj["Opp-ID"].toString().trim() : undefined,
          notes: obj["Angefragte Leistung"] ? obj["Angefragte Leistung"].toString().trim() : undefined,
          status: mapStatus(obj["Status"], obj["Art"]),
          volumeEuro: obj["Volumen"] ? parseFloat(obj["Volumen"]) * 1000 : undefined,
          offerDeadline: excelDateToJSDate(obj["Angebotsfrist"]),
          questionDeadline: excelDateToJSDate(obj["Fragefrist"]),
          bindingDeadline: excelDateToJSDate(obj["Bindefrist"]),
          successChance: obj["Erfolgswahrscheinlichkeit"] ? parseFloat(obj["Erfolgswahrscheinlichkeit"]) : undefined,
          firstContactDate: excelDateToJSDate(obj["Erstkontakt"]),
        };
        
        // Create tender
        const tender = await prisma.callToTender.create({
          data: data
        });
        
        // Link organisation
        if (organisation && organisationRole) {
          await prisma.callToTenderOrganisation.create({
            data: {
              organisationIDs: organisation.id,
              callToTenderIDs: tender.id,
              organisationRoleID: organisationRole.id
            }
          });
        }
        
        // Add employees (only 3-letter pseudonyms)
        const employeeRoles = {
          "Opp Partner": obj["Opp Partner"],
          "Fachlicher Lead": obj["Fachlicher Lead"],
          "Lead Vertrieb": obj["Lead Vertrieb"]
        };
        
        for (const [roleName, excelValue] of Object.entries(employeeRoles)) {
          if (excelValue && excelValue !== "n/a" && excelValue !== "tbd") {
            const names = excelValue.toString().split(/[,/]/).map(name => name.trim());
            for (const name of names) {
              const employee = await findEmployeeByPseudonym(name);
              if (employee) {
                await prisma.callToTenderEmployee.create({
                  data: {
                    employeeId: employee.id,
                    callToTenderId: tender.id,
                    employeeCallToTenderRole: roleName,
                    role: roleName,
                    description: `${roleName} für ${tender.title}`
                  }
                });
                console.log(`  - Mitarbeiter hinzugefügt: ${employee.pseudonym} als ${roleName}`);
              }
            }
          }
        }
        
        console.log(`✅ Importiert: ${title}`);
        importedCount++;
        
      } catch (error) {
        console.log(`❌ Fehler bei: ${obj["Angefragte Leistung"]} - ${error.message}`);
        skippedCount++;
      }
    }
    
    console.log(`\nImport abgeschlossen!`);
    console.log(`Importierte Ausschreibungen: ${importedCount}`);
    console.log(`Übersprungene Einträge: ${skippedCount}`);
    
  } catch (error) {
    console.error("Import failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importTenders(); 