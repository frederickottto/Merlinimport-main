const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

async function checkSWMServices() {
  try {
    console.log('Überprüfe SWM Services GmbH SOC/SIEM Tender...');
    
    // Find the specific tender
    const tender = await prisma.callToTender.findFirst({
      where: {
        OR: [
          { title: { contains: "SOC/SIEM" } },
          { title: { contains: "SWM" } },
          { notes: { contains: "SOC/SIEM" } }
        ]
      },
      include: {
        organisations: {
          include: {
            organisation: true,
            organisationRole: true
          }
        },
        employees: {
          include: {
            employee: true
          }
        }
      }
    });

    if (!tender) {
      console.log('❌ SWM Services GmbH SOC/SIEM Tender nicht gefunden');
      return;
    }

    console.log(`\n=== TENDER DETAILS ===`);
    console.log(`ID: ${tender.id}`);
    console.log(`Titel: ${tender.title}`);
    console.log(`Status: ${tender.status}`);
    console.log(`Notizen: ${tender.notes}`);

    console.log(`\n=== ORGANISATIONEN (${tender.organisations.length}) ===`);
    tender.organisations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.organisation.name} (${org.organisationRole.name})`);
    });

    console.log(`\n=== PROFILE (${tender.employees.length}) ===`);
    tender.employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.employee.pseudonym} (${emp.employeeCallToTenderRole})`);
    });

    // Check if there are duplicate organizations
    const orgNames = tender.organisations.map(org => org.organisation.name);
    const uniqueOrgNames = [...new Set(orgNames)];
    
    if (orgNames.length !== uniqueOrgNames.length) {
      console.log(`\n⚠️  DUPLIKATE ORGANISATIONEN GEFUNDEN!`);
      console.log(`Anzahl: ${orgNames.length}, Unique: ${uniqueOrgNames.length}`);
      
      const duplicates = orgNames.filter((name, index) => orgNames.indexOf(name) !== index);
      console.log(`Duplikate: ${[...new Set(duplicates)].join(', ')}`);
    }

    // Check if there are duplicate employees
    const empPseudonyms = tender.employees.map(emp => emp.employee.pseudonym);
    const uniqueEmpPseudonyms = [...new Set(empPseudonyms)];
    
    if (empPseudonyms.length !== uniqueEmpPseudonyms.length) {
      console.log(`\n⚠️  DUPLIKATE PROFILE GEFUNDEN!`);
      console.log(`Anzahl: ${empPseudonyms.length}, Unique: ${uniqueEmpPseudonyms.length}`);
      
      const duplicates = empPseudonyms.filter((name, index) => empPseudonyms.indexOf(name) !== index);
      console.log(`Duplikate: ${[...new Set(duplicates)].join(', ')}`);
    }

  } catch (error) {
    console.error('Fehler beim Überprüfen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSWMServices(); 