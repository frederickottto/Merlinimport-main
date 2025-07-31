export const callToTenderDeliverablesDetailConfig = {
  fields: [
    {
      name: "callToTender.title",
      label: "Ausschreibung",
      type: "text" as const,
      position: 1,
      section: {
        id: "basic",
        title: "Basic Information",
        position: 1
      }
    },
    {
      name: "deliverables.title",
      label: "Konzept",
      type: "text" as const,
      position: 2,
      section: {
        id: "basic",
        title: "Basic Information",
        position: 1
      }
    },
    
  ],
  sections: [
    {
      id: "basic",
      title: "Basic Information",
      position: 1
    }
  ]
};
