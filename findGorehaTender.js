const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findGorehaTender() {
  try {
    console.log('🔍 Searching for Goreha tender...');
    
    // Search for any tender containing "Goreha"
    const gorehaTenders = await prisma.callToTender.findMany({
      where: {
        title: {
          contains: 'Goreha'
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true
      }
    });
    
    console.log(`📊 Found ${gorehaTenders.length} tender(s) with "Goreha":`);
    
    gorehaTenders.forEach((tender, index) => {
      console.log(`${index + 1}. ID: ${tender.id}`);
      console.log(`   Title: ${tender.title}`);
      console.log(`   Status: ${tender.status}`);
      console.log(`   UpdatedAt: ${tender.updatedAt}`);
      console.log('');
    });
    
    // Also search for "C5" in case the title is different
    const c5Tenders = await prisma.callToTender.findMany({
      where: {
        title: {
          contains: 'C5'
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true
      }
    });
    
    console.log(`📊 Found ${c5Tenders.length} tender(s) with "C5":`);
    
    c5Tenders.forEach((tender, index) => {
      console.log(`${index + 1}. ID: ${tender.id}`);
      console.log(`   Title: ${tender.title}`);
      console.log(`   Status: ${tender.status}`);
      console.log(`   UpdatedAt: ${tender.updatedAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error searching for Goreha tender:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findGorehaTender(); 