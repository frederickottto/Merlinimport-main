export const dynamic = 'force-dynamic';

import { Skeleton } from "@/components/ui/skeleton";

import { DataTable } from "@/components/table/table";

import { api, HydrateClient } from "@/trpc/server";
import { projectColumns } from "@/server/controllers/projects/table-config";

const Page = async () => {
	try {
	  const data = await api.projects.all();
  
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
		  <DataTable 
			data={data} 
			columns={projectColumns}
			viewMode="modal"
		  />
		</HydrateClient>
	  );
	} catch (error) {
	  console.error("Error fetching projects data:", error);
	  return (
		<div className="text-red-500">
		  Error fetching data. Please try again later.
		</div>
	  );
	}
  };
  
  export default Page;