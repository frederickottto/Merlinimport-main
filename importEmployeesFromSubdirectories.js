const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const excelsFolder = path.join(__dirname, "excels");
const prisma = new PrismaClient();

// Define which sheets to process
const relevantSheets = [
  "Mitarbeiter",
  "BeruflicherWerdegang",
  "AkademischerAbschluss",
  "Referenz",
  "Private Referenz",
  "Lizensierung",
  "Qualifikation"
];

// Map sheet names to database collections
const sheetToCollectionMap = {
  "Mitarbeiter": "Employee",
  "BeruflicherWerdegang": "ProfessionalBackground",
  "AkademischerAbschluss": "AcademicDegree",
  "Referenz": "EmployeeProjectActivities",
  "Private Referenz": "EmployeeExternalProjects",
  "Lizensierung": "EmployeeCertificates",
  "Qualifikation": "EmployeeSkills"
};

// Field mappings for each collection (excluding specified fields)
const fieldMappings = {
  Employee: {
    // Only import these specific fields from Mitarbeiter sheet
    "Namenskürzel": "pseudonym",
    "Standort": "location",
    "Rank": "employeeRank",
    "Einstelldatum": "contractStartDate"
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
    "Niveau": "skillLevel"
  }
};

// Helper function to convert Excel date to JavaScript Date
function parseExcelDate(value) {
  if (!value) return null;
  
  // If it's already a Date object
  if (value instanceof Date) return value;
  
  // If it's a number (Excel date serial number)
  if (typeof value === 'number') {
    return new Date((value - 25569) * 86400 * 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  
  return null;
}

// Helper function to convert skill level
function convertNiveauToText(niveau) {
  if (!niveau) return null;
  
  const niveauStr = niveau.toString().toLowerCase();
  
  if (niveauStr.includes('grund') || niveauStr.includes('basic') || niveauStr.includes('1')) {
    return 'Grundkenntnisse';
  } else if (niveauStr.includes('fortgeschritten') || niveauStr.includes('advanced') || niveauStr.includes('2')) {
    return 'Fortgeschrittene Kenntnisse';
  } else if (niveauStr.includes('experte') || niveauStr.includes('expert') || niveauStr.includes('3')) {
    return 'Expertenkenntnisse';
  }
  
  return niveauStr;
}

// Transform row data based on the model
function transformRow(row, model) {
  const mapping = fieldMappings[model];
  if (!mapping) return null;
  
  const transformed = {};
  
  for (const [excelField, dbField] of Object.entries(mapping)) {
    if (row[excelField] !== undefined && row[excelField] !== null && row[excelField] !== '') {
      transformed[dbField] = row[excelField];
    }
  }
  
  return transformed;
}

// Transform academic degree row
function transformAcademicDegreeRow(row) {
  const transformed = transformRow(row, 'AcademicDegree');
  if (!transformed) return null;
  
  // Handle date fields
  if (transformed.studyStart) {
    transformed.studyStart = parseExcelDate(transformed.studyStart);
  }
  if (transformed.studyEnd) {
    transformed.studyEnd = parseExcelDate(transformed.studyEnd);
  }
  
  return transformed;
}

// Transform professional background row
function transformProfessionalBackgroundRow(row) {
  const transformed = transformRow(row, 'ProfessionalBackground');
  if (!transformed) return null;
  
  // Handle date fields
  if (transformed.professionStart) {
    transformed.professionStart = parseExcelDate(transformed.professionStart);
  }
  if (transformed.professionEnd) {
    transformed.professionEnd = parseExcelDate(transformed.professionEnd);
  }
  
  return transformed;
}

// Transform project activities row
function transformProjectActivitiesRow(row) {
  const transformed = transformRow(row, 'Referenz');
  if (!transformed) return null;
  
  // Handle date fields
  if (transformed.operationalPeriodStart) {
    transformed.operationalPeriodStart = parseExcelDate(transformed.operationalPeriodStart);
  }
  if (transformed.operationalPeriodEnd) {
    transformed.operationalPeriodEnd = parseExcelDate(transformed.operationalPeriodEnd);
  }
  
  return transformed;
}

// Transform external projects row
function transformExternalProjectsRow(row) {
  const transformed = transformRow(row, 'Private Referenz');
  if (!transformed) return null;
  
  // Handle date fields
  if (transformed.operationalPeriodStart) {
    transformed.operationalPeriodStart = parseExcelDate(transformed.operationalPeriodStart);
  }
  if (transformed.operationalPeriodEnd) {
    transformed.operationalPeriodEnd = parseExcelDate(transformed.operationalPeriodEnd);
  }
  
  return transformed;
}

// Transform certificates row
function transformCertificatesRow(row) {
  const transformed = transformRow(row, 'Lizensierung');
  if (!transformed) return null;
  
  // Handle date fields
  if (transformed.validUntil) {
    transformed.validUntil = parseExcelDate(transformed.validUntil);
  }
  
  return transformed;
}

// Transform skills row
function transformSkillsRow(row) {
  const transformed = transformRow(row, 'Qualifikation');
  if (!transformed) return null;
  
  // Convert skill level
  if (transformed.skillLevel) {
    transformed.skillLevel = convertNiveauToText(transformed.skillLevel);
  }
  
  return transformed;
}

// Helper function to find or create a skill
async function findOrCreateSkill(skillTitle) {
  if (!skillTitle) return null;
  
  let skill = await prisma.skills.findFirst({
    where: { title: skillTitle }
  });
  
  if (!skill) {
    skill = await prisma.skills.create({
      data: {
        title: skillTitle,
        type: 'Technical'
      }
    });
  }
  
  return skill;
}

// Helper function to find or create a certificate
async function findOrCreateCertificate(certificateTitle) {
  if (!certificateTitle) return null;
  
  let certificate = await prisma.certificate.findFirst({
    where: { title: certificateTitle }
  });
  
  if (!certificate) {
    certificate = await prisma.certificate.create({
      data: {
        title: certificateTitle,
        type: 'Professional'
      }
    });
  }
  
  return certificate;
}

// Helper function to find or create a project
async function findOrCreateProject(projectTitle, client) {
  if (!projectTitle) return null;
  
  let project = await prisma.project.findFirst({
    where: { title: projectTitle }
  });
  
  if (!project) {
    project = await prisma.project.create({
      data: {
        title: projectTitle,
        client: client || 'Unknown',
        description: projectTitle
      }
    });
  }
  
  return project;
}

// Helper function to find or create an employee rank
async function findOrCreateEmployeeRank(rank) {
  if (!rank) return null;
  
  let employeeRank = await prisma.employeeRank.findFirst({
    where: { employeePositionShort: rank }
  });
  
  if (!employeeRank) {
    try {
      employeeRank = await prisma.employeeRank.create({
        data: {
          employeePositionShort: rank,
          employeePositionLong: rank
        }
      });
    } catch (error) {
      // If creation fails due to unique constraint, try to find it again
      if (error.code === 'P2002') {
        employeeRank = await prisma.employeeRank.findFirst({
          where: { employeePositionShort: rank }
        });
      } else {
        throw error;
      }
    }
  }
  
  return employeeRank;
}

// Helper function to find or create a location
async function findOrCreateLocation(standort) {
  if (!standort) return null;
  
  let location = await prisma.location.findFirst({
    where: { city: standort }
  });
  
  if (!location) {
    location = await prisma.location.create({
      data: {
        street: 'Unknown',
        houseNumber: '0',
        postCode: '00000',
        city: standort,
        region: 'Unknown',
        country: 'Germany'
      }
    });
  }
  
  return location;
}

// Find all Excel files in subdirectories
function findExcelFiles() {
  const excelFiles = [];
  
  function scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (stat.isFile() && item.endsWith('.xlsx') && item.includes('EY CSS - Datenerhebung')) {
        excelFiles.push({
          path: fullPath,
          filename: item,
          directory: path.basename(dirPath)
        });
      }
    }
  }
  
  scanDirectory(excelsFolder);
  return excelFiles;
}

// Process a single Excel file
async function processExcelFile(fileInfo) {
  console.log(`Processing: ${fileInfo.filename} in ${fileInfo.directory}`);
  
  try {
    const workbook = xlsx.readFile(fileInfo.path);
    const sheets = workbook.SheetNames;
    
    // Find the Mitarbeiter sheet to get the employee data
    let employeePseudonym = null;
    let employeeData = {};
    
    if (sheets.includes('Mitarbeiter')) {
      const mitarbeiterSheet = workbook.Sheets['Mitarbeiter'];
      const mitarbeiterData = xlsx.utils.sheet_to_json(mitarbeiterSheet, { header: 1 });
      
      // Parse the vertical structure (key-value pairs)
      for (const row of mitarbeiterData) {
        if (row && row.length >= 2) {
          const key = row[0];
          const value = row[1];
          
          if (key && value) {
            switch (key.trim()) {
              case 'Namenskürzel':
                employeePseudonym = value;
                employeeData.pseudonym = value;
                break;
              case 'Standort':
                employeeData.location = value;
                break;
              case 'Rank':
              case 'Rank ':
                employeeData.employeeRank = value;
                break;
              case 'Einstelldatum':
                employeeData.contractStartDate = parseExcelDate(value);
                break;
            }
          }
        }
      }
    }
    
    if (!employeePseudonym) {
      console.log(`No employee pseudonym found in ${fileInfo.filename}`);
      return;
    }
    
    console.log(`Processing employee: ${employeePseudonym}`);
    
    // Check if employee already exists
    let employee = await prisma.employee.findFirst({
      where: { pseudonym: employeePseudonym }
    });
    
    // Handle location and employeeRank relationships
    let locationId = null;
    let employeeRankId = null;
    
    if (employeeData.location) {
      const location = await findOrCreateLocation(employeeData.location);
      locationId = location ? location.id : null;
    }
    
    if (employeeData.employeeRank) {
      const employeeRank = await findOrCreateEmployeeRank(employeeData.employeeRank);
      employeeRankId = employeeRank ? employeeRank.id : null;
    }
    
    if (!employee) {
      console.log(`Creating new employee: ${employeePseudonym}`);
      employee = await prisma.employee.create({
        data: {
          foreName: '', // Will be empty as per requirements
          lastName: '', // Will be empty as per requirements
          pseudonym: employeePseudonym,
          locationIDs: locationId,
          employeeRankIDs: employeeRankId,
          contractStartDate: employeeData.contractStartDate
        }
      });
    } else {
      console.log(`Updating existing employee: ${employeePseudonym}`);
      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          locationIDs: locationId,
          employeeRankIDs: employeeRankId,
          contractStartDate: employeeData.contractStartDate
        }
      });
    }
    
    // Process other sheets with horizontal structure (headers in first row, data in following rows)
    for (const sheetName of relevantSheets) {
      if (sheetName === 'Mitarbeiter') {
        // Process additional data from Mitarbeiter sheet (experience, etc.)
        console.log(`Processing additional data from Mitarbeiter sheet`);
        const sheet = workbook.Sheets[sheetName];
        const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
        
        // Look for experience-related data in the Mitarbeiter sheet
        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (Array.isArray(row) && row.length > 0) {
            const firstCell = row[0];
            if (typeof firstCell === 'string') {
              // Look for experience-related fields
              if (firstCell.toLowerCase().includes('erfahrung') || 
                  firstCell.toLowerCase().includes('experience') ||
                  firstCell.toLowerCase().includes('berufserfahrung') ||
                  firstCell.toLowerCase().includes('jahren') ||
                  firstCell.toLowerCase().includes('years')) {
                
                const experienceValue = row[1];
                if (experienceValue) {
                  console.log(`Found experience data: ${firstCell} = ${experienceValue}`);
                  // Store experience data - you might want to add this to the employee model
                  // For now, we'll log it
                }
              }
            }
          }
        }
        continue; // Skip normal sheet processing for Mitarbeiter
      }
      
      if (sheets.includes(sheetName)) {
        console.log(`Processing sheet: ${sheetName}`);
        const sheet = workbook.Sheets[sheetName];
        
        let sheetJson = [];
        
        // Handle different sheet types with their specific structures
        if (sheetName === "BeruflicherWerdegang" || sheetName === "Referenz" || sheetName === "Private Referenz" || sheetName === "Lizensierung" || sheetName === "Qualifikation") {
          const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
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
          }
        } else if (sheetName === "AkademischerAbschluss") {
          const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
          if (rawRows.length > 2) {
            const headers = rawRows[1];
            sheetJson = rawRows.slice(2).map(row => {
              const obj = {};
              headers.forEach((header, idx) => {
                obj[header] = row[idx];
              });
              return obj;
            });
          }
        }
        
        // Filter out empty rows
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
        
        // Process each data row
        for (const row of dataRows) {
          await processRecord(row, sheetName, employee);
        }
      }
    }
    
    console.log(`Successfully processed: ${fileInfo.filename}`);
    
  } catch (error) {
    console.error(`Error processing ${fileInfo.filename}:`, error);
  }
}

// Helper function to process a record based on sheet type
async function processRecord(record, sheetName, employee) {
  try {
    switch (sheetName) {
      case 'BeruflicherWerdegang':
        await processProfessionalBackground(record, employee);
        break;
      case 'AkademischerAbschluss':
        await processAcademicDegree(record, employee);
        break;
      case 'Referenz':
        await processProjectActivities(record, employee);
        break;
      case 'Private Referenz':
        await processExternalProjects(record, employee);
        break;
      case 'Lizensierung':
        await processCertificates(record, employee);
        break;
      case 'Qualifikation':
        await processSkills(record, employee);
        break;
    }
  } catch (error) {
    console.error(`Error processing record in ${sheetName}:`, error);
  }
}

// Process professional background record
async function processProfessionalBackground(record, employee) {
  const transformedData = {
    position: record['Funktion'] || record['Position'],
    executivePosition: record['Leitende Position'] === 'Ja' || record['Leitende Position'] === true,
    employer: record['Arbeitgeber'],
    industrySector: record['Branche'],
    description: record['Taetigkeitsbeschreibung'] || record['Beschreibung'],
    professionStart: parseExcelDate(record['Beginn']),
    professionEnd: parseExcelDate(record['Ende'])
  };
  
  if (transformedData.position || transformedData.employer) {
    // Handle industry sector relationship
    let industrySectorConnect = undefined;
    if (transformedData.industrySector) {
      let industrySector = await prisma.industrySector.findFirst({
        where: { industrySector: transformedData.industrySector }
      });
      if (!industrySector) {
        industrySector = await prisma.industrySector.create({
          data: { industrySector: transformedData.industrySector }
        });
      }
      industrySectorConnect = { industrySectorIDs: industrySector.id };
    }
    delete transformedData.industrySector;
    
    await prisma.professionalBackground.create({
      data: {
        ...transformedData,
        ...industrySectorConnect,
        employeeIDs: employee.id
      }
    });
  }
}

// Process academic degree record
async function processAcademicDegree(record, employee) {
  const transformedData = {
    degreeTitleShort: record['Abschluss'],
    completed: record['Abgeschlossen'] === 'Ja' || record['Abgeschlossen'] === true,
    study: record['Studienfach'],
    studyStart: parseExcelDate(record['Studium Beginn']),
    studyEnd: parseExcelDate(record['Studium Ende']),
    university: record['Bildungseinrichtung']
  };
  
  if (transformedData.degreeTitleShort || transformedData.study) {
    await prisma.academicDegree.create({
      data: {
        ...transformedData,
        employeeIDs: employee.id
      }
    });
  }
}

// Process project activities record
async function processProjectActivities(record, employee) {
  const projectTitle = record['Projektbezeichnung'] || record['Projekt'];
  const client = record['Mandant'] || record['Client'];
  
  if (projectTitle) {
    const project = await findOrCreateProject(projectTitle, client);
    if (project) {
      await prisma.employeeProjectActivities.create({
        data: {
          employeeIDs: employee.id,
          projectIDs: project.id,
          description: record['Projektrolle'] || record['Rolle'] || projectTitle,
          operationalPeriodStart: parseExcelDate(record['Projektbeginn']) || new Date(),
          operationalPeriodEnd: parseExcelDate(record['Projektende']) || new Date(),
          operationalDays: record['Projektdauer (Monate)'] || 0
        }
      });
    }
  }
}

// Process external projects record
async function processExternalProjects(record, employee) {
  const projectTitle = record['Projektbezeichnung'] || record['Projekt'];
  const client = record['Mandant'] || record['Client'];
  
  if (projectTitle) {
    // Create professional background first
    const professionalBackground = await prisma.professionalBackground.create({
      data: {
        employeeIDs: employee.id,
        position: record['Projektrolle'] || record['Rolle'] || 'External Project',
        employer: client || 'External',
        description: record['Beschreibung'] || projectTitle
      }
    });
    
    await prisma.employeeExternalProjects.create({
      data: {
        professionalBackgroundIDs: professionalBackground.id,
        employeeIDs: employee.id,
        projectTitle: projectTitle,
        description: record['Beschreibung'],
        projectStart: parseExcelDate(record['Projektbeginn']),
        projectEnd: parseExcelDate(record['Projektende']),
        operationalDays: record['Projektdauer (Monate)'] || 0,
        clientName: client
      }
    });
  }
}

// Process certificates record
async function processCertificates(record, employee) {
  const certificateTitle = record['Bezeichnung'] || record['Zertifikat'];
  
  if (certificateTitle) {
    const certificate = await findOrCreateCertificate(certificateTitle);
    if (certificate) {
      await prisma.employeeCertificates.create({
        data: {
          employeeIDs: employee.id,
          certificateIDs: certificate.id,
          validUntil: parseExcelDate(record['Ablaufdatum']),
          issuer: record['Aussteller']
        }
      });
    }
  }
}

// Process skills record
async function processSkills(record, employee) {
  const skillTitle = record['Skills'] || record['Qualifikation'] || record['Skill'];
  
  if (skillTitle) {
    const skill = await findOrCreateSkill(skillTitle);
    if (skill) {
      await prisma.employeeSkills.create({
        data: {
          niveau: convertNiveauToText(record['Niveau']),
          employeeIDs: [employee.id],
          skillIDs: skill.id
        }
      });
    }
  }
}

// Main function to run the import
async function runImport() {
  try {
    console.log('Starting import from subdirectories...');
    
    const excelFiles = findExcelFiles();
    console.log(`Found ${excelFiles.length} Excel files to process`);
    
    for (const fileInfo of excelFiles) {
      await processExcelFile(fileInfo);
    }
    
    console.log('Import completed successfully!');
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
runImport(); 