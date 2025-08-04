const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function finalCompleteStatusCheck() {
  console.log('📊 Finale vollständige Überprüfung aller Profile...\n');
  
  try {
    // Get all employees with 3-letter pseudonyms
    const employees = await prisma.employee.findMany({
      where: {
        pseudonym: {
          not: null
        }
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
        employeeExternalProjects: true
      },
      orderBy: {
        pseudonym: 'asc'
      }
    });
    
    const threeLetterEmployees = employees.filter(emp => emp.pseudonym && emp.pseudonym.length === 3);
    
    console.log(`📊 Gesamt: ${threeLetterEmployees.length} Profile mit 3-Buchstaben-Pseudonymen\n`);
    
    // Categorize profiles with ALL data types
    const completeProfiles = [];
    const partialProfiles = [];
    const emptyProfiles = [];
    
    threeLetterEmployees.forEach(emp => {
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
          pseudonym: emp.pseudonym
        });
      }
    });
    
    console.log('📋 **Vollständige Profile (4-6 Datentypen):**');
    console.log(`   Anzahl: ${completeProfiles.length}`);
    if (completeProfiles.length > 0) {
      console.log('   Profile:');
      completeProfiles.forEach(profile => {
        const dataTypes = [];
        if (profile.experience) dataTypes.push('Erfahrung');
        if (profile.education) dataTypes.push('Bildung');
        if (profile.skills) dataTypes.push('Skills');
        if (profile.certificates) dataTypes.push('Zertifikate');
        if (profile.professionalBackground) dataTypes.push('Beruflicher Werdegang');
        if (profile.projects) dataTypes.push('Projekte');
        console.log(`   - ${profile.pseudonym} (${dataTypes.join(', ')})`);
      });
    }
    
    console.log(`\n📋 **Teilweise Profile (2-3 Datentypen):**`);
    console.log(`   Anzahl: ${partialProfiles.length}`);
    if (partialProfiles.length > 0) {
      console.log('   Profile:');
      partialProfiles.forEach(profile => {
        const dataTypes = [];
        if (profile.experience) dataTypes.push('Erfahrung');
        if (profile.education) dataTypes.push('Bildung');
        if (profile.skills) dataTypes.push('Skills');
        if (profile.certificates) dataTypes.push('Zertifikate');
        if (profile.professionalBackground) dataTypes.push('Beruflicher Werdegang');
        if (profile.projects) dataTypes.push('Projekte');
        console.log(`   - ${profile.pseudonym} (${dataTypes.join(', ')})`);
      });
    }
    
    console.log(`\n📋 **Leere Profile (0-1 Datentypen):**`);
    console.log(`   Anzahl: ${emptyProfiles.length}`);
    if (emptyProfiles.length > 0) {
      console.log('   Profile:');
      emptyProfiles.forEach(profile => {
        console.log(`   - ${profile.pseudonym}`);
      });
    }
    
    // Summary statistics
    console.log('\n📊 **Zusammenfassung:**');
    console.log(`   ✅ Vollständig: ${completeProfiles.length} (${Math.round(completeProfiles.length / threeLetterEmployees.length * 100)}%)`);
    console.log(`   ⚠️  Teilweise: ${partialProfiles.length} (${Math.round(partialProfiles.length / threeLetterEmployees.length * 100)}%)`);
    console.log(`   ❌ Leer: ${emptyProfiles.length} (${Math.round(emptyProfiles.length / threeLetterEmployees.length * 100)}%)`);
    
    // Check specific KBR profile
    console.log('\n🔍 **KBR Spezielle Überprüfung:**');
    const kbrProfile = threeLetterEmployees.find(emp => emp.pseudonym === 'KBR');
    if (kbrProfile) {
      const hasExperience = kbrProfile.experienceIt > 0 || kbrProfile.experienceIs > 0 || kbrProfile.experienceItGs > 0 || kbrProfile.experienceGps > 0 || kbrProfile.experienceAll > 0;
      const hasEducation = kbrProfile.academicDegree && kbrProfile.academicDegree.length > 0;
      const hasSkills = kbrProfile.employeeSkills && kbrProfile.employeeSkills.length > 0;
      const hasCertificates = kbrProfile.employeeCertificates && kbrProfile.employeeCertificates.length > 0;
      const hasProfessionalBackground = kbrProfile.professionalBackground && kbrProfile.professionalBackground.length > 0;
      const hasProjects = kbrProfile.employeeExternalProjects && kbrProfile.employeeExternalProjects.length > 0;
      
      console.log(`   ✅ KBR: Erfahrung=${hasExperience ? 'Ja' : 'Nein'}, Bildung=${hasEducation ? 'Ja' : 'Nein'}, Skills=${hasSkills ? 'Ja' : 'Nein'}, Zertifikate=${hasCertificates ? 'Ja' : 'Nein'}, Beruflicher Werdegang=${hasProfessionalBackground ? 'Ja' : 'Nein'}, Projekte=${hasProjects ? 'Ja' : 'Nein'}`);
      
      if (hasSkills) {
        console.log(`   🛠️  KBR Skills: ${kbrProfile.employeeSkills.map(es => es.skills.title).join(', ')}`);
      }
    } else {
      console.log(`   ❌ KBR: Nicht gefunden`);
    }
    
    // Check imported profiles
    const importedProfiles = ['KBR', 'BSK', 'GAU', 'HSK', 'HWA', 'ISC', 'JSC', 'MSC', 'NSO', 'REH', 'RVO', 'SCA', 'WEI'];
    console.log('\n🔍 **Überprüfung der importierten Profile:**');
    
    for (const pseudonym of importedProfiles) {
      const profile = threeLetterEmployees.find(emp => emp.pseudonym === pseudonym);
      if (profile) {
        const hasExperience = profile.experienceIt > 0 || profile.experienceIs > 0 || profile.experienceItGs > 0 || profile.experienceGps > 0 || profile.experienceAll > 0;
        const hasEducation = profile.academicDegree && profile.academicDegree.length > 0;
        const hasSkills = profile.employeeSkills && profile.employeeSkills.length > 0;
        const hasCertificates = profile.employeeCertificates && profile.employeeCertificates.length > 0;
        const hasProfessionalBackground = profile.professionalBackground && profile.professionalBackground.length > 0;
        const hasProjects = profile.employeeExternalProjects && profile.employeeExternalProjects.length > 0;
        
        const dataCount = [hasExperience, hasEducation, hasSkills, hasCertificates, hasProfessionalBackground, hasProjects].filter(Boolean).length;
        const status = dataCount >= 4 ? '✅' : dataCount >= 2 ? '⚠️' : '❌';
        console.log(`   ${status} ${pseudonym}: ${dataCount}/6 Datentypen (Erfahrung=${hasExperience ? 'Ja' : 'Nein'}, Bildung=${hasEducation ? 'Ja' : 'Nein'}, Skills=${hasSkills ? 'Ja' : 'Nein'}, Zertifikate=${hasCertificates ? 'Ja' : 'Nein'}, Beruflicher Werdegang=${hasProfessionalBackground ? 'Ja' : 'Nein'}, Projekte=${hasProjects ? 'Ja' : 'Nein'})`);
      } else {
        console.log(`   ❌ ${pseudonym}: Nicht gefunden`);
      }
    }
    
  } catch (error) {
    console.error('❌ Fehler bei der finalen Überprüfung:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalCompleteStatusCheck().catch(console.error); 