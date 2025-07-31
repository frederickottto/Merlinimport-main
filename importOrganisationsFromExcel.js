const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { PrismaClient } = require("./generated/prisma");
require("dotenv").config();

const projectsFolder = path.join(__dirname, "projects");
const prisma = new PrismaClient();

async function importOrganisations() {
  const files = fs.readdirSync(projectsFolder).filter(file => file.endsWith('.xlsx') && !file.startsWith('~$'));
  for (const file of files) {
    const workbook = xlsx.readFile(path.join(projectsFolder, file));
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes("organisation"));
    if (!sheetName) {
      console.log(`No Organisation sheet found in ${file}`);
      continue;
    }
    const sheetJson = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
    console.log(`File: ${file} | Number of data rows:`, sheetJson.length);
    for (const obj of sheetJson) {
      if (!obj["Langname"] || obj["Langname"].toString().trim() === "") {
        console.log('Skipping row (missing Langname):', obj);
        continue;
      }
      // Upsert location
      const street = obj["Anschrift"] || "unknown";
      // Robustere Ermittlung der Hausnummer
      let houseNumber = (
        obj["Hausnummer"] ||
        obj["Hausnr."] ||
        obj["Nr."] ||
        obj["Hsnr"] ||
        ""
      );
      houseNumber = houseNumber !== null && houseNumber !== undefined ? String(houseNumber).trim() : "unknown";
      if (!houseNumber || houseNumber === "") houseNumber = "unknown";
      const postCode = obj["PLZ"] ? String(obj["PLZ"]) : "unknown";
      const city = obj["Ort"] || "unknown";
      const country = obj["Land"] || "unknown";
      let location = await prisma.location.findFirst({
        where: { street, houseNumber, postCode, city, country }
      });
      if (!location) {
        location = await prisma.location.create({
          data: { street, houseNumber, postCode, city, region: "unknown", country }
        });
      }
      const orgData = {
        name: obj["Langname"],
        abbreviation: obj["Kurzname"] || undefined,
        legalType: obj["Rechtsform"] || undefined,
        location: { connect: { id: location.id } },
      };
      console.log('Importing organisation:', orgData);
      await prisma.organisation.upsert({
        where: { name: obj["Langname"] },
        update: orgData,
        create: orgData
      });
    }
    console.log(`Imported organisations from ${file}`);
  }
  await prisma.$disconnect();
}

importOrganisations(); 