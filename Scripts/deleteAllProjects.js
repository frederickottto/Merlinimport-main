const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Lösche alle Projekte und zugehörige Daten...');
  
  try {
    // First, check how many projects exist
    const projectCount = await prisma.project.count();
    console.log(`📊 Gefundene Projekte: ${projectCount}`);
    
    if (projectCount === 0) {
      console.log('✅ Keine Projekte zum Löschen gefunden.');
      return;
    }
    
    // Delete related data first (in correct order to avoid foreign key constraints)
    console.log('🗑️  Lösche zugehörige Daten...');
    
    // Delete employee project activities
    const employeeProjectActivitiesResult = await prisma.employeeProjectActivities.deleteMany({});
    console.log(`   ✅ EmployeeProjectActivities gelöscht: ${employeeProjectActivitiesResult.count}`);
    
    // Delete employee external projects
    const employeeExternalProjectsResult = await prisma.employeeExternalProjects.deleteMany({});
    console.log(`   ✅ EmployeeExternalProjects gelöscht: ${employeeExternalProjectsResult.count}`);
    
    // Delete call to tender projects
    const callToTenderProjectResult = await prisma.callToTenderProject.deleteMany({});
    console.log(`   ✅ CallToTenderProject gelöscht: ${callToTenderProjectResult.count}`);
    
    // Clear project contacts (organisation contacts linked to projects)
    const projectContactsResult = await prisma.organisationContacts.updateMany({
      where: {
        projectIDs: {
          isEmpty: false
        }
      },
      data: {
        projectIDs: []
      }
    });
    console.log(`   ✅ Project contacts bereinigt: ${projectContactsResult.count} Kontakte`);
    
    // Now delete all projects
    const deleteResult = await prisma.project.deleteMany({});
    console.log(`✅ Erfolgreich gelöscht: ${deleteResult.count} Projekte`);
    
    // Verify deletion
    const remainingProjects = await prisma.project.count();
    console.log(`📊 Verbleibende Projekte: ${remainingProjects}`);
    
    if (remainingProjects === 0) {
      console.log('✅ Alle Projekte wurden erfolgreich gelöscht!');
    } else {
      console.log('⚠️  Es sind noch Projekte in der Datenbank vorhanden.');
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Löschen der Projekte:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 