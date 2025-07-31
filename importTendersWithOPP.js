const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();
const tendersFile = path.join(__dirname, "tenders", "Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx");

function excelDateToJSDate(excelDate) {
  if (typeof excelDate !== 'number' || excelDate < 1) {
    return undefined;
  }
  return new Date(Math.round((excelDate - 25569) * 86400 * 1000));
}

function mapStatus(rawStatus) {
  if (!rawStatus) return undefined;
  const statusStr = rawStatus.toString();
  
  console.log(`Mapping status: "${statusStr}"`);

  if (statusStr.includes("41 Gewonnen")) return "gewonnen";
  if (statusStr.includes("00 Warten auf Veröffentlichung")) return "";
  if (statusStr.includes("01 Lead")) return "";
  if (statusStr.includes("02 Präqualifizierung")) return "Präqualifizierung";
  if (statusStr.includes("10 Nicht angeboten")) return "nicht angeboten";
  if (statusStr.includes("20 In Erstellung")) return "in Erstellung";
  if (statusStr.includes("In Erstellung")) return "in Erstellung";
  if (statusStr.includes("30 Versendet")) return "versendet";
  if (statusStr.includes("42 Verloren")) return "verloren";
  if (statusStr.includes("43 Declined")) return "verloren";
  if (statusStr.startsWith("90") || statusStr.startsWith("91") || statusStr.startsWith("93") || statusStr.startsWith("94")) {
    return "Anderer im Lead";
  }

  return ""; // Default fallback
}

// Helper function to find or create employee
async function findOrCreateEmployee(employeeName) {
  if (!employeeName) return null;
  
  const nameStr = employeeName.toString().trim();
  if (!nameStr) return null;
  
  // Try to find existing employee by name
  let employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { foreName: { contains: nameStr, mode: 'insensitive' } },
        { lastName: { contains: nameStr, mode: 'insensitive' } },
        { pseudonym: { contains: nameStr, mode: 'insensitive' } }
      ]
    }
  });
  
  if (!employee) {
    // Create a new employee with the name as pseudonym
    employee = await prisma.employee.create({
      data: {
        foreName: nameStr,
        lastName: '',
        pseudonym: nameStr
      }
    });
    console.log(`Created new employee: ${nameStr}`);
  }
  
  return employee;
}

// Helper function to find or create organisation
async function findOrCreateOrganisation(orgName) {
  if (!orgName) return null;
  
  const nameStr = orgName.toString().trim();
  if (!nameStr) return null;
  
  // Try to find existing organisation
  let organisation = await prisma.organisation.findFirst({
    where: { name: { contains: nameStr, mode: 'insensitive' } }
  });
  
  if (!organisation) {
    // Create new organisation
    try {
      organisation = await prisma.organisation.create({
        data: { name: nameStr }
      });
      console.log(`Created new organisation: ${nameStr}`);
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint failed, try to find again
        organisation = await prisma.organisation.findFirst({
          where: { name: { contains: nameStr, mode: 'insensitive' } }
        });
        console.log(`Found existing organisation: ${nameStr}`);
      } else {
        throw error;
      }
    }
  }
  
  return organisation;
}

// Helper function to find or create organisation role
async function findOrCreateOrganisationRole(roleName) {
  if (!roleName) return null;
  
  const nameStr = roleName.toString().trim();
  if (!nameStr) return null;
  
  // Try to find existing organisation role
  let organisationRole = await prisma.organisationRole.findFirst({
    where: { role: { contains: nameStr, mode: 'insensitive' } }
  });
  
  if (!organisationRole) {
    // Create new organisation role
    organisationRole = await prisma.organisationRole.create({
      data: { role: nameStr }
    });
    console.log(`Created new organisation role: ${nameStr}`);
  }
  
  return organisationRole;
}

async function importTenders() {
  const workbook = xlsx.readFile(tendersFile);
  const sheetName = "Vertriebsliste";

  if (!workbook.SheetNames.includes(sheetName)) {
    console.log(`Tabellenblatt "${sheetName}" nicht gefunden.`);
    return;
  }

  const sheet = workbook.Sheets[sheetName];
  const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
  console.log(`Anzahl Zeilen im Tabellenblatt "Vertriebsliste": ${sheetJson.length}`);

  let importCount = 0;
  const targetRow = 372; // Excel row number (1-based, but we start from row 2, so this is actually row 371 in the data)
  const targetRowIndex = targetRow - 2; // Convert to 0-based index

  for (let i = 0; i < sheetJson.length; i++) {
    const obj = sheetJson[i];
    
    // Only process the target row
    if (i !== targetRowIndex) {
      continue;
    }

    if (!obj["Angefragte Leistung"] || obj["Angefragte Leistung"].toString().trim() === "") {
      continue;
    }

    console.log(`\n--- Processing Excel Row ${targetRow} (ID 402) ---`);
    console.log(`Kunde: ${obj["Kunde"]}`);
    console.log(`Angefragte Leistung: ${obj["Angefragte Leistung"]}`);
    console.log(`OPP Partner: ${obj["Opp Partner"]}`);

    const data = {
      title: obj["Angefragte Leistung"] ? obj["Angefragte Leistung"].toString().trim() : "Unbenannter Kunde",
      type: obj["Art"] ? obj["Art"].toString() : undefined,
      shortDescription: obj["Angefragte Leistung"] ? obj["Angefragte Leistung"].toString().trim() : undefined,
      status: mapStatus(obj["Status"]),
      offerDeadline: excelDateToJSDate(obj["Abgabefrist"]),
      questionDeadline: excelDateToJSDate(obj["Fragefrist"]),
      volumeEuro: obj["ToV in 1.000"] ? Number(String(obj["ToV in 1.000"]).replace(/[^0-9,.]/g, '').replace(',', '.')) * 1000 : undefined,
      websiteTenderPlattform: obj["Link Angebotsunterlagen"] ? obj["Link Angebotsunterlagen"].toString() : undefined,
      bindingDeadline: excelDateToJSDate(obj["Bindefrist"]),
      notes: obj["Anmerkungen"] ? `Anmerkungen: ${obj["Anmerkungen"]}` : undefined,
      awardCriteria: obj["Zuschlagsfrist"] ? excelDateToJSDate(obj["Zuschlagsfrist"])?.toString() : undefined,
      volumePT: obj["PoW"] ? Number(String(obj["PoW"]).replace(/[^0-9,.]/g, '').replace(',', '.')) : undefined,
      successChance: obj["Must win?"] === "Ja" ? 80 : 50, // Default success chance
      keywords: obj["Markt"] ? [obj["Markt"].toString()] : [],
    };

    const existingTender = await prisma.callToTender.findFirst({
      where: { title: data.title },
    });

    let tender;
    if (existingTender) {
      tender = await prisma.callToTender.update({
        where: { id: existingTender.id },
        data: data,
      });
      console.log("Updated existing tender:", data.title);
    } else {
      tender = await prisma.callToTender.create({
        data: data,
      });
      console.log("Created new tender:", data.title);
    }

    // Handle OPP Partner (Employee)
    if (obj["Opp Partner"]) {
      const oppPartner = await findOrCreateEmployee(obj["Opp Partner"]);
      if (oppPartner) {
        // Check if relationship already exists
        const existingRelationship = await prisma.callToTenderEmployee.findFirst({
          where: {
            callToTenderId: tender.id,
            employeeId: oppPartner.id,
            employeeCallToTenderRole: "OPP Partner"
          }
        });

        if (!existingRelationship) {
          await prisma.callToTenderEmployee.create({
            data: {
              callToTenderId: tender.id,
              employeeId: oppPartner.id,
              employeeCallToTenderRole: "OPP Partner"
            }
          });
          console.log(`Added OPP Partner: ${oppPartner.foreName}`);
        }
      }
    }

    // Handle Fachlicher Lead (Employee) - Map to "Fachverantwortung"
    if (obj["Fachlicher Lead"]) {
      const fachlicherLead = await findOrCreateEmployee(obj["Fachlicher Lead"]);
      if (fachlicherLead) {
        const existingRelationship = await prisma.callToTenderEmployee.findFirst({
          where: {
            callToTenderId: tender.id,
            employeeId: fachlicherLead.id,
            employeeCallToTenderRole: "Fachverantwortung"
          }
        });

        if (!existingRelationship) {
          await prisma.callToTenderEmployee.create({
            data: {
              callToTenderId: tender.id,
              employeeId: fachlicherLead.id,
              employeeCallToTenderRole: "Fachverantwortung"
            }
          });
          console.log(`Added Fachverantwortung: ${fachlicherLead.foreName}`);
        }
      }
    }

    // Handle Lead Vertrieb (Employee) - Map to "Vertriebslead (VL)"
    if (obj["Lead Vertrieb"]) {
      const leadVertrieb = await findOrCreateEmployee(obj["Lead Vertrieb"]);
      if (leadVertrieb) {
        const existingRelationship = await prisma.callToTenderEmployee.findFirst({
          where: {
            callToTenderId: tender.id,
            employeeId: leadVertrieb.id,
            employeeCallToTenderRole: "Vertriebslead (VL)"
          }
        });

        if (!existingRelationship) {
          await prisma.callToTenderEmployee.create({
            data: {
              callToTenderId: tender.id,
              employeeId: leadVertrieb.id,
              employeeCallToTenderRole: "Vertriebslead (VL)"
            }
          });
          console.log(`Added Vertriebslead (VL): ${leadVertrieb.foreName}`);
        }
      }
    }

    // Handle Organisation (if Kunde is different from existing organisations)
    if (obj["Kunde"]) {
      const organisation = await findOrCreateOrganisation(obj["Kunde"]);
      if (organisation) {
        // Create or find a default role for the customer
        const organisationRole = await findOrCreateOrganisationRole("Kunde");
        
        const existingRelationship = await prisma.callToTenderOrganisation.findFirst({
          where: {
            callToTenderIDs: tender.id,
            organisationIDs: organisation.id
          }
        });

        if (!existingRelationship) {
          await prisma.callToTenderOrganisation.create({
            data: {
              callToTenderIDs: tender.id,
              organisationIDs: organisation.id,
              organisationRoleID: organisationRole.id
            }
          });
          console.log(`Added Organisation: ${organisation.name} with role: ${organisationRole.role}`);
        }
      }
    }

        importCount++;
    console.log(`\nImport abgeschlossen. ${importCount} Einträge verarbeitet.`);
    break; // Exit after processing the target row
  }
  await prisma.$disconnect();
}

importTenders(); 