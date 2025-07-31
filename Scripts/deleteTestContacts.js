const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Lösche Test-Kontakte...');
  
  try {
    // Delete contacts with test email
    const testEmailResult = await prisma.organisationContacts.deleteMany({
      where: {
        email: 'test.kontakt@example.com'
      }
    });
    
    // Delete contacts with "Test Kontakt" name
    const testNameResult = await prisma.organisationContacts.deleteMany({
      where: {
        foreName: 'Test',
        lastName: 'Kontakt'
      }
    });
    
    // Delete "Max Musterfrau" test contact
    const maxMusterfrauResult = await prisma.organisationContacts.deleteMany({
      where: {
        foreName: 'Max',
        lastName: 'Musterfrau'
      }
    });
    
    const totalDeleted = testEmailResult.count + testNameResult.count + maxMusterfrauResult.count;
    
    console.log(`✅ Test-Kontakte gelöscht:`);
    console.log(`   - Kontakte mit test.kontakt@example.com: ${testEmailResult.count}`);
    console.log(`   - Kontakte mit Namen "Test Kontakt": ${testNameResult.count}`);
    console.log(`   - Kontakte mit Namen "Max Musterfrau": ${maxMusterfrauResult.count}`);
    console.log(`   📊 Gesamt gelöscht: ${totalDeleted} Test-Kontakte`);
    
    // Show remaining contacts
    const remainingContacts = await prisma.organisationContacts.findMany({
      include: { organisation: true }
    });
    
    console.log(`\n📋 Verbleibende Kontakte: ${remainingContacts.length}`);
    remainingContacts.forEach((contact, index) => {
      console.log(`   ${index + 1}. ${contact.foreName} ${contact.lastName} - ${contact.email} - Organisation: ${contact.organisation.map(org => org.name).join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Löschen der Test-Kontakte:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 