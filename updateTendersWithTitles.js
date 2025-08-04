const xlsx = require("xlsx");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

async function updateTendersWithTitles() {
  try {
    console.log('Starting to update tenders with titles from title file...');
    
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
    
    console.log(`Title map created with ${titleMap.size} entries`);
    
    // Get all tenders from database
    const tenders = await prisma.callToTender.findMany();
    console.log(`Found ${tenders.length} tenders in database`);
    
    let updatedCount = 0;
    
    // Update each tender with the correct title if available
    for (const tender of tenders) {
      const oppId = tender.shortDescription; // Opp-ID is stored in shortDescription
      
      if (oppId && titleMap.has(oppId)) {
        const newTitle = titleMap.get(oppId);
        
        // Update the tender with the new title
        await prisma.callToTender.update({
          where: { id: tender.id },
          data: { title: newTitle }
        });
        
        console.log(`Updated tender ${oppId}: "${tender.title}" → "${newTitle}"`);
        updatedCount++;
      }
    }
    
    console.log(`Update completed! Updated ${updatedCount} tenders with new titles.`);
    
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateTendersWithTitles(); 