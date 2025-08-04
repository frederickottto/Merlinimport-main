const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function fixKBRComplete() {
  console.log('🔧 Vervollständige KBR Profil...\n');
  
  try {
    // Read the KBR Excel file again
    const workbook = XLSX.readFile('./excels/KBR/EY CSS -  Datenerhebung KBR - 0.10.xlsx');
    
    // Find KBR profile
    const kbrProfile = await prisma.employee.findFirst({
      where: { pseudonym: 'KBR' }
    });
    
    if (!kbrProfile) {
      console.log('❌ KBR Profil nicht gefunden!');
      return;
    }
    
    console.log(`✅ KBR Profil gefunden (ID: ${kbrProfile.id})`);
    
    // Parse skills from Qualifikation sheet
    const skills = [];
    if (workbook.Sheets['Qualifikation']) {
      const skillsSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Qualifikation'], { header: 1, defval: null });
      
      for (let i = 2; i < skillsSheet.length; i++) {
        const row = skillsSheet[i];
        if (row && row.length >= 2 && row[0] !== '#') {
          const skill = row[1];
          if (skill && skill.trim() !== '') {
            skills.push(skill.trim());
          }
        }
      }
    }
    
    console.log(`📋 Gefundene Skills: ${skills.join(', ')}`);
    
    // Add skills
    for (const skillName of skills) {
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
      
      // Check if skill relationship already exists
      const existingSkill = await prisma.employeeSkills.findFirst({
        where: {
          employeeIDs: { has: kbrProfile.id },
          skillIDs: skill.id
        }
      });
      
      if (!existingSkill) {
        // Create employee skill relationship
        await prisma.employeeSkills.create({
          data: {
            employeeIDs: [kbrProfile.id],
            skillIDs: skill.id,
            niveau: '3' // Default level
          }
        });
        console.log(`   ✅ Skill hinzugefügt: ${skillName}`);
      } else {
        console.log(`   ⚠️  Skill bereits vorhanden: ${skillName}`);
      }
    }
    
    // Parse professional background from BeruflicherWerdegang sheet
    const professionalBackground = [];
    if (workbook.Sheets['BeruflicherWerdegang']) {
      const experienceSheet = XLSX.utils.sheet_to_json(workbook.Sheets['BeruflicherWerdegang'], { header: 1, defval: null });
      
      for (let i = 2; i < experienceSheet.length; i++) {
        const row = experienceSheet[i];
        if (row && row.length >= 6 && row[0] !== '#') {
          professionalBackground.push({
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
    
    console.log(`📋 Gefundener Beruflicher Werdegang: ${professionalBackground.length} Einträge`);
    
    // Add professional background with correct field names
    for (const bg of professionalBackground) {
      if (bg.employer && bg.function) {
        // Create professional background entry with correct schema fields
        await prisma.professionalBackground.create({
          data: {
            employeeIDs: kbrProfile.id,
            employer: bg.employer,
            position: bg.function,
            description: bg.description,
            professionStart: bg.startDate ? new Date(bg.startDate) : null,
            professionEnd: bg.endDate ? new Date(bg.endDate) : null,
            executivePosition: bg.leadingPosition === 'Ja'
          }
        });
        console.log(`   ✅ Beruflicher Werdegang hinzugefügt: ${bg.function} bei ${bg.employer}`);
      }
    }
    
    // Parse projects from Referenz sheet
    const projects = [];
    if (workbook.Sheets['Referenz']) {
      const projectSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Referenz'], { header: 1, defval: null });
      
      for (let i = 2; i < projectSheet.length; i++) {
        const row = projectSheet[i];
        if (row && row.length >= 8 && row[0] !== '#') {
          projects.push({
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
    
    console.log(`📋 Gefundene Projekte: ${projects.length} Einträge`);
    
    // Get the first professional background entry to link projects to
    const firstProfessionalBackground = await prisma.professionalBackground.findFirst({
      where: { employeeIDs: kbrProfile.id }
    });
    
    if (!firstProfessionalBackground) {
      console.log('   ⚠️  Kein ProfessionalBackground gefunden - erstelle einen Standard-Eintrag');
      
      // Create a default professional background entry
      const defaultBackground = await prisma.professionalBackground.create({
        data: {
          employeeIDs: kbrProfile.id,
          employer: 'EY',
          position: 'Senior Consultant',
          description: 'Standard-Eintrag für Projekte',
          professionStart: new Date('2020-01-01'),
          professionEnd: null,
          executivePosition: false
        }
      });
      
      // Add external projects linked to this background
      for (const project of projects) {
        if (project.name && project.client) {
          await prisma.employeeExternalProjects.create({
            data: {
              professionalBackgroundIDs: defaultBackground.id,
              employeeIDs: kbrProfile.id,
              projectTitle: project.name,
              clientName: project.client,
              employeeProjectRole: project.role,
              projectStart: project.startDate ? new Date(project.startDate) : null,
              projectEnd: project.endDate ? new Date(project.endDate) : null,
              description: project.tasks,
              keywords: project.tasks ? project.tasks.split(' ').filter(word => word.length > 3) : []
            }
          });
          console.log(`   ✅ Projekt hinzugefügt: ${project.name} für ${project.client}`);
        }
      }
    } else {
      console.log(`   ✅ Verwende ProfessionalBackground: ${firstProfessionalBackground.position} bei ${firstProfessionalBackground.employer}`);
      
      // Add external projects linked to existing background
      for (const project of projects) {
        if (project.name && project.client) {
          await prisma.employeeExternalProjects.create({
            data: {
              professionalBackgroundIDs: firstProfessionalBackground.id,
              employeeIDs: kbrProfile.id,
              projectTitle: project.name,
              clientName: project.client,
              employeeProjectRole: project.role,
              projectStart: project.startDate ? new Date(project.startDate) : null,
              projectEnd: project.endDate ? new Date(project.endDate) : null,
              description: project.tasks,
              keywords: project.tasks ? project.tasks.split(' ').filter(word => word.length > 3) : []
            }
          });
          console.log(`   ✅ Projekt hinzugefügt: ${project.name} für ${project.client}`);
        }
      }
    }
    
    console.log('\n🎉 KBR Profil vollständig vervollständigt!');
    
    // Final check
    const finalKBR = await prisma.employee.findFirst({
      where: { pseudonym: 'KBR' },
      include: {
        employeeSkills: {
          include: { skills: true }
        },
        professionalBackground: true,
        employeeExternalProjects: true
      }
    });
    
    console.log('\n📊 **Finale KBR Daten:**');
    console.log(`   Skills: ${finalKBR.employeeSkills.length}`);
    console.log(`   Beruflicher Werdegang: ${finalKBR.professionalBackground.length}`);
    console.log(`   Projekte: ${finalKBR.employeeExternalProjects.length}`);
    
  } catch (error) {
    console.error('❌ Fehler beim Vervollständigen von KBR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixKBRComplete().catch(console.error); 