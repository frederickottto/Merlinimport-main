const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

// Status mapping function (same as in detail-config.ts)
function mapStatus(status) {
  if (!status) return "-";
  
  const statusMap = {
    // Schema values
    "praequalifikation": "Präqualifikation",
    "teilnahmeantrag": "Teilnahmeantrag",
    "angebotsphase": "Angebotsphase",
    "warten_auf_entscheidung": "Warten auf Entscheidung",
    "gewonnen": "Gewonnen",
    "verloren": "Verloren",
    "nicht angeboten": "Nicht angeboten",
    
    // Imported values (from Excel)
    "Präqualifizierung": "Präqualifizierung",
    "Warten auf Entscheidung": "Warten auf Entscheidung",
    "In Erstellung TNA": "In Erstellung TNA",
    "In Erstellung Angebot": "In Erstellung Angebot",
    "Anderer im Lead": "Anderer im Lead",
    "nicht_angeboten": "Nicht angeboten",
    "in_erstellung_angebot": "In Erstellung Angebot",
    
    // Corrected status values
    "Gewonnen": "Gewonnen",
    "Verloren": "Verloren",
    "Nicht angeboten": "Nicht angeboten",
    "Versendet": "Versendet",
    "Angebotsphase": "Angebotsphase",
    "Verhandlungsphase": "Verhandlungsphase",
    "Warten auf Veröffentlichen": " ",
    "00 Warten auf Veröffentlichen": " ",
    "00 Warten auf Veröffentlichung": " ",
    "01 Lead": " ",
    "Zurückgezogen": "Zurückgezogen",
    "Lead": "Lead",
    "Teilnahmeantrag": "Teilnahmeantrag",
  };
  
  // Handle empty or space values
  if (status === " " || status === "" || status === "null") {
    return "-";
  }
  
  return statusMap[status] || status;
}

async function verifyStatusDisplay() {
  try {
    console.log('Überprüfe Status-Anzeige für alle Ausschreibungen...');
    
    // Get all tenders with their status
    const tenders = await prisma.callToTender.findMany({
      select: {
        id: true,
        title: true,
        status: true
      }
    });
    
    console.log(`Gefundene Tender: ${tenders.length}`);
    
    let statusCounts = {};
    let unmappedStatuses = [];
    let displayIssues = [];
    
    for (const tender of tenders) {
      const originalStatus = tender.status;
      const displayStatus = mapStatus(originalStatus);
      
      // Count status occurrences
      if (!statusCounts[displayStatus]) {
        statusCounts[displayStatus] = 0;
      }
      statusCounts[displayStatus]++;
      
      // Check for unmapped statuses
      if (!originalStatus || originalStatus === " " || originalStatus === "" || originalStatus === "null") {
        if (displayStatus !== "-") {
          displayIssues.push({
            tender: tender.title,
            original: originalStatus,
            display: displayStatus,
            issue: "Should display as '-'"
          });
        }
      } else if (displayStatus === originalStatus && !statusCounts.hasOwnProperty(originalStatus)) {
        // This is an unmapped status
        unmappedStatuses.push(originalStatus);
      }
      
      // Check for specific issues
      if (originalStatus && originalStatus.includes("In Erstellung")) {
        if (!originalStatus.includes("TNA") && !originalStatus.includes("Angebot")) {
          displayIssues.push({
            tender: tender.title,
            original: originalStatus,
            display: displayStatus,
            issue: "In Erstellung status not properly categorized"
          });
        }
      }
    }
    
    console.log(`\n=== STATUS-STATISTIK ===`);
    Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([status, count]) => {
        console.log(`${status}: ${count}`);
      });
    
    if (unmappedStatuses.length > 0) {
      console.log(`\n⚠️  UNMAPPED STATUSES (${unmappedStatuses.length}):`);
      const uniqueUnmapped = [...new Set(unmappedStatuses)];
      uniqueUnmapped.forEach(status => {
        console.log(`  - "${status}"`);
      });
    }
    
    if (displayIssues.length > 0) {
      console.log(`\n⚠️  DISPLAY ISSUES (${displayIssues.length}):`);
      displayIssues.forEach(issue => {
        console.log(`  - "${issue.tender}": "${issue.original}" → "${issue.display}" (${issue.issue})`);
      });
    }
    
    // Check for TNA vs Angebot distinction
    const tnaTenders = tenders.filter(t => t.status && t.status.includes("In Erstellung TNA"));
    const angebotTenders = tenders.filter(t => t.status && t.status.includes("In Erstellung Angebot"));
    
    console.log(`\n=== IN ERSTELLUNG KATEGORIEN ===`);
    console.log(`In Erstellung TNA: ${tnaTenders.length}`);
    console.log(`In Erstellung Angebot: ${angebotTenders.length}`);
    
    if (tnaTenders.length > 0) {
      console.log(`\nTNA Beispiele:`);
      tnaTenders.slice(0, 5).forEach(t => {
        console.log(`  - "${t.title}"`);
      });
    }
    
    if (angebotTenders.length > 0) {
      console.log(`\nAngebot Beispiele:`);
      angebotTenders.slice(0, 5).forEach(t => {
        console.log(`  - "${t.title}"`);
      });
    }
    
    console.log(`\n✅ Status-Überprüfung abgeschlossen!`);
    
  } catch (error) {
    console.error('Fehler bei der Status-Überprüfung:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyStatusDisplay(); 