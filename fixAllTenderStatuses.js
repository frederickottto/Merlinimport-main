const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapping of status values to frontend-compatible format
const statusMapping = {
  'Nicht angeboten': 'nicht_angeboten',
  'nicht angeboten': 'nicht_angeboten',
  'Anderer im Lead': 'anderer_im_lead',
  'anderer im lead': 'anderer_im_lead',
  'Präqualifikation': 'praequalifikation',
  'präqualifikation': 'praequalifikation',
  'In Erstellung TNA': 'in_erstellung_tna',
  'in erstellung tna': 'in_erstellung_tna',
  'Verloren': 'verloren',
  'verloren': 'verloren',
  'Gewonnen': 'gewonnen',
  'gewonnen': 'gewonnen',
  'In Bearbeitung': 'in_bearbeitung',
  'in bearbeitung': 'in_bearbeitung',
  'Abgegeben': 'abgegeben',
  'abgegeben': 'abgegeben',
  'Zurückgezogen': 'zurueckgezogen',
  'zurückgezogen': 'zurueckgezogen',
  'zurueckgezogen': 'zurueckgezogen',
  'Versendet': 'versendet',
  'versendet': 'versendet',
  'Declined': 'verloren',
  'Decliend': 'verloren',
  'In Erstellung Angebot': 'in_erstellung_angebot',
  'in erstellung angebot': 'in_erstellung_angebot',
  'Anderer im Lead - gewonnen': 'anderer_im_lead_gewonnen',
  'anderer im lead - gewonnen': 'anderer_im_lead_gewonnen',
  'Anderer im Lead - verloren': 'anderer_im_lead_verloren',
  'anderer im lead - verloren': 'anderer_im_lead_verloren',
  'Lead': 'lead',
  'lead': 'lead'
};

async function fixAllTenderStatuses() {
  try {
    console.log('🚀 Starting to fix all tender statuses...');
    
    // Get all tenders with their current status
    const allTenders = await prisma.callToTender.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true
      }
    });
    
    console.log(`📊 Found ${allTenders.length} tenders total`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const tender of allTenders) {
      const currentStatus = tender.status;
      
      if (!currentStatus) {
        console.log(`⏭️  Skipping ${tender.title} (no status)`);
        skippedCount++;
        continue;
      }
      
      // Check if status needs to be converted
      const newStatus = statusMapping[currentStatus];
      
      if (newStatus && newStatus !== currentStatus) {
        console.log(`🔄 Converting "${currentStatus}" to "${newStatus}" for: ${tender.title}`);
        
        await prisma.callToTender.update({
          where: { id: tender.id },
          data: {
            status: newStatus,
            updatedAt: new Date()
          }
        });
        
        updatedCount++;
      } else if (newStatus === currentStatus) {
        console.log(`✅ ${tender.title} already has correct format: "${currentStatus}"`);
        skippedCount++;
      } else {
        console.log(`❓ Unknown status format for ${tender.title}: "${currentStatus}"`);
        skippedCount++;
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`- Total tenders: ${allTenders.length}`);
    console.log(`- Updated: ${updatedCount}`);
    console.log(`- Skipped: ${skippedCount}`);
    console.log('\n🎯 All statuses should now display correctly in the frontend!');
    
  } catch (error) {
    console.error('❌ Error fixing tender statuses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllTenderStatuses(); 