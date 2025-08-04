const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function finalStatusCheck() {
  console.log('📊 Finale Überprüfung aller Profile...\n');
  
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
        }
      },
      orderBy: {
        pseudonym: 'asc'
      }
    });
    
    const threeLetterEmployees = employees.filter(emp => emp.pseudonym && emp.pseudonym.length === 3);
    
    console.log(`📊 Gesamt: ${threeLetterEmployees.length} Profile mit 3-Buchstaben-Pseudonymen\n`);
    
    // Categorize profiles
    const completeProfiles = [];
    const partialProfiles = [];
    const emptyProfiles = [];
    
    threeLetterEmployees.forEach(emp => {
      const hasExperience = emp.experienceIt > 0 || emp.experienceIs > 0 || emp.experienceItGs > 0 || emp.experienceGps > 0 || emp.experienceAll > 0;
      const hasEducation = emp.academicDegree && emp.academicDegree.length > 0;
      const hasSkills = emp.employeeSkills && emp.employeeSkills.length > 0;
      const hasCertificates = emp.employeeCertificates && emp.employeeCertificates.length > 0;
      
      const dataCount = [hasExperience, hasEducation, hasSkills, hasCertificates].filter(Boolean).length;
      
      if (dataCount >= 3) {
        completeProfiles.push({
          pseudonym: emp.pseudonym,
          experience: hasExperience,
          education: hasEducation,
          skills: hasSkills,
          certificates: hasCertificates,
          dataCount
        });
      } else if (dataCount >= 1) {
        partialProfiles.push({
          pseudonym: emp.pseudonym,
          experience: hasExperience,
          education: hasEducation,
          skills: hasSkills,
          certificates: hasCertificates,
          dataCount
        });
      } else {
        emptyProfiles.push({
          pseudonym: emp.pseudonym
        });
      }
    });
    
    console.log('📋 **Vollständige Profile (3-4 Datentypen):**');
    console.log(`   Anzahl: ${completeProfiles.length}`);
    if (completeProfiles.length > 0) {
      console.log('   Profile:');
      completeProfiles.forEach(profile => {
        const dataTypes = [];
        if (profile.experience) dataTypes.push('Erfahrung');
        if (profile.education) dataTypes.push('Bildung');
        if (profile.skills) dataTypes.push('Skills');
        if (profile.certificates) dataTypes.push('Zertifikate');
        console.log(`   - ${profile.pseudonym} (${dataTypes.join(', ')})`);
      });
    }
    
    console.log(`\n📋 **Teilweise Profile (1-2 Datentypen):**`);
    console.log(`   Anzahl: ${partialProfiles.length}`);
    if (partialProfiles.length > 0) {
      console.log('   Profile:');
      partialProfiles.forEach(profile => {
        const dataTypes = [];
        if (profile.experience) dataTypes.push('Erfahrung');
        if (profile.education) dataTypes.push('Bildung');
        if (profile.skills) dataTypes.push('Skills');
        if (profile.certificates) dataTypes.push('Zertifikate');
        console.log(`   - ${profile.pseudonym} (${dataTypes.join(', ')})`);
      });
    }
    
    console.log(`\n📋 **Leere Profile (nur Pseudonym):**`);
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
    
    // Check specific profiles that were imported
    const importedProfiles = ['KBR', 'BSK', 'GAU', 'HSK', 'HWA', 'ISC', 'JSC', 'MSC', 'NSO', 'REH', 'RVO', 'SCA', 'WEI'];
    console.log('\n🔍 **Überprüfung der importierten Profile:**');
    
    for (const pseudonym of importedProfiles) {
      const profile = threeLetterEmployees.find(emp => emp.pseudonym === pseudonym);
      if (profile) {
        const hasExperience = profile.experienceIt > 0 || profile.experienceIs > 0 || profile.experienceItGs > 0 || profile.experienceGps > 0 || profile.experienceAll > 0;
        const hasEducation = profile.academicDegree && profile.academicDegree.length > 0;
        const hasSkills = profile.employeeSkills && profile.employeeSkills.length > 0;
        const hasCertificates = profile.employeeCertificates && profile.employeeCertificates.length > 0;
        
        const status = [hasExperience, hasEducation, hasSkills, hasCertificates].filter(Boolean).length >= 3 ? '✅' : '⚠️';
        console.log(`   ${status} ${pseudonym}: Erfahrung=${hasExperience ? 'Ja' : 'Nein'}, Bildung=${hasEducation ? 'Ja' : 'Nein'}, Skills=${hasSkills ? 'Ja' : 'Nein'}, Zertifikate=${hasCertificates ? 'Ja' : 'Nein'}`);
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

finalStatusCheck().catch(console.error); 