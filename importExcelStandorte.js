// Script to import locations from Excel file into the app
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();

const prisma = new PrismaClient();

async function importExcelStandorte() {
  console.log("🏢 Importiere Standorte aus Excel-Datei...");
  
  try {
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Read the Excel file
    const workbook = XLSX.readFile('./excels/EY CSS - Datenerhebung MM.xlsx');
    
    // Check if _Daten sheet exists
    if (!workbook.Sheets['_Daten']) {
      console.log("❌ Sheet '_Daten' nicht gefunden!");
      return;
    }
    
    const sheet = workbook.Sheets['_Daten'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`📊 Sheet '_Daten' gefunden mit ${data.length} Zeilen`);
    
    // Extract locations from columns 8, 9, 10, 11 (Straße, Hausnummer, Postleitzahl, Ort)
    const locations = [];
    
    for (let row = 1; row < data.length; row++) {
      const rowData = data[row];
      if (rowData && rowData[8] && rowData[9] && rowData[10] && rowData[11]) {
        const location = {
          street: rowData[8].trim(),
          houseNumber: rowData[9].trim(),
          postCode: rowData[10].trim(),
          city: rowData[11].trim(),
          country: 'Deutschland'
        };
        
        // Check if this location already exists in our array
        const exists = locations.find(loc => 
          loc.street === location.street && 
          loc.houseNumber === location.houseNumber && 
          loc.city === location.city
        );
        
        if (!exists) {
          locations.push(location);
        }
      }
    }
    
    console.log(`📊 Gefundene Standorte in Excel: ${locations.length}`);
    
    // Check existing locations in app
    const existingCount = await prisma.location.count();
    console.log(`📊 Bestehende Standorte in der App: ${existingCount}`);
    
    // Import only new locations
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const location of locations) {
      try {
        // Check if location already exists in database
        const existing = await prisma.location.findFirst({
          where: {
            street: location.street,
            houseNumber: location.houseNumber,
            city: location.city
          }
        });
        
        if (!existing) {
          await prisma.location.create({
            data: {
              street: location.street,
              houseNumber: location.houseNumber,
              postCode: location.postCode,
              city: location.city,
              region: 'Unknown', // Default region
              country: location.country
            }
          });
          console.log(`✅ Hinzugefügt: ${location.street} ${location.houseNumber}, ${location.postCode} ${location.city}`);
          importedCount++;
        } else {
          console.log(`⏭️  Bereits vorhanden: ${location.street} ${location.houseNumber}, ${location.city}`);
          skippedCount++;
        }
      } catch (error) {
        console.log(`❌ Fehler beim Hinzufügen von ${location.street} ${location.houseNumber}, ${location.city}: ${error.message}`);
      }
    }
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Neue Standorte hinzugefügt: ${importedCount}`);
    console.log(`   ⏭️  Bereits vorhanden (übersprungen): ${skippedCount}`);
    
    // Verify the final count
    const finalCount = await prisma.location.count();
    console.log(`   📊 Gesamt Standorte in der App: ${finalCount}`);
    
    // Show some examples of newly added locations
    const newLocations = await prisma.location.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n📋 Beispiele neu hinzugefügter Standorte:`);
    for (const location of newLocations) {
      console.log(`   - ${location.street} ${location.houseNumber}, ${location.postCode} ${location.city}`);
    }
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

importExcelStandorte(); 