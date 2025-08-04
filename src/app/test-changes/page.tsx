"use client";

import { api } from "@/trpc/react";

export default function TestChangesPage() {
  const { data: tender, isLoading, error } = api.tenders.getById.useQuery(
    { 
      id: "688fa3c25dd9356b3d7d0634",
      _timestamp: Date.now()
    },
    {
      staleTime: 0,
      refetchOnMount: true,
    }
  );

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Changes</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold">Tender Data:</h2>
          <p><strong>ID:</strong> {tender?.id}</p>
          <p><strong>Title:</strong> {tender?.title}</p>
          <p><strong>Status:</strong> "{tender?.status}"</p>
          <p><strong>Notes:</strong> "{tender?.notes}"</p>
          <p><strong>Organisations:</strong> {tender?.organisations?.length || 0}</p>
        </div>

        {tender?.organisations?.map((org: any, index: number) => (
          <div key={index} className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold">Organisation {index + 1}:</h3>
            <p><strong>Name:</strong> {org.organisation?.name}</p>
            <p><strong>Role:</strong> {org.organisationRole}</p>
          </div>
        ))}

        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="font-semibold">Expected Changes:</h2>
          <p>✅ Status should be: "Nicht angeboten"</p>
          <p>✅ Organisation should be: "gematik" with role "Auftraggeber"</p>
          <p>✅ Notes should end with: "."</p>
        </div>
      </div>
    </div>
  );
} 