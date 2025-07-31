const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

async function checkAcademicDegrees() {
  try {
    console.log('Checking academic degrees in database...');
    
    const employees = await prisma.employee.findMany({
      include: {
        academicDegree: true
      }
    });
    
    console.log(`Total employees: ${employees.length}`);
    
    let totalDegrees = 0;
    let employeesWithDegrees = 0;
    
    for (const employee of employees) {
      if (employee.academicDegree.length > 0) {
        employeesWithDegrees++;
        totalDegrees += employee.academicDegree.length;
        console.log(`Employee ${employee.pseudonym}: ${employee.academicDegree.length} degrees`);
        
        for (const degree of employee.academicDegree) {
          console.log(`  - ${degree.degreeTitleLong || degree.degreeTitleShort} at ${degree.university}`);
        }
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`Employees with degrees: ${employeesWithDegrees}`);
    console.log(`Total degrees: ${totalDegrees}`);
    
    // Check some specific employees that should have degrees
    const testEmployees = ['AST', 'KHA', 'JHE', 'MM'];
    
    for (const pseudonym of testEmployees) {
      const employee = await prisma.employee.findFirst({
        where: { pseudonym: pseudonym },
        include: { academicDegree: true }
      });
      
      if (employee) {
        console.log(`\n${pseudonym}: ${employee.academicDegree.length} degrees`);
        for (const degree of employee.academicDegree) {
          console.log(`  - ${degree.degreeTitleLong || degree.degreeTitleShort} at ${degree.university}`);
        }
      } else {
        console.log(`\n${pseudonym}: Employee not found`);
      }
    }
    
  } catch (error) {
    console.error('Error checking academic degrees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAcademicDegrees(); 