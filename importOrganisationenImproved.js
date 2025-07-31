const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

// Funktion zur Validierung und Konvertierung von anualReturn Werten
function validateAndConvertRevenue(revenueValue) {
  if (!revenueValue || revenueValue === '' || revenueValue === null || revenueValue === undefined) {
    return null;
  }

  // Wenn es bereits eine Zahl ist, verwende sie direkt
  if (typeof revenueValue === 'number') {
    return revenueValue;
  }

  // Wenn es ein String ist, versuche ihn zu konvertieren
  if (typeof revenueValue === 'string') {
    // Entferne alle Leerzeichen und Sonderzeichen
    let cleanedValue = revenueValue.trim();
    
    // Entferne Währungssymbole und andere nicht-numerische Zeichen
    cleanedValue = cleanedValue.replace(/[€$£¥,]/g, '');
    cleanedValue = cleanedValue.replace(/\s+/g, ''); // Entferne alle Leerzeichen
    
    // Prüfe auf ungültige Werte
    if (cleanedValue === '' || cleanedValue === '-' || cleanedValue === 'N/A' || cleanedValue === 'n/a') {
      return null;
    }

    // Versuche die Konvertierung zu Float
    const convertedValue = parseFloat(cleanedValue);
    
    if (isNaN(convertedValue)) {
      console.log(`⚠️  Ungültiger Umsatz-Wert übersprungen: "${revenueValue}"`);
      return null;
    }

    return convertedValue;
  }

  // Für alle anderen Typen, versuche eine Konvertierung
  const convertedValue = parseFloat(revenueValue);
  if (isNaN(convertedValue)) {
    console.log(`⚠️  Ungültiger Umsatz-Wert übersprungen: "${revenueValue}"`);
    return null;
  }

  return convertedValue;
}

async function importOrganisations() {
  try {
    console.log('🚀 Starte verbesserten Import von Organisationen...\n');

    // Lade die Excel-Datei
    const workbook = XLSX.readFile('Organisationen.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Gefunden: ${data.length} Organisationen in der Excel-Datei\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const org of data) {
      try {
        // Validiere und konvertiere den Umsatz
        const validatedRevenue = validateAndConvertRevenue(org.annualRevenue);

        // Erstelle oder aktualisiere die Organisation
        const organisationData = {
          name: org.name || '',
          abbreviation: org.abbreviation || '',
          anonymousIdentifier: org.anonymousIdentifier || '',
          parentOrganisationId: org.parentOrganisationId || null,
          childOrganisationsId: org.childOrganisationsId || null,
          employeeNumber: parseInt(org.employeeNumber) || 0,
          anualReturn: validatedRevenue, // Verwende den validierten Wert
          website: org.website || '',
          legalType: org.legalType || '',
          industrySectorIDs: org.industrySectorIDs ? JSON.parse(org.industrySectorIDs) : [],
          locationID: org.locationID || null,
          projectIDs: org.projectIDs ? JSON.parse(org.projectIDs) : [],
          organisationContactsIDs: org.organisationContactsIDs ? JSON.parse(org.organisationContactsIDs) : []
        };

        // Prüfe, ob die Organisation bereits existiert
        const existingOrg = await prisma.organisation.findFirst({
          where: { name: org.name }
        });

        if (existingOrg) {
          // Aktualisiere die bestehende Organisation
          await prisma.organisation.update({
            where: { id: existingOrg.id },
            data: organisationData
          });
          console.log(`✅ Aktualisiert: ${org.name} (Umsatz: ${validatedRevenue})`);
        } else {
          // Erstelle eine neue Organisation
          await prisma.organisation.create({
            data: organisationData
          });
          console.log(`✅ Erstellt: ${org.name} (Umsatz: ${validatedRevenue})`);
        }

        successCount++;
      } catch (error) {
        console.log(`❌ Fehler bei ${org.name}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 IMPORT ZUSAMMENFASSUNG:`);
    console.log(`✅ Erfolgreich: ${successCount}`);
    console.log(`⚠️  Übersprungen: ${skipCount}`);
    console.log(`❌ Fehler: ${errorCount}`);
    console.log(`📈 Gesamt: ${data.length}`);

  } catch (error) {
    console.error('❌ Import fehlgeschlagen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Führe den Import aus
importOrganisations(); 