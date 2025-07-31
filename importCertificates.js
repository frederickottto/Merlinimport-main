// Certificate import script - imports certificates into the database
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const certificates = [
  {
    "title": "Projekt-/Programmmanagement",
    "category": "Projektmanagement"
  },
  {
    "title": "Prince2 Foundation Certificate (APMG)",
    "category": "Projektmanagement"
  },
  {
    "title": "Prince2 Practitioner Certificate (APMG)",
    "category": "Projektmanagement"
  },
  {
    "title": "Project Management Professional (PMP)",
    "category": "Projektmanagement"
  },
  {
    "title": "Certified Cloud Security Professional (CCSP)",
    "category": "Cloud"
  },
  {
    "title": "IT-Grundschutz-Praktiker (EY)",
    "category": "Security"
  },
  {
    "title": "BSI IT-Grundschutz-Berater",
    "category": "Security"
  },
  {
    "title": "BSI IT-Grundschutz Auditor",
    "category": "Security"
  },
  {
    "title": "IS -Revisions- und IS -Beratungs-Experte (IS-Revisor)",
    "category": "Security"
  },
  {
    "title": "Zertifizierung als Auditteamleiter für ISO 27001-Audits auf der Basis von IT-Grundschutz (Auditteamleiter)",
    "category": "Security"
  },
  {
    "title": "Geprüfter ISO 27001 Auditor",
    "category": "Security"
  },
  {
    "title": "Geprüfter IT-Sicherheitsbeauftragter (SGS TÜV)",
    "category": "Security"
  },
  {
    "title": "ISO 27001 Lead Auditor (PERSICON cert)",
    "category": "Security"
  },
  {
    "title": "Information Security Practitioner (ISP)",
    "category": "Security"
  },
  {
    "title": "Cyber Security Practitioner (CSP)",
    "category": "Security"
  },
  {
    "title": "Certified Information Security Manager (CISM)",
    "category": "Security"
  },
  {
    "title": "Certified Information System Auditor (CISA)",
    "category": "Security"
  },
  {
    "title": "Certified Ethical Hacker (CEH)",
    "category": "Security"
  },
  {
    "title": "IS-Pentester (BSI)",
    "category": "Security"
  },
  {
    "title": "Certified Information System Security Professional (CISSP)",
    "category": "Security"
  },
  {
    "title": "Geprüfter Datenschutzbeauftragter (SGS TÜV)",
    "category": "Datenschutz"
  },
  {
    "title": "Zertifizierter Datenschutzbeauftragter (Ulmer Model)",
    "category": "Datenschutz"
  },
  {
    "title": "EuroPriSe Legal Expert (ULD)",
    "category": "Datenschutz"
  },
  {
    "title": "EuroPriSe Technical and Legal Expert (ULD)",
    "category": "Datenschutz"
  },
  {
    "title": "LPIC-1",
    "category": "Architektur"
  },
  {
    "title": "LPIC-2",
    "category": "Architektur"
  },
  {
    "title": "LPIC-3",
    "category": "Architektur"
  },
  {
    "title": "EuroPriSe Technical Expert (ULD)",
    "category": "Architektur"
  },
  {
    "title": "Foundation Certificate in IT Service Management (ITIL)",
    "category": "DevOps"
  },
  {
    "title": "ITIL Foundation (APMG)",
    "category": "DevOps"
  },
  {
    "title": "ITIL Managing Professional (APMG)",
    "category": "DevOps"
  },
  {
    "title": "ITIL Master APMG)/IITIL Expert (APMG)",
    "category": "DevOps"
  },
  {
    "title": "ITIL Strategic Leader (APMG)",
    "category": "DevOps"
  },
  {
    "title": "COBIT Practitioner (ISACA)",
    "category": "DevOps"
  },
  {
    "title": "ISO 20000-1 Lead Auditor (PERSICON cert)",
    "category": "DevOps"
  },
  {
    "title": "BCM-Praktiker (BSI)",
    "category": "Sonstiges"
  }
];

async function importCertificates() {
  console.log("🚀 Zertifikat-Import");
  console.log("📋 Importiere Zertifikate in die Datenbank...\n");
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    console.log(`📊 Importiere ${certificates.length} Zertifikate...`);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const cert of certificates) {
      try {
        // Check if certificate already exists
        const existing = await prisma.certificate.findFirst({
          where: {
            title: cert.title
          }
        });
        
        if (existing) {
          console.log(`⏭️  Übersprungen: "${cert.title}" (bereits vorhanden)`);
          skippedCount++;
        } else {
          // Import certificate with full data structure
          await prisma.certificate.create({
            data: {
              title: cert.title,
              description: "",
              type: "Employee",
              category: cert.category,
              salesCertificate: false
            }
          });
          console.log(`✅ Importiert: "${cert.title}" (${cert.category})`);
          importedCount++;
        }
      } catch (error) {
        console.log(`❌ Fehler bei "${cert.title}": ${error.message}`);
      }
    }
    
    // Count certificates by category
    const categoryStats = {};
    certificates.forEach(cert => {
      categoryStats[cert.category] = (categoryStats[cert.category] || 0) + 1;
    });
    
    console.log(`\n📈 Import abgeschlossen:`);
    console.log(`   ✅ Importiert: ${importedCount} Zertifikate`);
    console.log(`   ⏭️  Übersprungen: ${skippedCount} Zertifikate`);
    console.log(`   📊 Gesamt: ${certificates.length} Zertifikate`);
    
    console.log(`\n📂 Kategorien:`);
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   📁 ${category}: ${count} Zertifikate`);
    });
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

importCertificates(); 