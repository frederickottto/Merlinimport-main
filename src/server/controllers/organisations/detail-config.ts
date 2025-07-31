import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Organisationsübersicht",
      position: 1,
    },
    {
      id: "contact",
      title: "Kontaktinformationen",
      position: 3,
    },
  
    {
      id: "details",
      title: "Weitere Details",
      position: 2,
    },
    
  ],
  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      position: 1,
      width: "full",
      section: {
        id: "overview",
        title: "Organisationsübersicht",
        position: 1
      },
    },
    {
      name: "abbreviation",
      label: "Abkürzung",
      type: "text",
      position: 2,
      width: "half",
      section: {
        id: "overview",
        title: "Organisationsübersicht",
        position: 1
      },
    },
    {
      name: "anonymousIdentifier",
      label: "Anonymer Bezeichner",
      type: "text",
      position: 3,
      width: "half",
      section: {
        id: "overview",
        title: "Organisationsübersicht",
        position: 1
      },
    },
    {
      name: "website",
      label: "Website",
      type: "link",
      position: 1,
      width: "full",
      section: {
        id: "contact",
        title: "Kontaktinformationen",
        position: 3
      },
    },
    {
      name: "location.street",
      label: "Straße",
      type: "text",
      position: 1,
      width: "half",
      section: {
        id: "contact",
        title: "Kontaktinformationen",
        position: 3
      },
    },
    {
      name: "location.houseNumber",
      label: "Hausnummer",
      type: "text",
      position: 2,
      width: "half",
      section: {
        id: "contact",
        title: "Kontaktinformationen",
        position: 3
      },
    },
  
    {
      name: "location.postCode",
      label: "Postleitzahl",
      type: "text",
      position: 3,
      width: "third",
      section: {
        id: "contact",
        title: "Kontaktinformationen",
        position: 3
      },
    },
    {
      name: "location.city",
      label: "Stadt",
      type: "text",
      position: 4,
      width: "third",
      section: {
        id: "contact",
        title: "Kontaktinformationen",
        position: 3
      },
    },
  
    {
      name: "location.country",
      label: "Land",
      type: "text",
      position: 5,
      width: "third",
      section: {
        id: "contact",
        title: "Kontaktinformationen",
        position: 3
      },
    },
    {
      name: "employeeNumber",
      label: "Anzahl Mitarbeiter",
      type: "number",
      position: 1,
      width: "half",
      section: {
        id: "details",
        title: "Weitere Details",
        position: 2
      },
    },
    {
      name: "anualReturn",
      label: "Jahresumsatz",
      type: "currency",
      position: 2,
      width: "half",
      section: {
        id: "details",
        title: "Weitere Details",
        position: 2
      },
    },
    {
      name: "legalType",
      label: "Rechtsform",
      type: "text",
      position: 3,
      width: "half",
      section: {
        id: "details",
        title: "Weitere Details",
        position: 2
      },
    },
    {
      name: "industrySector",
      label: "Branche",
      type: "tags",
      position: 4,
      width: "half",
      section: {
        id: "details",
        title: "Weitere Details",
        position: 2
      },
    },
    {
      name: "parentOrganisation",
      label: "Muttergesellschaft",
      type: "text",
      position: 5,
      width: "full",
      section: {
        id: "details",
        title: "Weitere Details",
        position: 2
      },
    },
    {
      name: "organisationOrganisationRoles",
      label: "Rollen (Organisation)",
      type: "tags",
      position: 6,
      width: "full",
      section: {
        id: "details",
        title: "Weitere Details",
        position: 2
      },
    },
    {
      name: "childOrganisations",
      label: "Tochtergesellschaften",
      type: "tags",
      position: 7,
      width: "full",
      section: {
        id: "details",
        title: "Weitere Details",
        position: 2
      },
    },
  ],
};
