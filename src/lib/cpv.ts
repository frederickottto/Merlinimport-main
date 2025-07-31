/**
 * Oberste Ebene des CPV (Divisionen, 2-stelliger Code).
 * Quelle: Regulation (EC) 213/2008 / TED – CPV 2008.
 */
export enum CPVDivision {
  /** 03 000 000-* – Agricultural, farming, fishing, forestry … */
  Agriculture = '03',
  /** 09 000 000-* – Petroleum products, fuel, electricity … */
  Energy = '09',
  /** 14 000 000-* – Mining, basic metals and related products */
  MiningMetals = '14',
  /** 15 000 000-* – Food, beverages, tobacco … */
  Food = '15',
  /** 16 000 000-* – Agricultural machinery */
  AgriMachinery = '16',
  /** 18 000 000-* – Clothing, footwear, luggage … */
  Clothing = '18',
  /** 19 000 000-* – Leather, textile, plastic & rubber materials */
  Materials = '19',
  /** 22 000 000-* – Printed matter and related products */
  PrintedMatter = '22',
  /** 24 000 000-* – Chemical products */
  Chemicals = '24',
  /** 30 000 000-* – Office & computing machinery (excl. furniture) */
  OfficeIT = '30',
  /** 31 000 000-* – Electrical machinery & lighting */
  Electrical = '31',
  /** 32 000 000-* – Radio, telecom & related equipment */
  Telecom = '32',
  /** 33 000 000-* – Medical equipment, pharma & personal care */
  Medical = '33',
  /** 34 000 000-* – Transport equipment & auxiliaries */
  TransportEquip = '34',
  /** 35 000 000-* – Security, fire-fighting, police, defence */
  SecurityDefence = '35',
  /** 37 000 000-* – Musical instruments, sports goods, toys … */
  LeisureGoods = '37',
  /** 38 000 000-* – Laboratory, optical & precision equipment */
  LabOptics = '38',
  /** 39 000 000-* – Furniture, domestic appliances, cleaning prod. */
  Furniture = '39',
  /** 41 000 000-* – Collected & purified water */
  Water = '41',
  /** 42 000 000-* – Industrial machinery */
  IndustrialMachinery = '42',
  /** 43 000 000-* – Mining, quarrying & construction machinery */
  ConstructionMachinery = '43',
  /** 44 000 000-* – Construction structures & materials */
  ConstructionMaterials = '44',
  /** 45 000 000-* – Construction work */
  ConstructionWork = '45',
  /** 48 000 000-* – Software packages & information systems */
  Software = '48',
  /** 50 000 000-* – Repair & maintenance services */
  RepairMaintenance = '50',
  /** 51 000 000-* – Installation services (excl. software) */
  Installation = '51',
  /** 55 000 000-* – Hotel, restaurant & retail trade services */
  HospitalityRetail = '55',
  /** 60 000 000-* – Transport services (excl. waste) */
  TransportServices = '60',
  /** 63 000 000-* – Supporting & auxiliary transport; travel */
  TravelSupport = '63',
  /** 64 000 000-* – Postal & telecom services */
  PostalTelecom = '64',
  /** 65 000 000-* – Public-utility services */
  Utilities = '65',
  /** 66 000 000-* – Financial & insurance services */
  FinanceInsurance = '66',
  /** 70 000 000-* – Real-estate services */
  RealEstate = '70',
  /** 71 000 000-* – Architectural, engineering & inspection */
  ArchitectureEngineering = '71',
  /** 72 000 000-* – IT: consulting, development, support */
  ITServices = '72',
  /** 73 000 000-* – R&D and related consultancy */
  ResearchDevelopment = '73',
  /** 75 000 000-* – Administration, defence, social security */
  AdministrationDefence = '75',
  /** 76 000 000-* – Oil & gas industry services */
  OilGasServices = '76',
  /** 77 000 000-* – Agricultural, forestry, aquacultural services */
  AgriServices = '77',
  /** 79 000 000-* – Business services: law, marketing, consulting … */
  BusinessServices = '79',
  /** 80 000 000-* – Education & training services */
  EducationTraining = '80',
  /** 85 000 000-* – Health & social work services */
  HealthSocial = '85',
  /** 90 000 000-* – Sewage, refuse, cleaning, environment */
  Environment = '90',
  /** 92 000 000-* – Recreational, cultural & sporting services */
  CultureSport = '92',
  /** 98 000 000-* – Other community, social & personal services */
  OtherCommunity = '98'
} 