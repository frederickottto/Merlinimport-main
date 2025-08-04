const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

// Helper function to parse Excel date
function parseExcelDate(value) {
  if (!value) return null;
  
  if (value instanceof Date) return value;
  
  if (typeof value === 'number') {
    return new Date((value - 25569) * 86400 * 1000);
  }
  
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  
  return null;
}

// Helper function to determine status based on requirements
function determineStatus(status, art) {
  if (status === "20 In Erstellung") {
    if (art === "TNA") {
      return "In Erstellung TNA";
    } else {
      return "In Erstellung Angebot";
    }
  }
  return status;
}

// Helper function to find or create organisation
async function findOrCreateOrganisation(organisationName) {
  if (!organisationName) return null;
  
  let organisation = await prisma.organisation.findFirst({
    where: { name: organisationName }
  });
  
  if (!organisation) {
    organisation = await prisma.organisation.create({
      data: {
        name: organisationName,
        abbreviation: organisationName.substring(0, 3).toUpperCase()
      }
    });
  }
  
  return organisation;
}

// Helper function to find or create organisation role
async function findOrCreateOrganisationRole(roleName) {
  if (!roleName) return null;
  
  let role = await prisma.organisationRole.findFirst({
    where: { role: roleName }
  });
  
  if (!role) {
    role = await prisma.organisationRole.create({
      data: {
        role: roleName
      }
    });
  }
  
  return role;
}

async function importTendersOriginal() {
  try {
    console.log('Starting tender import with original script...');
    
    // Read the Vertriebsprozess file (instead of Ausschreibungs-Liste.xlsx)
    const tenderWorkbook = xlsx.readFile('tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx');
    const vertriebsliste = tenderWorkbook.Sheets['Vertriebsliste'];
    const tenderData = xlsx.utils.sheet_to_json(vertriebsliste, { header: 1 });
    
    // Read the title file
    const titleWorkbook = xlsx.readFile('tenders/Copy of Vertrieb_mit_laengeren_Titeln.xlsx');
    const titleSheet = titleWorkbook.Sheets[titleWorkbook.SheetNames[0]];
    const titleData = xlsx.utils.sheet_to_json(titleSheet, { header: 1 });
    
    // Create a map of Opp-ID to title from the title file
    const titleMap = new Map();
    for (let i = 1; i < titleData.length; i++) {
      const row = titleData[i];
      if (row && row.length >= 6 && row[2]) { // Opp-ID is in column 2 (index 2)
        const oppId = row[2];
        const title = row[5]; // Titel is in column 5 (index 5)
        if (oppId && title && title !== 'nan') {
          titleMap.set(oppId.toString(), title);
        }
      }
    }
    
    console.log('Title map created with', titleMap.size, 'entries');
    
    // Process tender data starting from row 3 (after headers)
    let processedCount = 0;
    const maxToProcess = 5; // Process next 5 tenders
    
    for (let i = 3; i < tenderData.length && processedCount < maxToProcess; i++) {
      const row = tenderData[i];
      if (!row || row.length < 10) continue;
      
      // Extract data from the row
      const oppId = row[2]; // Opp-ID column
      const art = row[1]; // Art column
      const kunde = row[3]; // Kunde column
      const angefragteLeistung = row[4]; // Angefragte Leistung column
      const status = row[5]; // Status column
      const fragefrist = row[6]; // Fragefrist column
      const abgabefrist = row[7]; // Abgabefrist column
      const tov = row[9]; // ToV in 1.000 column
      const verantwortlicherPartner = row[12]; // verantwortlicher Partner column
      const fachlicherLead = row[13]; // Fachlicher Lead column
      const leadVertrieb = row[14]; // Lead Vertrieb column
      const vertriebsSupport = row[15]; // Vertriebs-support column
      const anmerkungen = row[18]; // Anmerkungen column
      const zuschlagsfrist = row[24]; // Zuschlagsfrist column
      const bindefrist = row[39]; // Bindefrist column
      const vertragsbeginn = row[40]; // Vertragsbeginn column
      const vertragsende = row[41]; // Vertragsende column
      
      // Skip if no Opp-ID
      if (!oppId) continue;
      
      // Check if this tender already exists
      const existingTender = await prisma.callToTender.findFirst({
        where: { 
          shortDescription: oppId.toString() // Using shortDescription to store Opp-ID
        }
      });
      
      if (existingTender) {
        console.log(`Tender with Opp-ID ${oppId} already exists, skipping...`);
        continue;
      }
      
      // Get title from title map
      const title = titleMap.get(oppId.toString()) || angefragteLeistung || 'Untitled Tender';
      
      // Determine status based on requirements
      const finalStatus = determineStatus(status, art);
      
      // Create organisation if needed
      let organisation = null;
      if (kunde) {
        organisation = await findOrCreateOrganisation(kunde);
      }
      
      // Create organisation role
      const organisationRole = await findOrCreateOrganisationRole('Client');
      
      console.log(`Processing tender ${oppId}: ${title}`);
      
      // Create the tender
      const tender = await prisma.callToTender.create({
        data: {
          title: title,
          type: art,
          shortDescription: oppId.toString(), // Store Opp-ID here
          status: finalStatus,
          questionDeadline: parseExcelDate(fragefrist),
          offerDeadline: parseExcelDate(abgabefrist),
          volumeEuro: tov ? parseInt(tov) * 1000 : null, // Convert from thousands to full amount
          notes: anmerkungen,
          bindingDeadline: parseExcelDate(bindefrist),
          projectStart: parseExcelDate(vertragsbeginn),
          projectEnd: parseExcelDate(vertragsende),
          keywords: [art, kunde].filter(Boolean)
        }
      });
      
      // Create organisation relationship if organisation exists
      if (organisation && organisationRole) {
        await prisma.callToTenderOrganisation.create({
          data: {
            organisationIDs: organisation.id,
            callToTenderIDs: tender.id,
            organisationRoleID: organisationRole.id
          }
        });
      }
      
      processedCount++;
      console.log(`Successfully created tender: ${title} (Opp-ID: ${oppId})`);
    }
    
    console.log(`Import completed! Processed ${processedCount} tenders.`);
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importTendersOriginal(); 