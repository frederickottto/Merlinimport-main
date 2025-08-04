const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function showEmptyProfiles() {
  console.log('📋 Zeige alle 29 Profile mit 0-1 Datentypen...\n');
  
  try {
    // Get ALL employees
    const allEmployees = await prisma.employee.findMany({
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
        employeeExternalProjects: true
      },
      orderBy: {
        pseudonym: 'asc'
      }
    });
    
    // Find profiles with 0-1 datatypes
    const emptyProfiles = [];
    
    allEmployees.forEach(emp => {
      const hasExperience = emp.experienceIt > 0 || emp.experienceIs > 0 || emp.experienceItGs > 0 || emp.experienceGps > 0 || emp.experienceAll > 0;
      const hasEducation = emp.academicDegree && emp.academicDegree.length > 0;
      const hasSkills = emp.employeeSkills && emp.employeeSkills.length > 0;
      const hasCertificates = emp.employeeCertificates && emp.employeeCertificates.length > 0;
      const hasProfessionalBackground = emp.professionalBackground && emp.professionalBackground.length > 0;
      const hasProjects = emp.employeeExternalProjects && emp.employeeExternalProjects.length > 0;
      
      const dataCount = [hasExperience, hasEducation, hasSkills, hasCertificates, hasProfessionalBackground, hasProjects].filter(Boolean).length;
      
      if (dataCount <= 1) {
        emptyProfiles.push({
          id: emp.id,
          pseudonym: emp.pseudonym,
          foreName: emp.foreName,
          lastName: emp.lastName,
          experience: hasExperience,
          education: hasEducation,
          skills: hasSkills,
          certificates: hasCertificates,
          professionalBackground: hasProfessionalBackground,
          projects: hasProjects,
          dataCount,
          // Show actual data counts
          experienceYears: emp.experienceAll || 0,
          educationCount: emp.academicDegree ? emp.academicDegree.length : 0,
          skillsCount: emp.employeeSkills ? emp.employeeSkills.length : 0,
          certificatesCount: emp.employeeCertificates ? emp.employeeCertificates.length : 0,
          professionalBackgroundCount: emp.professionalBackground ? emp.professionalBackground.length : 0,
          projectsCount: emp.employeeExternalProjects ? emp.employeeExternalProjects.length : 0
        });
      }
    });
    
    console.log(`📊 Gefunden: ${emptyProfiles.length} Profile mit 0-1 Datentypen\n`);
    
    // Group by data count
    const zeroDataProfiles = emptyProfiles.filter(p => p.dataCount === 0);
    const oneDataProfiles = emptyProfiles.filter(p => p.dataCount === 1);
    
    console.log(`📋 **Profile mit 0 Datentypen (${zeroDataProfiles.length}):**`);
    zeroDataProfiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.pseudonym || 'Kein Pseudonym'} (${profile.foreName} ${profile.lastName})`);
      console.log(`      ID: ${profile.id}`);
      console.log(`      Erfahrung: ${profile.experienceYears} Jahre`);
      console.log(`      Bildung: ${profile.educationCount} Einträge`);
      console.log(`      Skills: ${profile.skillsCount} Einträge`);
      console.log(`      Zertifikate: ${profile.certificatesCount} Einträge`);
      console.log(`      Beruflicher Werdegang: ${profile.professionalBackgroundCount} Einträge`);
      console.log(`      Projekte: ${profile.projectsCount} Einträge`);
      console.log('');
    });
    
    console.log(`📋 **Profile mit 1 Datentyp (${oneDataProfiles.length}):**`);
    oneDataProfiles.forEach((profile, index) => {
      const dataTypes = [];
      if (profile.experience) dataTypes.push('Erfahrung');
      if (profile.education) dataTypes.push('Bildung');
      if (profile.skills) dataTypes.push('Skills');
      if (profile.certificates) dataTypes.push('Zertifikate');
      if (profile.professionalBackground) dataTypes.push('Beruflicher Werdegang');
      if (profile.projects) dataTypes.push('Projekte');
      
      console.log(`   ${index + 1}. ${profile.pseudonym || 'Kein Pseudonym'} (${profile.foreName} ${profile.lastName})`);
      console.log(`      ID: ${profile.id}`);
      console.log(`      Hat: ${dataTypes.join(', ')}`);
      console.log(`      Erfahrung: ${profile.experienceYears} Jahre`);
      console.log(`      Bildung: ${profile.educationCount} Einträge`);
      console.log(`      Skills: ${profile.skillsCount} Einträge`);
      console.log(`      Zertifikate: ${profile.certificatesCount} Einträge`);
      console.log(`      Beruflicher Werdegang: ${profile.professionalBackgroundCount} Einträge`);
      console.log(`      Projekte: ${profile.projectsCount} Einträge`);
      console.log('');
    });
    
    // Summary
    console.log('📊 **Zusammenfassung:**');
    console.log(`   ❌ 0 Datentypen: ${zeroDataProfiles.length} Profile`);
    console.log(`   ⚠️  1 Datentyp: ${oneDataProfiles.length} Profile`);
    console.log(`   📋 Gesamt: ${emptyProfiles.length} Profile`);
    
    // Show some interesting patterns
    console.log('\n🔍 **Interessante Muster:**');
    
    const noPseudonymProfiles = emptyProfiles.filter(p => !p.pseudonym);
    const threeLetterProfiles = emptyProfiles.filter(p => p.pseudonym && p.pseudonym.length === 3);
    const otherLengthProfiles = emptyProfiles.filter(p => p.pseudonym && p.pseudonym.length !== 3);
    
    console.log(`   Profile ohne Pseudonym: ${noPseudonymProfiles.length}`);
    console.log(`   3-Buchstaben-Pseudonyme: ${threeLetterProfiles.length}`);
    console.log(`   Andere Pseudonym-Längen: ${otherLengthProfiles.length}`);
    
    if (noPseudonymProfiles.length > 0) {
      console.log('\n   **Profile ohne Pseudonym:**');
      noPseudonymProfiles.forEach(profile => {
        console.log(`   - ${profile.foreName} ${profile.lastName} (ID: ${profile.id})`);
      });
    }
    
    if (threeLetterProfiles.length > 0) {
      console.log('\n   **3-Buchstaben-Pseudonyme:**');
      threeLetterProfiles.forEach(profile => {
        console.log(`   - ${profile.pseudonym} (${profile.foreName} ${profile.lastName})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Anzeigen der leeren Profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showEmptyProfiles().catch(console.error); 