const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

async function addMissingLeadVertrieb() {
  try {
    console.log('Füge fehlende Lead Vertrieb Profile für alle Ausschreibungen hinzu...');
    
    // Read Excel file
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    const sheetName = "Vertriebsliste";
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Anzahl Zeilen im Tabellenblatt "Vertriebsliste": ${sheetJson.length}`);
    
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < sheetJson.length; i++) {
      const row = sheetJson[i];
      const angefragteLeistung = row["Angefragte Leistung"];
      const leadVertrieb = row["Lead Vertrieb"];
      
      // Skip if no angefragte Leistung or no Lead Vertrieb
      if (!angefragteLeistung || !leadVertrieb || leadVertrieb === "n/a" || leadVertrieb === "tbd") {
        skippedCount++;
        continue;
      }
      
      try {
        // Find the tender by matching angefragte Leistung with title or notes
        const tender = await prisma.callToTender.findFirst({
          where: {
            OR: [
              { title: { contains: angefragteLeistung.toString().trim(), mode: 'insensitive' } },
              { notes: { contains: angefragteLeistung.toString().trim(), mode: 'insensitive' } }
            ]
          },
          include: {
            employees: {
              include: {
                employee: true
              }
            }
          }
        });
        
        if (!tender) {
          console.log(`⚠️  Tender nicht gefunden für: "${angefragteLeistung}"`);
          errorCount++;
          continue;
        }
        
        // Check if Lead Vertrieb is already assigned
        const existingLeadVertrieb = tender.employees.find(emp => 
          emp.employeeCallToTenderRole === 'Lead Vertrieb'
        );
        
        if (existingLeadVertrieb) {
          console.log(`⏭️  Lead Vertrieb bereits zugeordnet für: "${tender.title}"`);
          skippedCount++;
          continue;
        }
        
        // Parse Lead Vertrieb names (can be comma or slash separated)
        const leadVertriebNames = leadVertrieb.toString().split(/[,/]/).map(name => name.trim());
        
        for (const name of leadVertriebNames) {
          if (!name || name === "n/a" || name === "tbd") continue;
          
          // Find employee by pseudonym
          const employee = await prisma.employee.findFirst({
            where: {
              pseudonym: name
            }
          });
          
          if (!employee) {
            console.log(`⚠️  Mitarbeiter "${name}" nicht gefunden für: "${tender.title}"`);
            continue;
          }
          
          // Add Lead Vertrieb
          await prisma.callToTenderEmployee.create({
            data: {
              employeeId: employee.id,
              callToTenderId: tender.id,
              employeeCallToTenderRole: 'Lead Vertrieb',
              role: 'Lead Vertrieb',
              description: `Lead Vertrieb für ${tender.title}`
            }
          });
          
          console.log(`✅ Lead Vertrieb "${employee.pseudonym}" hinzugefügt für: "${tender.title}"`);
          addedCount++;
        }
        
      } catch (error) {
        console.log(`❌ Fehler bei Zeile ${i + 2}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Hinzugefügte Lead Vertrieb Profile: ${addedCount}`);
    console.log(`Übersprungene Einträge: ${skippedCount}`);
    console.log(`Fehler: ${errorCount}`);
    
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Lead Vertrieb Profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingLeadVertrieb(); 