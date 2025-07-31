const { PrismaClient } = require("@prisma/client");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const prisma = new PrismaClient();

// EY Standorte mit korrekten Adressen
const eyLocations = {
  'Berlin': {
    street: 'Friedrichstraße',
    houseNumber: '140',
    postCode: '10117',
    city: 'Berlin',
    region: 'Berlin',
    country: 'Deutschland'
  },
  'Bremen': {
    street: 'Lloydstraße',
    houseNumber: '4-6',
    postCode: '28217',
    city: 'Bremen',
    region: 'Bremen',
    country: 'Deutschland'
  },
  'Dortmund': {
    street: 'Westfalendamm',
    houseNumber: '11',
    postCode: '44141',
    city: 'Dortmund',
    region: 'Nordrhein-Westfalen',
    country: 'Deutschland'
  },
  'Dresden': {
    street: 'Forststraße',
    houseNumber: '2',
    postCode: '01099',
    city: 'Dresden',
    region: 'Sachsen',
    country: 'Deutschland'
  },
  'Düsseldorf': {
    street: 'Graf-Adolf-Platz',
    houseNumber: '15',
    postCode: '40213',
    city: 'Düsseldorf',
    region: 'Nordrhein-Westfalen',
    country: 'Deutschland'
  },
  'Eschborn': {
    street: 'Mergenthalerallee',
    houseNumber: '3-5',
    postCode: '65760',
    city: 'Eschborn/Frankfurt (Main)',
    region: 'Hessen',
    country: 'Deutschland'
  },
  'Frankfurt': {
    street: 'Mergenthalerallee',
    houseNumber: '3-5',
    postCode: '65760',
    city: 'Eschborn/Frankfurt (Main)',
    region: 'Hessen',
    country: 'Deutschland'
  },
  'Essen': {
    street: 'Wittekindstraße',
    houseNumber: '1a',
    postCode: '45131',
    city: 'Essen',
    region: 'Nordrhein-Westfalen',
    country: 'Deutschland'
  },
  'Freiburg': {
    street: 'Bismarckallee',
    houseNumber: '15',
    postCode: '79098',
    city: 'Freiburg',
    region: 'Baden-Württemberg',
    country: 'Deutschland'
  },
  'Hamburg': {
    street: 'Rothenbaumchaussee',
    houseNumber: '78',
    postCode: '20148',
    city: 'Hamburg',
    region: 'Hamburg',
    country: 'Deutschland'
  },
  'Hannover': {
    street: 'Landschaftsstraße',
    houseNumber: '8',
    postCode: '30159',
    city: 'Hannover',
    region: 'Niedersachsen',
    country: 'Deutschland'
  },
  'Heilbronn': {
    street: 'Titotstraße',
    houseNumber: '8',
    postCode: '74072',
    city: 'Heilbronn',
    region: 'Baden-Württemberg',
    country: 'Deutschland'
  },
  'Köln': {
    street: 'Börsenplatz',
    houseNumber: '1',
    postCode: '50667',
    city: 'Köln',
    region: 'Nordrhein-Westfalen',
    country: 'Deutschland'
  },
  'Leipzig': {
    street: 'Grimmaische Straße',
    houseNumber: '25',
    postCode: '04109',
    city: 'Leipzig',
    region: 'Sachsen',
    country: 'Deutschland'
  },
  'Mannheim': {
    street: 'Glücksteinallee',
    houseNumber: '1',
    postCode: '68163',
    city: 'Mannheim',
    region: 'Baden-Württemberg',
    country: 'Deutschland'
  },
  'München': {
    street: 'Arnulfstraße',
    houseNumber: '59',
    postCode: '80636',
    city: 'München',
    region: 'Bayern',
    country: 'Deutschland'
  },
  'Nürnberg': {
    street: 'Am Tullnaupark',
    houseNumber: '8',
    postCode: '90402',
    city: 'Nürnberg',
    region: 'Bayern',
    country: 'Deutschland'
  },
  'Ravensburg': {
    street: 'Parkstraße',
    houseNumber: '40',
    postCode: '88212',
    city: 'Ravensburg',
    region: 'Baden-Württemberg',
    country: 'Deutschland'
  },
  'Saarbrücken': {
    street: 'Heinrich-Böcking-Straße',
    houseNumber: '6-8',
    postCode: '66121',
    city: 'Saarbrücken',
    region: 'Saarland',
    country: 'Deutschland'
  },
  'Stuttgart': {
    street: 'Flughafenstraße',
    houseNumber: '61',
    postCode: '70629',
    city: 'Stuttgart',
    region: 'Baden-Württemberg',
    country: 'Deutschland'
  },
  'Villingen-Schwenningen': {
    street: 'Max-Planck-Straße',
    houseNumber: '11',
    postCode: '78052',
    city: 'Villingen-Schwenningen',
    region: 'Baden-Württemberg',
    country: 'Deutschland'
  }
};

// Helper function to find matching location
function findMatchingLocation(standort) {
  if (!standort) return null;
  
  const standortStr = standort.toString().toLowerCase().trim();
  
  // Direct matches
  for (const [city, location] of Object.entries(eyLocations)) {
    if (standortStr === city.toLowerCase()) {
      return { city, location };
    }
  }
  
  // Partial matches
  for (const [city, location] of Object.entries(eyLocations)) {
    if (standortStr.includes(city.toLowerCase()) || city.toLowerCase().includes(standortStr)) {
      return { city, location };
    }
  }
  
  // Special cases
  if (standortStr.includes('frankfurt') || standortStr.includes('eschborn')) {
    return { city: 'Frankfurt', location: eyLocations['Frankfurt'] };
  }
  
  return null;
}

// Helper function to find or create location
async function findOrCreateLocation(locationData) {
  if (!locationData) return null;
  
  // Try to find existing location with exact match
  let location = await prisma.location.findFirst({
    where: {
      city: locationData.city,
      street: locationData.street,
      houseNumber: locationData.houseNumber
    }
  });
  
  if (!location) {
    // Try to find by city only
    location = await prisma.location.findFirst({
      where: { city: locationData.city }
    });
    
    if (location) {
      // Update existing location with correct data
      location = await prisma.location.update({
        where: { id: location.id },
        data: locationData
      });
    } else {
      // Create new location
      location = await prisma.location.create({
        data: locationData
      });
    }
  }
  
  return location;
}

// Helper function to find or create employee rank
async function findOrCreateEmployeeRank(rank) {
  if (!rank) return null;
  
  let employeeRank = await prisma.employeeRank.findFirst({
    where: { employeePositionLong: rank }
  });
  
  if (!employeeRank) {
    try {
      employeeRank = await prisma.employeeRank.create({
        data: {
          employeePositionLong: rank,
          employeePositionShort: rank.substring(0, 10) // Short version
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint failed, try to find again
        employeeRank = await prisma.employeeRank.findFirst({
          where: { employeePositionLong: rank }
        });
      } else {
        throw error;
      }
    }
  }
  
  return employeeRank;
}

// Helper function to parse Excel date
function parseExcelDate(value) {
  if (!value) return null;
  
  if (typeof value === 'number') {
    // Excel date number
    const date = new Date((value - 25569) * 86400 * 1000);
    return date;
  } else if (typeof value === 'string') {
    // Try to parse date string
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
}

// Helper function to extract experience data
function extractExperienceData(rawRows) {
  const experienceData = {};
  
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (Array.isArray(row) && row.length > 0) {
      const firstCell = row[0];
      if (typeof firstCell === 'string') {
        const firstCellLower = firstCell.toLowerCase();
        
        // Look for experience-related fields
        if (firstCellLower.includes('erfahrung') || 
            firstCellLower.includes('experience') ||
            firstCellLower.includes('berufserfahrung') ||
            firstCellLower.includes('jahren') ||
            firstCellLower.includes('years') ||
            firstCellLower.includes('it-erfahrung') ||
            firstCellLower.includes('it-gs-erfahrung') ||
            firstCellLower.includes('is-erfahrung') ||
            firstCellLower.includes('gps-erfahrung') ||
            firstCellLower.includes('gesamterfahrung') ||
            firstCellLower.includes('sonstige erfahrung')) {
          
          const experienceValue = row[1];
          if (experienceValue) {
            experienceData[firstCell] = experienceValue;
            console.log(`Found experience data: ${firstCell} = ${experienceValue}`);
          }
        }
      }
    }
  }
  
  return experienceData;
}

// Helper function to find or create skill
async function findOrCreateSkill(skillTitle) {
  if (!skillTitle) return null;
  
  let skill = await prisma.skills.findFirst({
    where: { title: skillTitle }
  });
  
  if (!skill) {
    skill = await prisma.skills.create({
      data: { title: skillTitle }
    });
  }
  
  return skill;
}

// Helper function to find or create certificate
async function findOrCreateCertificate(certificateTitle) {
  if (!certificateTitle) return null;
  
  let certificate = await prisma.certificate.findFirst({
    where: { title: certificateTitle }
  });
  
  if (!certificate) {
    certificate = await prisma.certificate.create({
      data: { title: certificateTitle }
    });
  }
  
  return certificate;
}

// Helper function to find or create project
async function findOrCreateProject(projectTitle, client) {
  if (!projectTitle) return null;
  
  let project = await prisma.projects.findFirst({
    where: { projectTitle: projectTitle }
  });
  
  if (!project) {
    project = await prisma.projects.create({
      data: { 
        projectTitle: projectTitle,
        client: client || ''
      }
    });
  }
  
  return project;
}

// Helper function to process professional background
async function processProfessionalBackground(record, employee) {
  if (!record || !employee) return;
  
  const data = {
    employer: record['Firma'] || record['Company'] || '',
    position: record['Position'] || '',
    professionStart: parseExcelDate(record['Startdatum'] || record['Start Date']),
    professionEnd: parseExcelDate(record['Enddatum'] || record['End Date']),
    description: record['Beschreibung'] || record['Description'] || '',
    employeeIDs: employee.id
  };
  
  await prisma.professionalBackground.create({
    data: data
  });
}

// Helper function to process academic degree
async function processAcademicDegree(record, employee) {
  if (!record || !employee) return;
  
  const data = {
    degreeTitleLong: record['Abschluss'] || record['Degree'] || '',
    university: record['Institution'] || '',
    studyEnd: parseExcelDate(record['Abschlussjahr'] || record['Graduation Year']),
    employeeIDs: employee.id
  };
  
  await prisma.academicDegree.create({
    data: data
  });
}

// Helper function to process certificates
async function processCertificates(record, employee) {
  if (!record || !employee) return;
  
  const certificateTitle = record['Zertifikat'] || record['Certificate'] || record['Titel'] || '';
  if (!certificateTitle) return;
  
  const certificate = await findOrCreateCertificate(certificateTitle);
  if (certificate) {
    await prisma.employeeCertificates.create({
      data: {
        employeeIDs: employee.id,
        certificateIDs: certificate.id
      }
    });
  }
}

// Helper function to process skills
async function processSkills(record, employee) {
  if (!record || !employee) return;
  
  const skillTitle = record['Fähigkeit'] || record['Skill'] || record['Titel'] || '';
  if (!skillTitle) return;
  
  const skill = await findOrCreateSkill(skillTitle);
  if (skill) {
    await prisma.employeeSkills.create({
      data: {
        skillIDs: skill.id,
        employeeIDs: [employee.id]
      }
    });
  }
}

// Helper function to process projects
async function processProjects(record, employee) {
  if (!record || !employee) return;
  
  const projectTitle = record['Projekt'] || record['Project'] || record['Titel'] || '';
  if (!projectTitle) return;
  
  const client = record['Kunde'] || record['Client'] || '';
  const project = await findOrCreateProject(projectTitle, client);
  if (project) {
    await prisma.projectsOnEmployee.create({
      data: {
        employeeIDs: employee.id,
        projectsIDs: project.id
      }
    });
  }
}

// Helper function to process record based on sheet type
async function processRecord(record, sheetName, employee) {
  if (!record || !employee) return;
  
  try {
    switch (sheetName) {
      case 'BeruflicherWerdegang':
        await processProfessionalBackground(record, employee);
        break;
      case 'AkademischerAbschluss':
        await processAcademicDegree(record, employee);
        break;
      case 'Lizensierung':
      case 'Qualifikation':
        await processCertificates(record, employee);
        break;
      case 'Referenz':
      case 'Private Referenz':
        await processProjects(record, employee);
        break;
    }
  } catch (error) {
    console.error(`Error processing record in ${sheetName}:`, error.message);
  }
}

// Main function to process Excel file
async function processExcelFile(fileInfo) {
  try {
    const workbook = xlsx.readFile(fileInfo.filepath);
    const sheets = workbook.SheetNames;
    
    console.log(`Processing: ${fileInfo.filename} in ${fileInfo.subdirectory}`);
    
    // Extract employee pseudonym from filename
    const employeePseudonym = fileInfo.subdirectory;
    if (!employeePseudonym) {
      console.log(`No employee pseudonym found in ${fileInfo.filename}`);
      return;
    }
    
    console.log(`Processing employee: ${employeePseudonym}`);
    
    // Check if employee already exists
    let employee = await prisma.employee.findFirst({
      where: { pseudonym: employeePseudonym }
    });
    
    // Process Mitarbeiter sheet for basic data and experience
    let employeeData = {};
    let experienceData = {};
    
    if (sheets.includes('Mitarbeiter')) {
      const sheet = workbook.Sheets['Mitarbeiter'];
      const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
      
      // Extract basic employee data
      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (Array.isArray(row) && row.length > 1) {
          const key = row[0];
          const value = row[1];
          
          if (typeof key === 'string' && value) {
            switch (key) {
              case 'Namenskürzel':
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
      
      // Extract experience data
      experienceData = extractExperienceData(rawRows);
    }
    
    // Handle location and employeeRank relationships
    let locationId = null;
    let employeeRankId = null;
    
    if (employeeData.location) {
      const matchingLocation = findMatchingLocation(employeeData.location);
      if (matchingLocation) {
        const location = await findOrCreateLocation(matchingLocation.location);
        locationId = location ? location.id : null;
        console.log(`Location matched: ${employeeData.location} → ${matchingLocation.city}`);
      }
    }
    
    if (employeeData.employeeRank) {
      const employeeRank = await findOrCreateEmployeeRank(employeeData.employeeRank);
      employeeRankId = employeeRank ? employeeRank.id : null;
    }
    
    // Extract experience data from experienceData object
    const experienceIt = parseInt(experienceData['Berufserfahrung IT Allgemein [In Jahren]'] || experienceData['IT-Erfahrung'] || '0');
    const experienceIs = parseInt(experienceData['Berufserfahrung Informationssicherheit [In Jahren]'] || experienceData['IS-Erfahrung'] || '0');
    const experienceItGs = parseInt(experienceData['Berufserfahrung IT-Grundschutz [In Jahren]'] || experienceData['IT-GS-Erfahrung'] || '0');
    const experienceGps = parseInt(experienceData['Berufserfahrung Public Sector (seit)'] || experienceData['GPS-Erfahrung'] || '0');
    const experienceOther = parseInt(experienceData['Sonstige Erfahrung'] || '0');
    const experienceAll = parseInt(experienceData['Gesamterfahrung'] || '0');

    // Create or update employee
    if (!employee) {
      console.log(`Creating new employee: ${employeePseudonym}`);
      employee = await prisma.employee.create({
        data: {
          foreName: employeePseudonym, // Set pseudonym as foreName
          lastName: '', // Will be empty as per requirements
          pseudonym: employeePseudonym,
          locationIDs: locationId,
          employeeRankIDs: employeeRankId,
          contractStartDate: employeeData.contractStartDate,
          experienceIt: experienceIt,
          experienceIs: experienceIs,
          experienceItGs: experienceItGs,
          experienceGps: experienceGps,
          experienceOther: experienceOther,
          experienceAll: experienceAll
        }
      });
    } else {
      console.log(`Updating existing employee: ${employeePseudonym}`);
      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          foreName: employeePseudonym, // Set pseudonym as foreName
          locationIDs: locationId,
          employeeRankIDs: employeeRankId,
          contractStartDate: employeeData.contractStartDate,
          experienceIt: experienceIt,
          experienceIs: experienceIs,
          experienceItGs: experienceItGs,
          experienceGps: experienceGps,
          experienceOther: experienceOther,
          experienceAll: experienceAll
        }
      });
    }
    
    // Process other sheets
    const relevantSheets = ['BeruflicherWerdegang', 'AkademischerAbschluss', 'Referenz', 'Private Referenz', 'Lizensierung', 'Qualifikation'];
    
    for (const sheetName of relevantSheets) {
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
        
        // Process records
        for (const record of sheetJson) {
          await processRecord(record, sheetName, employee);
        }
      }
    }
    
    console.log(`Successfully processed: ${fileInfo.filename}`);
    
  } catch (error) {
    console.error(`Error processing ${fileInfo.filename}:`, error);
  }
}

// Function to find all Excel files
function findExcelFiles() {
  const excelsDir = path.join(__dirname, 'excels');
  const excelFiles = [];
  
  function scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.xlsx') && item.includes('EY CSS - Datenerhebung')) {
        const subdirectory = path.basename(dirPath);
        excelFiles.push({
          filepath: fullPath,
          filename: item,
          subdirectory: subdirectory
        });
      }
    }
  }
  
  scanDirectory(excelsDir);
  return excelFiles;
}

// Main import function
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
    console.error('Error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
runImport(); 