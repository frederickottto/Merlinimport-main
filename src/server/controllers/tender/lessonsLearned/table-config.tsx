import { type ColumnDef } from "@tanstack/react-table";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";
import { format } from "date-fns";

export type LessonsLearnedTableItem = {
  id: string;
  submissionDate: Date | null;
  decisionDate: Date | null;
  rejectionReasons: string | null;
  lessonsLearned: string;
  wonByOrganisation: {
    id: string;
    name: string;
  } | null;
  wonByOrganisationName: string | null;
  tender: {
    id: string;
    title: string | null;
    type: string | null;
    status: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    shortDescription: string | null;
    keywords: string[];
    templateIDs: string[];
  };
  relatedProfiles: string[];
  relatedTasks: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
};

export const columns: ColumnDef<LessonsLearnedTableItem>[] = [
  getSelectionColumn<LessonsLearnedTableItem>(),
  {
    id: "tenderTitle",
    header: "Tender",
    accessorKey: "tender.title",
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "lessonsLearned",
    header: "Lessons Learned",
    accessorKey: "lessonsLearned",
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "wonByOrganisationName",
    header: "Won By",
    accessorKey: "wonByOrganisationName",
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "submissionDate",
    header: "Submission Date",
    accessorKey: "submissionDate",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const date = row.getValue("submissionDate") as Date | null;
      return date ? format(date, "dd.MM.yyyy") : "-";
    },
  },
  {
    id: "decisionDate",
    header: "Decision Date",
    accessorKey: "decisionDate",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const date = row.getValue("decisionDate") as Date | null;
      return date ? format(date, "dd.MM.yyyy") : "-";
    },
  },
  {
    id: "rejectionReasons",
    header: "Rejection Reasons",
    accessorKey: "rejectionReasons",
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "relatedProfiles",
    header: "Related Profiles",
    accessorKey: "relatedProfiles",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const profiles = row.getValue("relatedProfiles") as string[];
      return profiles.length > 0 ? profiles.join(", ") : "-";
    },
  },
  {
    id: "relatedTasks",
    header: "Related Tasks",
    accessorKey: "relatedTasks",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const tasks = row.getValue("relatedTasks") as string[];
      return tasks.length > 0 ? tasks.join(", ") : "-";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      // If we're on the tender view, only show delete action
      const isTenderView = window.location.pathname.includes('/tenders/') && 
                          !window.location.pathname.includes('/lessons-learned');
      
      return (
        <ActionCell 
          row={row} 
          viewMode="navigation"
          pathname={isTenderView ? "/tenders/lessons-learned" : "/tenders/lessons-learned"}
          hideView={isTenderView}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
]; 