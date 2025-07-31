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

const projectFieldMap = {
  "Leistungsempfänger": "title",
  "Projektbeschreibung": "description",
  "Ebene": "type",
  "Start des Vertrags": "contractBeginn",
  "Ende des Vertrags": "contractEnd",
  "Auftragsvolumen (PT)": "volumePTTotal",
  "Fachfamilie": "keywords",
  "Freigabe-Auswahl": "referenceApproval",
  "Teamgröße": "teamSize",
  "Audit-Stunden": "scopeAuditHours",
  "Gesamtvolumen (€)": "volumeEuroTotal",
  "Abgerufenes Volumen (€)": "volumeEuroRetrieved",
  "Abgerufene PT": "volumePTRetrieved",
  "Volumen (Stunden)": "volumeHoursTotal",
  "Genehmigte Marge": "approvedMargin",
  "Datum Erstkontakt": "firstContactDate",
  "Leistungszeitpunkt": "serviceDate",
  "EVB-IT-Vertragsnummer": "evbItContractNumber",
  "EVB-IT-Vertragsspeicherort": "evbItContractLocation",
  "Standards": "standards"
};

async function importProjects() {
  const files = fs.readdirSync(projectsFolder).filter(file => file.endsWith('.xlsx') && !file.startsWith('~$'));
  for (const file of files) {
    const workbook = xlsx.readFile(path.join(projectsFolder, file));
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes("referenz"));
    if (!sheetName) {
      console.log(`No Referenzen sheet found in ${file}`);
      continue;
    }
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: null });
    if (rawRows.length < 2) {
      console.log(`File: ${file} | Not enough rows to determine header and data.`);
      continue;
    }
    const headerRow = rawRows[1]; // Always use the second row as header
    const dataRows = rawRows.slice(2).filter(row => Array.isArray(row) && row.some(cell => cell));
    console.log(`File: ${file} | Using header row:`, headerRow);
    console.log(`File: ${file} | Number of data rows:`, dataRows.length);
    for (const row of dataRows) {
      const obj = {};
      headerRow.forEach((header, idx) => {
        obj[header] = row[idx];
      });
      if (!obj["Leistungsempfänger"] && !obj["Projektbeschreibung"]) {
        console.log('Skipping row (missing title/description):', obj);
        continue;
      }
      let organisation = null;
      if (obj["Leistungsempfänger"]) {
        organisation = await prisma.organisation.findFirst({ where: { name: obj["Leistungsempfänger"] } });
      }
      const data = {};
      for (const [col, value] of Object.entries(obj)) {
        if (value === null || value === undefined || value === "") continue;
        const field = projectFieldMap[col];
        if (field) {
          if (["contractBeginn", "contractEnd", "firstContactDate", "serviceDate"].includes(field)) {
            data[field] = parseExcelDate(value);
          } else if (["volumePTTotal", "teamSize", "scopeAuditHours", "volumePTRetrieved"].includes(field)) {
            data[field] = parseInt(value);
          } else if (["volumeEuroTotal", "volumeEuroRetrieved", "volumeHoursTotal", "approvedMargin"].includes(field)) {
            data[field] = parseFloat(value);
          } else if (field === "referenceApproval") {
            data[field] = value === "Ja" || value === true;
          } else if (field === "keywords" || field === "standards") {
            data[field] = [value];
          } else {
            data[field] = value;
          }
        }
      }
      if (organisation) {
        data.organisation = { connect: { id: organisation.id } };
      }
      // Prüfe, ob das Projekt bereits existiert (Duplikat-Prüfung)
      let existingProject = null;
      if (data.title && organisation) {
        existingProject = await prisma.project.findFirst({
          where: {
            title: data.title,
            description: data.description,
            organisationIDs: { has: organisation.id },
          },
        });
      }
      let project = existingProject;
      if (!existingProject) {
        project = await prisma.project.create({ data });
        console.log('Importing project:', data);
      } else {
        console.log('Skipping duplicate project:', data.title, '|', data.description, '| Org:', organisation?.name);
      }

      // Debug: print contact fields for every row
      console.log('Row contact fields:', {
        Vorname: obj["Vorname"],
        Name: obj["Name"],
        Email: obj["E-Mail"],
        Telefon: obj["Telefon"],
        Position: obj["Abteilung/Rolle/Position"]
      });

      // --- Contact Import Logic ---
      const contactFirstName = obj["Vorname"] || null;
      const contactLastName = obj["Name"] || null;
      const contactEmail = obj["E-Mail"] != null ? String(obj["E-Mail"]) : null;
      const contactPhone = obj["Telefon"] != null ? String(obj["Telefon"]) : null;
      // Ändere: Schreibe in 'position' statt 'department'
      const contactValue = obj["Abteilung/Rolle/Position"] != null ? String(obj["Abteilung/Rolle/Position"]) : null;

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
        }
        if (!existingContact && contactFirstName && contactLastName) {
          existingContact = await prisma.organisationContacts.findFirst({
            where: {
              foreName: contactFirstName,
              lastName: contactLastName,
              organisation: { some: { id: organisation.id } },
            },
          });
        }
        if (!existingContact) {
          await prisma.organisationContacts.create({
            data: {
              foreName: contactFirstName || '',
              lastName: contactLastName || '',
              email: contactEmail,
              telephone: contactPhone,
              department: null,
              position: contactValue,
              organisation: { connect: { id: organisation.id } },
            },
          });
        } else {
          // Update, falls position leer ist
          await prisma.organisationContacts.update({
            where: { id: existingContact.id },
            data: {
              position: existingContact.position || contactValue,
              department: existingContact.department && existingContact.department !== '' ? existingContact.department : null,
            },
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