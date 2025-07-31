const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

// Helper function to normalize strings for comparison
function normalizeString(str) {
  if (!str) return '';
  return str.toString().toLowerCase().trim().replace(/\s+/g, ' ');
}

// Helper function to check if an academic degree is complete
function isCompleteDegree(degree) {
  const hasTitle = degree.degreeTitleLong || degree.degreeTitleShort;
  const hasUniversity = degree.university && degree.university.trim() !== '';
  return hasTitle && hasUniversity;
}

// Helper function to check if two academic degrees are truly duplicates
function areTrulyDuplicate(degree1, degree2) {
  const title1 = normalizeString(degree1.degreeTitleLong || degree1.degreeTitleShort);
  const title2 = normalizeString(degree2.degreeTitleLong || degree2.degreeTitleShort);
  const university1 = normalizeString(degree1.university);
  const university2 = normalizeString(degree2.university);
  
  // Only consider them duplicates if both title and university match exactly
  return title1 === title2 && university1 === university2 && university1 !== '';
}

async function fixAcademicDegrees() {
  try {
    console.log('Fixing academic degrees...');
    
    const employees = await prisma.employee.findMany({
      include: {
        academicDegree: true
      }
    });
    
    let totalRemoved = 0;
    
    for (const employee of employees) {
      if (employee.academicDegree.length <= 1) continue;
      
      const degrees = employee.academicDegree;
      const degreesToRemove = new Set();
      
      // First, remove entries with empty university names
      for (let i = 0; i < degrees.length; i++) {
        if (!isCompleteDegree(degrees[i])) {
          console.log(`Removing incomplete degree for ${employee.pseudonym}: ${degrees[i].degreeTitleLong || degrees[i].degreeTitleShort} at "${degrees[i].university}"`);
          degreesToRemove.add(degrees[i].id);
        }
      }
      
      // Then check for true duplicates among complete entries
      for (let i = 0; i < degrees.length; i++) {
        if (degreesToRemove.has(degrees[i].id)) continue; // Skip already marked for removal
        
        for (let j = i + 1; j < degrees.length; j++) {
          if (degreesToRemove.has(degrees[j].id)) continue; // Skip already marked for removal
          
          if (areTrulyDuplicate(degrees[i], degrees[j])) {
            console.log(`Found true duplicate for ${employee.pseudonym}: ${degrees[i].degreeTitleLong || degrees[i].degreeTitleShort} at ${degrees[i].university}`);
            
            // Keep the one with more complete information
            const degree1Completeness = [
              degrees[i].degreeTitleLong,
              degrees[i].degreeTitleShort,
              degrees[i].university,
              degrees[i].study,
              degrees[i].studyEnd
            ].filter(Boolean).length;
            
            const degree2Completeness = [
              degrees[j].degreeTitleLong,
              degrees[j].degreeTitleShort,
              degrees[j].university,
              degrees[j].study,
              degrees[j].studyEnd
            ].filter(Boolean).length;
            
            if (degree1Completeness >= degree2Completeness) {
              degreesToRemove.add(degrees[j].id);
            } else {
              degreesToRemove.add(degrees[i].id);
            }
          }
        }
      }
      
      // Remove the marked degrees
      for (const degreeId of degreesToRemove) {
        try {
          await prisma.academicDegree.delete({
            where: { id: degreeId }
          });
          totalRemoved++;
        } catch (error) {
          console.log(`Error deleting degree ${degreeId}: ${error.message}`);
        }
      }
    }
    
    console.log(`\nTotal degrees removed: ${totalRemoved}`);
    
    // Show final state
    console.log('\nFinal state:');
    const finalEmployees = await prisma.employee.findMany({
      include: {
        academicDegree: true
      }
    });
    
    let totalDegrees = 0;
    let employeesWithDegrees = 0;
    
    for (const employee of finalEmployees) {
      if (employee.academicDegree.length > 0) {
        employeesWithDegrees++;
        totalDegrees += employee.academicDegree.length;
        console.log(`Employee ${employee.pseudonym}: ${employee.academicDegree.length} degrees`);
        
        for (const degree of employee.academicDegree) {
          console.log(`  - ${degree.degreeTitleLong || degree.degreeTitleShort} at ${degree.university}`);
        }
      }
    }
    
    console.log(`\nFinal Summary:`);
    console.log(`Employees with degrees: ${employeesWithDegrees}`);
    console.log(`Total degrees: ${totalDegrees}`);
    
  } catch (error) {
    console.error('Error fixing academic degrees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAcademicDegrees(); 