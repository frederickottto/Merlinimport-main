const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

async function checkRoles() {
  try {
    const roles = await prisma.callToTenderEmployee.findMany({
      select: { employeeCallToTenderRole: true },
      distinct: ['employeeCallToTenderRole']
    });
    
    console.log('Existing employee roles:');
    roles.forEach(r => console.log('- ' + r.employeeCallToTenderRole));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles(); 