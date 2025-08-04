const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
require("dotenv").config();

const prisma = new PrismaClient();

async function updateExistingTendersWithNewLogic() {
  try {
    console.log('Starting to update existing tenders with new logic...');
    
    // Read the title file to get better titles
    const titleWorkbook = xlsx.readFile('tenders/Copy of Vertrieb_mit_laengeren_Titeln.xlsx');
    const titleSheet = titleWorkbook.Sheets[titleWorkbook.SheetNames[0]];
    const titleData = xlsx.utils.sheet_to_json(titleSheet, { header: 1 });
    
    // Create a map of customer names + # to titles from the title file
    const titleMap = new Map();
    for (let i = 1; i < titleData.length; i++) {
      const row = titleData[i];
      if (row && row.length >= 6) {
        const number = row[0]; // # column (index 0)
        const customerName = row[3]; // Kunde column (index 3)
        const title = row[5]; // Titel column (index 5)
        if (customerName && title && title !== 'nan') {
          // Create key with customer name + number
          const key = `${customerName.toString().trim()}_${number ? number.toString().trim() : ''}`;
          titleMap.set(key, title.toString().trim());
          // Also store just customer name as fallback
          titleMap.set(customerName.toString().trim(), title.toString().trim());
        }
      }
    }
    
    console.log(`Title map created with ${titleMap.size} entries`);
    
    // Get all tenders from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tenders = await prisma.callToTender.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      include: {
        organisations: {
          include: {
            organisation: true,
            organisationRole: true
          }
        }
      }
    });
    
    console.log(`Found ${tenders.length} tenders from today to update`);
    
    let updatedCount = 0;
    
    for (const tender of tenders) {
      try {
        // Find the customer organisation
        const customerOrg = tender.organisations.find(org => org.organisationRole.role === 'Client');
        
        if (customerOrg) {
          const customerName = customerOrg.organisation.name;
          
          // Try to find a better title from the title file
          let newTitle = tender.title;
          const betterTitle = titleMap.get(customerName);
          
          if (betterTitle) {
            newTitle = betterTitle;
          }
          
          // Update the tender
          await prisma.callToTender.update({
            where: { id: tender.id },
            data: {
              title: newTitle,
              notes: tender.shortDescription // Move shortDescription to notes
            }
          });
          
          console.log(`Updated "${tender.title}" to "${newTitle}"`);
          updatedCount++;
        }
        
      } catch (error) {
        console.log(`Error updating tender "${tender.title}":`, error.message);
      }
    }
    
    console.log(`\nUpdate completed! ${updatedCount} tenders updated.`);
    
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingTendersWithNewLogic(); 