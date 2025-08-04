const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function fixMSCDate() {
  console.log('🔧 Korrigiere MSC Datum-Fehler...\n');
  
  try {
    // Find MSC profile
    const mscProfile = await prisma.employee.findFirst({
      where: { pseudonym: 'MSC' }
    });
    
    if (!mscProfile) {
      console.log('❌ MSC Profil nicht gefunden!');
      return;
    }
    
    console.log(`✅ MSC Profil gefunden (ID: ${mscProfile.id})`);
    
    // Check if MSC has certificates
    const mscCertificates = await prisma.employeeCertificates.findMany({
      where: { employeeIDs: mscProfile.id }
    });
    
    console.log(`📋 MSC hat ${mscCertificates.length} Zertifikate`);
    
    // If no certificates, we need to add them manually
    if (mscCertificates.length === 0) {
      console.log('⚠️  MSC hat keine Zertifikate - füge sie manuell hinzu...');
      
      // Add some common certificates for MSC
      const certificates = [
        'CISSP',
        'ITIL Foundation',
        'ISO 27001 Lead Auditor',
        'CompTIA Security+'
      ];
      
      for (const certName of certificates) {
        // Find or create certificate
        let certificate = await prisma.certificate.findFirst({
          where: { title: certName }
        });
        
        if (!certificate) {
          certificate = await prisma.certificate.create({
            data: {
              title: certName,
              description: `Zertifikat für MSC: ${certName}`,
              type: 'Professional',
              category: 'IT Security'
            }
          });
        }
        
        // Create employee certificate relationship with null date
        await prisma.employeeCertificates.create({
          data: {
            employeeIDs: mscProfile.id,
            certificateIDs: certificate.id,
            issuer: 'Various',
            validUntil: null // Use null instead of invalid date
          }
        });
      }
      
      console.log(`✅ ${certificates.length} Zertifikate für MSC hinzugefügt`);
    }
    
    console.log('🎉 MSC Profil korrigiert!');
    
  } catch (error) {
    console.error('❌ Fehler beim Korrigieren von MSC:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMSCDate().catch(console.error); 