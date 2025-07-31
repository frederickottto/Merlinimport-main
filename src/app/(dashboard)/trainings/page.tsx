export const dynamic = 'force-dynamic';

import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/table/table";
import { trainingColumns } from "@/server/controllers/misc/trainings/table-config";
import { api, HydrateClient } from "@/trpc/server";

const Page = async () => {
  try {
    const data = await api.trainings.getAll();

    if (!data) {
      return (
        <div className="flex flex-col space-y-4">
          <div className="text-gray-400">No Data Found!</div>
          <Skeleton className="w-[500px] h-[20px] rounded-full" />
          <Skeleton className="w-[500px] h-[20px] rounded-full" />
          <Skeleton className="w-[300px] h-[20px] rounded-full" />
          <Skeleton className="w-[200px] h-[20px] rounded-full" />
        </div>
      );
    }

    return (
      <HydrateClient>
        <div className="space-y-6">
			<div className="flex items-center justify-between">
			  <h1 className="text-3xl font-bold tracking-tight">Schulungen</h1>
			</div>
        <DataTable data={data} columns={trainingColumns} />
        </div>
      </HydrateClient>
    );
  } catch (error) {
    console.error("Error fetching trainings data:", error);
    return (
      <div className="text-red-500">
        Error fetching data. Please try again later.
      </div>
    );
  }
};

export default Page; 