import { format } from "date-fns";
import { z } from "zod";

interface LessonsLearnedItem {
  wonByOrganisationName?: string;
}

export const lessonsLearnedDetailConfig = {
  sections: [
    {
      id: "basic",
      title: "Basic Information",
      position: 1,
      fields: [
        {
          label: "Submission Date",
          key: "submissionDate",
          format: (value: Date | undefined) => value ? format(value, "dd.MM.yyyy") : "-",
        },
        {
          label: "Decision Date",
          key: "decisionDate",
          format: (value: Date | undefined) => value ? format(value, "dd.MM.yyyy") : "-",
        },
        {
          label: "Rejection Reasons",
          key: "rejectionReasons",
          format: (value: string | undefined) => value || "-",
        },
      ],
    },
    {
      id: "lessons",
      title: "Lessons Learned",
      position: 2,
      fields: [
        {
          label: "Lessons Learned",
          key: "lessonsLearned",
          format: (value: string) => value,
        },
      ],
    },
    {
      id: "winning",
      title: "Winning Information",
      position: 3,
      fields: [
        {
          label: "Won By",
          key: "wonByOrganisation",
          format: (value: { name: string } | undefined, item: LessonsLearnedItem) => {
            if (value) return value.name;
            return item.wonByOrganisationName || "-";
          },
        },
      ],
    },
    {
      id: "related",
      title: "Related Information",
      position: 4,
      fields: [
        {
          label: "Related Profiles",
          key: "relatedProfiles",
          format: (value: string[] | undefined) => value?.join(", ") || "-",
        },
        {
          label: "Related Tasks",
          key: "relatedTasks",
          format: (value: string[] | undefined) => value?.join(", ") || "-",
        },
      ],
    },
  ],
  fields: [],
};

export const detailSchema = z.object({
  submissionDate: z.date().optional(),
  decisionDate: z.date().optional(),
  rejectionReasons: z.string().optional(),
  lessonsLearned: z.string(),
  wonByOrganisationId: z.string().optional(),
  wonByOrganisationName: z.string().optional(),
  relatedProfiles: z.array(z.string()).optional(),
  relatedTasks: z.array(z.string()).optional(),
}); 