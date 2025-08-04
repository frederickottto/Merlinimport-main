const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function fixKBRProfile() {
  console.log('🔧 Korrigiere KBR-Profil...\n');
  
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
    const sheetNames = workbook.SheetNames;
    console.log(`   Verfügbare Sheets: ${sheetNames.join(', ')}`);
    
    // Parse Mitarbeiter sheet for basic info and location
    if (sheetNames.includes('Mitarbeiter')) {
      const mitarbeiterSheet = workbook.Sheets['Mitarbeiter'];
      const mitarbeiterData = XLSX.utils.sheet_to_json(mitarbeiterSheet);
      
      if (mitarbeiterData.length > 0) {
        const mitarbeiter = mitarbeiterData[0];
        console.log('👤 Mitarbeiter-Daten gefunden:');
        console.log(`   Name: ${mitarbeiter.Name || 'N/A'}`);
        console.log(`   Standort: ${mitarbeiter.Standort || 'N/A'}`);
        console.log(`   Position: ${mitarbeiter.Position || 'N/A'}`);
        
        // Create or update location
        if (mitarbeiter.Standort) {
          const cityMapping = {
            'Berlin': {
              street: 'Friedrichstraße',
              houseNumber: '140',
              postCode: '10117',
              city: 'Berlin',
              country: 'Deutschland'
            },
            'Düsseldorf': {
              street: 'Graf-Adolf-Platz',
              houseNumber: '15',
              postCode: '40213',
              city: 'Düsseldorf',
              country: 'Deutschland'
            },
            'München': {
              street: 'Arnulfstraße',
              houseNumber: '59',
              postCode: '80636',
              city: 'München',
              country: 'Deutschland'
            },
            'Hamburg': {
              street: 'Rothenbaumchaussee',
              houseNumber: '78',
              postCode: '20148',
              city: 'Hamburg',
              country: 'Deutschland'
            },
            'Köln': {
              street: 'Börsenplatz',
              houseNumber: '1',
              postCode: '50667',
              city: 'Köln',
              country: 'Deutschland'
            },
            'Stuttgart': {
              street: 'Flughafenstraße',
              houseNumber: '61',
              postCode: '70629',
              city: 'Stuttgart',
              country: 'Deutschland'
            },
            'Essen': {
              street: 'Wittekindstraße',
              houseNumber: '1a',
              postCode: '45131',
              city: 'Essen',
              country: 'Deutschland'
            },
            'Leipzig': {
              street: 'Grimmaische Straße',
              houseNumber: '25',
              postCode: '04109',
              city: 'Leipzig',
              country: 'Deutschland'
            },
            'Mannheim': {
              street: 'Glücksteinallee',
              houseNumber: '1',
              postCode: '68163',
              city: 'Mannheim',
              country: 'Deutschland'
            },
            'Nürnberg': {
              street: 'Am Tullnaupark',
              houseNumber: '8',
              postCode: '90402',
              city: 'Nürnberg',
              country: 'Deutschland'
            },
            'Eschborn/Frankfurt': {
              street: 'Mergenthalerallee',
              houseNumber: '3-5',
              postCode: '65760',
              city: 'Eschborn/Frankfurt (Main)',
              country: 'Deutschland'
            },
            'Dresden': {
              street: 'Forststraße',
              houseNumber: '2',
              postCode: '01099',
              city: 'Dresden',
              country: 'Deutschland'
            }
          };
          
          const addressMapping = cityMapping[mitarbeiter.Standort];
          if (addressMapping) {
            // Check if location already exists
            let location = await prisma.location.findFirst({
              where: {
                city: addressMapping.city,
                street: addressMapping.street,
                houseNumber: addressMapping.houseNumber
              }
            });
            
            if (!location) {
              // Create new location
              location = await prisma.location.create({
                data: {
                  street: addressMapping.street,
                  houseNumber: addressMapping.houseNumber,
                  postCode: addressMapping.postCode,
                  city: addressMapping.city,
                  region: '',
                  country: addressMapping.country
                }
              });
              console.log(`   ✅ Neuer Standort erstellt: ${addressMapping.street} ${addressMapping.houseNumber}, ${addressMapping.postCode} ${addressMapping.city}`);
            } else {
              console.log(`   ✅ Existierender Standort gefunden: ${location.city}`);
            }
            
            // Update employee with location
            await prisma.employee.update({
              where: { id: kbrProfile.id },
              data: { locationIDs: location.id }
            });
            console.log(`   ✅ KBR-Profil mit Standort verknüpft: ${location.city}`);
          } else {
            console.log(`   ⚠️  Keine Adress-Mapping für "${mitarbeiter.Standort}" gefunden`);
          }
        }
      }
    }
    
    // Parse AkademischerAbschluss sheet for education
    if (sheetNames.includes('AkademischerAbschluss')) {
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
        if (abschluss.Abschluss && abschluss.Institution) {
          await prisma.academicDegree.create({
            data: {
              employeeIDs: kbrProfile.id,
              title: abschluss.Abschluss,
              institution: abschluss.Institution,
              graduationYear: abschluss.Jahr ? parseInt(abschluss.Jahr) : null,
              fieldOfStudy: abschluss.Fachrichtung || null
            }
          });
          console.log(`   ✅ Akademischer Abschluss hinzugefügt: ${abschluss.Abschluss} - ${abschluss.Institution}`);
        }
      }
    }
    
    // Parse Qualifikation sheet for skills
    if (sheetNames.includes('Qualifikation')) {
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
        if (qualifikation.Qualifikation) {
          // Find or create skill
          let skill = await prisma.skills.findFirst({
            where: { title: qualifikation.Qualifikation }
          });
          
          if (!skill) {
            skill = await prisma.skills.create({
              data: {
                title: qualifikation.Qualifikation,
                type: 'Technical',
                description: qualifikation.Beschreibung || null
              }
            });
            console.log(`   ✅ Neuer Skill erstellt: ${qualifikation.Qualifikation}`);
          }
          
          // Create employee skill relationship
          await prisma.employeeSkills.create({
            data: {
              employeeIDs: [kbrProfile.id],
              skillIDs: skill.id,
              niveau: qualifikation.Niveau || 'Fortgeschritten'
            }
          });
          console.log(`   ✅ Skill verknüpft: ${qualifikation.Qualifikation}`);
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
    
  } catch (error) {
    console.error('❌ Fehler beim Korrigieren des KBR-Profils:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixKBRProfile().catch(console.error); 