const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showEmployees() {
  try {
    // Get all employees
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        foreName: true,
        lastName: true,
        pseudonym: true,
        employeerCompany: true
      },
      orderBy: {
        lastName: 'asc'
      }
    });
    
    console.log('Verfügbare Mitarbeiter:');
    console.log('=======================');
    
    employees.forEach((employee, index) => {
      console.log(`${index + 1}. ${employee.foreName} ${employee.lastName} (${employee.pseudonym || 'Kein Pseudonym'})`);
    });
    
    console.log(`\nGesamt: ${employees.length} Mitarbeiter`);
    
  } catch (error) {
    console.error('Error showing employees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showEmployees(); 