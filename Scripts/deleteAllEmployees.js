const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  await prisma.employeeProjectActivities.deleteMany({});
  await prisma.employeeExternalProjects.deleteMany({});
  await prisma.employeeCertificates.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.voccational.deleteMany({});
  await prisma.professionalBackground.deleteMany({});
  await prisma.academicDegree.deleteMany({});
  await prisma.employee.deleteMany({});
  console.log('✅ All employees, certificates, professional backgrounds, academic degrees, and external projects deleted!');
  await prisma.$disconnect();
}

main(); 