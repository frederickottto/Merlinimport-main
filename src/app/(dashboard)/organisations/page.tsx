export const dynamic = 'force-dynamic';

import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/table/table";
import { api, HydrateClient } from "@/trpc/server";
import type { Organisation, IndustrySector, Location } from "@prisma/client";
import { organisationColumns } from "@/server/controllers/organisations/table-config";

interface OrganisationWithRelations extends Organisation {
	location?: Location | null;
	industrySector?: IndustrySector[];
	parentOrganisation?: Organisation | null;
}

interface TransformedOrganisation extends Organisation {
	locationCountry: string;
	parentCompanyName: string;
	industrySectors: string;
}

const Page = async () => {
	try {
		// Get organizations with all related data
		const data = await api.organisations.all();

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

		// Transform the data to show meaningful values
		const transformedData = data.map((org: OrganisationWithRelations): TransformedOrganisation => ({
			...org,
			// Keep original fields
			id: org.id,
			name: org.name,
			abbreviation: org.abbreviation,
			website: org.website,
			employeeNumber: org.employeeNumber,
			anualReturn: org.anualReturn,
			legalType: org.legalType,
			// Add computed fields
			locationCountry: org.location?.country || '-',
			parentCompanyName: org.parentOrganisation?.name || '-',
			industrySectors: org.industrySector?.map((sector: IndustrySector) => sector.industrySector).join(', ') || '-'
		}));

		return (
			<HydrateClient>
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h1 className="text-3xl font-bold tracking-tight">Organisationen</h1>
					</div>
					<DataTable 
						data={transformedData} 
						tabValue="organisations"
						viewMode="modal"
						columns={organisationColumns}
					/>
				</div>
			</HydrateClient>
		);
	} catch (error) {
		console.error("Error fetching organisation data:", error);
		return (
			<div className="text-red-500">
				Error fetching data. Please try again later.
			</div>
		);
	}
};

export default Page;