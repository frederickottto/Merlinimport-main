// Debug script to find all voccational records
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function debugVoccational() {
  console.log("🔍 Debug Voccational Records");
  
  try {
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Find all voccational records
    const voccationalRecords = await prisma.voccational.findMany({
      include: {
        employee: true
      }
    });
    
    console.log(`📊 Gefundene Voccational Records: ${voccationalRecords.length}`);
    
    for (const record of voccationalRecords) {
      console.log(`   - ID: ${record.id}`);
      console.log(`     Employee: ${record.employee?.foreName} ${record.employee?.lastName} (${record.employeeIDs})`);
      console.log(`     Title: ${record.voccationalTitleShort}`);
      console.log(`     Company: ${record.company}`);
      console.log(`     Start: ${record.voccationalStart}`);
      console.log(`     End: ${record.voccationalEnd}`);
      console.log("");
    }
    
    // Find all employees
    const employees = await prisma.employee.findMany({
      include: {
        voccational: true
      }
    });
    
    console.log(`📊 Gefundene Employees: ${employees.length}`);
    
    for (const employee of employees) {
      console.log(`   - ${employee.foreName} ${employee.lastName} (${employee.id})`);
      console.log(`     Voccational Records: ${employee.voccational.length}`);
      for (const voc of employee.voccational) {
        console.log(`       - ${voc.voccationalTitleShort} (${voc.id})`);
      }
      console.log("");
    }
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

debugVoccational(); 