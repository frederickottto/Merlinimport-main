"use client";

import { api } from "@/trpc/react";

export default function DebugTenderPage() {
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
      <h1 className="text-2xl font-bold mb-4">Debug Tender Page</h1>
      
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
          <h2 className="text-lg font-semibold mb-2">Frontend Logic Test</h2>
          
          {/* Status Logic */}
          <div className="mb-4">
            <h3 className="font-semibold">Status Logic:</h3>
            <p>Original: "{tender.status}"</p>
            {(() => {
              const statusMap = {
                "nicht angeboten": "Nicht angeboten",
                "Nicht angeboten": "Nicht angeboten",
              };
              const mappedStatus = statusMap[tender.status || ""] || tender.status;
              return <p>Mapped: "{mappedStatus}"</p>;
            })()}
          </div>

          {/* Organisations Logic */}
          <div>
            <h3 className="font-semibold">Organisations Logic:</h3>
            <p>Count: {tender.organisations?.length || 0}</p>
            {(() => {
              const organisations = tender.organisations || [];
              if (organisations.length === 0) {
                return <p>Result: "-" (no organisations)</p>;
              }
              
              const clientOrganisations = organisations.filter(org => 
                !org.organisationRole || org.organisationRole === 'Auftraggeber'
              );
              
              const orgsToShow = clientOrganisations.length > 0 ? clientOrganisations : organisations;
              const result = orgsToShow.map(org => org.organisation.name).join(", ");
              
              return <p>Result: "{result}"</p>;
            })()}
          </div>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Expected Display</h2>
          <p><strong>Status:</strong> Nicht angeboten</p>
          <p><strong>Auftraggeber:</strong> gematik</p>
        </div>
      </div>
    </div>
  );
} 