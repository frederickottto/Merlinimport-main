const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const prisma = new PrismaClient();

async function checkTenderStatus() {
  try {
    // Find the tender with "Beschaffungsamt des BMI" in the title
    const tender = await prisma.callToTender.findFirst({
      where: {
        title: {
          contains: "Beschaffungsamt des BMI"
        }
      },
      select: {
        id: true,
        title: true,
        status: true
      }
    });

    if (tender) {
      console.log('Found tender:');
      console.log('ID:', tender.id);
      console.log('Title:', tender.title);
      console.log('Status:', tender.status);
    } else {
      console.log('Tender not found');
    }

    // Also check all tenders with "nicht angeboten" status
    const nichtAngebotenTenders = await prisma.callToTender.findMany({
      where: {
        status: "nicht angeboten"
      },
      select: {
        id: true,
        title: true,
        status: true
      }
    });

    console.log('\nAll tenders with "nicht angeboten" status:');
    nichtAngebotenTenders.forEach(t => {
      console.log(`- ${t.title} (${t.status})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTenderStatus(); 