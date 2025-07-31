// Certificate data export script - outputs certificates in JSON format
// This allows you to see the data and use it in other ways while fixing the database

const grouped = {
  "Projektmanagement": [
    "Projekt-/Programmmanagement",
    "Prince2 Foundation Certificate (APMG)",
    "Prince2 Practitioner Certificate (APMG)",
    "Project Management Professional (PMP)"
  ],
  "Governance & Prozesse": [
    "COBIT Practitioner (ISACA)",
    "Foundation Certificate in IT Service Management (ITIL)",
    "ISO 20000-1 Lead Auditor (PERSICON cert)",
    "ITIL Foundation (APMG)",
    "ITIL Managing Professional (APMG)",
    "ITIL Master APMG)/IITIL Expert (APMG)",
    "ITIL Strategic Leader (APMG)"
  ],
  "Informationssicherheitsmanagement": [
    "IT-Grundschutz-Praktiker (EY)",
    "BSI IT-Grundschutz-Berater",
    "BSI IT-Grundschutz Auditor",
    "IS -Revisions- und IS -Beratungs-Experte (IS-Revisor)",
    "Zertifizierung als Auditteamleiter für ISO 27001-Audits auf der Basis von IT-Grundschutz (Auditteamleiter)",
    "Geprüfter ISO 27001 Auditor",
    "Geprüfter IT-Sicherheitsbeauftragter (SGS TÜV)[MF1]",
    "ISO 27001 Lead Auditor (PERSICON cert)[MF2]",
    "Information Security Practitioner (ISP)",
    "Cyber Security Practitioner (CSP)",
    "Certified Information Security Manager (CISM)",
    "Certified Information System Auditor (CISA)"
  ],
  "Technische Sicherheit": [
    "Certified Ethical Hacker (CEH)",
    "IS-Pentester (BSI)",
    "Certified Cloud Security Professional (CCSP)",
    "Certified Information System Security Professional (CISSP)",
    "LPIC-1",
    "LPIC-2",
    "LPIC-3",
    "EuroPriSe Technical and Legal Expert (ULD)",
    "EuroPriSe Technical Expert (ULD)"
  ],
  "Business Continuity": [
    "BCM-Praktiker (BSI)"
  ],
  "Datenschutz": [
    "Geprüfter Datenschutzbeauftragter (SGS TÜV)",
    "Zertifizierter Datenschutzbeauftragter (Ulmer Model)",
    "EuroPriSe Legal Expert (ULD)"
  ]
};

function exportCertificates() {
  console.log("🚀 Zertifikat-Export");
  console.log("📋 Exportiere Zertifikate in JSON Format...\n");
  
  // Convert to certificate objects
  const certificates = Object.entries(grouped).flatMap(([category, titles]) =>
    titles.map(title => ({
      title,
      description: "",
      type: "Employee",
      category,
      salesCertificate: false
    }))
  );
  
  console.log("📊 Zertifikate für Import:");
  console.log(JSON.stringify(certificates, null, 2));
  
  console.log(`\n📈 Zusammenfassung:`);
  console.log(`   📊 Gesamt: ${certificates.length} Zertifikate`);
  console.log(`   📂 Kategorien: ${Object.keys(grouped).length}`);
  
  console.log("\n🔧 Nächste Schritte:");
  console.log("1. Kopieren Sie die JSON-Daten oben");
  console.log("2. Beheben Sie die Datenbankverbindung");
  console.log("3. Verwenden Sie die Daten für den Import");
  
  // Also save to file
  const fs = require('fs');
  fs.writeFileSync('certificates-export.json', JSON.stringify(certificates, null, 2));
  console.log("\n💾 Zertifikate wurden in 'certificates-export.json' gespeichert");
}

exportCertificates();
