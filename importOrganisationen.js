// Script to import organizations from Excel file into the app
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();

const prisma = new PrismaClient();

// Funktion zur Konvertierung von Umsatz-Strings zu Float
function convertRevenueString(revenueString) {
  if (!revenueString || revenueString === '' || revenueString === null || revenueString === undefined) {
    return null;
  }

  // String bereinigen
  let cleanedValue = revenueString.toString().trim();
  
  // Währungssymbol und Leerzeichen entfernen
  cleanedValue = cleanedValue.replace(/[€\s]/g, '');
  
  // Deutsche Zahlenformatierung (Komma als Dezimaltrennzeichen) zu Punkt konvertieren
  cleanedValue = cleanedValue.replace(/\./g, '').replace(/,/g, '.');
  
  // Zu Float konvertieren
  const floatValue = parseFloat(cleanedValue);
  
  if (isNaN(floatValue)) {
    console.log(`⚠️  Konnte Umsatz nicht konvertieren: "${revenueString}" -> null`);
    return null;
  }
  
  return floatValue;
}

async function importOrganisationen() {
  console.log("🏢 Importiere Organisationen aus Excel-Datei...");
  
  try {
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/OrganisationenÜbersicht.xlsx');
    
    // Check if Sheet1 exists
    if (!workbook.Sheets['Sheet1']) {
      console.log("❌ Sheet 'Sheet1' nicht gefunden!");
      return;
    }
    
    const sheet = workbook.Sheets['Sheet1'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`📊 Sheet 'Sheet1' gefunden mit ${data.length} Zeilen`);
    
    // Extract organizations from data
    const organizations = [];
    const seenOrganizations = new Set(); // To track duplicates
    
    for (let row = 1; row < data.length; row++) {
      const rowData = data[row];
      if (rowData && rowData[1]) { // Column 1 is "Name"
        const name = rowData[1]?.toString().trim();
        const abbreviation = rowData[2]?.toString().trim() || '';
        const legalForm = rowData[3]?.toString().trim() || '';
        const industry = rowData[4]?.toString().trim() || '';
        const employeeCount = rowData[5] ? parseInt(rowData[5]) || 0 : 0;
        const revenueString = rowData[6]?.toString().trim() || '';
        const website = rowData[7]?.toString().trim() || '';
        const street = rowData[9]?.toString().trim() || '';
        const houseNumber = rowData[10]?.toString().trim() || '';
        const postCode = rowData[11]?.toString().trim() || '';
        const city = rowData[12]?.toString().trim() || '';
        const role = rowData[13]?.toString().trim() || '';
        
        // Umsatz korrekt konvertieren
        const annualRevenue = convertRevenueString(revenueString);
        
        // Create a unique key for duplicate detection
        const uniqueKey = `${name}|${abbreviation}|${legalForm}|${industry}|${employeeCount}|${revenueString}|${website}|${street}|${houseNumber}|${postCode}|${city}|${role}`;
        
        if (name && !seenOrganizations.has(uniqueKey)) {
          seenOrganizations.add(uniqueKey);
          
          const organization = {
            name: name,
            abbreviation: abbreviation,
            anonymousIdentifier: '', // Leer lassen wie gewünscht
            website: website,
            employeeCount: employeeCount,
            annualRevenue: annualRevenue, // Jetzt korrekt konvertiert
            legalForm: legalForm,
            industry: industry,
            parentCompany: '', // Leer lassen wie gewünscht
            role: role,
            // Address fields
            street: street,
            houseNumber: houseNumber,
            postCode: postCode,
            city: city
          };
          
          organizations.push(organization);
        } else if (name && seenOrganizations.has(uniqueKey)) {
          console.log(`⏭️  Duplikat übersprungen: ${name}`);
        }
      }
    }
    
    console.log(`📊 Gefundene Organisationen: ${organizations.length} (Duplikate entfernt)`);
    
    // Check existing organizations in app
    const existingCount = await prisma.organisation.count();
    console.log(`📊 Bestehende Organisationen in der App: ${existingCount}`);
    
    // Import organizations
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const org of organizations) {
      try {
        // Check if organization already exists in database
        const existing = await prisma.organisation.findFirst({
          where: {
            name: org.name
          }
        });
        
        // Find or create location
        let location = null;
        if (org.street || org.city) {
          location = await prisma.location.findFirst({
            where: {
              street: org.street,
              city: org.city
            }
          });
          
          // Create location if it doesn't exist
          if (!location && (org.street || org.city)) {
            location = await prisma.location.create({
              data: {
                street: org.street,
                houseNumber: org.houseNumber,
                postCode: org.postCode,
                city: org.city
              }
            });
            console.log(`📍 Neue Location erstellt: ${org.street} ${org.houseNumber}, ${org.postCode} ${org.city}`);
          }
          
          if (location) {
            console.log(`📍 Location gefunden: ${org.street} ${org.houseNumber}, ${org.postCode} ${org.city} für ${org.name}`);
          }
        }
        
        // Find or create industry sector
        let industrySector = null;
        if (org.industry && org.industry !== 'Branche') {
          industrySector = await prisma.industrySector.findFirst({
            where: {
              industrySector: org.industry
            }
          });
          
          // Create industry sector if it doesn't exist
          if (!industrySector) {
            industrySector = await prisma.industrySector.create({
              data: {
                industrySector: org.industry,
                industrySectorEY: org.industry
              }
            });
            console.log(`🏭 Neue Branche erstellt: ${org.industry}`);
          }
          
          if (industrySector) {
            console.log(`🏭 Branche gefunden: ${org.industry} für ${org.name}`);
          }
        }
        
        if (!existing) {
          // Create new organization
          await prisma.organisation.create({
            data: {
              name: org.name,
              abbreviation: org.abbreviation,
              anonymousIdentifier: org.anonymousIdentifier,
              website: org.website,
              employeeNumber: org.employeeCount,
              anualReturn: org.annualRevenue, // Jetzt korrekt konvertiert
              legalType: org.legalForm,
              // Link to location if found
              ...(location && { locationID: location.id }),
              // Link to industry sector if found
              ...(industrySector && { industrySectorIDs: [industrySector.id] })
            }
          });
          
          console.log(`✅ Importiert: ${org.name} (Umsatz: ${org.annualRevenue})`);
          importedCount++;
        } else {
          // Update existing organization with new data from Excel
          await prisma.organisation.update({
            where: {
              id: existing.id
            },
            data: {
              abbreviation: org.abbreviation || existing.abbreviation,
              anonymousIdentifier: org.anonymousIdentifier || existing.anonymousIdentifier,
              website: org.website || existing.website,
              employeeNumber: org.employeeCount || existing.employeeNumber,
              anualReturn: org.annualRevenue || existing.anualReturn, // Jetzt korrekt konvertiert
              legalType: org.legalForm || existing.legalType,
              // Link to location if found
              ...(location && { locationID: location.id }),
              // Link to industry sector if found
              ...(industrySector && { industrySectorIDs: [industrySector.id] })
            }
          });
          
          console.log(`🔄 Aktualisiert: ${org.name} (Umsatz: ${org.annualRevenue})`);
          importedCount++;
        }
      } catch (error) {
        console.log(`❌ Fehler beim Import von ${org.name}: ${error.message}`);
      }
    }
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Neue Organisationen hinzugefügt: ${importedCount}`);
    console.log(`   ⏭️  Bereits vorhanden (übersprungen): ${skippedCount}`);
    
    // Verify the final count
    const finalCount = await prisma.organisation.count();
    console.log(`   📊 Gesamt Organisationen in der App: ${finalCount}`);
    
    // Show some examples of newly added organizations
    const newOrganizations = await prisma.organisation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n📋 Beispiele neu hinzugefügter Organisationen:`);
    for (const org of newOrganizations) {
      console.log(`   - ${org.name} (${org.abbreviation || 'keine Abkürzung'}) - Umsatz: ${org.anualReturn}`);
    }
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

importOrganisationen(); 