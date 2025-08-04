const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();
const tendersFile = path.join(__dirname, "tenders", "Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx");

// Helper function to find or create organisation
async function findOrCreateOrganisation(organisationName) {
  if (!organisationName) return null;
  
  let organisation = await prisma.organisation.findFirst({
    where: { name: organisationName }
  });
  
  if (!organisation) {
    organisation = await prisma.organisation.create({
      data: {
        name: organisationName,
        abbreviation: organisationName.substring(0, 3).toUpperCase()
      }
    });
  }
  
  return organisation;
}

// Helper function to find or create organisation role
async function findOrCreateOrganisationRole(roleName) {
  if (!roleName) return null;
  
  let role = await prisma.organisationRole.findFirst({
    where: { role: roleName }
  });
  
  if (!role) {
    role = await prisma.organisationRole.create({
      data: {
        role: roleName
      }
    });
  }
  
  return role;
}

function excelDateToJSDate(excelDate) {
  if (typeof excelDate !== 'number' || excelDate < 1) {
    return undefined;
  }
  return new Date(Math.round((excelDate - 25569) * 86400 * 1000));
}

function mapStatus(rawStatus, art) {
  if (!rawStatus) return undefined;
  const statusStr = rawStatus.toString();

  if (statusStr.includes("41 Gewonnen")) return "Gewonnen";
  if (statusStr.includes("00 Warten auf Veröffentlichung")) return undefined;
  if (statusStr.includes("01 Lead")) return "Präqualifikationen";
  if (statusStr.includes("02 Präqualifizierung")) return "Präqualifizierung";
  if (statusStr.includes("10 Nicht angeboten")) return "Nicht angeboten";
  if (statusStr.includes("20 In Erstellung")) {
    // Check if it's TNA type
    if (art && art.toString().includes("TNA")) {
      return "In Erstellung TNA";
    } else {
      return "In Erstellung Angebot";
    }
  }
  if (statusStr.includes("In Erstellung")) {
    // Check if it's TNA type
    if (art && art.toString().includes("TNA")) {
      return "In Erstellung TNA";
    } else {
      return "In Erstellung Angebot";
    }
  }
  if (statusStr.includes("30 Versendet")) return "Warten auf Entscheidung";
  if (statusStr.includes("42 Verloren")) return "Verloren";
  if (statusStr.includes("43 Declined")) return "Verloren";
  if (statusStr.startsWith("90") || statusStr.startsWith("91") || statusStr.startsWith("93") || statusStr.startsWith("94")) {
    return "Anderer im Lead";
  }

  return undefined; // Wenn kein Mapping zutrifft
}

async function importTenders() {
  const workbook = xlsx.readFile(tendersFile);
  const sheetName = "Vertriebsliste";

  if (!workbook.SheetNames.includes(sheetName)) {
    console.log(`Tabellenblatt "${sheetName}" nicht gefunden.`);
    return;
  }

  // Read the title file to get better titles
  const titleWorkbook = xlsx.readFile('tenders/Copy of Vertrieb_mit_laengeren_Titeln.xlsx');
  const titleSheet = titleWorkbook.Sheets[titleWorkbook.SheetNames[0]];
  const titleData = xlsx.utils.sheet_to_json(titleSheet, { header: 1 });
  
  // Create a map of customer names + # to titles from the title file
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

  const sheet = workbook.Sheets[sheetName];
  const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
  console.log(`Anzahl Zeilen im Tabellenblatt "Vertriebsliste": ${sheetJson.length}`);

  let importCount = 0;
  const maxToImport = 5; // Only import next 5 tenders
  
  for (const obj of sheetJson) {
    if (importCount >= maxToImport) break;
    if (!obj["Angefragte Leistung"] || obj["Angefragte Leistung"].toString().trim() === "") {
      continue;
    }

    // Create organisation if needed (this will be the "Auftraggeber")
    let organisation = null;
    if (obj["Kunde"]) {
      organisation = await findOrCreateOrganisation(obj["Kunde"].toString().trim());
    }
    
    // Create organisation role
    const organisationRole = await findOrCreateOrganisationRole('Client');
    
    // Get title from title file if available
    let title = obj["Angefragte Leistung"] ? obj["Angefragte Leistung"].toString().trim() : "Untitled Tender";
    
    // If we have a customer and number, try to find a better title from the title file
    if (obj["Kunde"]) {
      const customerName = obj["Kunde"].toString().trim();
      const number = obj["#"] ? obj["#"].toString().trim() : "";
      
      // Try to find title with customer name + number first
      const keyWithNumber = `${customerName}_${number}`;
      let betterTitle = titleMap.get(keyWithNumber);
      
      // If not found, try with just customer name
      if (!betterTitle) {
        betterTitle = titleMap.get(customerName);
      }
      
      if (betterTitle) {
        title = betterTitle;
      }
    }
    
    const data = {
      title: title,
      type: obj["Art"] ? obj["Art"].toString() : undefined,
      shortDescription: obj["Opp-ID"] ? obj["Opp-ID"].toString().trim() : undefined,
      notes: obj["Angefragte Leistung"] ? obj["Angefragte Leistung"].toString().trim() : undefined,
      status: mapStatus(obj["Status"], obj["Art"]),
      offerDeadline: excelDateToJSDate(obj["Abgabefrist"]),
      questionDeadline: excelDateToJSDate(obj["Fragefrist"]),
      volumeEuro: obj["ToV in 1.000"] ? Number(String(obj["ToV in 1.000"]).replace(/[^0-9,.]/g, '').replace(',', '.')) * 1000 : undefined,
      websiteTenderPlattform: obj["Link Angebotsunterlagen"] ? obj["Link Angebotsunterlagen"].toString() : undefined,
      bindingDeadline: excelDateToJSDate(obj["Bindefrist"]),
      serviceDate: excelDateToJSDate(obj["Vertragsbeginn"]),
      notes: obj["Anmerkungen"] ? `Anmerkungen: ${obj["Anmerkungen"]}` : undefined,
      awardCriteria: obj["Zuschlagsfrist"] ? excelDateToJSDate(obj["Zuschlagsfrist"])?.toString() : undefined,
    };

    const existingTender = await prisma.callToTender.findFirst({
      where: { shortDescription: data.shortDescription },
    });

    if (existingTender) {
      console.log(`Tender "${data.title}" already exists, skipping...`);
      continue;
    } else {
      // Create the tender
      const tender = await prisma.callToTender.create({
        data: data,
      });
      
      // Create organisation relationship if organisation exists
      if (organisation && organisationRole) {
        await prisma.callToTenderOrganisation.create({
          data: {
            organisationIDs: organisation.id,
            callToTenderIDs: tender.id,
            organisationRoleID: organisationRole.id
          }
        });
      }
      
      console.log("Importiert:", data.title);
      importCount++;
    }
  }
  
  console.log(`\nImport abgeschlossen. ${importCount} Einträge verarbeitet.`);
  await prisma.$disconnect();
}

importTenders();
