const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { PrismaClient } = require("./generated/prisma");
require("dotenv").config();

const excelFolder = path.join(__dirname, "excels");
const prisma = new PrismaClient();

// Helper to create/find employee by name
async function getOrCreateEmployee(data) {
  if (!data.foreName && !data.lastName) return null;
  let employee = await prisma.employee.findFirst({
    where: {
      foreName: data.foreName || undefined,
      lastName: data.lastName || undefined,
    },
  });
  if (!employee) {
    employee = await prisma.employee.create({ data });
    console.log("✅ Created Employee:", data);
  }
  return employee;
}

function excelDateToJSDate(serial) {
  if (!serial) return null;
  return new Date((serial - 25569) * 86400 * 1000);
}

async function run() {
  const files = fs.readdirSync(excelFolder);
  for (const file of files) {
    if (!file.endsWith(".xlsx") || file.startsWith("~$")) continue;
    console.log(`📄 Processing: ${file}`);
    const workbook = xlsx.readFile(path.join(excelFolder, file));
    if (!workbook.SheetNames.includes("_Daten")) continue;
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets["_Daten"], { defval: null });
    for (const row of rows) {
      // --- Employee fields ---
      const employeeData = {
        foreName: row["Vorname"] || null,
        lastName: row["Nachname"] || null,
        pseudonym: row["Kürzel"] || null,
        employeerCompany: row["Bezeichnung"] || null,
        contractStartDate: excelDateToJSDate(row["Einstelldatum"]),
        telephone: row["Telefon-Nr"] || null,
        mobile: row["Handy-Nr"] || null,
        linkedInURL: row["Linkedin-URL"] || null,
        xingURL: row["Xing-URL"] || null,
        discoverURL: row["Discover-URL"] || null,
        experienceIt: parseInt(row["Berufserfahrung IT Allgemein [In Jahren]"]) || 0,
        experienceIs: parseInt(row["Berufserfahrung Informationssicherheit [In Jahren]"]) || 0,
        experienceItGs: parseInt(row["Berufserfahrung IT-Grundschutz [In Jahren]"]) || 0,
        experienceGps: parseInt(row["Berufserfahrung Public Sector (seit)"]) || 0,
        description: row["Kurzbeschreibung"] || null,
      };
      if (!employeeData.foreName && !employeeData.lastName) continue;
      const employee = await getOrCreateEmployee(employeeData);
      if (!employee) continue;

      // --- AcademicDegree ---
      if (row["Akademischer Abschluss"]) {
        await prisma.academicDegree.create({
          data: {
            employeeIDs: employee.id,
            degreeTitleShort: row["Akademischer Abschluss"],
            completed: true,
            university: row["Bildungseinrichtung"] || null,
          },
        });
        console.log("  → AcademicDegree for", employee.foreName, employee.lastName);
      }

      // --- EmployeeSkills ---
      if (row["Skills"]) {
        await prisma.employeeSkills.create({
          data: {
            employeeIDs: [employee.id],
            niveau: row["Sprachniveau"] || null,
            skillIDs: row["Skills"], // This should be an ID, but we use the string for now
          },
        });
        console.log("  → EmployeeSkills for", employee.foreName, employee.lastName);
      }

      // --- EmployeeCertificates ---
      if (row["Lizensierung"]) {
        await prisma.employeeCertificates.create({
          data: {
            employeeIDs: employee.id,
            certificateTitle: row["Lizensierung"],
            expiryDate: null,
          },
        });
        console.log("  → EmployeeCertificates for", employee.foreName, employee.lastName);
      }

      // --- EmployeeExternalProjects ---
      if (row["Projektbezeichnung"]) {
        await prisma.employeeExternalProjects.create({
          data: {
            employeeIDs: employee.id,
            projectTitle: row["Projektbezeichnung"],
            client: row["Organisation"] || null,
            projectStart: excelDateToJSDate(row["Projektbeginn"]),
            projectEnd: excelDateToJSDate(row["Projektende"]),
            description: row["Kurzbeschreibung"] || null,
          },
        });
        console.log("  → EmployeeExternalProjects for", employee.foreName, employee.lastName);
      }
    }
    // --- Voccational (Berufsausbildung) import ---
    const vocSheetName = Object.keys(workbook.Sheets).find(
      (name) => name.toLowerCase().includes('berufsausbildung')
    );
    if (vocSheetName) {
      const vocSheet = workbook.Sheets[vocSheetName];
      const vocRows = xlsx.utils.sheet_to_json(vocSheet, { range: 1, defval: null });
      for (const vocRow of vocRows) {
        const employee = await prisma.employee.findFirst({
          where: {
            foreName: rows[0]?.["Vorname"] || undefined,
            lastName: rows[0]?.["Nachname"] || undefined,
          },
        });
        if (!employee) {
          console.warn(`⚠️ No employee found for Berufsausbildung in file ${file}`);
          continue;
        }
        let industrySectorConnect = undefined;
        if (vocRow['Branche']) {
          let sector = await prisma.industrySector.findFirst({
            where: { industrySector: vocRow['Branche'] },
          });
          if (!sector) {
            sector = await prisma.industrySector.create({
              data: { industrySector: vocRow['Branche'] },
            });
            console.log(`🆕 Created new IndustrySector: ${vocRow['Branche']}`);
          }
          industrySectorConnect = { industrySectorIDs: sector.id };
        }
        function parseExcelDate(value) {
          if (!value) return null;
          if (typeof value === 'number') {
            return new Date(Math.round((value - 25569) * 86400 * 1000));
          }
          if (typeof value === 'string' && value.includes('.')) {
            const [day, month, year] = value.split('.');
            const fullYear = year.length === 2 ? '20' + year : year;
            return new Date(`${fullYear}-${month}-${day}`);
          }
          return null;
        }
        await prisma.voccational.create({
          data: {
            employeeIDs: employee.id,
            company: vocRow['Firma'] || null,
            voccationalTitleShort: vocRow['Berufsbezeichnung (IHK)'] || null,
            voccationalStart: parseExcelDate(vocRow['Ausbildung Beginn']),
            voccationalEnd: parseExcelDate(vocRow['Ausbildung Ende']),
            voccationalMINT: vocRow['IT-Relevante Ausbildung']?.toLowerCase() === 'ja',
            ...(industrySectorConnect || {}),
          },
        });
        console.log(`  → Voccational for ${employee.foreName} ${employee.lastName}`);
      }
    }
  }
  await prisma.$disconnect();
  console.log("✅ Import complete!");
}

run(); 