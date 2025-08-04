const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

async function investigateImportIssues() {
  try {
    console.log('🔍 Untersuche Import-Probleme...');
    
    // Read Excel file
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    
    const sheetName = "Vertriebsliste";
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Excel-Zeilen: ${sheetJson.length}`);
    
    // Get all tenders from database
    const dbTenders = await prisma.callToTender.findMany({
      include: {
        organisations: {
          include: {
            organisation: true
          }
        },
        employees: {
          include: {
            employee: true
          }
        }
      }
    });
    
    console.log(`Datenbank-Tender: ${dbTenders.length}`);
    
    // 1. Check for specific BWFuhrpark Services issue
    console.log('\n=== BWFUHRPARK SERVICES UNTERSUCHUNG ===');
    const bwfuhrparkExcel = sheetJson.find(row => 
      row["Kunde"] && row["Kunde"].toString().includes("BWFuhrpark")
    );
    
    if (bwfuhrparkExcel) {
      console.log('Excel-Daten für BWFuhrpark:');
      console.log(`  Kunde: ${bwfuhrparkExcel["Kunde"]}`);
      console.log(`  Status: ${bwfuhrparkExcel["Status"]}`);
      console.log(`  Angefragte Leistung: ${bwfuhrparkExcel["Angefragte Leistung"]}`);
      console.log(`  Opp-ID: ${bwfuhrparkExcel["Opp-ID"]}`);
    }
    
    const bwfuhrparkDB = dbTenders.find(t => 
      t.organisations.some(org => 
        org.organisation.name.includes("BWFuhrpark")
      )
    );
    
    if (bwfuhrparkDB) {
      console.log('\nDatenbank-Daten für BWFuhrpark:');
      console.log(`  Titel: ${bwfuhrparkDB.title}`);
      console.log(`  Status: ${bwfuhrparkDB.status}`);
      console.log(`  Notes: ${bwfuhrparkDB.notes}`);
      console.log(`  Short Description: ${bwfuhrparkDB.shortDescription}`);
    }
    
    // 2. Check for KBR duplicate issues
    console.log('\n=== KBR DUPLIKAT UNTERSUCHUNG ===');
    const kbrAssignments = await prisma.callToTenderEmployee.findMany({
      where: {
        employee: {
          pseudonym: "KBR"
        }
      },
      include: {
        employee: true,
        callToTender: {
          select: {
            title: true,
            id: true
          }
        }
      }
    });
    
    console.log(`KBR Zuweisungen gefunden: ${kbrAssignments.length}`);
    
    // Group by tender
    const kbrByTender = {};
    kbrAssignments.forEach(assignment => {
      const tenderId = assignment.callToTender.id;
      if (!kbrByTender[tenderId]) {
        kbrByTender[tenderId] = {
          title: assignment.callToTender.title,
          assignments: []
        };
      }
      kbrByTender[tenderId].assignments.push({
        role: assignment.employeeCallToTenderRole,
        id: assignment.id
      });
    });
    
    console.log('\nKBR Zuweisungen nach Tender:');
    Object.entries(kbrByTender).forEach(([tenderId, data]) => {
      console.log(`\nTender: "${data.title}" (ID: ${tenderId})`);
      data.assignments.forEach(assignment => {
        console.log(`  - Rolle: ${assignment.role} (ID: ${assignment.id})`);
      });
    });
    
    // 3. Check for date issues
    console.log('\n=== DATUM UNTERSUCHUNG ===');
    const tendersWithDates = dbTenders.filter(t => 
      t.offerDeadline || t.questionDeadline || t.bindingDeadline
    );
    
    console.log(`Tender mit Datumsfeldern: ${tendersWithDates.length}`);
    
    // Sample some tenders with dates
    tendersWithDates.slice(0, 5).forEach(tender => {
      console.log(`\nTender: "${tender.title}"`);
      console.log(`  Angebotsfrist: ${tender.offerDeadline}`);
      console.log(`  Fragefrist: ${tender.questionDeadline}`);
      console.log(`  Bindefrist: ${tender.bindingDeadline}`);
    });
    
    // 4. Check for status inconsistencies
    console.log('\n=== STATUS INKONSISTENZEN ===');
    let statusMismatches = [];
    
    for (const excelRow of sheetJson.slice(0, 50)) { // Check first 50 rows
      const kunde = excelRow["Kunde"];
      const excelStatus = excelRow["Status"];
      const angefragteLeistung = excelRow["Angefragte Leistung"];
      
      if (!kunde || !angefragteLeistung || kunde === "n/a" || angefragteLeistung === "n/a") {
        continue;
      }
      
      // Find matching tender
      const matchingTender = dbTenders.find(t => 
        t.organisations.some(org => 
          org.organisation.name === kunde.toString().trim()
        ) ||
        (t.notes && t.notes.includes(angefragteLeistung.toString().trim())) ||
        (t.title && t.title.includes(angefragteLeistung.toString().trim()))
      );
      
      if (matchingTender && excelStatus && excelStatus !== "n/a") {
        const excelStatusClean = excelStatus.toString().trim();
        const dbStatus = matchingTender.status;
        
        if (excelStatusClean !== dbStatus) {
          statusMismatches.push({
            tender: matchingTender.title,
            kunde: kunde.toString().trim(),
            excelStatus: excelStatusClean,
            dbStatus: dbStatus,
            angefragteLeistung: angefragteLeistung.toString().trim()
          });
        }
      }
    }
    
    console.log(`Status-Inkonsistenzen gefunden: ${statusMismatches.length}`);
    statusMismatches.slice(0, 10).forEach(mismatch => {
      console.log(`\n"${mismatch.tender}"`);
      console.log(`  Kunde: ${mismatch.kunde}`);
      console.log(`  Excel Status: ${mismatch.excelStatus}`);
      console.log(`  DB Status: ${mismatch.dbStatus}`);
      console.log(`  Leistung: ${mismatch.angefragteLeistung}`);
    });
    
    // 5. Check for duplicate employee assignments
    console.log('\n=== DUPLIKAT MITARBEITER ZUWEISUNGEN ===');
    const allEmployeeAssignments = await prisma.callToTenderEmployee.findMany({
      include: {
        employee: true,
        callToTender: {
          select: {
            title: true,
            id: true
          }
        }
      }
    });
    
    // Group by tender and employee
    const assignmentsByTender = {};
    allEmployeeAssignments.forEach(assignment => {
      const tenderId = assignment.callToTender.id;
      const employeeId = assignment.employee.id;
      const key = `${tenderId}-${employeeId}`;
      
      if (!assignmentsByTender[key]) {
        assignmentsByTender[key] = {
          tender: assignment.callToTender.title,
          employee: assignment.employee.pseudonym,
          assignments: []
        };
      }
      assignmentsByTender[key].assignments.push({
        role: assignment.employeeCallToTenderRole,
        id: assignment.id
      });
    });
    
    const duplicates = Object.entries(assignmentsByTender).filter(([key, data]) => 
      data.assignments.length > 1
    );
    
    console.log(`Duplikat-Zuweisungen gefunden: ${duplicates.length}`);
    duplicates.slice(0, 10).forEach(([key, data]) => {
      console.log(`\n"${data.tender}" - ${data.employee}`);
      data.assignments.forEach(assignment => {
        console.log(`  - ${assignment.role} (ID: ${assignment.id})`);
      });
    });
    
    // 6. Check total employee assignments
    console.log('\n=== GESAMT MITARBEITER ZUWEISUNGEN ===');
    const employeeCounts = {};
    allEmployeeAssignments.forEach(assignment => {
      const pseudonym = assignment.employee.pseudonym;
      if (!employeeCounts[pseudonym]) {
        employeeCounts[pseudonym] = 0;
      }
      employeeCounts[pseudonym]++;
    });
    
    console.log('Mitarbeiter mit den meisten Zuweisungen:');
    Object.entries(employeeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([pseudonym, count]) => {
        console.log(`  ${pseudonym}: ${count} Zuweisungen`);
      });
    
  } catch (error) {
    console.error('Fehler bei der Untersuchung:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateImportIssues(); 