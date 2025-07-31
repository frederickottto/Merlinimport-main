const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const prisma = new PrismaClient();

async function testAPI() {
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
      console.log('=== RAW TENDER DATA ===');
      console.log('ID:', tender.id);
      console.log('Title:', tender.title);
      console.log('Status:', tender.status);
      console.log('Status type:', typeof tender.status);
      
      // Simulate the exact API processing from tender.ts
      const processedTender = {
        ...tender,
        createdAt: tender.createdAt ? new Date(tender.createdAt) : undefined,
        updatedAt: tender.updatedAt ? new Date(tender.updatedAt) : undefined,
        offerDeadline: tender.offerDeadline ? new Date(tender.offerDeadline) : undefined,
        questionDeadline: tender.questionDeadline ? new Date(tender.questionDeadline) : undefined,
        bindingDeadline: tender.bindingDeadline ? new Date(tender.bindingDeadline) : undefined,
        releaseDate: tender.releaseDate ? new Date(tender.releaseDate) : undefined,
        organisations: tender.organisations?.map(org => ({
          id: org.id,
          organisation: {
            id: org.organisation.id,
            name: org.organisation.name,
          },
          organisationRole: org.organisationRole.role,
        })) || [],
        workpackages: tender.lots?.flatMap(lot => 
          lot.workpackages?.map(wp => ({
            id: wp.id,
            number: wp.number || "",
            title: wp.title || "",
            description: wp.description,
            volumeEuro: wp.volumeEuro || undefined,
            volumePT: wp.volumePT || undefined,
          })) || []
        ) || [],
        projectCallToTender: tender.projectCallToTender?.map(project => ({
          id: project.id,
          title: project.title,
          type: project.type,
        })) || [],
      };

      console.log('\n=== PROCESSED TENDER DATA (API RESPONSE) ===');
      console.log('Status:', processedTender.status);
      console.log('Status type:', typeof processedTender.status);
      console.log('Status === null:', processedTender.status === null);
      console.log('Status === undefined:', processedTender.status === undefined);
      console.log('Status === "":', processedTender.status === "");
      console.log('Status === "nicht angeboten":', processedTender.status === "nicht angeboten");
      
      // Test what the DetailView would receive
      console.log('\n=== DETAILVIEW SIMULATION ===');
      const statusField = {
        name: "status",
        label: "Status",
        type: "text",
        position: 3,
        transform: (value) => {
          console.log('Transform function called with:', value, 'type:', typeof value);
          const statusMap = {
            "praequalifikation": "Präqualifikation",
            "teilnahmeantrag": "Teilnahmeantrag",
            "angebotsphase": "Angebotsphase",
            "warten_auf_entscheidung": "Warten auf Entscheidung",
            "gewonnen": "Gewonnen",
            "verloren": "Verloren",
            "nicht angeboten": "Nicht angeboten",
          };
          const result = statusMap[value] || String(value);
          console.log('Transform result:', result);
          return result;
        },
        section: {
          id: "overview",
          title: "Übersicht",
          position: 1,
        },
      };
      
      const value = processedTender.status;
      console.log('Value passed to transform:', value);
      
      if (value === null || value === undefined) {
        console.log('Value is null/undefined, DetailView would return "-"');
      } else {
        const result = statusField.transform(value);
        console.log('Transform result:', result);
      }
      
    } else {
      console.log('Tender not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI(); 