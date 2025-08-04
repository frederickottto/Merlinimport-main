const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function deleteEdoLthProfile() {
  console.log('🗑️  Lösche das fehlerhafte Profil "EDO, LTH, ..."...\n');
  
  try {
    // Find the profile with pseudonym "EDO, LTH, ..."
    const profileToDelete = await prisma.employee.findFirst({
      where: {
        pseudonym: 'EDO, LTH, ...'
      },
      include: {
        academicDegree: true,
        employeeSkills: {
          include: {
            skills: true
          }
        },
        employeeCertificates: {
          include: {
            certificate: true
          }
        },
        professionalBackground: true,
        employeeExternalProjects: true,
        location: true
      }
    });
    
    if (!profileToDelete) {
      console.log('❌ Profil "EDO, LTH, ..." nicht gefunden');
      return;
    }
    
    console.log('📋 **Profil gefunden:**');
    console.log(`   ID: ${profileToDelete.id}`);
    console.log(`   Pseudonym: ${profileToDelete.pseudonym}`);
    console.log(`   Name: ${profileToDelete.foreName} ${profileToDelete.lastName}`);
    console.log(`   Standort: ${profileToDelete.location ? profileToDelete.location.city : 'Kein Standort'}`);
    console.log(`   Akademische Abschlüsse: ${profileToDelete.academicDegree.length}`);
    console.log(`   Skills: ${profileToDelete.employeeSkills.length}`);
    console.log(`   Zertifikate: ${profileToDelete.employeeCertificates.length}`);
    console.log(`   Beruflicher Werdegang: ${profileToDelete.professionalBackground.length}`);
    console.log(`   Externe Projekte: ${profileToDelete.employeeExternalProjects.length}`);
    
    // Delete related records first
    console.log('\n🗑️  **Lösche verknüpfte Datensätze...**');
    
    // Delete CallToTenderEmployee records
    const callToTenderEmployees = await prisma.callToTenderEmployee.deleteMany({
      where: {
        employeeId: profileToDelete.id
      }
    });
    console.log(`   ✅ CallToTenderEmployee: ${callToTenderEmployees.count} Datensätze gelöscht`);
    
    // Delete EmployeeExternalProjects
    const externalProjects = await prisma.employeeExternalProjects.deleteMany({
      where: {
        employeeIDs: profileToDelete.id
      }
    });
    console.log(`   ✅ EmployeeExternalProjects: ${externalProjects.count} Datensätze gelöscht`);
    
    // Delete ProfessionalBackground
    const professionalBackground = await prisma.professionalBackground.deleteMany({
      where: {
        employeeIDs: profileToDelete.id
      }
    });
    console.log(`   ✅ ProfessionalBackground: ${professionalBackground.count} Datensätze gelöscht`);
    
    // Delete EmployeeCertificates
    const employeeCertificates = await prisma.employeeCertificates.deleteMany({
      where: {
        employeeIDs: profileToDelete.id
      }
    });
    console.log(`   ✅ EmployeeCertificates: ${employeeCertificates.count} Datensätze gelöscht`);
    
    // Delete AcademicDegree
    const academicDegrees = await prisma.academicDegree.deleteMany({
      where: {
        employeeIDs: profileToDelete.id
      }
    });
    console.log(`   ✅ AcademicDegree: ${academicDegrees.count} Datensätze gelöscht`);
    
    // Delete SecurityClearance
    const securityClearances = await prisma.securityClearance.deleteMany({
      where: {
        employeeIDs: profileToDelete.id
      }
    });
    console.log(`   ✅ SecurityClearance: ${securityClearances.count} Datensätze gelöscht`);
    
    // Delete Voccational
    const voccationals = await prisma.voccational.deleteMany({
      where: {
        employeeIDs: profileToDelete.id
      }
    });
    console.log(`   ✅ Voccational: ${voccationals.count} Datensätze gelöscht`);
    
    // Delete EmployeeProjectActivities
    const employeeProjectActivities = await prisma.employeeProjectActivities.deleteMany({
      where: {
        employeeIDs: profileToDelete.id
      }
    });
    console.log(`   ✅ EmployeeProjectActivities: ${employeeProjectActivities.count} Datensätze gelöscht`);
    
    // Delete EmployeeTraining
    const employeeTrainings = await prisma.employeeTraining.deleteMany({
      where: {
        employeeID: profileToDelete.id
      }
    });
    console.log(`   ✅ EmployeeTraining: ${employeeTrainings.count} Datensätze gelöscht`);
    
    // Now delete the employee profile
    await prisma.employee.delete({
      where: {
        id: profileToDelete.id
      }
    });
    
    console.log('\n✅ **Profil erfolgreich gelöscht!**');
    console.log(`   🗑️  "${profileToDelete.pseudonym}" wurde aus der Datenbank entfernt`);
    
    // Verify deletion
    const verifyDeletion = await prisma.employee.findFirst({
      where: {
        pseudonym: 'EDO, LTH, ...'
      }
    });
    
    if (!verifyDeletion) {
      console.log('✅ **Löschung bestätigt:** Profil existiert nicht mehr in der Datenbank');
    } else {
      console.log('❌ **Fehler:** Profil wurde nicht vollständig gelöscht');
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Löschen des Profils:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteEdoLthProfile().catch(console.error); 