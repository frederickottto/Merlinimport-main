const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showTendersWithEmployees() {
  try {
    // Get tenders with their employees
    const tenders = await prisma.callToTender.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        employees: {
          include: {
            employee: {
              select: {
                foreName: true,
                lastName: true,
                pseudonym: true
              }
            }
          }
        }
      }
    });
    
    console.log('Ausschreibungen mit zugewiesenen Mitarbeitern:');
    console.log('=============================================');
    
    tenders.forEach((tender, index) => {
      console.log(`\n${index + 1}. ${tender.title}`);
      console.log(`   Status: ${tender.status || 'null'}`);
      console.log(`   Typ: ${tender.type || 'null'}`);
      
      if (tender.employees.length > 0) {
        console.log(`   Mitarbeiter:`);
        tender.employees.forEach((empRel, empIndex) => {
          const employee = empRel.employee;
          const name = `${employee.foreName} ${employee.lastName}`;
          const pseudonym = employee.pseudonym ? ` (${employee.pseudonym})` : '';
          console.log(`     ${empIndex + 1}. ${name}${pseudonym} - ${empRel.employeeCallToTenderRole}`);
        });
      } else {
        console.log(`   Mitarbeiter: Keine zugewiesen`);
      }
      
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('Error showing tenders with employees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showTendersWithEmployees(); 