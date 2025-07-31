const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

// Helper function to check if a professional background entry is empty
function isEmptyProfessionalBackground(entry) {
  return !entry.employer && 
         !entry.position && 
         !entry.description && 
         !entry.professionStart && 
         !entry.professionEnd;
}

async function removeEmptyProfessionalBackground() {
  try {
    console.log('Starting removal of empty professional background entries...');
    
    // Get all employees with their professional background
    const employees = await prisma.employee.findMany({
      include: {
        professionalBackground: true
      }
    });
    
    let totalEmptyEntries = 0;
    let totalEmployeesProcessed = 0;
    let employeesWithEmptyEntries = 0;
    
    for (const employee of employees) {
      if (employee.professionalBackground.length === 0) {
        continue;
      }
      
      const emptyEntries = employee.professionalBackground.filter(isEmptyProfessionalBackground);
      
      if (emptyEntries.length > 0) {
        employeesWithEmptyEntries++;
        console.log(`\nEmployee ${employee.pseudonym}: ${emptyEntries.length} empty entries out of ${employee.professionalBackground.length} total`);
        
        // Delete empty entries
        for (const emptyEntry of emptyEntries) {
          try {
            // Check if the record still exists before trying to delete
            const existingRecord = await prisma.professionalBackground.findUnique({
              where: { id: emptyEntry.id }
            });
            
            if (!existingRecord) {
              console.log(`  - Record ${emptyEntry.id} already deleted, skipping...`);
              continue;
            }
            
            // First delete any related EmployeeExternalProjects records
            await prisma.employeeExternalProjects.deleteMany({
              where: { professionalBackgroundIDs: emptyEntry.id }
            });
            
            // Then delete the professional background record
            await prisma.professionalBackground.delete({
              where: { id: emptyEntry.id }
            });
            
            totalEmptyEntries++;
            console.log(`  - Successfully deleted empty entry: ${emptyEntry.id}`);
          } catch (error) {
            if (error.code === 'P2025') {
              console.log(`  - Record ${emptyEntry.id} already deleted, skipping...`);
            } else {
              console.log(`  - Error deleting entry ${emptyEntry.id}: ${error.message}`);
            }
          }
        }
      }
      
      totalEmployeesProcessed++;
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total employees processed: ${totalEmployeesProcessed}`);
    console.log(`Employees with empty entries: ${employeesWithEmptyEntries}`);
    console.log(`Total empty entries removed: ${totalEmptyEntries}`);
    
    // Show final state for some employees
    console.log('\n=== Sample Final State ===');
    const sampleEmployees = await prisma.employee.findMany({
      where: {
        pseudonym: { in: ['FGR', 'AST', 'KTH', 'LAR'] }
      },
      include: {
        professionalBackground: true
      }
    });
    
    for (const employee of sampleEmployees) {
      console.log(`\n${employee.pseudonym}: ${employee.professionalBackground.length} entries`);
      for (const bg of employee.professionalBackground) {
        console.log(`  - ${bg.position} at ${bg.employer}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeEmptyProfessionalBackground(); 