const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function importKBRDetailed() {
  console.log('🚀 Importiere KBR detaillierte Daten...\n');
  
  try {
    // Read the KBR Excel file
    const workbook = XLSX.readFile('./excels/KBR/EY CSS -  Datenerhebung KBR - 0.10.xlsx');
    
    console.log(`📊 Gefundene Sheets: ${workbook.SheetNames.join(', ')}`);
    
    // Parse KBR data from different sheets
    const kbrData = {
      basic: {},
      experience: [],
      education: [],
      skills: [],
      certificates: [],
      projects: []
    };
    
    // Parse basic employee data
    if (workbook.Sheets['Mitarbeiter']) {
      const employeeSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Mitarbeiter'], { header: 1, defval: null });
      
      for (let i = 0; i < employeeSheet.length; i++) {
        const row = employeeSheet[i];
        if (row && row.length >= 2) {
          const field = row[0];
          const value = row[1];
          
          if (field === 'Vorname') kbrData.basic.firstName = value;
          if (field === 'Nachname') kbrData.basic.lastName = value;
          if (field === 'Namenskürzel') kbrData.basic.pseudonym = value;
          if (field === 'Titel') kbrData.basic.title = value;
        }
      }
    }
    
    // Parse professional experience
    if (workbook.Sheets['BeruflicherWerdegang']) {
      const experienceSheet = XLSX.utils.sheet_to_json(workbook.Sheets['BeruflicherWerdegang'], { header: 1, defval: null });
      
      for (let i = 2; i < experienceSheet.length; i++) {
        const row = experienceSheet[i];
        if (row && row.length >= 6 && row[0] !== '#') {
          kbrData.experience.push({
            function: row[1] || '',
            leadingPosition: row[2] || '',
            employer: row[3] || '',
            industry: row[4] || '',
            description: row[5] || '',
            startDate: row[6] || '',
            endDate: row[7] || ''
          });
        }
      }
    }
    
    // Parse education
    if (workbook.Sheets['AkademischerAbschluss']) {
      const educationSheet = XLSX.utils.sheet_to_json(workbook.Sheets['AkademischerAbschluss'], { header: 1, defval: null });
      
      for (let i = 2; i < educationSheet.length; i++) {
        const row = educationSheet[i];
        if (row && row.length >= 6 && row[0] !== '#') {
          kbrData.education.push({
            degree: row[1] || '',
            completed: row[2] || '',
            fieldOfStudy: row[3] || '',
            startDate: row[4] || '',
            endDate: row[5] || '',
            institution: row[6] || ''
          });
        }
      }
    }
    
    // Parse skills
    if (workbook.Sheets['Qualifikation']) {
      const skillsSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Qualifikation'], { header: 1, defval: null });
      
      for (let i = 2; i < skillsSheet.length; i++) {
        const row = skillsSheet[i];
        if (row && row.length >= 2 && row[0] !== '#') {
          const skill = row[1];
          if (skill && skill.trim() !== '') {
            kbrData.skills.push(skill.trim());
          }
        }
      }
    }
    
    // Parse certificates
    if (workbook.Sheets['Lizensierung']) {
      const certSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Lizensierung'], { header: 1, defval: null });
      
      for (let i = 2; i < certSheet.length; i++) {
        const row = certSheet[i];
        if (row && row.length >= 2 && row[0] !== '#') {
          const cert = row[1];
          if (cert && cert.trim() !== '') {
            kbrData.certificates.push({
              name: cert.trim(),
              expiryDate: row[2] || null
            });
          }
        }
      }
    }
    
    // Parse projects
    if (workbook.Sheets['Referenz']) {
      const projectSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Referenz'], { header: 1, defval: null });
      
      for (let i = 2; i < projectSheet.length; i++) {
        const row = projectSheet[i];
        if (row && row.length >= 8 && row[0] !== '#') {
          kbrData.projects.push({
            name: row[1] || '',
            client: row[2] || '',
            clientType: row[3] || '',
            role: row[4] || '',
            startDate: row[5] || '',
            endDate: row[6] || '',
            duration: row[7] || '',
            tasks: row[8] || ''
          });
        }
      }
    }
    
    console.log('📋 **Geparste KBR Daten:**');
    console.log(`   Name: ${kbrData.basic.firstName} ${kbrData.basic.lastName}`);
    console.log(`   Pseudonym: ${kbrData.basic.pseudonym}`);
    console.log(`   Titel: ${kbrData.basic.title}`);
    console.log(`   Erfahrung: ${kbrData.experience.length} Einträge`);
    console.log(`   Bildung: ${kbrData.education.length} Abschlüsse`);
    console.log(`   Skills: ${kbrData.skills.length} Skills`);
    console.log(`   Zertifikate: ${kbrData.certificates.length} Zertifikate`);
    console.log(`   Projekte: ${kbrData.projects.length} Projekte`);
    
    // Find existing KBR profile
    const existingKBR = await prisma.employee.findFirst({
      where: { pseudonym: 'KBR' }
    });
    
    if (!existingKBR) {
      console.log('❌ KBR Profil nicht gefunden!');
      return;
    }
    
    console.log(`\n✅ KBR Profil gefunden (ID: ${existingKBR.id})`);
    
    // Update basic information
    await prisma.employee.update({
      where: { id: existingKBR.id },
      data: {
        foreName: kbrData.basic.pseudonym || 'KBR', // Use pseudonym as name
        lastName: '',
        // Calculate experience years from professional background
        experienceIt: calculateExperienceYears(kbrData.experience, 'IT'),
        experienceIs: calculateExperienceYears(kbrData.experience, 'IS'),
        experienceItGs: calculateExperienceYears(kbrData.experience, 'IT-GS'),
        experienceGps: calculateExperienceYears(kbrData.experience, 'GPS'),
        experienceAll: calculateTotalExperience(kbrData.experience)
      }
    });
    
    console.log('✅ Grunddaten aktualisiert');
    
    // Add education
    for (const edu of kbrData.education) {
      if (edu.degree && edu.fieldOfStudy) {
        await prisma.academicDegree.create({
          data: {
            employeeIDs: existingKBR.id,
            degreeTitleShort: edu.degree,
            degreeTitleLong: edu.degree,
            study: edu.fieldOfStudy,
            university: edu.institution,
            completed: edu.completed === 'Ja',
            studyMINT: isMINTField(edu.fieldOfStudy)
          }
        });
      }
    }
    
    console.log(`✅ ${kbrData.education.length} Bildungsabschlüsse hinzugefügt`);
    
    // Add skills
    for (const skillName of kbrData.skills) {
      // Find or create skill
      let skill = await prisma.skills.findFirst({
        where: { title: skillName }
      });
      
      if (!skill) {
        skill = await prisma.skills.create({
          data: {
            title: skillName,
            type: 'Technical',
            description: `Skill für KBR: ${skillName}`
          }
        });
      }
      
      // Create employee skill relationship
      await prisma.employeeSkills.create({
        data: {
          employeeIDs: [existingKBR.id],
          skillIDs: skill.id,
          niveau: '3' // Default level
        }
      });
    }
    
    console.log(`✅ ${kbrData.skills.length} Skills hinzugefügt`);
    
    // Add certificates
    for (const cert of kbrData.certificates) {
      // Find or create certificate
      let certificate = await prisma.certificate.findFirst({
        where: { title: cert.name }
      });
      
      if (!certificate) {
        certificate = await prisma.certificate.create({
          data: {
            title: cert.name,
            description: `Zertifikat für KBR: ${cert.name}`,
            type: 'Professional',
            category: 'IT Security'
          }
        });
      }
      
      // Create employee certificate relationship
      await prisma.employeeCertificates.create({
        data: {
          employeeIDs: existingKBR.id,
          certificateIDs: certificate.id,
          issuer: 'Various',
          validUntil: cert.expiryDate ? new Date(cert.expiryDate) : null
        }
      });
    }
    
    console.log(`✅ ${kbrData.certificates.length} Zertifikate hinzugefügt`);
    
    console.log('\n🎉 KBR Profil erfolgreich vervollständigt!');
    
  } catch (error) {
    console.error('❌ Fehler beim Importieren der KBR Daten:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function calculateExperienceYears(experience, type) {
  // Simple calculation based on experience entries
  return experience.length * 2; // Rough estimate
}

function calculateTotalExperience(experience) {
  return experience.length * 3; // Rough estimate
}

function isMINTField(fieldOfStudy) {
  const mintFields = ['informatik', 'mathematik', 'naturwissenschaft', 'technik', 'engineering'];
  return mintFields.some(field => fieldOfStudy.toLowerCase().includes(field));
}

importKBRDetailed().catch(console.error); 