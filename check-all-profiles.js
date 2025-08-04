const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkAllProfiles() {
  console.log('📊 Überprüfe ALLE Profile...\n');
  
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
    
    console.log(`📊 Gesamt: ${allEmployees.length} Profile\n`);
    
    // Categorize by pseudonym length
    const threeLetterEmployees = allEmployees.filter(emp => emp.pseudonym && emp.pseudonym.length === 3);
    const otherEmployees = allEmployees.filter(emp => emp.pseudonym && emp.pseudonym.length !== 3);
    const noPseudonymEmployees = allEmployees.filter(emp => !emp.pseudonym);
    
    console.log('📋 **Aufschlüsselung nach Pseudonym-Länge:**');
    console.log(`   3-Buchstaben: ${threeLetterEmployees.length} Profile`);
    console.log(`   Andere Längen: ${otherEmployees.length} Profile`);
    console.log(`   Kein Pseudonym: ${noPseudonymEmployees.length} Profile`);
    
    // Categorize ALL profiles with data types
    const completeProfiles = [];
    const partialProfiles = [];
    const emptyProfiles = [];
    
    allEmployees.forEach(emp => {
      const hasExperience = emp.experienceIt > 0 || emp.experienceIs > 0 || emp.experienceItGs > 0 || emp.experienceGps > 0 || emp.experienceAll > 0;
      const hasEducation = emp.academicDegree && emp.academicDegree.length > 0;
      const hasSkills = emp.employeeSkills && emp.employeeSkills.length > 0;
      const hasCertificates = emp.employeeCertificates && emp.employeeCertificates.length > 0;
      const hasProfessionalBackground = emp.professionalBackground && emp.professionalBackground.length > 0;
      const hasProjects = emp.employeeExternalProjects && emp.employeeExternalProjects.length > 0;
      
      const dataCount = [hasExperience, hasEducation, hasSkills, hasCertificates, hasProfessionalBackground, hasProjects].filter(Boolean).length;
      
      if (dataCount >= 4) {
        completeProfiles.push({
          pseudonym: emp.pseudonym,
          foreName: emp.foreName,
          lastName: emp.lastName,
          experience: hasExperience,
          education: hasEducation,
          skills: hasSkills,
          certificates: hasCertificates,
          professionalBackground: hasProfessionalBackground,
          projects: hasProjects,
          dataCount
        });
      } else if (dataCount >= 2) {
        partialProfiles.push({
          pseudonym: emp.pseudonym,
          foreName: emp.foreName,
          lastName: emp.lastName,
          experience: hasExperience,
          education: hasEducation,
          skills: hasSkills,
          certificates: hasCertificates,
          professionalBackground: hasProfessionalBackground,
          projects: hasProjects,
          dataCount
        });
      } else {
        emptyProfiles.push({
          pseudonym: emp.pseudonym,
          foreName: emp.foreName,
          lastName: emp.lastName
        });
      }
    });
    
    console.log('\n📋 **Vollständige Profile (4-6 Datentypen):**');
    console.log(`   Anzahl: ${completeProfiles.length}`);
    if (completeProfiles.length > 0) {
      console.log('   Beispiele:');
      completeProfiles.slice(0, 10).forEach(profile => {
        const dataTypes = [];
        if (profile.experience) dataTypes.push('Erfahrung');
        if (profile.education) dataTypes.push('Bildung');
        if (profile.skills) dataTypes.push('Skills');
        if (profile.certificates) dataTypes.push('Zertifikate');
        if (profile.professionalBackground) dataTypes.push('Beruflicher Werdegang');
        if (profile.projects) dataTypes.push('Projekte');
        console.log(`   - ${profile.pseudonym || 'Kein Pseudonym'} (${profile.foreName} ${profile.lastName}) - ${dataTypes.join(', ')}`);
      });
      if (completeProfiles.length > 10) {
        console.log(`   ... und ${completeProfiles.length - 10} weitere`);
      }
    }
    
    console.log(`\n📋 **Teilweise Profile (2-3 Datentypen):**`);
    console.log(`   Anzahl: ${partialProfiles.length}`);
    if (partialProfiles.length > 0) {
      console.log('   Beispiele:');
      partialProfiles.slice(0, 10).forEach(profile => {
        const dataTypes = [];
        if (profile.experience) dataTypes.push('Erfahrung');
        if (profile.education) dataTypes.push('Bildung');
        if (profile.skills) dataTypes.push('Skills');
        if (profile.certificates) dataTypes.push('Zertifikate');
        if (profile.professionalBackground) dataTypes.push('Beruflicher Werdegang');
        if (profile.projects) dataTypes.push('Projekte');
        console.log(`   - ${profile.pseudonym || 'Kein Pseudonym'} (${profile.foreName} ${profile.lastName}) - ${dataTypes.join(', ')}`);
      });
      if (partialProfiles.length > 10) {
        console.log(`   ... und ${partialProfiles.length - 10} weitere`);
      }
    }
    
    console.log(`\n📋 **Leere Profile (0-1 Datentypen):**`);
    console.log(`   Anzahl: ${emptyProfiles.length}`);
    if (emptyProfiles.length > 0) {
      console.log('   Beispiele:');
      emptyProfiles.slice(0, 10).forEach(profile => {
        console.log(`   - ${profile.pseudonym || 'Kein Pseudonym'} (${profile.foreName} ${profile.lastName})`);
      });
      if (emptyProfiles.length > 10) {
        console.log(`   ... und ${emptyProfiles.length - 10} weitere`);
      }
    }
    
    // Summary statistics for ALL profiles
    console.log('\n📊 **Zusammenfassung (ALLE Profile):**');
    console.log(`   ✅ Vollständig: ${completeProfiles.length} (${Math.round(completeProfiles.length / allEmployees.length * 100)}%)`);
    console.log(`   ⚠️  Teilweise: ${partialProfiles.length} (${Math.round(partialProfiles.length / allEmployees.length * 100)}%)`);
    console.log(`   ❌ Leer: ${emptyProfiles.length} (${Math.round(emptyProfiles.length / allEmployees.length * 100)}%)`);
    
    // Check specific profiles
    console.log('\n🔍 **Spezielle Profile Überprüfung:**');
    const specialProfiles = ['KBR', 'EDO', 'LTH'];
    
    for (const pseudonym of specialProfiles) {
      const profile = allEmployees.find(emp => emp.pseudonym === pseudonym);
      if (profile) {
        const hasExperience = profile.experienceIt > 0 || profile.experienceIs > 0 || profile.experienceItGs > 0 || profile.experienceGps > 0 || profile.experienceAll > 0;
        const hasEducation = profile.academicDegree && profile.academicDegree.length > 0;
        const hasSkills = profile.employeeSkills && profile.employeeSkills.length > 0;
        const hasCertificates = profile.employeeCertificates && profile.employeeCertificates.length > 0;
        const hasProfessionalBackground = profile.professionalBackground && profile.professionalBackground.length > 0;
        const hasProjects = profile.employeeExternalProjects && profile.employeeExternalProjects.length > 0;
        
        const dataCount = [hasExperience, hasEducation, hasSkills, hasCertificates, hasProfessionalBackground, hasProjects].filter(Boolean).length;
        const status = dataCount >= 4 ? '✅' : dataCount >= 2 ? '⚠️' : '❌';
        console.log(`   ${status} ${pseudonym}: ${dataCount}/6 Datentypen (${profile.foreName} ${profile.lastName})`);
      } else {
        console.log(`   ❌ ${pseudonym}: Nicht gefunden`);
      }
    }
    
    // Show some examples of non-3-letter profiles
    console.log('\n🔍 **Beispiele für andere Profile:**');
    const otherExamples = otherEmployees.slice(0, 5);
    otherExamples.forEach(emp => {
      const hasExperience = emp.experienceIt > 0 || emp.experienceIs > 0 || emp.experienceItGs > 0 || emp.experienceGps > 0 || emp.experienceAll > 0;
      const hasEducation = emp.academicDegree && emp.academicDegree.length > 0;
      const hasSkills = emp.employeeSkills && emp.employeeSkills.length > 0;
      const hasCertificates = emp.employeeCertificates && emp.employeeCertificates.length > 0;
      const hasProfessionalBackground = emp.professionalBackground && emp.professionalBackground.length > 0;
      const hasProjects = emp.employeeExternalProjects && emp.employeeExternalProjects.length > 0;
      
      const dataCount = [hasExperience, hasEducation, hasSkills, hasCertificates, hasProfessionalBackground, hasProjects].filter(Boolean).length;
      console.log(`   ${emp.pseudonym} (${emp.foreName} ${emp.lastName}): ${dataCount}/6 Datentypen`);
    });
    
  } catch (error) {
    console.error('❌ Fehler bei der Überprüfung aller Profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllProfiles().catch(console.error); 