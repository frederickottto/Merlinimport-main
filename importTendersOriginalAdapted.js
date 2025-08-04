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

  if (statusStr.includes("41 Gewonnen")) return "Gewonnen";
  if (statusStr.includes("00 Warten auf Veröffentlichung")) return undefined;
  if (statusStr.includes("01 Lead")) return "Präqualifikationen";
  if (statusStr.includes("02 Präqualifizierung")) return "Präqualifizierung";
  if (statusStr.includes("10 Nicht angeboten")) return "Nicht angeboten";
  if (statusStr.includes("20 In Erstellung")) return "Angebotsphase";
  if (statusStr.includes("In Erstellung")) return "Angebotsphase";
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

    // Create a unique identifier for the tender
    const tenderId = obj["Opp-ID"] || obj["Angefragte Leistung"];
    
    const data = {
      title: obj["Kunde"] ? obj["Kunde"].toString().trim() : "Unbenannter Kunde",
      type: obj["Art"] ? obj["Art"].toString() : undefined,
      shortDescription: obj["Angefragte Leistung"] ? obj["Angefragte Leistung"].toString().trim() : undefined,
      status: mapStatus(obj["Status"]),
      offerDeadline: excelDateToJSDate(obj["Abgabefrist"]),
      questionDeadline: excelDateToJSDate(obj["Fragefrist"]),
      volumeEuro: obj["ToV in 1.000"] ? Number(String(obj["ToV in 1.000"]).replace(/[^0-9,.]/g, '').replace(',', '.')) * 1000 : undefined,
      hyperlink: obj["Link Angebotsunterlagen"] ? obj["Link Angebotsunterlagen"].toString() : undefined,
      websiteTenderPlattform: obj["Link Angebotsunterlagen"] ? obj["Link Angebotsunterlagen"].toString() : undefined,
      bindingDeadline: excelDateToJSDate(obj["Bindefrist"]),
      serviceDate: excelDateToJSDate(obj["Vertragsbeginn"]),
      notes: obj["Anmerkungen"] ? `Anmerkungen: ${obj["Anmerkungen"]}` : undefined,
      awardCriteria: obj["Zuschlagsfrist"] ? excelDateToJSDate(obj["Zuschlagsfrist"])?.toString() : undefined,
    };

    // Check if tender already exists by shortDescription
    const existingTender = await prisma.callToTender.findFirst({
      where: { shortDescription: data.shortDescription },
    });

    if (existingTender) {
      console.log(`Tender "${data.title}" already exists, skipping...`);
      continue;
    } else {
      await prisma.callToTender.create({
        data: data,
      });
      console.log("Importiert:", data.title);
      importCount++;
    }
  }
  
  console.log(`\nImport abgeschlossen. ${importCount} Einträge verarbeitet.`);
  await prisma.$disconnect();
}

importTenders(); 