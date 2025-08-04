const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function fixKBRSimple() {
  console.log('🔧 Korrigiere KBR-Profil (vereinfacht)...\n');
  
  try {
    // Find KBR profile
    const kbrProfile = await prisma.employee.findFirst({
      where: {
        pseudonym: 'KBR'
      }
    });
    
    if (!kbrProfile) {
      console.log('❌ KBR-Profil nicht gefunden');
      return;
    }
    
    console.log(`📋 KBR-Profil gefunden: ${kbrProfile.id}`);
    
    // Create Berlin location for KBR
    let berlinLocation = await prisma.location.findFirst({
      where: {
        city: 'Berlin',
        street: 'Friedrichstraße',
        houseNumber: '140'
      }
    });
    
    if (!berlinLocation) {
      berlinLocation = await prisma.location.create({
        data: {
          street: 'Friedrichstraße',
          houseNumber: '140',
          postCode: '10117',
          city: 'Berlin',
          region: '',
          country: 'Deutschland'
        }
      });
      console.log('   ✅ Berlin Standort erstellt');
    } else {
      console.log('   ✅ Berlin Standort gefunden');
    }
    
    // Update employee with location
    await prisma.employee.update({
      where: { id: kbrProfile.id },
      data: { locationIDs: berlinLocation.id }
    });
    console.log('   ✅ KBR-Profil mit Berlin Standort verknüpft');
    
    // Delete existing academic degrees
    await prisma.academicDegree.deleteMany({
      where: { employeeIDs: kbrProfile.id }
    });
    console.log('   🗑️  Bestehende akademische Abschlüsse gelöscht');
    
    // Add correct academic degrees based on Excel data
    await prisma.academicDegree.create({
      data: {
        employeeIDs: kbrProfile.id,
        degreeTitleShort: 'Bachelor of Arts',
        degreeTitleLong: 'Bachelor of Arts',
        university: 'Universität Potsdam',
        study: 'Rechtswissenschaften',
        studyEnd: new Date('2001-09-30'),
        completed: true
      }
    });
    console.log('   ✅ Bachelor of Arts hinzugefügt');
    
    await prisma.academicDegree.create({
      data: {
        employeeIDs: kbrProfile.id,
        degreeTitleShort: 'M.B.A',
        degreeTitleLong: 'Master of Business Administration',
        university: 'Universität Wales (UK)',
        study: 'Finanzmanagement',
        completed: true
      }
    });
    console.log('   ✅ M.B.A hinzugefügt');
    
    // Delete existing skills
    await prisma.employeeSkills.deleteMany({
      where: { employeeIDs: { has: kbrProfile.id } }
    });
    console.log('   🗑️  Bestehende Skills gelöscht');
    
    // Add skills based on Excel data
    const skillsToAdd = [
      'ISMS', 'IT-Siko', 'ITIL', 'COBIT', 'ISO 27001', 'IT-Grundschutz',
      'Informationssicherheit', 'Cyber Security', 'BCM', 'Business Continuity',
      'Risikomanagement', 'Compliance', 'Audit', 'Governance', 'Datenschutz'
    ];
    
    for (const skillName of skillsToAdd) {
      // Find or create skill
      let skill = await prisma.skills.findFirst({
        where: { title: skillName }
      });
      
      if (!skill) {
        skill = await prisma.skills.create({
          data: {
            title: skillName,
            type: 'Technical',
            description: null
          }
        });
      }
      
      // Create employee skill relationship
      await prisma.employeeSkills.create({
        data: {
          employeeIDs: [kbrProfile.id],
          skillIDs: skill.id,
          niveau: 'Fortgeschritten'
        }
      });
    }
    console.log(`   ✅ ${skillsToAdd.length} Skills hinzugefügt`);
    
    console.log('\n✅ **KBR-Profil erfolgreich korrigiert!**');
    
    // Verify the fix
    const updatedKBR = await prisma.employee.findFirst({
      where: { pseudonym: 'KBR' },
      include: {
        location: true,
        academicDegree: true,
        employeeSkills: {
          include: { skills: true }
        }
      }
    });
    
    console.log('\n📋 **Überprüfung des korrigierten Profils:**');
    console.log(`   Standort: ${updatedKBR.location ? updatedKBR.location.city : 'Kein Standort'}`);
    console.log(`   Akademische Abschlüsse: ${updatedKBR.academicDegree.length}`);
    console.log(`   Skills: ${updatedKBR.employeeSkills.length}`);
    
    if (updatedKBR.academicDegree.length > 0) {
      console.log('   🎓 Akademische Abschlüsse:');
      updatedKBR.academicDegree.forEach((degree, index) => {
        console.log(`      ${index + 1}. ${degree.degreeTitleShort} - ${degree.university}`);
      });
    }
    
    if (updatedKBR.employeeSkills.length > 0) {
      console.log('   🔧 Skills:');
      updatedKBR.employeeSkills.forEach((skill, index) => {
        console.log(`      ${index + 1}. ${skill.skills.title} (${skill.niveau})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Korrigieren des KBR-Profils:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixKBRSimple().catch(console.error); 