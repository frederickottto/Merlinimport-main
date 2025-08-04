const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkKBRDetails() {
  console.log('🔍 Überprüfe KBR Details...\n');
  
  try {
    // Find KBR profile with all related data
    const kbrProfile = await prisma.employee.findFirst({
      where: { pseudonym: 'KBR' },
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
      }
    });
    
    if (!kbrProfile) {
      console.log('❌ KBR Profil nicht gefunden!');
      return;
    }
    
    console.log(`✅ KBR Profil gefunden (ID: ${kbrProfile.id})`);
    console.log(`   Name: ${kbrProfile.foreName} ${kbrProfile.lastName}`);
    console.log(`   Pseudonym: ${kbrProfile.pseudonym}`);
    console.log(`   Firma: ${kbrProfile.employeerCompany}`);
    console.log(`   Standort: ${kbrProfile.location ? kbrProfile.location.city : 'Kein Standort'}`);
    
    // Check experience data
    console.log('\n📊 **Erfahrungsdaten:**');
    console.log(`   IT: ${kbrProfile.experienceIt} Jahre`);
    console.log(`   IS: ${kbrProfile.experienceIs} Jahre`);
    console.log(`   IT-GS: ${kbrProfile.experienceItGs} Jahre`);
    console.log(`   GPS: ${kbrProfile.experienceGps} Jahre`);
    console.log(`   Gesamt: ${kbrProfile.experienceAll} Jahre`);
    
    // Check education
    console.log('\n📚 **Bildung:**');
    if (kbrProfile.academicDegree && kbrProfile.academicDegree.length > 0) {
      kbrProfile.academicDegree.forEach((edu, index) => {
        console.log(`   ${index + 1}. ${edu.degreeTitleShort} - ${edu.study} (${edu.university})`);
      });
    } else {
      console.log('   ❌ Keine Bildungsdaten');
    }
    
    // Check skills
    console.log('\n🛠️ **Skills:**');
    if (kbrProfile.employeeSkills && kbrProfile.employeeSkills.length > 0) {
      kbrProfile.employeeSkills.forEach((skill, index) => {
        console.log(`   ${index + 1}. ${skill.skills.title} (Niveau: ${skill.niveau})`);
      });
    } else {
      console.log('   ❌ Keine Skills');
    }
    
    // Check certificates
    console.log('\n🏆 **Zertifikate:**');
    if (kbrProfile.employeeCertificates && kbrProfile.employeeCertificates.length > 0) {
      kbrProfile.employeeCertificates.forEach((cert, index) => {
        console.log(`   ${index + 1}. ${cert.certificate.title} (Aussteller: ${cert.issuer})`);
      });
    } else {
      console.log('   ❌ Keine Zertifikate');
    }
    
    // Check what should be there based on Excel data
    console.log('\n📋 **Erwartete Daten aus Excel (KBR):**');
    console.log('   Beruflicher Werdegang:');
    console.log('   - Geschäftsführer bei PwC (Cyber Bereich)');
    console.log('   - Partner bei PwC (Cyber Bereich)');
    console.log('   - Vorstandsvorsitzender bei SEGARDO AG');
    
    console.log('\n   Skills:');
    console.log('   - ISMS');
    console.log('   - IT-Siko');
    console.log('   - Risikoanalysen');
    
    console.log('\n   Zertifikate:');
    console.log('   - CISSP');
    console.log('   - ITIL Expert');
    console.log('   - ITIL Foundation');
    
    // Check if we have ProfessionalBackground data
    const professionalBackground = await prisma.professionalBackground.findMany({
      where: { employeeIDs: kbrProfile.id }
    });
    
    console.log('\n💼 **Beruflicher Werdegang (ProfessionalBackground):**');
    if (professionalBackground.length > 0) {
      professionalBackground.forEach((bg, index) => {
        console.log(`   ${index + 1}. ${bg.employer} - ${bg.position} (${bg.startDate} - ${bg.endDate})`);
      });
    } else {
      console.log('   ❌ Keine ProfessionalBackground Daten');
    }
    
    // Check if we have EmployeeExternalProjects data
    const externalProjects = await prisma.employeeExternalProjects.findMany({
      where: { employeeIDs: kbrProfile.id }
    });
    
    console.log('\n🌐 **Externe Projekte:**');
    if (externalProjects.length > 0) {
      externalProjects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.projectTitle} - ${project.clientName}`);
      });
    } else {
      console.log('   ❌ Keine externen Projekte');
    }
    
    console.log('\n📊 **Zusammenfassung der fehlenden Daten:**');
    const missingData = [];
    
    if (!kbrProfile.employeeSkills || kbrProfile.employeeSkills.length === 0) {
      missingData.push('Skills (ISMS, IT-Siko, Risikoanalysen)');
    }
    
    if (professionalBackground.length === 0) {
      missingData.push('Beruflicher Werdegang (PwC, SEGARDO AG)');
    }
    
    if (externalProjects.length === 0) {
      missingData.push('Projektreferenzen');
    }
    
    if (missingData.length > 0) {
      console.log('   Fehlende Daten:');
      missingData.forEach(item => console.log(`   - ${item}`));
    } else {
      console.log('   ✅ Alle Daten vorhanden');
    }
    
  } catch (error) {
    console.error('❌ Fehler bei der KBR Überprüfung:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkKBRDetails().catch(console.error); 