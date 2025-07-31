"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/table/table";
import { api } from "@/trpc/react";
import { columns } from "@/server/controllers/tender/lessonsLearned/table-config";

const Page = () => {
  const { data, isLoading, error } = api.lessonsLearned.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <Skeleton className="w-[500px] h-[20px] rounded-full" />
        <Skeleton className="w-[500px] h-[20px] rounded-full" />
        <Skeleton className="w-[300px] h-[20px] rounded-full" />
        <Skeleton className="w-[200px] h-[20px] rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error fetching data. Please try again later.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-gray-400">No Lessons Learned Found!</div>
        <Skeleton className="w-[500px] h-[20px] rounded-full" />
        <Skeleton className="w-[500px] h-[20px] rounded-full" />
        <Skeleton className="w-[300px] h-[20px] rounded-full" />
        <Skeleton className="w-[200px] h-[20px] rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Lessons Learned</h1>
      </div>
      <DataTable 
        data={data} 
        columns={columns}
        tabValue="tenders"
        viewMode="navigation"
      />
    </div>
  );
};

export default Page; 