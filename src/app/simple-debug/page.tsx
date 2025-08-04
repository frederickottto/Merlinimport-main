"use client";

import { useEffect, useState } from "react";

export default function SimpleDebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Direct database query simulation
    const testData = {
      id: "688fa3c25dd9356b3d7d0634",
      title: "360-Grad-Sicherheitsanalyse Authenticator",
      status: "nicht angeboten",
      organisations: [
        {
          id: "688fd039d11db03bef8e49c1",
          organisation: {
            id: "688ca356529479d94470ca2b",
            name: "gematik"
          },
          organisationRole: "Auftraggeber"
        }
      ]
    };

    setData(testData);
    setLoading(false);
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-8">No data</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Debug Tender Page</h1>
      
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Test Data</h2>
          <p><strong>ID:</strong> {data.id}</p>
          <p><strong>Title:</strong> {data.title}</p>
          <p><strong>Status:</strong> {data.status}</p>
          <p><strong>Status Type:</strong> {typeof data.status}</p>
          <p><strong>Organisations:</strong> {data.organisations?.length || 0}</p>
          
          {data.organisations && data.organisations.length > 0 && (
            <div className="mt-2">
              <p><strong>Organisations:</strong></p>
              {data.organisations.map((org: any, index: number) => (
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
            <p>Original: "{data.status}"</p>
            {(() => {
              const statusMap = {
                "nicht angeboten": "Nicht angeboten",
                "Nicht angeboten": "Nicht angeboten",
              };
              const mappedStatus = statusMap[data.status || ""] || data.status;
              return <p>Mapped: "{mappedStatus}"</p>;
            })()}
          </div>

          {/* Organisations Logic */}
          <div>
            <h3 className="font-semibold">Organisations Logic:</h3>
            <p>Count: {data.organisations?.length || 0}</p>
            {(() => {
              const organisations = data.organisations || [];
              if (organisations.length === 0) {
                return <p>Result: "-" (no organisations)</p>;
              }
              
              const clientOrganisations = organisations.filter((org: any) => 
                !org.organisationRole || org.organisationRole === 'Auftraggeber'
              );
              
              const orgsToShow = clientOrganisations.length > 0 ? clientOrganisations : organisations;
              const result = orgsToShow.map((org: any) => org.organisation.name).join(", ");
              
              return <p>Result: "{result}"</p>;
            })()}
          </div>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Expected Display</h2>
          <p><strong>Status:</strong> Nicht angeboten</p>
          <p><strong>Auftraggeber:</strong> gematik</p>
        </div>

        <div className="border p-4 rounded bg-green-50">
          <h2 className="text-lg font-semibold mb-2 text-green-800">✅ Expected Result</h2>
          <p className="text-green-700">Based on this test data, the frontend should display:</p>
          <ul className="list-disc list-inside mt-2 text-green-700">
            <li><strong>Status:</strong> "Nicht angeboten"</li>
            <li><strong>Auftraggeber:</strong> "gematik"</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 