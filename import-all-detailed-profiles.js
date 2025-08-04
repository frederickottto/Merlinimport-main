const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

// List of profiles to import (from the analysis)
const PROFILES_TO_IMPORT = [
  'BSK', 'CDR', 'GAU', 'HBO', 'HSK', 'HWA', 'ISC', 'JSC', 'MSC', 
  'NSO', 'REH', 'RVO', 'SCA', 'WEI', 'WEL'
];

async function importAllDetailedProfiles() {
  console.log('🚀 Starte automatischen Import aller detaillierten Profile...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const pseudonym of PROFILES_TO_IMPORT) {
    try {
      console.log(`\n📁 Verarbeite ${pseudonym}...`);
      
      // Check if Excel file exists
      const excelPath = `./excels/${pseudonym}/EY CSS - Datenerhebung ${pseudonym} - 0.10.xlsx`;
      
      if (!fs.existsSync(excelPath)) {
        console.log(`   ⚠️  Excel-Datei nicht gefunden: ${excelPath}`);
        continue;
      }
      
      // Import profile
      await importDetailedProfile(pseudonym, excelPath);
      successCount++;
      
    } catch (error) {
      console.error(`   ❌ Fehler bei ${pseudonym}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Import abgeschlossen:`);
  console.log(`   ✅ Erfolgreich: ${successCount}`);
  console.log(`   ❌ Fehler: ${errorCount}`);
  console.log(`   📋 Gesamt: ${PROFILES_TO_IMPORT.length}`);
}

async function importDetailedProfile(pseudonym, excelPath) {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(excelPath);
    
    // Parse data from different sheets
    const profileData = {
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
          
          if (field === 'Vorname') profileData.basic.firstName = value;
          if (field === 'Nachname') profileData.basic.lastName = value;
          if (field === 'Namenskürzel') profileData.basic.pseudonym = value;
          if (field === 'Titel') profileData.basic.title = value;
        }
      }
    }
    
    // Parse professional experience
    if (workbook.Sheets['BeruflicherWerdegang']) {
      const experienceSheet = XLSX.utils.sheet_to_json(workbook.Sheets['BeruflicherWerdegang'], { header: 1, defval: null });
      
      for (let i = 2; i < experienceSheet.length; i++) {
        const row = experienceSheet[i];
        if (row && row.length >= 6 && row[0] !== '#') {
          profileData.experience.push({
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
          profileData.education.push({
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
            profileData.skills.push(skill.trim());
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
            profileData.certificates.push({
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
          profileData.projects.push({
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
    
    console.log(`   📋 Geparste Daten: ${profileData.experience.length} Erfahrung, ${profileData.education.length} Bildung, ${profileData.skills.length} Skills, ${profileData.certificates.length} Zertifikate`);
    
    // Find existing profile
    const existingProfile = await prisma.employee.findFirst({
      where: { pseudonym: pseudonym }
    });
    
    if (!existingProfile) {
      console.log(`   ❌ Profil ${pseudonym} nicht gefunden!`);
      return;
    }
    
    console.log(`   ✅ Profil gefunden (ID: ${existingProfile.id})`);
    
    // Update basic information
    await prisma.employee.update({
      where: { id: existingProfile.id },
      data: {
        foreName: pseudonym, // Use pseudonym as name
        lastName: '',
        // Calculate experience years from professional background
        experienceIt: calculateExperienceYears(profileData.experience, 'IT'),
        experienceIs: calculateExperienceYears(profileData.experience, 'IS'),
        experienceItGs: calculateExperienceYears(profileData.experience, 'IT-GS'),
        experienceGps: calculateExperienceYears(profileData.experience, 'GPS'),
        experienceAll: calculateTotalExperience(profileData.experience)
      }
    });
    
    console.log(`   ✅ Grunddaten aktualisiert`);
    
    // Add education
    for (const edu of profileData.education) {
      if (edu.degree && edu.fieldOfStudy) {
        await prisma.academicDegree.create({
          data: {
            employeeIDs: existingProfile.id,
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
    
    if (profileData.education.length > 0) {
      console.log(`   ✅ ${profileData.education.length} Bildungsabschlüsse hinzugefügt`);
    }
    
    // Add skills
    for (const skillName of profileData.skills) {
      // Find or create skill
      let skill = await prisma.skills.findFirst({
        where: { title: skillName }
      });
      
      if (!skill) {
        skill = await prisma.skills.create({
          data: {
            title: skillName,
            type: 'Technical',
            description: `Skill für ${pseudonym}: ${skillName}`
          }
        });
      }
      
      // Create employee skill relationship
      await prisma.employeeSkills.create({
        data: {
          employeeIDs: [existingProfile.id],
          skillIDs: skill.id,
          niveau: '3' // Default level
        }
      });
    }
    
    if (profileData.skills.length > 0) {
      console.log(`   ✅ ${profileData.skills.length} Skills hinzugefügt`);
    }
    
    // Add certificates
    for (const cert of profileData.certificates) {
      // Find or create certificate
      let certificate = await prisma.certificate.findFirst({
        where: { title: cert.name }
      });
      
      if (!certificate) {
        certificate = await prisma.certificate.create({
          data: {
            title: cert.name,
            description: `Zertifikat für ${pseudonym}: ${cert.name}`,
            type: 'Professional',
            category: 'IT Security'
          }
        });
      }
      
      // Create employee certificate relationship
      await prisma.employeeCertificates.create({
        data: {
          employeeIDs: existingProfile.id,
          certificateIDs: certificate.id,
          issuer: 'Various',
          validUntil: cert.expiryDate ? new Date(cert.expiryDate) : null
        }
      });
    }
    
    if (profileData.certificates.length > 0) {
      console.log(`   ✅ ${profileData.certificates.length} Zertifikate hinzugefügt`);
    }
    
    console.log(`   🎉 ${pseudonym} erfolgreich vervollständigt!`);
    
  } catch (error) {
    console.error(`   ❌ Fehler beim Importieren von ${pseudonym}:`, error);
    throw error;
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

// Main execution
async function main() {
  console.log('🔧 Überprüfe Datenbankschema...');
  
  try {
    await prisma.employee.count();
    console.log('✅ Datenbankschema ist bereit');
  } catch (error) {
    console.error('❌ Datenbankschema nicht gefunden. Bitte führen Sie "npx prisma db push" aus.');
    process.exit(1);
  }
  
  console.log('🚀 Starte automatischen Import...');
  await importAllDetailedProfiles();
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
}); 