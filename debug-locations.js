// Debug script to check locations and their relationships
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function debugLocations() {
  console.log("🔍 Debug Locations");
  
  try {
    await prisma.$connect();
    console.log("✅ Datenbankverbindung erfolgreich");
    
    // Find all locations
    const locations = await prisma.location.findMany();
    
    console.log(`📊 Gefundene Locations: ${locations.length}`);
    
    for (const location of locations) {
      console.log(`   - ID: ${location.id}`);
      console.log(`     City: ${location.city}`);
      console.log(`     Street: ${location.street}`);
      console.log(`     House Number: ${location.houseNumber}`);
      console.log(`     Post Code: ${location.postCode}`);
      console.log(`     Region: ${location.region}`);
      console.log(`     Country: ${location.country}`);
      console.log("");
    }
    
    // Find all employees with locations
    const employees = await prisma.employee.findMany({
      include: {
        location: true
      }
    });
    
    console.log(`📊 Gefundene Employees mit Locations: ${employees.length}`);
    
    for (const employee of employees) {
      console.log(`   - ${employee.foreName} ${employee.lastName} (${employee.id})`);
      if (employee.location) {
        console.log(`     Location: ${employee.location.city} (${employee.locationIDs})`);
      } else {
        console.log(`     Location: Keine`);
      }
      console.log("");
    }
    
    // Check if there are any employees with locationIDs but no location relation
    const employeesWithLocationIDs = await prisma.employee.findMany({
      where: {
        locationIDs: { not: null }
      }
    });
    
    console.log(`📊 Employees mit locationIDs aber ohne Location Relation: ${employeesWithLocationIDs.length}`);
    for (const employee of employeesWithLocationIDs) {
      console.log(`   - ${employee.foreName} ${employee.lastName}: locationIDs = ${employee.locationIDs}`);
    }
    
  } catch (error) {
    console.log(`❌ Fehler: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

debugLocations(); 