const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const prisma = new PrismaClient();

async function testTenderAPI() {
  try {
    // Find the tender with "Beschaffungsamt des BMI" in the title
    const tender = await prisma.callToTender.findFirst({
      where: {
        title: {
          contains: "Beschaffungsamt des BMI"
        }
      },
      include: {
        organisations: {
          include: {
            organisation: true,
            organisationRole: true,
          },
        },
        employees: {
          include: {
            employee: true,
          },
        },
        conditionsOfParticipation: {
          include: {
            conditionsOfParticipationType: true,
            certificate: true,
            industrySector: true,
          },
        },
        lots: {
          include: {
            workpackages: true,
          },
        },
        projectCallToTender: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    if (tender) {
      console.log('Found tender:');
      console.log('ID:', tender.id);
      console.log('Title:', tender.title);
      console.log('Status:', tender.status);
      console.log('Status type:', typeof tender.status);
      
      // Test the transform function from detail-config.ts
      const statusMap = {
        "praequalifikation": "Präqualifikation",
        "teilnahmeantrag": "Teilnahmeantrag",
        "angebotsphase": "Angebotsphase",
        "warten_auf_entscheidung": "Warten auf Entscheidung",
        "gewonnen": "Gewonnen",
        "verloren": "Verloren",
        "nicht angeboten": "Nicht angeboten",
      };
      
      const transformedStatus = statusMap[tender.status] || String(tender.status);
      console.log('Transformed status:', transformedStatus);
      
    } else {
      console.log('Tender not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTenderAPI(); 