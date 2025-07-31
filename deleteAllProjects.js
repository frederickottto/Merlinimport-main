const { PrismaClient } = require("./generated/prisma");
require("dotenv").config();

const prisma = new PrismaClient();

async function deleteAllProjects() {
  try {
    // Delete related records first
    await prisma.employeeProjectActivities.deleteMany({});
    await prisma.organisationProjectActivities.deleteMany({});
    await prisma.organisationProjectsOrganisationRoles.deleteMany({});
    await prisma.callToTenderProject.deleteMany({});
    // Now delete projects
    await prisma.project.deleteMany({});
    console.log("✅ All projects and related records deleted.");
  } catch (e) {
    console.error("❌ Error deleting projects:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllProjects(); 