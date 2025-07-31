const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

// Helper function to normalize strings for comparison
function normalizeString(str) {
  if (!str) return '';
  return str.toString().toLowerCase().trim().replace(/\s+/g, ' ');
}

// Helper function to check if two academic degrees are duplicates
function areAcademicDegreesDuplicate(degree1, degree2) {
  const fields1 = [
    normalizeString(degree1.degreeTitleShort),
    normalizeString(degree1.degreeTitleLong),
    normalizeString(degree1.university),
    normalizeString(degree1.study)
  ];
  
  const fields2 = [
    normalizeString(degree2.degreeTitleShort),
    normalizeString(degree2.degreeTitleLong),
    normalizeString(degree2.university),
    normalizeString(degree2.study)
  ];
  
  // Check if any combination of fields matches
  for (let i = 0; i < fields1.length; i++) {
    for (let j = 0; j < fields2.length; j++) {
      if (fields1[i] && fields2[j] && fields1[i] === fields2[j]) {
        // If one field matches, check if other fields are also similar
        let matchCount = 0;
        for (let k = 0; k < fields1.length; k++) {
          if (fields1[k] && fields2[k] && fields1[k] === fields2[k]) {
            matchCount++;
          }
        }
        if (matchCount >= 2) { // At least 2 fields must match
          return true;
        }
      }
    }
  }
  
  return false;
}

// Helper function to check if two professional backgrounds are duplicates
function areProfessionalBackgroundsDuplicate(bg1, bg2) {
  const fields1 = [
    normalizeString(bg1.employer),
    normalizeString(bg1.position),
    normalizeString(bg1.description)
  ];
  
  const fields2 = [
    normalizeString(bg2.employer),
    normalizeString(bg2.position),
    normalizeString(bg2.description)
  ];
  
  // Check if employer and position match
  if (fields1[0] && fields2[0] && fields1[0] === fields2[0] &&
      fields1[1] && fields2[1] && fields1[1] === fields2[1]) {
    return true;
  }
  
  return false;
}

// Helper function to check if two certificates are duplicates
function areCertificatesDuplicate(cert1, cert2) {
  return normalizeString(cert1.title) === normalizeString(cert2.title);
}

// Helper function to check if two skills are duplicates
function areSkillsDuplicate(skill1, skill2) {
  return normalizeString(skill1.title) === normalizeString(skill2.title);
}

// Function to remove academic degree duplicates
async function removeAcademicDegreeDuplicates() {
  console.log('Checking for academic degree duplicates...');
  
  const employees = await prisma.employee.findMany({
    include: {
      academicDegree: true
    }
  });
  
  let totalDuplicatesRemoved = 0;
  
  for (const employee of employees) {
    if (employee.academicDegree.length <= 1) continue;
    
    const degrees = employee.academicDegree;
    const duplicatesToRemove = new Set(); // Use Set to avoid duplicate IDs
    
    for (let i = 0; i < degrees.length; i++) {
      for (let j = i + 1; j < degrees.length; j++) {
        if (areAcademicDegreesDuplicate(degrees[i], degrees[j])) {
          console.log(`Found duplicate academic degree for employee ${employee.pseudonym}:`);
          console.log(`  - Degree 1: ${degrees[i].degreeTitleLong || degrees[i].degreeTitleShort} at ${degrees[i].university}`);
          console.log(`  - Degree 2: ${degrees[j].degreeTitleLong || degrees[j].degreeTitleShort} at ${degrees[j].university}`);
          
          // Keep the one with more complete information
          const degree1Completeness = [
            degrees[i].degreeTitleLong,
            degrees[i].degreeTitleShort,
            degrees[i].university,
            degrees[i].study,
            degrees[i].studyEnd
          ].filter(Boolean).length;
          
          const degree2Completeness = [
            degrees[j].degreeTitleLong,
            degrees[j].degreeTitleShort,
            degrees[j].university,
            degrees[j].study,
            degrees[j].studyEnd
          ].filter(Boolean).length;
          
          if (degree1Completeness >= degree2Completeness) {
            duplicatesToRemove.add(degrees[j].id);
          } else {
            duplicatesToRemove.add(degrees[i].id);
          }
        }
      }
    }
    
    // Remove duplicates
    for (const duplicateId of duplicatesToRemove) {
      try {
        await prisma.academicDegree.delete({
          where: { id: duplicateId }
        });
        totalDuplicatesRemoved++;
      } catch (error) {
        if (error.code === 'P2025') {
          console.log(`Record ${duplicateId} already deleted, skipping...`);
        } else {
          console.log(`Error deleting academic degree record ${duplicateId}: ${error.message}`);
        }
      }
    }
  }
  
  console.log(`Removed ${totalDuplicatesRemoved} academic degree duplicates`);
  return totalDuplicatesRemoved;
}

// Function to remove professional background duplicates
async function removeProfessionalBackgroundDuplicates() {
  console.log('Checking for professional background duplicates...');
  
  const employees = await prisma.employee.findMany({
    include: {
      professionalBackground: true
    }
  });
  
  let totalDuplicatesRemoved = 0;
  
  for (const employee of employees) {
    if (employee.professionalBackground.length <= 1) continue;
    
    const backgrounds = employee.professionalBackground;
    const duplicatesToRemove = new Set(); // Use Set to avoid duplicate IDs
    
    for (let i = 0; i < backgrounds.length; i++) {
      for (let j = i + 1; j < backgrounds.length; j++) {
        if (areProfessionalBackgroundsDuplicate(backgrounds[i], backgrounds[j])) {
          console.log(`Found duplicate professional background for employee ${employee.pseudonym}:`);
          console.log(`  - Background 1: ${backgrounds[i].position} at ${backgrounds[i].employer}`);
          console.log(`  - Background 2: ${backgrounds[j].position} at ${backgrounds[j].employer}`);
          
          // Keep the one with more complete information
          const bg1Completeness = [
            backgrounds[i].employer,
            backgrounds[i].position,
            backgrounds[i].description,
            backgrounds[i].professionStart,
            backgrounds[i].professionEnd
          ].filter(Boolean).length;
          
          const bg2Completeness = [
            backgrounds[j].employer,
            backgrounds[j].position,
            backgrounds[j].description,
            backgrounds[j].professionStart,
            backgrounds[j].professionEnd
          ].filter(Boolean).length;
          
          if (bg1Completeness >= bg2Completeness) {
            duplicatesToRemove.add(backgrounds[j].id);
          } else {
            duplicatesToRemove.add(backgrounds[i].id);
          }
        }
      }
    }
    
    // Remove duplicates
    for (const duplicateId of duplicatesToRemove) {
      try {
        // First delete related EmployeeExternalProjects records
        await prisma.employeeExternalProjects.deleteMany({
          where: { professionalBackgroundIDs: duplicateId }
        });
        
        // Then delete the professional background record
        await prisma.professionalBackground.delete({
          where: { id: duplicateId }
        });
        totalDuplicatesRemoved++;
      } catch (error) {
        if (error.code === 'P2025') {
          console.log(`Record ${duplicateId} already deleted, skipping...`);
        } else {
          console.log(`Error deleting record ${duplicateId}: ${error.message}`);
        }
      }
    }
  }
  
  console.log(`Removed ${totalDuplicatesRemoved} professional background duplicates`);
  return totalDuplicatesRemoved;
}

// Function to remove certificate duplicates
async function removeCertificateDuplicates() {
  console.log('Checking for certificate duplicates...');
  
  const certificates = await prisma.certificate.findMany();
  const duplicatesToRemove = new Set(); // Use Set to avoid duplicate IDs
  
  for (let i = 0; i < certificates.length; i++) {
    for (let j = i + 1; j < certificates.length; j++) {
      if (areCertificatesDuplicate(certificates[i], certificates[j])) {
        console.log(`Found duplicate certificate:`);
        console.log(`  - Certificate 1: ${certificates[i].title}`);
        console.log(`  - Certificate 2: ${certificates[j].title}`);
        
        // Keep the one with more complete information
        const cert1Completeness = [
          certificates[i].title,
          certificates[i].description,
          certificates[i].type,
          certificates[i].category
        ].filter(Boolean).length;
        
        const cert2Completeness = [
          certificates[j].title,
          certificates[j].description,
          certificates[j].type,
          certificates[j].category
        ].filter(Boolean).length;
        
        if (cert1Completeness >= cert2Completeness) {
          duplicatesToRemove.add(certificates[j].id);
        } else {
          duplicatesToRemove.add(certificates[i].id);
        }
      }
    }
  }
  
  // Remove duplicates
  for (const duplicateId of duplicatesToRemove) {
    try {
      await prisma.certificate.delete({
        where: { id: duplicateId }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        console.log(`Record ${duplicateId} already deleted, skipping...`);
      } else {
        console.log(`Error deleting certificate record ${duplicateId}: ${error.message}`);
      }
    }
  }
  
  console.log(`Removed ${duplicatesToRemove.size} certificate duplicates`);
  return duplicatesToRemove.size;
}

// Function to remove skill duplicates
async function removeSkillDuplicates() {
  console.log('Checking for skill duplicates...');
  
  const skills = await prisma.skills.findMany();
  const duplicatesToRemove = new Set(); // Use Set to avoid duplicate IDs
  
  for (let i = 0; i < skills.length; i++) {
    for (let j = i + 1; j < skills.length; j++) {
      if (areSkillsDuplicate(skills[i], skills[j])) {
        console.log(`Found duplicate skill:`);
        console.log(`  - Skill 1: ${skills[i].title}`);
        console.log(`  - Skill 2: ${skills[j].title}`);
        
        // Keep the one with more complete information
        const skill1Completeness = [
          skills[i].title,
          skills[i].type,
          skills[i].description
        ].filter(Boolean).length;
        
        const skill2Completeness = [
          skills[j].title,
          skills[j].type,
          skills[j].description
        ].filter(Boolean).length;
        
        if (skill1Completeness >= skill2Completeness) {
          duplicatesToRemove.add(skills[j].id);
        } else {
          duplicatesToRemove.add(skills[i].id);
        }
      }
    }
  }
  
  // Remove duplicates
  for (const duplicateId of duplicatesToRemove) {
    try {
      await prisma.skills.delete({
        where: { id: duplicateId }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        console.log(`Record ${duplicateId} already deleted, skipping...`);
      } else {
        console.log(`Error deleting skill record ${duplicateId}: ${error.message}`);
      }
    }
  }
  
  console.log(`Removed ${duplicatesToRemove.size} skill duplicates`);
  return duplicatesToRemove.size;
}

// Function to remove employee certificate relationship duplicates
async function removeEmployeeCertificateDuplicates() {
  console.log('Checking for employee certificate relationship duplicates...');
  
  const employeeCertificates = await prisma.employeeCertificates.findMany({
    include: {
      employee: true,
      certificate: true
    }
  });
  
  const duplicatesToRemove = new Set(); // Use Set to avoid duplicate IDs
  const seen = new Set();
  
  for (const ec of employeeCertificates) {
    const key = `${ec.employeeIDs}-${ec.certificateIDs}`;
    if (seen.has(key)) {
      console.log(`Found duplicate employee certificate relationship for employee ${ec.employee.pseudonym}: ${ec.certificate.title}`);
      duplicatesToRemove.add(ec.id);
    } else {
      seen.add(key);
    }
  }
  
  // Remove duplicates
  for (const duplicateId of duplicatesToRemove) {
    try {
      await prisma.employeeCertificates.delete({
        where: { id: duplicateId }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        console.log(`Record ${duplicateId} already deleted, skipping...`);
      } else {
        console.log(`Error deleting employee certificate record ${duplicateId}: ${error.message}`);
      }
    }
  }
  
  console.log(`Removed ${duplicatesToRemove.size} employee certificate relationship duplicates`);
  return duplicatesToRemove.size;
}

// Function to remove employee skill relationship duplicates
async function removeEmployeeSkillDuplicates() {
  console.log('Checking for employee skill relationship duplicates...');
  
  const employeeSkills = await prisma.employeeSkills.findMany({
    include: {
      employees: true,
      skills: true
    }
  });
  
  const duplicatesToRemove = new Set(); // Use Set to avoid duplicate IDs
  const seen = new Set();
  
  for (const es of employeeSkills) {
    for (const employeeId of es.employeeIDs) {
      const key = `${employeeId}-${es.skillIDs}`;
      if (seen.has(key)) {
        console.log(`Found duplicate employee skill relationship for employee ${es.employees.find(e => e.id === employeeId)?.pseudonym}: ${es.skills.title}`);
        duplicatesToRemove.add(es.id);
        break;
      } else {
        seen.add(key);
      }
    }
  }
  
  // Remove duplicates
  for (const duplicateId of duplicatesToRemove) {
    try {
      await prisma.employeeSkills.delete({
        where: { id: duplicateId }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        console.log(`Record ${duplicateId} already deleted, skipping...`);
      } else {
        console.log(`Error deleting employee skill record ${duplicateId}: ${error.message}`);
      }
    }
  }
  
  console.log(`Removed ${duplicatesToRemove.size} employee skill relationship duplicates`);
  return duplicatesToRemove.size;
}

// Main function to remove all duplicates
async function removeAllDuplicates() {
  try {
    console.log('Starting duplicate removal process...');
    
    const results = {
      academicDegrees: await removeAcademicDegreeDuplicates(),
      professionalBackgrounds: await removeProfessionalBackgroundDuplicates(),
      certificates: await removeCertificateDuplicates(),
      skills: await removeSkillDuplicates(),
      employeeCertificates: await removeEmployeeCertificateDuplicates(),
      employeeSkills: await removeEmployeeSkillDuplicates()
    };
    
    const totalRemoved = Object.values(results).reduce((sum, count) => sum + (count || 0), 0);
    
    console.log('\n=== DUPLICATE REMOVAL SUMMARY ===');
    console.log(`Academic Degree duplicates removed: ${results.academicDegrees}`);
    console.log(`Professional Background duplicates removed: ${results.professionalBackgrounds}`);
    console.log(`Certificate duplicates removed: ${results.certificates}`);
    console.log(`Skill duplicates removed: ${results.skills}`);
    console.log(`Employee Certificate relationship duplicates removed: ${results.employeeCertificates}`);
    console.log(`Employee Skill relationship duplicates removed: ${results.employeeSkills}`);
    console.log(`Total duplicates removed: ${totalRemoved}`);
    
    console.log('\nDuplicate removal completed successfully!');
    
  } catch (error) {
    console.error('Error during duplicate removal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the duplicate removal
removeAllDuplicates(); 