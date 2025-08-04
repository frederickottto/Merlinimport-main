const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkKBRProfile() {
  console.log('🔍 Überprüfe KBR-Profil...\n');
  
  try {
    // Find KBR profile
    const kbrProfile = await prisma.employee.findFirst({
      where: {
        pseudonym: 'KBR'
      },
      include: {
        location: true,
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
      }
    });
    
    if (!kbrProfile) {
      console.log('❌ KBR-Profil nicht gefunden');
      return;
    }
    
    console.log('📋 **KBR-Profil Details:**');
    console.log(`   ID: ${kbrProfile.id}`);
    console.log(`   Pseudonym: ${kbrProfile.pseudonym}`);
    console.log(`   Name: ${kbrProfile.foreName} ${kbrProfile.lastName}`);
    console.log(`   Erfahrung IT: ${kbrProfile.experienceIt} Jahre`);
    console.log(`   Erfahrung IS: ${kbrProfile.experienceIs} Jahre`);
    console.log(`   Erfahrung ITGS: ${kbrProfile.experienceItGs} Jahre`);
    console.log(`   Erfahrung GPS: ${kbrProfile.experienceGps} Jahre`);
    console.log(`   Erfahrung Andere: ${kbrProfile.experienceOther} Jahre`);
    console.log(`   Erfahrung Gesamt: ${kbrProfile.experienceAll} Jahre`);
    
    console.log('\n📍 **Standort:**');
    if (kbrProfile.location) {
      console.log(`   Straße: ${kbrProfile.location.street}`);
      console.log(`   Hausnummer: ${kbrProfile.location.houseNumber}`);
      console.log(`   PLZ: ${kbrProfile.location.postCode}`);
      console.log(`   Stadt: ${kbrProfile.location.city}`);
      console.log(`   Region: ${kbrProfile.location.region}`);
      console.log(`   Land: ${kbrProfile.location.country}`);
    } else {
      console.log('   ❌ Kein Standort vorhanden');
    }
    
    console.log('\n🎓 **Akademische Abschlüsse:**');
    if (kbrProfile.academicDegree && kbrProfile.academicDegree.length > 0) {
      kbrProfile.academicDegree.forEach((degree, index) => {
        console.log(`   ${index + 1}. ${degree.title} - ${degree.institution} (${degree.graduationYear})`);
      });
    } else {
      console.log('   ❌ Keine akademischen Abschlüsse vorhanden');
    }
    
    console.log('\n💼 **Beruflicher Werdegang:**');
    if (kbrProfile.professionalBackground && kbrProfile.professionalBackground.length > 0) {
      kbrProfile.professionalBackground.forEach((bg, index) => {
        console.log(`   ${index + 1}. ${bg.position} bei ${bg.employer}`);
        console.log(`      Beschreibung: ${bg.description || 'Keine'}`);
        console.log(`      Start: ${bg.professionStart || 'Unbekannt'}`);
        console.log(`      Ende: ${bg.professionEnd || 'Unbekannt'}`);
        console.log(`      Führungsposition: ${bg.executivePosition ? 'Ja' : 'Nein'}`);
      });
    } else {
      console.log('   ❌ Kein beruflicher Werdegang vorhanden');
    }
    
    console.log('\n🔧 **Skills:**');
    if (kbrProfile.employeeSkills && kbrProfile.employeeSkills.length > 0) {
      kbrProfile.employeeSkills.forEach((skill, index) => {
        console.log(`   ${index + 1}. ${skill.skills.title} (Niveau: ${skill.niveau})`);
      });
    } else {
      console.log('   ❌ Keine Skills vorhanden');
    }
    
    console.log('\n📜 **Zertifikate:**');
    if (kbrProfile.employeeCertificates && kbrProfile.employeeCertificates.length > 0) {
      kbrProfile.employeeCertificates.forEach((cert, index) => {
        console.log(`   ${index + 1}. ${cert.certificate.title} (Gültig bis: ${cert.validUntil || 'Unbegrenzt'})`);
      });
    } else {
      console.log('   ❌ Keine Zertifikate vorhanden');
    }
    
    console.log('\n🌐 **Externe Projekte:**');
    if (kbrProfile.employeeExternalProjects && kbrProfile.employeeExternalProjects.length > 0) {
      kbrProfile.employeeExternalProjects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.projectTitle} (Rolle: ${project.employeeProjectRole})`);
        console.log(`      Kunde: ${project.clientName || 'Unbekannt'}`);
        console.log(`      Beschreibung: ${project.description || 'Keine'}`);
      });
    } else {
      console.log('   ❌ Keine externen Projekte vorhanden');
    }
    
    // Check if KBR Excel file exists
    const fs = require('fs');
    const path = require('path');
    const kbrExcelPath = path.join(__dirname, 'excels', 'KBR', 'EY CSS - Datenerhebung KBR - 0.10.xlsx');
    
    console.log('\n📁 **Excel-Datei Check:**');
    if (fs.existsSync(kbrExcelPath)) {
      console.log(`   ✅ Excel-Datei gefunden: ${kbrExcelPath}`);
      
      // Check if we can read the Excel file
      const XLSX = require('xlsx');
      try {
        const workbook = XLSX.readFile(kbrExcelPath);
        const sheetNames = workbook.SheetNames;
        console.log(`   📊 Verfügbare Sheets: ${sheetNames.join(', ')}`);
        
        // Check Mitarbeiter sheet for basic info
        if (sheetNames.includes('Mitarbeiter')) {
          const mitarbeiterSheet = workbook.Sheets['Mitarbeiter'];
          const mitarbeiterData = XLSX.utils.sheet_to_json(mitarbeiterSheet);
          console.log(`   👤 Mitarbeiter-Daten: ${mitarbeiterData.length} Zeilen gefunden`);
          
          if (mitarbeiterData.length > 0) {
            const firstRow = mitarbeiterData[0];
            console.log('   📋 Verfügbare Felder in Mitarbeiter-Sheet:');
            Object.keys(firstRow).forEach(key => {
              console.log(`      - ${key}: ${firstRow[key]}`);
            });
          }
        }
        
        // Check BeruflicherWerdegang sheet
        if (sheetNames.includes('BeruflicherWerdegang')) {
          const berufSheet = workbook.Sheets['BeruflicherWerdegang'];
          const berufData = XLSX.utils.sheet_to_json(berufSheet);
          console.log(`   💼 Beruflicher Werdegang: ${berufData.length} Einträge gefunden`);
        }
        
      } catch (error) {
        console.log(`   ❌ Fehler beim Lesen der Excel-Datei: ${error.message}`);
      }
    } else {
      console.log(`   ❌ Excel-Datei nicht gefunden: ${kbrExcelPath}`);
    }
    
  } catch (error) {
    console.error('❌ Fehler bei der Überprüfung des KBR-Profils:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkKBRProfile().catch(console.error); 