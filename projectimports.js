const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { PrismaClient } = require("./generated/prisma");
require("dotenv").config();

const projectsFolder = path.join(__dirname, "projects");
const prisma = new PrismaClient();

function parseExcelDate(value) {
  if (!value) return null;
  if (typeof value === 'number') return new Date(Math.round((value - 25569) * 86400 * 1000));
  if (typeof value === 'string' && value.includes('.')) {
    const [day, month, year] = value.split('.');
    const fullYear = year.length === 2 ? '20' + year : year;
    return new Date(`${fullYear}-${month}-${day}`);
  }
  return null;
}

async function importProjects() {
  const files = fs.readdirSync(projectsFolder).filter(file => file.endsWith('.xlsx') && !file.startsWith('~$'));
  for (const file of files) {
    const workbook = xlsx.readFile(path.join(projectsFolder, file));
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
    for (const row of rows) {
      const orgName = row["Leistungsempfänger"];
      let organisation = await prisma.organisation.findFirst({ where: { name: orgName } });
      if (!organisation && orgName) {
        organisation = await prisma.organisation.create({ data: { name: orgName } });
      }
      await prisma.project.create({
        data: {
          title: row["Projektbezeichnung (kurz)"] || null,
          description: row["Projektbeschreibung"] || null,
          type: row["Ebene"] || null,
          contractBeginn: parseExcelDate(row["Start des Vertrags"]),
          contractEnd: parseExcelDate(row["Ende des Vertrags"]),
          volumePTTotal: row["Auftragsvolumen (PT)"] ? parseInt(row["Auftragsvolumen (PT)"]) : null,
          keywords: row["Fachfamilie"] ? [row["Fachfamilie"]] : [],
          referenceApproval: row["Freigabe-Auswahl"] === "Ja",
          organisation: organisation ? { connect: { id: organisation.id } } : undefined,
        }
      });
      // --- Contact Import Logic ---
      const contactFirstName = row["Vorname"] || null;
      const contactLastName = row["Name"] || null;
      const contactEmail = row["E-Mail"] || null;
      const contactPhone = row["Telefon"] || null;
      const contactDepartment = row["Abteilung/Rolle/Position"] || null;

      // Debug: print contact fields for every row
      console.log('Row contact fields:', {
        Vorname: row["Vorname"],
        Name: row["Name"],
        Email: row["E-Mail"],
        Telefon: row["Telefon"],
        Abteilung: row["Abteilung/Rolle/Position"]
      });

      if (organisation && (contactFirstName || contactLastName || contactEmail)) {
        // Try to find existing contact for this org by email (preferred) or name
        let existingContact = null;
        if (contactEmail) {
          existingContact = await prisma.organisationContacts.findFirst({
            where: {
              email: contactEmail,
              organisation: { some: { id: organisation.id } },
            },
          });
        } else if (contactFirstName && contactLastName) {
          existingContact = await prisma.organisationContacts.findFirst({
            where: {
              foreName: contactFirstName,
              lastName: contactLastName,
              organisation: { some: { id: organisation.id } },
            },
          });
        }
        if (!existingContact) {
          console.log(`Creating contact for organisation '${organisation.name}':`, {
            foreName: contactFirstName,
            lastName: contactLastName,
            email: contactEmail,
            telephone: contactPhone,
            department: contactDepartment
          });
          await prisma.organisationContacts.create({
            data: {
              foreName: contactFirstName || '',
              lastName: contactLastName || '',
              email: contactEmail,
              telephone: contactPhone,
              department: contactDepartment,
              organisation: { connect: { id: organisation.id } },
            },
          });
        } else {
          console.log(`Contact already exists for organisation '${organisation.name}':`, {
            foreName: contactFirstName,
            lastName: contactLastName,
            email: contactEmail
          });
        }
      } else if (!organisation && (contactFirstName || contactLastName || contactEmail)) {
        console.log('No organisation found for contact:', {
          foreName: contactFirstName,
          lastName: contactLastName,
          email: contactEmail
        });
      }
    }
    console.log(`Imported projects from ${file}`);
  }
  await prisma.$disconnect();
}

importProjects(); 