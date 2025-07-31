const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllOrganisations() {
  try {
    const deleted = await prisma.organisation.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} organisations.`);
  } catch (error) {
    console.error('Error deleting organisations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllOrganisations(); 