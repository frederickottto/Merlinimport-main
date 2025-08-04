const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

async function fixImportIssues() {
  try {
    console.log('🔧 Behebe Import-Probleme...');
    
    // Read Excel file
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    
    const sheetName = "Vertriebsliste";
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Excel-Zeilen: ${sheetJson.length}`);
    
    // 1. Fix duplicate employee assignments
    console.log('\n=== BEHEBE DUPLIKAT MITARBEITER ZUWEISUNGEN ===');
    
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
        id: assignment.id,
        role: assignment.employeeCallToTenderRole
      });
    });
    
    let duplicateCount = 0;
    let deletedCount = 0;
    
    for (const [key, data] of Object.entries(assignmentsByTender)) {
      if (data.assignments.length > 1) {
        console.log(`\nDuplikate gefunden: "${data.tender}" - ${data.employee}`);
        
        // Keep the first assignment, delete the rest
        const toKeep = data.assignments[0];
        const toDelete = data.assignments.slice(1);
        
        console.log(`  Behalte: ${toKeep.role} (ID: ${toKeep.id})`);
        
        for (const assignment of toDelete) {
          console.log(`  Lösche: ${assignment.role} (ID: ${assignment.id})`);
          
          await prisma.callToTenderEmployee.delete({
            where: { id: assignment.id }
          });
          
          deletedCount++;
        }
        
        duplicateCount++;
      }
    }
    
    console.log(`\nDuplikate behoben: ${duplicateCount} Tender, ${deletedCount} Einträge gelöscht`);
    
    // 2. Fix status inconsistencies
    console.log('\n=== BEHEBE STATUS INKONSISTENZEN ===');
    
    const dbTenders = await prisma.callToTender.findMany({
      include: {
        organisations: {
          include: {
            organisation: true
          }
        }
      }
    });
    
    let statusFixed = 0;
    
    for (const excelRow of sheetJson) {
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
        
        // Map Excel status to correct database status
        let correctStatus = null;
        
        if (excelStatusClean === "02 Präqualifizierung") {
          correctStatus = "Präqualifizierung";
        } else if (excelStatusClean === "10 Nicht angeboten") {
          correctStatus = "Nicht angeboten";
        } else if (excelStatusClean === "20 In Erstellung") {
          correctStatus = "In Erstellung Angebot";
        } else if (excelStatusClean === "30 Versendet") {
          correctStatus = "Versendet";
        } else if (excelStatusClean === "41 Gewonnen") {
          correctStatus = "Gewonnen";
        } else if (excelStatusClean === "42 Verloren") {
          correctStatus = "Verloren";
        } else if (excelStatusClean === "43 Zurückgezogen durch Kunde") {
          correctStatus = "Zurückgezogen";
        } else if (excelStatusClean === "90 Anderer im Lead - angeboten") {
          correctStatus = "Anderer im Lead";
        } else if (excelStatusClean === "94 - Anderer im Lead - Zuarbeit CSS") {
          correctStatus = "Anderer im Lead";
        } else if (excelStatusClean === "00 Warten auf Veröffentlichung") {
          correctStatus = " ";
        } else if (excelStatusClean === "01 Lead") {
          correctStatus = " ";
        }
        
        if (correctStatus && correctStatus !== dbStatus) {
          console.log(`🔄 Status korrigiert: "${matchingTender.title}"`);
          console.log(`   Von: "${dbStatus}" → "${correctStatus}"`);
          console.log(`   Excel: ${excelStatusClean}`);
          
          await prisma.callToTender.update({
            where: { id: matchingTender.id },
            data: { status: correctStatus }
          });
          
          statusFixed++;
        }
      }
    }
    
    console.log(`\nStatus-Inkonsistenzen behoben: ${statusFixed}`);
    
    // 3. Fix specific BWFuhrpark issue
    console.log('\n=== BEHEBE BWFUHRPARK SPEZIFISCHES PROBLEM ===');
    
    const bwfuhrparkTender = dbTenders.find(t => 
      t.organisations.some(org => 
        org.organisation.name.includes("BWFuhrpark")
      )
    );
    
    if (bwfuhrparkTender) {
      console.log(`BWFuhrpark Tender gefunden: "${bwfuhrparkTender.title}"`);
      console.log(`Aktueller Status: ${bwfuhrparkTender.status}`);
      
      // Fix the status to match Excel
      await prisma.callToTender.update({
        where: { id: bwfuhrparkTender.id },
        data: { status: "Präqualifizierung" }
      });
      
      console.log(`Status korrigiert zu: "Präqualifizierung"`);
    }
    
    // 4. Clean up excessive KBR assignments
    console.log('\n=== BEREINIGE ÜBERMÄSSIGE KBR ZUWEISUNGEN ===');
    
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
    
    console.log(`KBR Zuweisungen vor Bereinigung: ${kbrAssignments.length}`);
    
    // Keep only one assignment per tender for KBR
    const kbrByTender = {};
    kbrAssignments.forEach(assignment => {
      const tenderId = assignment.callToTender.id;
      if (!kbrByTender[tenderId]) {
        kbrByTender[tenderId] = {
          title: assignment.callToTender.title,
          assignments: []
        };
      }
      kbrByTender[tenderId].assignments.push(assignment);
    });
    
    let kbrDeleted = 0;
    
    for (const [tenderId, data] of Object.entries(kbrByTender)) {
      if (data.assignments.length > 1) {
        console.log(`\nKBR Duplikate in "${data.title}": ${data.assignments.length} Zuweisungen`);
        
        // Keep the first one, delete the rest
        const toKeep = data.assignments[0];
        const toDelete = data.assignments.slice(1);
        
        console.log(`  Behalte: ${toKeep.employeeCallToTenderRole} (ID: ${toKeep.id})`);
        
        for (const assignment of toDelete) {
          console.log(`  Lösche: ${assignment.employeeCallToTenderRole} (ID: ${assignment.id})`);
          
          await prisma.callToTenderEmployee.delete({
            where: { id: assignment.id }
          });
          
          kbrDeleted++;
        }
      }
    }
    
    console.log(`\nKBR Duplikate gelöscht: ${kbrDeleted}`);
    
    // 5. Verify fixes
    console.log('\n=== VERIFIZIERUNG DER KORREKTUREN ===');
    
    const finalKbrCount = await prisma.callToTenderEmployee.count({
      where: {
        employee: {
          pseudonym: "KBR"
        }
      }
    });
    
    const finalDuplicateCount = await prisma.callToTenderEmployee.findMany({
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
    
    // Check for remaining duplicates
    const remainingDuplicates = {};
    finalDuplicateCount.forEach(assignment => {
      const key = `${assignment.callToTender.id}-${assignment.employee.id}`;
      if (!remainingDuplicates[key]) {
        remainingDuplicates[key] = 0;
      }
      remainingDuplicates[key]++;
    });
    
    const stillDuplicated = Object.values(remainingDuplicates).filter(count => count > 1).length;
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`KBR Zuweisungen nach Bereinigung: ${finalKbrCount}`);
    console.log(`Verbleibende Duplikate: ${stillDuplicated}`);
    console.log(`Status-Inkonsistenzen behoben: ${statusFixed}`);
    console.log(`Duplikat-Zuweisungen gelöscht: ${deletedCount}`);
    
    console.log(`\n✅ Import-Probleme behoben!`);
    
  } catch (error) {
    console.error('Fehler beim Beheben der Import-Probleme:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImportIssues(); 