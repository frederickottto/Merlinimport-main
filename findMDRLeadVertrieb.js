const xlsx = require("xlsx");
require("dotenv").config();

async function findMDRLeadVertrieb() {
  try {
    console.log('Suche nach MDR Ausschreibungen in der Excel-Datei...');
    
    const tendersFile = 'tenders/Copy of EY CSS - Überblick Vertriebsprozess (version 1).xlsx';
    const workbook = xlsx.readFile(tendersFile);
    const sheetName = "Vertriebsliste";
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 2 });
    
    console.log(`Anzahl Zeilen im Tabellenblatt "Vertriebsliste": ${sheetJson.length}`);
    
    const mdrEntries = [];
    
    for (let i = 0; i < sheetJson.length; i++) {
      const row = sheetJson[i];
      const angefragteLeistung = row["Angefragte Leistung"];
      const kunde = row["Kunde"];
      const oppPartner = row["Opp Partner"];
      const fachlicherLead = row["Fachlicher Lead"];
      const leadVertrieb = row["Lead Vertrieb"];
      const status = row["Status"];
      const oppId = row["Opp-ID"];
      
      if (angefragteLeistung && 
          (angefragteLeistung.toString().includes('MDR') || 
           angefragteLeistung.toString().includes('Managed Detection') ||
           angefragteLeistung.toString().includes('Detection and Response'))) {
        
        mdrEntries.push({
          row: i + 2,
          angefragteLeistung: angefragteLeistung,
          kunde: kunde,
          oppPartner: oppPartner,
          fachlicherLead: fachlicherLead,
          leadVertrieb: leadVertrieb,
          status: status,
          oppId: oppId
        });
      }
    }
    
    console.log(`\nGefundene MDR Einträge in Excel: ${mdrEntries.length}`);
    
    mdrEntries.forEach((entry, index) => {
      console.log(`\n${index + 1}. Zeile ${entry.row}:`);
      console.log(`   Angefragte Leistung: "${entry.angefragteLeistung}"`);
      console.log(`   Kunde: "${entry.kunde}"`);
      console.log(`   Opp Partner: "${entry.oppPartner}"`);
      console.log(`   Fachlicher Lead: "${entry.fachlicherLead}"`);
      console.log(`   Lead Vertrieb: "${entry.leadVertrieb}"`);
      console.log(`   Status: "${entry.status}"`);
      console.log(`   Opp-ID: "${entry.oppId}"`);
    });
    
  } catch (error) {
    console.error('Fehler bei der Suche:', error);
  }
}

findMDRLeadVertrieb(); 