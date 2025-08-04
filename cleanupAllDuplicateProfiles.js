const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

// Define the correct role names that should be kept
const CORRECT_ROLES = {
  'Vertriebslead (VL)': 'Vertriebslead (VL)',
  'Lead Vertrieb': 'Vertriebslead (VL)', // Map to correct name
  'Opp Partner': 'Opp Partner',
  'Fachverantwortlicher': 'Fachverantwortlicher',
  'Fachlicher Lead': 'Fachverantwortlicher', // Map to correct name
  'Vertriebssupport (VS)': 'Vertriebssupport (VS)',
  'OPP-Partner': 'Opp Partner' // Map to correct name
};

async function cleanupAllDuplicateProfiles() {
  try {
    console.log('Überprüfe alle Ausschreibungen auf doppelte Profile...');
    
    // Get all tenders with their employees
    const tenders = await prisma.callToTender.findMany({
      include: {
        employees: {
          include: {
            employee: true
          }
        }
      }
    });

    console.log(`Gefundene Ausschreibungen: ${tenders.length}`);
    
    let totalTendersProcessed = 0;
    let totalDuplicatesRemoved = 0;
    let totalTendersWithDuplicates = 0;

    for (const tender of tenders) {
      if (tender.employees.length === 0) {
        continue;
      }

      totalTendersProcessed++;
      let hasDuplicates = false;
      let duplicatesRemoved = 0;

      // Group employees by pseudonym
      const employeeGroups = new Map();
      
      tender.employees.forEach(emp => {
        const pseudonym = emp.employee.pseudonym;
        if (!employeeGroups.has(pseudonym)) {
          employeeGroups.set(pseudonym, []);
        }
        employeeGroups.get(pseudonym).push(emp);
      });

      // Check each group for duplicates
      for (const [pseudonym, employees] of employeeGroups) {
        if (employees.length > 1) {
          hasDuplicates = true;
          console.log(`\n🔍 ${tender.title}: ${pseudonym} hat ${employees.length} Zuordnungen`);
          
          employees.forEach(emp => {
            console.log(`  - ${emp.employee.pseudonym} (${emp.employeeCallToTenderRole}) - ID: ${emp.id}`);
          });

          // Determine which assignments to keep and which to delete
          const assignmentsToDelete = [];
          const assignmentsToKeep = [];

          // Group by role
          const roleGroups = new Map();
          employees.forEach(emp => {
            const role = emp.employeeCallToTenderRole;
            if (!roleGroups.has(role)) {
              roleGroups.set(role, []);
            }
            roleGroups.get(role).push(emp);
          });

          // For each role group, keep the one with the correct role name
          for (const [role, roleEmployees] of roleGroups) {
            if (roleEmployees.length > 1) {
              // Multiple assignments with same role - keep the first one
              assignmentsToKeep.push(roleEmployees[0]);
              assignmentsToDelete.push(...roleEmployees.slice(1));
            } else {
              // Single assignment with this role
              const correctRole = CORRECT_ROLES[role];
              if (correctRole && correctRole !== role) {
                // This role should be mapped to a different name
                // Check if we already have the correct role
                const hasCorrectRole = roleEmployees.some(emp => 
                  assignmentsToKeep.some(keep => keep.employeeCallToTenderRole === correctRole)
                );
                
                if (!hasCorrectRole) {
                  // Update the role to the correct name
                  assignmentsToKeep.push(roleEmployees[0]);
                } else {
                  // We already have the correct role, delete this one
                  assignmentsToDelete.push(roleEmployees[0]);
                }
              } else {
                // Role is correct, keep it
                assignmentsToKeep.push(roleEmployees[0]);
              }
            }
          }

          // Delete duplicate assignments
          if (assignmentsToDelete.length > 0) {
            console.log(`  🗑️  Lösche ${assignmentsToDelete.length} doppelte Zuordnungen:`);
            assignmentsToDelete.forEach(emp => {
              console.log(`    - ${emp.employee.pseudonym} (${emp.employeeCallToTenderRole})`);
            });

            await prisma.callToTenderEmployee.deleteMany({
              where: {
                id: {
                  in: assignmentsToDelete.map(emp => emp.id)
                }
              }
            });

            duplicatesRemoved += assignmentsToDelete.length;
            totalDuplicatesRemoved += assignmentsToDelete.length;
          }

          // Update roles to correct names if needed
          for (const emp of assignmentsToKeep) {
            const correctRole = CORRECT_ROLES[emp.employeeCallToTenderRole];
            if (correctRole && correctRole !== emp.employeeCallToTenderRole) {
              console.log(`  🔄 Aktualisiere Rolle: ${emp.employeeCallToTenderRole} → ${correctRole}`);
              
              await prisma.callToTenderEmployee.update({
                where: { id: emp.id },
                data: { 
                  employeeCallToTenderRole: correctRole,
                  role: correctRole
                }
              });
            }
          }
        }
      }

      if (hasDuplicates) {
        totalTendersWithDuplicates++;
        console.log(`✅ ${tender.title}: ${duplicatesRemoved} Duplikate entfernt`);
      }
    }

    console.log(`\n=== ZUSAMMENFASSUNG ===`);
    console.log(`Verarbeitete Ausschreibungen: ${totalTendersProcessed}`);
    console.log(`Ausschreibungen mit Duplikaten: ${totalTendersWithDuplicates}`);
    console.log(`Entfernte Duplikate: ${totalDuplicatesRemoved}`);
    console.log(`✅ Bereinigung abgeschlossen!`);

  } catch (error) {
    console.error('Fehler bei der Bereinigung:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAllDuplicateProfiles(); 