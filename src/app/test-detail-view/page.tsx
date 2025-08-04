"use client";

import { api } from "@/trpc/react";
import { DetailView } from "@/components/detail/DetailView";
import { detailSchema as tenderDetailSchema } from "@/server/controllers/tender/detail-config";

export default function TestDetailViewPage() {
  const { data: tender, isLoading, error } = api.tenders.getById.useQuery(
    { id: "688fa3c25dd9356b3d7d0634" },
    {
      retry: false,
      enabled: true,
    }
  );

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;
  if (!tender) return <div className="p-8">No tender found</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test DetailView Component</h1>
      
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Raw tRPC Data</h2>
          <p><strong>ID:</strong> {tender.id}</p>
          <p><strong>Title:</strong> {tender.title}</p>
          <p><strong>Status:</strong> {tender.status}</p>
          <p><strong>Status Type:</strong> {typeof tender.status}</p>
          <p><strong>Organisations:</strong> {tender.organisations?.length || 0}</p>
          
          {tender.organisations && tender.organisations.length > 0 && (
            <div className="mt-2">
              <p><strong>Organisations:</strong></p>
              {tender.organisations.map((org, index) => (
                <p key={index} className="ml-4">
                  {org.organisation.name} - {org.organisationRole}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">DetailView Component Test</h2>
          <DetailView
            schema={tenderDetailSchema}
            data={tender}
            className="py-4"
          />
        </div>
      </div>
    </div>
  );
} 