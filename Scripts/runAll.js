// runAll.js

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { PrismaClient } = require("./generated/prisma");
require("dotenv").config();

const excelFolder = path.join(__dirname, "excels");
const prisma = new PrismaClient();

const relevantSheets = [
  "Mitarbeiter",
  "BeruflicherWerdegang",
  "AkademischerAbschluss",
  "Referenz",
  "Private Referenz",
  "Lizensierung",
  "Qualifikation"
];

const sheetToCollectionMap = {
  "Mitarbeiter": "Employee",
  "BeruflicherWerdegang": "ProfessionalBackground",
  "AkademischerAbschluss": "AcademicDegree",
  "Referenz": "EmployeeProjectActivities",
  "Private Referenz": "EmployeeExternalProjects",
  "Lizensierung": "EmployeeCertificates",
  "Qualifikation": "EmployeeSkills"
};

const fieldMappings = {
  Employee: {
    "Vorname": "foreName",
    "Nachname": "lastName",
    "Namenskürzel": "pseudonym",
    "Titel": "titles",
    "Arbeitgeber": "employeerCompany",
    "Counselor": "counselor",
    "Rank": "employeeRank",
    "Standort": "location",
    "Einstelldatum": "contractStartDate",
    "Telefon-Nr": "telephone",
    "Handy-Nr": "mobile",
    "Linkedin-URL": "linkedInURL",
    "Xing-URL": "xingURL",
    "Discover-URL": "discoverURL",
    "Berufserfahrung IT Allgemein [In Jahren]": "experienceIt",
    "Berufserfahrung Informationssicherheit [In Jahren]": "experienceIs",
    "Berufserfahrung IT-Grundschutz [In Jahren]": "experienceItGs",
    "Berufserfahrung Public Sector (seit)": "experienceGps",
    "SÜ Bund/ Land?": "securityClearance",
    "Sicherheitsüberprüfungsstufe": "securityClearanceLevel",
    "Datum der Sicherheitsüberprüfungs-Antragsstellung": "securityClearanceDate",
    "Kurzbeschreibung": "description"
  },
  ProfessionalBackground: {
    "Funktion": "position",
    "Leitende Position": "executivePosition",
    "Arbeitgeber": "employer",
    "Branche": "industrySector",
    "Taetigkeitsbeschreibung": "description",
    "Beginn": "professionStart",
    "Ende": "professionEnd"
  },
  AcademicDegree: {
    "Abschluss": "degreeTitleShort",
    "Abgeschlossen": "completed",
    "Studienfach": "study",
    "Studium Beginn": "studyStart",
    "Studium Ende": "studyEnd",
    "Bildungseinrichtung": "university"
  },
  Referenz: {
    "Projektbezeichnung": "projectTitle",
    "Mandant": "client",
    "Art des Mandanten": "type",
    "Projektrolle": "description",
    "Projektbeginn": "operationalPeriodStart",
    "Projektende": "operationalPeriodEnd",
    "Projektdauer (Monate)": "operationalDays",
    "Aufgaben": "tasks"
  },
  "Private Referenz": {
    "Projektbezeichnung": "projectTitle",
    "Mandant": "client",
    "Art des Mandanten": "type",
    "Projektrolle": "description",
    "Projektbeginn": "operationalPeriodStart",
    "Projektende": "operationalPeriodEnd",
    "Projektdauer (Monate)": "operationalDays",
    "Aufgaben": "tasks"
  },
  "Lizensierung": {
    "Bezeichnung": "certificateTitle",
    "Ablaufdatum": "validUntil",
    "Aussteller": "issuer"
  },
  "Qualifikation": {
    "Skills": "skillTitle",
    "Mit Niveau": "niveau"
  }
};

function transformEmployeeData(excelData) {
  const transformed = {};
  for (const [key, value] of Object.entries(excelData)) {
    const mappedField = fieldMappings.Employee[key];
    if (mappedField) {
      if (mappedField === "contractStartDate") {
        if (typeof value === 'number') {
          transformed[mappedField] = new Date((value - 25569) * 86400 * 1000);
        } else if (typeof value === 'string' && value) {
          const parsed = new Date(value);
          transformed[mappedField] = isNaN(parsed.getTime()) ? null : parsed;
        } else if (value instanceof Date) {
          transformed[mappedField] = value;
        } else {
          transformed[mappedField] = null;
        }
      } else if (mappedField === "experienceIt" || mappedField === "experienceIs" || 
                 mappedField === "experienceItGs" || mappedField === "experienceGps") {
        transformed[mappedField] = parseInt(value) || 0;
      } else {
        transformed[mappedField] = value;
      }
    }
  }

  const allowedScalars = [
    'foreName', 'lastName', 'pseudonym', 'employeerCompany', 'contractStartDate',
    'telephone', 'mobile', 'linkedInURL', 'xingURL', 'discoverURL',
    'experienceIt', 'experienceIs', 'experienceItGs', 'experienceGps',
    'experienceOther', 'experienceAll', 'description'
  ];
  const filtered = {};
  for (const key of allowedScalars) {
    if (transformed[key] !== null && transformed[key] !== undefined && transformed[key] !== "") {
      filtered[key] = transformed[key];
    }
  }
  return filtered;
}

function transformRow(row, model) {
  const mapping = fieldMappings[model];
  if (!mapping) return {};
  const result = {};
  for (const [german, english] of Object.entries(mapping)) {
    if (row[german] !== undefined && row[german] !== null && row[german] !== "") {
      if (english === 'professionEnd' && row[german] === 'heute') {
        result[english] = null;
      } else if (english.toLowerCase().includes("date") || english.toLowerCase().includes("start") || english.toLowerCase().includes("end")) {
        if (typeof row[german] === 'number') {
          result[english] = new Date((row[german] - 25569) * 86400 * 1000);
        } else {
          result[english] = row[german];
        }
      } else if (english === 'executivePosition' || english === 'completed' || english === 'voccationalMINT') {
        result[english] = row[german] === 'Ja' || row[german] === true;
      } else if (english === 'duration') {
        result[english] = parseInt(row[german]) || 0;
      } else {
        result[english] = row[german];
      }
    }
  }
  return result;
}

function transformAcademicDegreeRow(row) {
  const mapping = fieldMappings.AcademicDegree;
  const result = {};
  for (const [german, english] of Object.entries(mapping)) {
    if (row[german] !== undefined && row[german] !== null && row[german] !== "") {
      if (english === 'completed') {
        result[english] = row[german] === 'Ja' || row[german] === true;
      } else if (english === 'studyStart' || english === 'studyEnd') {
        if (typeof row[german] === 'number') {
          result[english] = new Date((row[german] - 25569) * 86400 * 1000);
        } else if (typeof row[german] === 'string' && row[german]) {
          const parsed = new Date(row[german]);
          result[english] = isNaN(parsed.getTime()) ? null : parsed;
        } else if (row[german] instanceof Date) {
          result[english] = row[german];
        } else {
          result[english] = null;
        }
      } else {
        result[english] = row[german];
      }
    }
  }
  return result;
}

async function runAll() {
  console.log("🚀 Starte Importprozess mit Prisma...");
  const files = fs.readdirSync(excelFolder).filter(file => file.endsWith('.xlsx') && !file.startsWith('~$'));
  const employeeDataList = [];
  const pseudonymToId = {};

  for (const file of files) {
    const workbook = xlsx.readFile(path.join(excelFolder, file));
    let currentEmployee = null;
    if (workbook.SheetNames.includes('Mitarbeiter')) {
      const sheetJson = xlsx.utils.sheet_to_json(workbook.Sheets['Mitarbeiter'], { defval: null });
      const employeeData = {};
      sheetJson.forEach(row => {
        if (row['Allgemeine Mitarbeiterdaten']) {
          employeeData[row['Allgemeine Mitarbeiterdaten'].trim()] = row['__EMPTY'];
        }
      });
      const transformed = transformEmployeeData(employeeData);
      let employeeRankConnect = undefined;
      if (transformed.employeeRank) {
        let employeeRank = await prisma.employeeRank.findFirst({
          where: { employeePositionShort: transformed.employeeRank }
        });
        if (!employeeRank) {
          employeeRank = await prisma.employeeRank.create({
            data: { employeePositionShort: transformed.employeeRank, employeePositionLong: transformed.employeeRank }
          });
        }
        employeeRankConnect = { employeeRank: { connect: { id: employeeRank.id } } };
      }
      let locationConnect = undefined;
      if (transformed.location) {
        let location = await prisma.location.findFirst({
          where: { city: transformed.location }
        });
        if (!location) {
          location = await prisma.location.create({
            data: {
              city: transformed.location,
              street: 'unknown',
              houseNumber: 'unknown',
              postCode: 'unknown',
              region: 'unknown',
              country: 'unknown'
            }
          });
        }
        locationConnect = { locationsID: location.id };
      }
      delete transformed.employeeRank;
      delete transformed.location;
      const counselorName = transformed.counselor;
      delete transformed.counselor;
      const employeeDataToCreate = {
        ...transformed,
        ...(employeeRankConnect || {}),
        ...(locationConnect || {})
      };
      if (Object.keys(employeeDataToCreate).length > 0) {
        try {
          currentEmployee = await prisma.employee.create({ data: employeeDataToCreate });
          if (transformed.pseudonym) {
            pseudonymToId[transformed.pseudonym] = currentEmployee.id;
          }
          employeeDataList.push({ id: currentEmployee.id, pseudonym: transformed.pseudonym, counselorName });
        } catch (e) {
          console.error(`❌ Fehler beim Import in Employee:`, e.message);
        }
      } else {
        console.warn(`⚠️ No valid employee data found in ${file}`);
      }
    } else {
      console.warn(`⚠️ No 'Mitarbeiter' sheet found in ${file}`);
    }
    for (const [sheetName, model] of Object.entries(sheetToCollectionMap)) {
      if (sheetName === 'Mitarbeiter') continue;
      if (!relevantSheets.includes(sheetName)) continue;
      if (!workbook.SheetNames.includes(sheetName)) continue;
      let sheetJson;
      if (sheetName === "BeruflicherWerdegang" || sheetName === "Referenz" || sheetName === "Private Referenz" || sheetName === "Lizensierung" || sheetName === "Qualifikation") {
        const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: null });
        const nonEmptyRows = rawRows.filter(row => Array.isArray(row) && row.some(cell => cell));
        if (nonEmptyRows.length > 1) {
          const headers = nonEmptyRows[1];
          const dataRows = nonEmptyRows.slice(2).filter(row => typeof row[0] === 'number');
          sheetJson = dataRows.map(row => {
            const obj = {};
            headers.forEach((header, idx) => {
              obj[header] = row[idx];
            });
            return obj;
          });
          if (sheetName === 'Qualifikation') {
          }
          if (sheetName === 'Lizensierung') {
            if (sheetJson.length === 0) {
              console.warn(`[WARN] No data rows found in Lizensierung after header extraction in file ${file}`);
            }
          }
          if (sheetName === 'Private Referenz') {
            if (sheetJson.length === 0) {
              console.warn(`[WARN] No data rows found in Private Referenz after header extraction in file ${file}`);
            }
          }
        } else {
          sheetJson = [];
          if (sheetName === 'Qualifikation') {
            console.warn(`[WARN] Qualifikation: No valid header/data rows found in file ${file}`);
          }
          if (sheetName === 'Lizensierung') {
            console.warn(`[WARN] Lizensierung: No valid header/data rows found in file ${file}`);
          }
          if (sheetName === 'Private Referenz') {
            console.warn(`[WARN] Private Referenz: No valid header/data rows found in file ${file}`);
          }
        }
      } else if (sheetName === "AkademischerAbschluss") {
        const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: null });
        if (rawRows.length > 2) {
          const headers = rawRows[1];
          sheetJson = rawRows.slice(2).map(row => {
            const obj = {};
            headers.forEach((header, idx) => {
              obj[header] = row[idx];
            });
            return obj;
          });
        } else {
          sheetJson = [];
        }
      } else if (sheetName === "Mitarbeiter") {
      } else {
        sheetJson = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
      }
      const dataRows = sheetJson.filter(row =>
        Object.keys(row).some(key => {
          const value = row[key];
          return (
            value !== null &&
            value !== undefined &&
            value !== '' &&
            key !== '#' &&
            !/^platzhalter$/i.test(String(value).trim())
          );
        })
      );
      let certImportCount = 0;
      for (const row of dataRows) {
        const transformed =
          model === 'AcademicDegree'
            ? transformAcademicDegreeRow(row)
            : model === 'EmployeeExternalProjects'
              ? transformRow(row, 'Private Referenz')
              : model === 'EmployeeCertificates'
                ? transformRow(row, 'Lizensierung')
                : model === 'EmployeeSkills'
                  ? transformRow(row, 'Qualifikation')
                  : transformRow(row, model);
        if (Object.keys(transformed).length > 0 || model === 'EmployeeProjectActivities') {
          try {
            if (model === 'ProfessionalBackground') {
              if (!currentEmployee) {
                console.error('No matching employee found for this file');
                continue;
              }
              let industrySectorConnect = undefined;
              if (transformed.industrySector) {
                let industrySector = await prisma.industrySector.findFirst({
                  where: { industrySector: transformed.industrySector }
                });
                if (!industrySector) {
                  industrySector = await prisma.industrySector.create({
                    data: { industrySector: transformed.industrySector }
                  });
                }
                industrySectorConnect = { industrySector: { connect: { id: industrySector.id } } };
              }
              delete transformed.industrySector;
              await prisma.professionalBackground.create({
                data: {
                  ...transformed,
                  ...industrySectorConnect,
                  employee: { connect: { id: currentEmployee.id } }
                }
              });
            } else if (model === 'AcademicDegree') {
              if (!currentEmployee) {
                console.error('No matching employee found for this file');
                continue;
              }
              await prisma.academicDegree.create({
                data: {
                  ...transformed,
                  employeeIDs: currentEmployee.id
                }
              });
            } else if (model === 'EmployeeExternalProjects') {
              if (!currentEmployee) {
                console.error('No matching employee found for this file');
                continue;
              }
              const profBackground = await prisma.professionalBackground.findFirst({
                where: { employeeIDs: currentEmployee.id },
                orderBy: { professionStart: 'desc' }
              });
              const position = profBackground ? profBackground.position : null;
              try {
                await prisma.employeeExternalProjects.create({
                  data: {
                    employeeIDs: currentEmployee.id,
                    professionalBackgroundIDs: profBackground ? profBackground.id : undefined,
                    projectTitle: row['Projektbezeichnung'] || null,
                    clientName: row['Mandant'] || null,
                    projectStart: transformRow({ 'Projektbeginn': row['Projektbeginn'] }, 'Referenz').operationalPeriodStart || null,
                    projectEnd: transformRow({ 'Projektende': row['Projektende'] }, 'Referenz').operationalPeriodEnd || null,
                    description: row['Projektrolle'] || row['description'] || 'Projektaktivität',
                    operationalDays: row['Projektdauer (Monate)'] ? Math.round(parseFloat(row['Projektdauer (Monate)']) * 30) : 0,
                    employeeProjectRole: position,
                  }
                });
              } catch (e) {
                console.error(`❌ Fehler beim Import in EmployeeExternalProjects:`, e.message);
              }
            } else if (model === 'EmployeeCertificates') {
              if (!currentEmployee) {
                console.error('No matching employee found for this file');
                continue;
              }
              if (!transformed.certificateTitle || transformed.certificateTitle.trim() === "") {
                console.warn('[DEBUG] Skipping Lizensierung row: missing certificate title.', row);
                continue;
              }
              let certificate = null;
              if (transformed.certificateTitle) {
                certificate = await prisma.certificate.findFirst({ where: { title: transformed.certificateTitle } });
                if (certificate) {
                } else {
                  certificate = await prisma.certificate.create({ data: { title: transformed.certificateTitle } });
                }
              }
              let validUntil = null;
              if (transformed.validUntil) {
                if (typeof transformed.validUntil === 'number') {
                  validUntil = new Date((transformed.validUntil - 25569) * 86400 * 1000);
                } else if (typeof transformed.validUntil === 'string' && transformed.validUntil) {
                  const parts = transformed.validUntil.split('.');
                  if (parts.length === 3) {
                    const [day, month, year] = parts;
                    validUntil = new Date(`${year}-${month}-${day}`);
                  } else {
                    const parsed = new Date(transformed.validUntil);
                    validUntil = isNaN(parsed.getTime()) ? null : parsed;
                  }
                }
              }
              await prisma.employeeCertificates.create({
                data: {
                  employeeIDs: currentEmployee.id,
                  certificateIDs: certificate ? certificate.id : undefined,
                  validUntil: validUntil,
                  issuer: transformed.issuer || null
                }
              });
              certImportCount++;
            } else if (model === 'EmployeeSkills') {
              let skillImportCount = 0;
              for (const row of dataRows) {
                const transformed = transformRow(row, 'Qualifikation');
                if (!currentEmployee) continue;
                if (!transformed.skillTitle || transformed.skillTitle.trim() === "") continue;
                let skill = await prisma.skills.findFirst({ where: { title: transformed.skillTitle } });
                if (!skill) {
                  skill = await prisma.skills.create({ data: { title: transformed.skillTitle } });
                }
                await prisma.employeeSkills.create({
                  data: {
                    employeeIDs: [currentEmployee.id],
                    skillIDs: skill.id,
                    niveau: transformed.niveau !== undefined && transformed.niveau !== null ? String(transformed.niveau) : null
                  }
                });
                skillImportCount++;
              }
              if (skillImportCount > 0) {
                console.log(`✅ Import in EmployeeSkills (Qualifikation) successful for ${skillImportCount} skills`);
              }
            } else if (model === 'EmployeeProjectActivities') {
              if (!currentEmployee) {
                console.error('No matching employee found for this file');
                continue;
              }
              let organisationId = undefined;
              if (row['Mandant']) {
                let org = await prisma.organisation.findFirst({ where: { name: row['Mandant'] } });
                if (!org) {
                  org = await prisma.organisation.create({ data: { name: row['Mandant'] } });
                }
                organisationId = org.id;
              }
              const project = await prisma.project.create({
                data: {
                  title: row['Projektbezeichnung'] || null,
                  type: row['Art des Mandanten'] || null,
                  contractBeginn: transformRow({ 'Projektbeginn': row['Projektbeginn'] }, 'Referenz').operationalPeriodStart || null,
                  contractEnd: transformRow({ 'Projektende': row['Projektende'] }, 'Referenz').operationalPeriodEnd || null,
                  description: row['Aufgaben'] || null,
                  organisation: organisationId ? { connect: { id: organisationId } } : undefined,
                },
              });
              await prisma.employeeProjectActivities.create({
                data: {
                  employee: { connect: { id: currentEmployee.id } },
                  project: { connect: { id: project.id } },
                  description: row['Projektrolle'] || row['description'] || 'Projektaktivität',
                  operationalPeriodStart: transformRow({ 'Projektbeginn': row['Projektbeginn'] }, 'Referenz').operationalPeriodStart || new Date(),
                  operationalPeriodEnd: transformRow({ 'Projektende': row['Projektende'] }, 'Referenz').operationalPeriodEnd || new Date(),
                  operationalDays: row['Projektdauer (Monate)'] ? parseInt(row['Projektdauer (Monate)']) * 30 : 0,
                },
              });
            } else {
              await prisma[model.charAt(0).toLowerCase() + model.slice(1)].create({ data: transformed });
            }
          } catch (e) {
            console.error(`❌ Fehler beim Import in ${model}:`, e.message);
          }
        } else {
          if (model === 'EmployeeExternalProjects') {
            console.warn(`[DEBUG] Skipping row in Private Referenz: no mappable fields found. Row content:`, row);
          }
          if (model === 'EmployeeSkills') {
            console.warn(`[DEBUG] Skipping row in Qualifikationen: no mappable fields found. Row content:`, row);
          }
        }
      }
      if (model === 'EmployeeCertificates' && certImportCount) {
        console.log(`✅ Import in EmployeeCertificates (Lizensierung) successful for ${certImportCount} certificates`);
      }
    }
    const vocSheetName = workbook.SheetNames.find(
      (name) => name.toLowerCase().includes('berufsausbildung')
    );
    if (vocSheetName) {
      const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[vocSheetName], { header: 1, defval: null });
      let vocRows = [];
      if (rawRows.length > 1) {
        const headers = rawRows[1];
        vocRows = rawRows.slice(2).map(row => {
          const obj = {};
          headers.forEach((header, idx) => {
            obj[header] = row[idx];
          });
          return obj;
        });
      }
      for (const vocRow of vocRows) {
        if (!currentEmployee) {
          console.error('No matching employee found for this file');
          continue;
        }
        let industrySectorIDs = undefined;
        if (vocRow['Branche']) {
          let sector = await prisma.industrySector.findFirst({
            where: { industrySector: vocRow['Branche'] }
          });
          if (!sector) {
            sector = await prisma.industrySector.create({
              data: { industrySector: vocRow['Branche'] }
            });
          }
          industrySectorIDs = sector.id;
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
            employeeIDs: currentEmployee.id,
            company: vocRow['Firma'] || null,
            voccationalTitleLong: vocRow['Berufsbezeichnung (IHK)'] || null,
            voccationalStart: parseExcelDate(vocRow['Ausbildung Beginn']),
            voccationalEnd: parseExcelDate(vocRow['Ausbildung Ende']),
            voccationalMINT: vocRow['IT-Relevante Ausbildung']?.toLowerCase() === 'ja',
            ...(industrySectorIDs ? { industrySectorIDs } : {})
          }
        });
        console.log(`✅ Import in Voccational successful`);
      }
    }
  }

  for (const emp of employeeDataList) {
    if (emp.counselorName) {
      const counselorId = pseudonymToId[emp.counselorName];
      if (counselorId) {
        await prisma.employee.update({
          where: { id: emp.id },
          data: { counselor: { connect: { id: counselorId } } }
        });
      } else {
      }
    }
  }

  await prisma.$disconnect();
}

runAll();
