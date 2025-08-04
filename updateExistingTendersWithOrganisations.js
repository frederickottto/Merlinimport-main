const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

// Helper function to find or create organisation
async function findOrCreateOrganisation(organisationName) {
  if (!organisationName) return null;
  
  let organisation = await prisma.organisation.findFirst({
    where: { name: organisationName }
  });
  
  if (!organisation) {
    organisation = await prisma.organisation.create({
      data: {
        name: organisationName,
        abbreviation: organisationName.substring(0, 3).toUpperCase()
      }
    });
  }
  
  return organisation;
}

// Helper function to find or create organisation role
async function findOrCreateOrganisationRole(roleName) {
  if (!roleName) return null;
  
  let role = await prisma.organisationRole.findFirst({
    where: { role: roleName }
  });
  
  if (!role) {
    role = await prisma.organisationRole.create({
      data: {
        role: roleName
      }
    });
  }
  
  return role;
}

async function updateExistingTendersWithOrganisations() {
  try {
    console.log('Starting to update existing tenders with customer organisations...');
    
    // Get all existing tenders
    const existingTenders = await prisma.callToTender.findMany();
    console.log(`Found ${existingTenders.length} existing tenders to update`);
    
    // Create organisation role for clients
    const organisationRole = await findOrCreateOrganisationRole('Client');
    
    let updatedCount = 0;
    
    for (const tender of existingTenders) {
      try {
        // Check if tender already has organisation relationships
        const existingRelationships = await prisma.callToTenderOrganisation.findMany({
          where: { callToTenderIDs: tender.id }
        });
        
        if (existingRelationships.length > 0) {
          console.log(`Tender "${tender.title}" already has organisation relationships, skipping...`);
          continue;
        }
        
        // Use the title as the customer name (since that's how it was imported)
        const customerName = tender.title;
        
        if (!customerName || customerName === "Unbenannter Kunde") {
          console.log(`Tender "${tender.title}" has no valid customer name, skipping...`);
          continue;
        }
        
        // Create or find the organisation
        const organisation = await findOrCreateOrganisation(customerName);
        
        if (organisation && organisationRole) {
          // Create organisation relationship
          await prisma.callToTenderOrganisation.create({
            data: {
              organisationIDs: organisation.id,
              callToTenderIDs: tender.id,
              organisationRoleID: organisationRole.id
            }
          });
          
          console.log(`Updated tender "${tender.title}" with organisation "${customerName}"`);
          updatedCount++;
        }
        
      } catch (error) {
        console.log(`Error updating tender "${tender.title}":`, error.message);
      }
    }
    
    console.log(`\nUpdate completed! ${updatedCount} tenders updated with customer organisations.`);
    
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingTendersWithOrganisations(); 