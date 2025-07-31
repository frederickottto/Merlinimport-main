const { PrismaClient } = require("@prisma/client");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const prisma = new PrismaClient();

// Helper function to parse Excel date
function parseExcelDate(value) {
  if (!value) return null;
  
  try {
    if (typeof value === 'number') {
      // Excel date number - check if it's a valid Excel date
      if (value < 1 || value > 100000) {
        return null; // Invalid Excel date
      }
      const date = new Date((value - 25569) * 86400 * 1000);
      // Check if the date is reasonable (between 1900 and 2100)
      if (date.getFullYear() < 1900 || date.getFullYear() > 2100) {
        return null;
      }
      return date;
    } else if (typeof value === 'string') {
      // Try to parse date string
      const date = new Date(value);
      if (!isNaN(date.getTime()) && date.getFullYear() >= 1900 && date.getFullYear() <= 2100) {
        return date;
      }
    }
  } catch (error) {
    console.log(`Error parsing date value: ${value}`);
  }
  
  return null;
}

// Function to process academic degree from Excel
async function processAcademicDegreeFromExcel(record, employee) {
  if (!record || !employee) return;
  
  const data = {
    degreeTitleLong: record['Abschluss'] || record['Degree'] || '',
    degreeTitleShort: record['Abschluss'] || record['Degree'] || '',
    university: record['Bildungseinrichtung'] || record['Institution'] || '',
    study: record['Studienfach'] || record['Study'] || '',
    studyEnd: parseExcelDate(record['Studium Ende'] || record['Abschlussjahr'] || record['Graduation Year']),
    employeeIDs: employee.id
  };
  
  // Only create if we have at least a degree title
  if (data.degreeTitleLong) {
    try {
      await prisma.academicDegree.create({
        data: data
      });
      console.log(`Created degree for ${employee.pseudonym}: ${data.degreeTitleLong} at ${data.university}`);
    } catch (error) {
      console.log(`Error creating degree for ${employee.pseudonym}: ${error.message}`);
    }
  }
}

// Function to process Excel file and restore academic degrees
async function processExcelFileForRestore(fileInfo) {
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
    
    // Find or create employee
    let employee = await prisma.employee.findFirst({
      where: { pseudonym: employeePseudonym }
    });
    
    if (!employee) {
      console.log(`Employee ${employeePseudonym} not found, creating...`);
      employee = await prisma.employee.create({
        data: {
          foreName: employeePseudonym,
          lastName: '',
          pseudonym: employeePseudonym
        }
      });
    }
    
    // Process AkademischerAbschluss sheet
    if (sheets.includes('AkademischerAbschluss')) {
      console.log(`Processing AkademischerAbschluss sheet for ${employeePseudonym}`);
      const sheet = workbook.Sheets['AkademischerAbschluss'];
      
      let sheetJson = [];
      
      // Handle the sheet structure
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
      
      // Process each record
      for (const record of sheetJson) {
        if (record && (record['Abschluss'] || record['Degree'])) {
          // Convert numeric values to strings
          const processedRecord = {};
          for (const [key, value] of Object.entries(record)) {
            if (typeof value === 'number') {
              processedRecord[key] = value.toString();
            } else {
              processedRecord[key] = value;
            }
          }
          await processAcademicDegreeFromExcel(processedRecord, employee);
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

// Main function to restore original data
async function restoreOriginalData() {
  try {
    console.log('Starting restoration of original academic degree data...');
    
    // First, clear all existing academic degrees
    console.log('Clearing existing academic degrees...');
    await prisma.academicDegree.deleteMany({});
    console.log('All existing academic degrees cleared.');
    
    const excelFiles = findExcelFiles();
    console.log(`Found ${excelFiles.length} Excel files to process`);
    
    for (const fileInfo of excelFiles) {
      await processExcelFileForRestore(fileInfo);
    }
    
    console.log('Restoration completed successfully!');
    
    // Show final state
    console.log('\nFinal state:');
    const finalEmployees = await prisma.employee.findMany({
      include: {
        academicDegree: true
      }
    });
    
    let totalDegrees = 0;
    let employeesWithDegrees = 0;
    
    for (const employee of finalEmployees) {
      if (employee.academicDegree.length > 0) {
        employeesWithDegrees++;
        totalDegrees += employee.academicDegree.length;
        console.log(`Employee ${employee.pseudonym}: ${employee.academicDegree.length} degrees`);
        
        for (const degree of employee.academicDegree) {
          console.log(`  - ${degree.degreeTitleLong || degree.degreeTitleShort} at ${degree.university || 'No university'}`);
        }
      }
    }
    
    console.log(`\nFinal Summary:`);
    console.log(`Employees with degrees: ${employeesWithDegrees}`);
    console.log(`Total degrees: ${totalDegrees}`);
    
  } catch (error) {
    console.error('Error during restoration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
restoreOriginalData(); 