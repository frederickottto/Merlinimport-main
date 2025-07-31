export const dynamic = 'force-dynamic';

import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/table/table";
import { api, HydrateClient } from "@/trpc/server";
import { profileColumns } from "@/server/controllers/profiles/table-config";

const Page = async () => {
	try {
	  const data = await api.profiles.all();
  
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
			  <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
			</div>
			<DataTable 
			  data={data} 
			  columns={profileColumns}
			  tabValue="profiles"
			  viewMode="modal"
			/>
		  </div>
		</HydrateClient>
	  );
	} catch (error) {
	  console.error("Error fetching profiles data:", error);
	  return (
		<div className="text-red-500">
		  Error fetching data. Please try again later.
		</div>
	  );
	}
  };
  
  export default Page;