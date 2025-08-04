const { PrismaClient } = require('@prisma/client');
const xlsx = require("xlsx");
require("dotenv").config();

const prisma = new PrismaClient();

async function comprehensiveTenderUpdate() {
  try {
    console.log('Umfassende Überprüfung und Aktualisierung aller Ausschreibungen...');
    
    // Read Excel files
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const titleFile = 'tenders/Copy of Vertrieb_mit_laengeren_Titeln.xlsx';
    
    const workbook = xlsx.readFile(tendersFile);
    const titleWorkbook = xlsx.readFile(titleFile);
    
    const sheetName = "Vertriebsliste";
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    const titleSheet = titleWorkbook.Sheets[0];
    const titleData = xlsx.utils.sheet_to_json(titleSheet, { header: 1, defval: null });
    
    console.log(`Anzahl Zeilen im Tabellenblatt "Vertriebsliste": ${sheetJson.length}`);
    console.log(`Anzahl Zeilen in Titel-Excel: ${titleData.length}`);
    
    // Create title mapping
    const titleMap = new Map();
    for (let i = 1; i < titleData.length; i++) {
      const row = titleData[i];
      if (row && row.length >= 6) {
        const number = row[0]; // # column (index 0)
        const customerName = row[3]; // Kunde column (index 3)
        const title = row[5]; // Titel column (index 5)
        if (customerName && title && title !== 'nan') {
          const key = `${customerName.toString().trim()}_${number ? number.toString().trim() : ''}`;
          titleMap.set(key, title.toString().trim());
          titleMap.set(customerName.toString().trim(), title.toString().trim());
        }
      }
    }
    
    let totalTenders = 0;
    let updatedTenders = 0;
    let addedEmployees = 0;
    let addedOrganisations = 0;
    let updatedTitles = 0;
    let errors = 0;
    
    // Get all tenders from database
    const dbTenders = await prisma.callToTender.findMany({
      include: {
        employees: {
          include: {
            employee: true
          }
        },
        organisations: {
          include: {
            organisation: true,
            organisationRole: true
          }
        }
      }
    });
    
    console.log(`Anzahl Tender in Datenbank: ${dbTenders.length}`);
    
    // Process each Excel row
    for (let i = 0; i < sheetJson.length; i++) {
      const row = sheetJson[i];
      const angefragteLeistung = row["Angefragte Leistung"];
      const kunde = row["Kunde"];
      
      if (!angefragteLeistung || !kunde || angefragteLeistung === "n/a" || kunde === "n/a") {
        continue;
      }
      
      totalTenders++;
      
      try {
        // Find matching tender
        const tender = dbTenders.find(t => 
          (t.title && t.title.includes(angefragteLeistung.toString().trim())) ||
          (t.notes && t.notes.includes(angefragteLeistung.toString().trim())) ||
          (t.title && angefragteLeistung.toString().trim().includes(t.title)) ||
          (t.notes && angefragteLeistung.toString().trim().includes(t.notes))
        );
        
        if (!tender) {
          console.log(`⚠️  Tender nicht gefunden für: "${angefragteLeistung}"`);
          continue;
        }
        
        let tenderUpdated = false;
        
        // 1. Check and update title
        if (kunde) {
          const customerName = kunde.toString().trim();
          const number = row["#"] ? row["#"].toString().trim() : "";
          const keyWithNumber = `${customerName}_${number}`;
          let betterTitle = titleMap.get(keyWithNumber);
          if (!betterTitle) {
            betterTitle = titleMap.get(customerName);
          }
          if (betterTitle && tender.title !== betterTitle) {
            await prisma.callToTender.update({
              where: { id: tender.id },
              data: { title: betterTitle }
            });
            console.log(`✅ Titel aktualisiert für "${tender.title}" → "${betterTitle}"`);
            updatedTitles++;
            tenderUpdated = true;
          }
        }
        
        // 2. Check and add organisation
        const existingOrg = tender.organisations.find(org => 
          org.organisation.name === kunde.toString().trim()
        );
        
        if (!existingOrg) {
          // Find or create organisation
          let organisation = await prisma.organisation.findFirst({
            where: { name: kunde.toString().trim() }
          });
          
          if (!organisation) {
            organisation = await prisma.organisation.create({
              data: {
                name: kunde.toString().trim(),
                abbreviation: kunde.toString().trim().substring(0, 3).toUpperCase()
              }
            });
          }
          
          // Find or create organisation role
          let organisationRole = await prisma.organisationRole.findFirst({
            where: { role: 'Client' }
          });
          
          if (!organisationRole) {
            organisationRole = await prisma.organisationRole.create({
              data: { role: 'Client' }
            });
          }
          
          // Create relationship
          await prisma.callToTenderOrganisation.create({
            data: {
              organisation: {
                connect: { id: organisation.id }
              },
              organisationRole: {
                connect: { id: organisationRole.id }
              },
              callToTender: {
                connect: { id: tender.id }
              }
            }
          });
          
          console.log(`✅ Organisation hinzugefügt: "${kunde}" für "${tender.title}"`);
          addedOrganisations++;
          tenderUpdated = true;
        }
        
        // 3. Check and add employees
        const employeeRoles = {
          "Opp Partner": row["Opp Partner"],
          "Fachverantwortlicher": row["Fachlicher Lead"],
          "Lead Vertrieb": row["Lead Vertrieb"]
        };
        
        for (const [roleName, excelValue] of Object.entries(employeeRoles)) {
          if (excelValue && excelValue !== "n/a" && excelValue !== "tbd") {
            const existingEmployee = tender.employees.find(emp => 
              emp.employeeCallToTenderRole === roleName
            );
            
            if (!existingEmployee) {
              const names = excelValue.toString().split(/[,/]/).map(name => name.trim());
              for (const name of names) {
                if (!name || name === "n/a" || name === "tbd") continue;
                
                // Find employee by pseudonym
                const employee = await prisma.employee.findFirst({
                  where: { pseudonym: name }
                });
                
                if (employee) {
                  await prisma.callToTenderEmployee.create({
                    data: {
                      employeeId: employee.id,
                      callToTenderId: tender.id,
                      employeeCallToTenderRole: roleName,
                      role: roleName,
                      description: `${roleName} für ${tender.title}`
                    }
                  });
                  
                  console.log(`✅ Mitarbeiter hinzugefügt: "${employee.pseudonym}" als ${roleName} für "${tender.title}"`);
                  addedEmployees++;
                  tenderUpdated = true;
                } else {
                  console.log(`⚠️  Mitarbeiter "${name}" nicht gefunden für ${roleName} in "${tender.title}"`);
                }
              }
            }
          }
        }
        
        if (tenderUpdated) {
          updatedTenders++;
        }
        
      } catch (error) {
        console.log(`❌ Fehler bei Zeile ${i + 2}: ${error.message}`);
        errors++;
      }
    }
    
    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Verarbeitete Excel-Einträge: ${totalTenders}`);
    console.log(`Aktualisierte Tender: ${updatedTenders}`);
    console.log(`Hinzugefügte Mitarbeiter: ${addedEmployees}`);
    console.log(`Hinzugefügte Organisationen: ${addedOrganisations}`);
    console.log(`Aktualisierte Titel: ${updatedTitles}`);
    console.log(`Fehler: ${errors}`);
    
  } catch (error) {
    console.error('Fehler bei der umfassenden Überprüfung:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveTenderUpdate(); 