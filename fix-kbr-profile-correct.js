const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function fixKBRProfileCorrect() {
  console.log('🔧 Korrigiere KBR-Profil mit korrekten Spaltennamen...\n');
  
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
    
    // Read KBR Excel file
    const kbrExcelPath = path.join(__dirname, 'excels', 'KBR', 'EY CSS -  Datenerhebung KBR - 0.10.xlsx');
    
    if (!fs.existsSync(kbrExcelPath)) {
      console.log('❌ KBR Excel-Datei nicht gefunden');
      return;
    }
    
    console.log('📊 Lese KBR Excel-Datei...');
    const workbook = XLSX.readFile(kbrExcelPath);
    
    // Parse _Daten sheet for basic info and location
    if (workbook.SheetNames.includes('_Daten')) {
      const datenSheet = workbook.Sheets['_Daten'];
      const datenData = XLSX.utils.sheet_to_json(datenSheet);
      
      // Find KBR in the data
      const kbrData = datenData.find(row => row.Kürzel === 'KBR');
      
      if (kbrData) {
        console.log('👤 KBR-Daten gefunden:');
        console.log(`   Name: ${kbrData.Titel || ''} ${kbrData['Akademischer Abschluss'] || ''}`);
        console.log(`   Standort: ${kbrData.Ort || 'N/A'}`);
        console.log(`   Straße: ${kbrData.Straße || 'N/A'}`);
        console.log(`   Hausnummer: ${kbrData.Hausnummer || 'N/A'}`);
        console.log(`   PLZ: ${kbrData.Postleitzahl || 'N/A'}`);
        console.log(`   Land: ${kbrData.Land || 'N/A'}`);
        
        // Create or update location
        if (kbrData.Ort && kbrData.Straße && kbrData.Hausnummer) {
          // Check if location already exists
          let location = await prisma.location.findFirst({
            where: {
              city: kbrData.Ort,
              street: kbrData.Straße,
              houseNumber: kbrData.Hausnummer
            }
          });
          
          if (!location) {
            // Create new location
            location = await prisma.location.create({
              data: {
                street: kbrData.Straße,
                houseNumber: kbrData.Hausnummer,
                postCode: kbrData.Postleitzahl,
                city: kbrData.Ort,
                region: '',
                country: kbrData.Land
              }
            });
            console.log(`   ✅ Neuer Standort erstellt: ${kbrData.Straße} ${kbrData.Hausnummer}, ${kbrData.Postleitzahl} ${kbrData.Ort}`);
          } else {
            console.log(`   ✅ Existierender Standort gefunden: ${location.city}`);
          }
          
          // Update employee with location
          await prisma.employee.update({
            where: { id: kbrProfile.id },
            data: { locationIDs: location.id }
          });
          console.log(`   ✅ KBR-Profil mit Standort verknüpft: ${location.city}`);
        }
      } else {
        console.log('   ⚠️  KBR-Daten nicht in _Daten Sheet gefunden');
      }
    }
    
    // Parse AkademischerAbschluss sheet for education
    if (workbook.SheetNames.includes('AkademischerAbschluss')) {
      const akademischSheet = workbook.Sheets['AkademischerAbschluss'];
      const akademischData = XLSX.utils.sheet_to_json(akademischSheet);
      
      console.log(`🎓 Akademische Abschlüsse gefunden: ${akademischData.length} Einträge`);
      
      // Delete existing academic degrees
      await prisma.academicDegree.deleteMany({
        where: { employeeIDs: kbrProfile.id }
      });
      console.log('   🗑️  Bestehende akademische Abschlüsse gelöscht');
      
      // Add new academic degrees
      for (const abschluss of akademischData) {
        if (abschluss.__EMPTY && abschluss.__EMPTY_5) { // Abschluss and Bildungseinrichtung
          await prisma.academicDegree.create({
            data: {
              employeeIDs: kbrProfile.id,
              degreeTitleShort: abschluss.__EMPTY, // Abschluss
              degreeTitleLong: abschluss.__EMPTY, // Abschluss
              university: abschluss.__EMPTY_5, // Bildungseinrichtung
              studyEnd: abschluss.__EMPTY_4 ? new Date(abschluss.__EMPTY_4) : null, // Studium Ende
              study: abschluss.__EMPTY_2 || null // Studienfach
            }
          });
          console.log(`   ✅ Akademischer Abschluss hinzugefügt: ${abschluss.__EMPTY} - ${abschluss.__EMPTY_5}`);
        }
      }
    }
    
    // Parse Qualifikation sheet for skills
    if (workbook.SheetNames.includes('Qualifikation')) {
      const qualifikationSheet = workbook.Sheets['Qualifikation'];
      const qualifikationData = XLSX.utils.sheet_to_json(qualifikationSheet);
      
      console.log(`🔧 Qualifikationen gefunden: ${qualifikationData.length} Einträge`);
      
      // Delete existing skills
      await prisma.employeeSkills.deleteMany({
        where: { employeeIDs: { has: kbrProfile.id } }
      });
      console.log('   🗑️  Bestehende Skills gelöscht');
      
      // Add new skills
      for (const qualifikation of qualifikationData) {
        if (qualifikation.__EMPTY) { // Skills column
          // Find or create skill
          let skill = await prisma.skills.findFirst({
            where: { title: qualifikation.__EMPTY }
          });
          
          if (!skill) {
            skill = await prisma.skills.create({
              data: {
                title: qualifikation.__EMPTY,
                type: 'Technical',
                description: null
              }
            });
            console.log(`   ✅ Neuer Skill erstellt: ${qualifikation.__EMPTY}`);
          }
          
          // Create employee skill relationship
          await prisma.employeeSkills.create({
            data: {
              employeeIDs: [kbrProfile.id],
              skillIDs: skill.id,
              niveau: qualifikation.__EMPTY_1 || 'Fortgeschritten' // Mit Niveau
            }
          });
          console.log(`   ✅ Skill verknüpft: ${qualifikation.__EMPTY}`);
        }
      }
    }
    
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

fixKBRProfileCorrect().catch(console.error); 