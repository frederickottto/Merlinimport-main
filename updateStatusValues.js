const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function updateStatusValues() {
  try {
    console.log('Starting to update status values...');
    
    // Find all tenders with "Angebotsphase" status
    const tendersWithAngebotsphase = await prisma.callToTender.findMany({
      where: {
        status: "Angebotsphase"
      },
      select: {
        id: true,
        title: true,
        status: true,
        type: true
      }
    });
    
    console.log(`Found ${tendersWithAngebotsphase.length} tenders with "Angebotsphase" status`);
    
    let updatedCount = 0;
    
    for (const tender of tendersWithAngebotsphase) {
      try {
        // Update to "In Erstellung Angebot" for non-TNA types
        if (!tender.type || !tender.type.includes("TNA")) {
          await prisma.callToTender.update({
            where: { id: tender.id },
            data: { status: "In Erstellung Angebot" }
          });
          
          console.log(`Updated "${tender.title}" from "Angebotsphase" to "In Erstellung Angebot"`);
          updatedCount++;
        } else {
          // Update to "In Erstellung TNA" for TNA types
          await prisma.callToTender.update({
            where: { id: tender.id },
            data: { status: "In Erstellung TNA" }
          });
          
          console.log(`Updated "${tender.title}" from "Angebotsphase" to "In Erstellung TNA"`);
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

updateStatusValues(); 