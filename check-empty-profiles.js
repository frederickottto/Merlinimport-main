const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkEmptyProfiles() {
  console.log('🔍 Überprüfe leere Profile...\n');
  
  try {
    // Get all employees with their related data
    const employees = await prisma.employee.findMany({
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
        location: true
      },
      orderBy: {
        pseudonym: 'asc'
      }
    });
    
    console.log(`📊 Gefunden: ${employees.length} Mitarbeiterprofile in der Datenbank\n`);
    
    // Check for empty profiles (only pseudonym, no other meaningful data)
    const emptyProfiles = [];
    const profilesWithData = [];
    
    employees.forEach(emp => {
      const hasExperience = emp.experienceIt > 0 || emp.experienceIs > 0 || emp.experienceItGs > 0 || emp.experienceGps > 0 || emp.experienceAll > 0;
      const hasEducation = emp.academicDegree && emp.academicDegree.length > 0;
      const hasSkills = emp.employeeSkills && emp.employeeSkills.length > 0;
      const hasCertificates = emp.employeeCertificates && emp.employeeCertificates.length > 0;
      const hasLocation = emp.location !== null;
      const hasCompany = emp.employeerCompany && emp.employeerCompany.trim() !== '';
      const hasStartDate = emp.contractStartDate !== null;
      
      const hasAnyData = hasExperience || hasEducation || hasSkills || hasCertificates || hasLocation || hasCompany || hasStartDate;
      
      if (!hasAnyData && emp.pseudonym && emp.pseudonym.length === 3) {
        emptyProfiles.push({
          pseudonym: emp.pseudonym,
          foreName: emp.foreName,
          lastName: emp.lastName,
          id: emp.id
        });
      } else if (emp.pseudonym && emp.pseudonym.length === 3) {
        profilesWithData.push({
          pseudonym: emp.pseudonym,
          foreName: emp.foreName,
          lastName: emp.lastName,
          hasExperience,
          hasEducation,
          hasSkills,
          hasCertificates,
          hasLocation,
          hasCompany,
          hasStartDate
        });
      }
    });
    
    console.log('📋 **Leere Profile (nur Pseudonym):**');
    console.log(`   Anzahl: ${emptyProfiles.length}`);
    if (emptyProfiles.length > 0) {
      console.log('   Profile:');
      emptyProfiles.forEach(profile => {
        console.log(`   - ${profile.pseudonym} (ID: ${profile.id})`);
      });
    }
    
    console.log('\n📋 **Profile mit Daten:**');
    console.log(`   Anzahl: ${profilesWithData.length}`);
    
    // Check specific KBR profile
    console.log('\n🔍 **Spezifische Überprüfung KBR:**');
    const kbrProfile = employees.find(emp => emp.pseudonym === 'KBR');
    if (kbrProfile) {
      console.log(`   ✅ KBR gefunden (ID: ${kbrProfile.id})`);
      console.log(`   Vorname: ${kbrProfile.foreName}`);
      console.log(`   Nachname: ${kbrProfile.lastName}`);
      console.log(`   Firma: ${kbrProfile.employeerCompany}`);
      console.log(`   Erfahrung IT: ${kbrProfile.experienceIt}`);
      console.log(`   Erfahrung IS: ${kbrProfile.experienceIs}`);
      console.log(`   Erfahrung IT-GS: ${kbrProfile.experienceItGs}`);
      console.log(`   Erfahrung GPS: ${kbrProfile.experienceGps}`);
      console.log(`   Erfahrung Gesamt: ${kbrProfile.experienceAll}`);
      console.log(`   Startdatum: ${kbrProfile.contractStartDate}`);
      console.log(`   Standort: ${kbrProfile.location ? 'Ja' : 'Nein'}`);
      console.log(`   Akademische Abschlüsse: ${kbrProfile.academicDegree ? kbrProfile.academicDegree.length : 0}`);
      console.log(`   Skills: ${kbrProfile.employeeSkills ? kbrProfile.employeeSkills.length : 0}`);
      console.log(`   Zertifikate: ${kbrProfile.employeeCertificates ? kbrProfile.employeeCertificates.length : 0}`);
      
      if (kbrProfile.employeeSkills && kbrProfile.employeeSkills.length > 0) {
        console.log('   Skills Details:');
        kbrProfile.employeeSkills.forEach(skill => {
          console.log(`     - ${skill.skills.title} (Niveau: ${skill.niveau})`);
        });
      }
      
      if (kbrProfile.employeeCertificates && kbrProfile.employeeCertificates.length > 0) {
        console.log('   Zertifikate Details:');
        kbrProfile.employeeCertificates.forEach(cert => {
          console.log(`     - ${cert.certificate.title}`);
        });
      }
    } else {
      console.log('   ❌ KBR nicht gefunden');
    }
    
    // Check if KBR is in empty profiles
    const kbrEmpty = emptyProfiles.find(profile => profile.pseudonym === 'KBR');
    if (kbrEmpty) {
      console.log('\n⚠️  **KBR ist in der Liste der leeren Profile!**');
    } else {
      console.log('\n✅ **KBR hat Daten und ist nicht leer**');
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Überprüfen der Profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmptyProfiles().catch(console.error); 