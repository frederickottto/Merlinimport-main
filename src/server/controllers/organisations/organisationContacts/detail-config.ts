import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Kontaktübersicht",
      position: 1,
    },
    {
      id: "contact",
      title: "Kontaktinformationen",
      position: 2,
    },
    {
      id: "organisation",
      title: "Organisation",
      position: 3,
    },
  ],
  fields: [
    {
      name: "salutation",
      label: "Anrede",
      type: "text",
      position: 0,
      width: "half",
      section: {
        id: "overview",
        title: "Kontaktübersicht",
        position: 1
      },
    },
    {
      name: "foreName",
      label: "Vorname",
      type: "text",
      position: 1,
      width: "half",
      section: {
        id: "overview",
        title: "Kontaktübersicht",
        position: 1
      },
    },
    {
      name: "lastName",
      label: "Nachname",
      type: "text",
      position: 2,
      width: "half",
      section: {
        id: "overview",
        title: "Kontaktübersicht",
        position: 1
      },
    },
    {
      name: "position",
      label: "Position",
      type: "text",
      position: 3,
      width: "half",
      section: {
        id: "overview",
        title: "Kontaktübersicht",
        position: 1
      },
    },
    {
      name: "department",
      label: "Abteilung",
      type: "text",
      position: 4,
      width: "half",
      section: {
        id: "overview",
        title: "Kontaktübersicht",
        position: 1
      },
    },
    {
      name: "email",
      label: "E-Mail",
      type: "text",
      position: 1,
      width: "full",
      section: {
        id: "contact",
        title: "Kontaktinformationen",
        position: 2
      },
    },
    {
      name: "mobile",
      label: "Mobil",
      type: "text",
      position: 2,
      width: "half",
      section: {
        id: "contact",
        title: "Kontaktinformationen",
        position: 2
      },
    },
    {
      name: "telephone",
      label: "Telefon",
      type: "text",
      position: 3,
      width: "half",
      section: {
        id: "contact",
        title: "Kontaktinformationen",
        position: 2
      },
    },
    {
      name: "organisationDisplay",
      label: "Organisationen",
      type: "text",
      position: 1,
      width: "full",
      section: {
        id: "organisation",
        title: "Organisation",
        position: 3
      },
    },
  ],
};
