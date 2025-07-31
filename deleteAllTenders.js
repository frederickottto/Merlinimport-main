const { PrismaClient } = require("./generated/prisma");
require("dotenv").config();

const prisma = new PrismaClient();

async function deleteAllTenders() {
  // Zuerst abhängige Relationen löschen
  await prisma.callToTenderDeliverables.deleteMany({});
  await prisma.callToTenderEmployee.deleteMany({});
  await prisma.callToTenderOrganisation.deleteMany({});
  await prisma.callToTenderProject.deleteMany({});
  await prisma.lot.deleteMany({});
  await prisma.workpackage.deleteMany({});
  await prisma.conditionsOfParticipation.deleteMany({});
  await prisma.conditionsOfParticipationType.deleteMany({});
  await prisma.riskQualityProcess.deleteMany({});
  await prisma.template.deleteMany({});
  // Dann die Haupttabelle
  await prisma.callToTender.deleteMany({});
  console.log("Alle Ausschreibungen und abhängige Relationen wurden gelöscht.");
  await prisma.$disconnect();
}

deleteAllTenders(); 