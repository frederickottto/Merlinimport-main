const { PrismaClient } = require("./generated/prisma");
require("dotenv").config();

const prisma = new PrismaClient();

async function deleteAllOrganisations() {
  try {
    // Zuerst alle Kontakte unter Organisationen löschen
    await prisma.organisationContacts.deleteMany({});
    console.log("✅ All organisation contacts deleted.");
    // Dann alle Organisationen löschen
    await prisma.organisation.deleteMany({});
    console.log("✅ All organisations deleted.");
  } catch (e) {
    console.error("❌ Error deleting organisations:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllOrganisations(); 