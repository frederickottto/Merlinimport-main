const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function deleteLastTender() {
  try {
    console.log('🗑️  Lösche die letzte verbleibende Ausschreibung...');
    
    const remainingTender = await prisma.callToTender.findFirst({
      select: {
        id: true,
        title: true
      }
    });
    
    if (remainingTender) {
      console.log(`Lösche: "${remainingTender.title}"`);
      
      // Try to delete with all related data
      await prisma.callToTender.delete({
        where: { id: remainingTender.id }
      });
      
      console.log('✅ Letzte Ausschreibung erfolgreich gelöscht!');
    } else {
      console.log('Keine Ausschreibungen mehr vorhanden.');
    }
    
    // Verify
    const finalCount = await prisma.callToTender.count();
    console.log(`\nVerbleibende Ausschreibungen: ${finalCount}`);
    
    if (finalCount === 0) {
      console.log('🎉 Alle Ausschreibungen wurden erfolgreich gelöscht!');
      console.log('Die Datenbank ist bereit für einen neuen Import.');
    }
    
  } catch (error) {
    console.error('Fehler beim Löschen der letzten Ausschreibung:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteLastTender(); 