// Script to delete specific employees (Max Mustermann and Sabine Mustermann)
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function deleteSpecificEmployees() {
  console.log("🗑️  Spezifische Employee-Löschung");
  console.log("📋 Lösche Max Mustermann und Sabine Mustermann...\n");
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Find the specific employees
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { 
            AND: [
              { foreName: { contains: "Max" } },
              { lastName: { contains: "Mustermann" } }
            ]
          },
          { 
            AND: [
              { foreName: { contains: "Sabine" } },
              { lastName: { contains: "Mustermann" } }
            ]
          }
        ]
      }
    });
    
    console.log(`📊 Gefundene Employees: ${employees.length}`);
    
    if (employees.length === 0) {
      console.log("ℹ️  Keine der gesuchten Employees gefunden");
      return;
    }
    
    // Log all found employees for debugging
    for (const emp of employees) {
      console.log(`   - ${emp.foreName} ${emp.lastName} (${emp.id})`);
    }
    console.log("");
    
    for (const employee of employees) {
      console.log(`🗑️  Lösche: ${employee.foreName} ${employee.lastName} (${employee.pseudonym})`);
      
      // Delete related data for this specific employee
      
      // Delete employee certificates
      const certCount = await prisma.employeeCertificates.count({
        where: { employeeIDs: employee.id }
      });
      if (certCount > 0) {
        await prisma.employeeCertificates.deleteMany({
          where: { employeeIDs: employee.id }
        });
        console.log(`   ✅ Gelöscht: ${certCount} Employee Certificates`);
      }
      

      
      // Delete employee project activities
      const projectCount = await prisma.employeeProjectActivities.count({
        where: { employeeIDs: employee.id }
      });
      if (projectCount > 0) {
        await prisma.employeeProjectActivities.deleteMany({
          where: { employeeIDs: employee.id }
        });
        console.log(`   ✅ Gelöscht: ${projectCount} Employee Project Activities`);
      }
      
      // Delete employee external projects
      const externalCount = await prisma.employeeExternalProjects.count({
        where: { employeeIDs: employee.id }
      });
      if (externalCount > 0) {
        await prisma.employeeExternalProjects.deleteMany({
          where: { employeeIDs: employee.id }
        });
        console.log(`   ✅ Gelöscht: ${externalCount} Employee External Projects`);
      }
      
      // Delete academic degrees
      const degreeCount = await prisma.academicDegree.count({
        where: { employeeIDs: employee.id }
      });
      if (degreeCount > 0) {
        await prisma.academicDegree.deleteMany({
          where: { employeeIDs: employee.id }
        });
        console.log(`   ✅ Gelöscht: ${degreeCount} Academic Degrees`);
      }
      
      // Delete professional backgrounds
      const backgroundCount = await prisma.professionalBackground.count({
        where: { employeeIDs: employee.id }
      });
      if (backgroundCount > 0) {
        await prisma.professionalBackground.deleteMany({
          where: { employeeIDs: employee.id }
        });
        console.log(`   ✅ Gelöscht: ${backgroundCount} Professional Backgrounds`);
      }
      
      // Delete voccational records
      const voccationalCount = await prisma.voccational.count({
        where: { employeeIDs: employee.id }
      });
      if (voccationalCount > 0) {
        await prisma.voccational.deleteMany({
          where: { employeeIDs: employee.id }
        });
        console.log(`   ✅ Gelöscht: ${voccationalCount} Voccational Records`);
      }
      
      // Delete employee skills (remove employee from skill arrays)
      const employeeSkills = await prisma.employeeSkills.findMany({
        where: { employeeIDs: { has: employee.id } }
      });
      
      for (const skill of employeeSkills) {
        const updatedEmployeeIDs = skill.employeeIDs.filter(id => id !== employee.id);
        if (updatedEmployeeIDs.length === 0) {
          // If no employees left, delete the entire skill record
          await prisma.employeeSkills.delete({
            where: { id: skill.id }
          });
        } else {
          // Update the skill record to remove this employee
          await prisma.employeeSkills.update({
            where: { id: skill.id },
            data: { employeeIDs: updatedEmployeeIDs }
          });
        }
      }
      
      if (employeeSkills.length > 0) {
        console.log(`   ✅ Gelöscht: ${employeeSkills.length} Employee Skills`);
      }
      
      // Delete security clearances
      const securityCount = await prisma.securityClearance.count({
        where: { employeeIDs: employee.id }
      });
      if (securityCount > 0) {
        await prisma.securityClearance.deleteMany({
          where: { employeeIDs: employee.id }
        });
        console.log(`   ✅ Gelöscht: ${securityCount} Security Clearances`);
      }
      
      // Delete employee project employee roles
      const roleCount = await prisma.employeeProjectEmployeeRole.count({
        where: { employeeID: employee.id }
      });
      if (roleCount > 0) {
        await prisma.employeeProjectEmployeeRole.deleteMany({
          where: { employeeID: employee.id }
        });
        console.log(`   ✅ Gelöscht: ${roleCount} Employee Project Employee Roles`);
      }
      
      // Delete employee trainings
      const trainingCount = await prisma.employeeTraining.count({
        where: { employeeID: employee.id }
      });
      if (trainingCount > 0) {
        await prisma.employeeTraining.deleteMany({
          where: { employeeID: employee.id }
        });
        console.log(`   ✅ Gelöscht: ${trainingCount} Employee Trainings`);
      }
      
      // Delete tasks assigned to this employee
      const taskCount = await prisma.task.count({
        where: { 
          OR: [
            { assignedToId: employee.id },
            { createdById: employee.id }
          ]
        }
      });
      if (taskCount > 0) {
        await prisma.task.deleteMany({
          where: { 
            OR: [
              { assignedToId: employee.id },
              { createdById: employee.id }
            ]
          }
        });
        console.log(`   ✅ Gelöscht: ${taskCount} Tasks`);
      }
      
      // Delete search orders created by this employee
      const searchOrderCount = await prisma.searchOrder.count({
        where: { createdById: employee.id }
      });
      if (searchOrderCount > 0) {
        await prisma.searchOrder.deleteMany({
          where: { createdById: employee.id }
        });
        console.log(`   ✅ Gelöscht: ${searchOrderCount} Search Orders`);
      }
      
      // Delete call to tender employees
      const callToTenderEmployeeCount = await prisma.callToTenderEmployee.count({
        where: { employeeId: employee.id }
      });
      if (callToTenderEmployeeCount > 0) {
        await prisma.callToTenderEmployee.deleteMany({
          where: { employeeId: employee.id }
        });
        console.log(`   ✅ Gelöscht: ${callToTenderEmployeeCount} Call To Tender Employees`);
      }
      
      // Remove counselor relationships
      await prisma.employee.updateMany({
        where: { counselorIDs: employee.id },
        data: { counselorIDs: null }
      });
      
      // Remove division relationships
      await prisma.employee.updateMany({
        where: { id: employee.id },
        data: { divisionId: null }
      });
      
      // Remove division manager relationships
      await prisma.division.updateMany({
        where: { managedById: employee.id },
        data: { managedById: null }
      });
      
      // Now delete the employee
      await prisma.employee.delete({
        where: { id: employee.id }
      });
      
      console.log(`   ✅ Employee gelöscht: ${employee.foreName} ${employee.lastName}`);
    }
    
    console.log(`\n📈 Löschung abgeschlossen:`);
    console.log(`   ✅ Gelöscht: ${employees.length} Employees`);
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSpecificEmployees(); 