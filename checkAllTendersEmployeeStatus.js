const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllTendersEmployeeStatus() {
  try {
    // Get all tenders with their employee count
    const tenders = await prisma.callToTender.findMany({
      include: {
        _count: {
          select: {
            employees: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Status aller Ausschreibungen mit Mitarbeitern:');
    console.log('==============================================');
    
    let totalTenders = 0;
    let tendersWithEmployees = 0;
    let totalEmployees = 0;
    
    tenders.forEach((tender, index) => {
      const employeeCount = tender._count.employees;
      totalTenders++;
      totalEmployees += employeeCount;
      
      if (employeeCount > 0) {
        tendersWithEmployees++;
        console.log(`${index + 1}. ✅ ${tender.title} - ${employeeCount} Mitarbeiter`);
      } else {
        console.log(`${index + 1}. ❌ ${tender.title} - Keine Mitarbeiter`);
      }
    });
    
    console.log('\n=== ZUSAMMENFASSUNG ===');
    console.log(`Gesamtanzahl Ausschreibungen: ${totalTenders}`);
    console.log(`Ausschreibungen mit Mitarbeitern: ${tendersWithEmployees}`);
    console.log(`Ausschreibungen ohne Mitarbeiter: ${totalTenders - tendersWithEmployees}`);
    console.log(`Gesamtanzahl Mitarbeiter-Zuordnungen: ${totalEmployees}`);
    console.log(`Durchschnittliche Mitarbeiter pro Ausschreibung: ${(totalEmployees / totalTenders).toFixed(1)}`);
    
  } catch (error) {
    console.error('Error checking tender employee status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTendersEmployeeStatus(); 