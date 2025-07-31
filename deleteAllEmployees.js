// Script to delete all employees and related data from the database
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function deleteAllEmployees() {
  console.log("🗑️  Employee-Löschung");
  console.log("📋 Lösche alle Employees und zugehörige Daten aus der Datenbank...\n");
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Count existing employees
    const employeeCount = await prisma.employee.count();
    console.log(`📊 Gefundene Employees: ${employeeCount}`);
    
    if (employeeCount === 0) {
      console.log("ℹ️  Keine Employees zum Löschen gefunden");
      return;
    }
    
    // Delete related data first (due to foreign key constraints)
    console.log("🗑️  Lösche zugehörige Daten...");
    
    // Delete employee certificates
    const certCount = await prisma.employeeCertificates.count();
    if (certCount > 0) {
      await prisma.employeeCertificates.deleteMany({});
      console.log(`✅ Gelöscht: ${certCount} Employee Certificates`);
    }
    
    // Delete employee skills
    const skillCount = await prisma.employeeSkills.count();
    if (skillCount > 0) {
      await prisma.employeeSkills.deleteMany({});
      console.log(`✅ Gelöscht: ${skillCount} Employee Skills`);
    }
    
    // Delete employee project activities
    const projectCount = await prisma.employeeProjectActivities.count();
    if (projectCount > 0) {
      await prisma.employeeProjectActivities.deleteMany({});
      console.log(`✅ Gelöscht: ${projectCount} Employee Project Activities`);
    }
    
    // Delete employee external projects
    const externalCount = await prisma.employeeExternalProjects.count();
    if (externalCount > 0) {
      await prisma.employeeExternalProjects.deleteMany({});
      console.log(`✅ Gelöscht: ${externalCount} Employee External Projects`);
    }
    
    // Delete academic degrees
    const degreeCount = await prisma.academicDegree.count();
    if (degreeCount > 0) {
      await prisma.academicDegree.deleteMany({});
      console.log(`✅ Gelöscht: ${degreeCount} Academic Degrees`);
    }
    
    // Delete professional backgrounds
    const backgroundCount = await prisma.professionalBackground.count();
    if (backgroundCount > 0) {
      await prisma.professionalBackground.deleteMany({});
      console.log(`✅ Gelöscht: ${backgroundCount} Professional Backgrounds`);
    }
    
    // Delete voccational records
    const voccationalCount = await prisma.voccational.count();
    if (voccationalCount > 0) {
      await prisma.voccational.deleteMany({});
      console.log(`✅ Gelöscht: ${voccationalCount} Voccational Records`);
    }
    
    // Delete security clearances
    const securityCount = await prisma.securityClearance.count();
    if (securityCount > 0) {
      await prisma.securityClearance.deleteMany({});
      console.log(`✅ Gelöscht: ${securityCount} Security Clearances`);
    }
    
    // Delete divisions (managed by employees)
    const divisionCount = await prisma.division.count();
    if (divisionCount > 0) {
      // First remove employee-division relationships
      await prisma.employee.updateMany({
        data: { divisionId: null }
      });
      
      // Remove division manager relationships
      await prisma.division.updateMany({
        data: { managedById: null }
      });
      
      // First delete sub-divisions
      await prisma.division.updateMany({
        where: { parentDivisionId: { not: null } },
        data: { parentDivisionId: null }
      });
      
      // Then delete all divisions
      await prisma.division.deleteMany({});
      console.log(`✅ Gelöscht: ${divisionCount} Divisions`);
    }
    
    // Delete employee project employee roles
    const roleCount = await prisma.employeeProjectEmployeeRole.count();
    if (roleCount > 0) {
      await prisma.employeeProjectEmployeeRole.deleteMany({});
      console.log(`✅ Gelöscht: ${roleCount} Employee Project Employee Roles`);
    }
    
    // Delete employee trainings
    const trainingCount = await prisma.employeeTraining.count();
    if (trainingCount > 0) {
      await prisma.employeeTraining.deleteMany({});
      console.log(`✅ Gelöscht: ${trainingCount} Employee Trainings`);
    }
    
    // Delete tasks
    const taskCount = await prisma.task.count();
    if (taskCount > 0) {
      await prisma.task.deleteMany({});
      console.log(`✅ Gelöscht: ${taskCount} Tasks`);
    }
    
    // Delete search orders
    const searchOrderCount = await prisma.searchOrder.count();
    if (searchOrderCount > 0) {
      await prisma.searchOrder.deleteMany({});
      console.log(`✅ Gelöscht: ${searchOrderCount} Search Orders`);
    }
    
    // Delete call to tender employees
    const callToTenderEmployeeCount = await prisma.callToTenderEmployee.count();
    if (callToTenderEmployeeCount > 0) {
      await prisma.callToTenderEmployee.deleteMany({});
      console.log(`✅ Gelöscht: ${callToTenderEmployeeCount} Call To Tender Employees`);
    }
    
    // Remove employee counselor relationships
    await prisma.employee.updateMany({
      data: { counselorIDs: null }
    });
    console.log(`✅ Employee Counselor Beziehungen entfernt`);
    
    // Now delete all employees
    const result = await prisma.employee.deleteMany({});
    
    console.log(`✅ Erfolgreich gelöscht: ${result.count} Employees`);
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllEmployees(); 