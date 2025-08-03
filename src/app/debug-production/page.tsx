"use client";

import { useState, useEffect } from "react";

export default function DebugProductionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testProductionAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test the production API directly
      const response = await fetch('/api/trpc/tenders.getById?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22id%22%3A%22688fa3c25dd9356b3d7d0634%22%7D%7D%7D', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Force fresh request
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      
      console.log('Production API Response:', result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Production API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testLocalAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test the local API
      const response = await fetch('/api/trpc/tenders.getById?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22id%22%3A%22688fa3c25dd9356b3d7d0634%22%2C%22_timestamp%22%3A' + Date.now() + '%7D%7D%7D', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      
      console.log('Local API Response:', result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Local API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Production API</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testProductionAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Production API'}
        </button>
        
        <button
          onClick={testLocalAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {loading ? 'Testing...' : 'Test Local API'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <h3 className="text-red-800 font-semibold">Error:</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">API Response:</h2>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Raw Response:</h3>
            <pre className="text-sm overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>

          {data[0]?.result?.data && (
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Tender Data:</h3>
              <div className="space-y-2">
                <p><strong>ID:</strong> {data[0].result.data.id}</p>
                <p><strong>Title:</strong> {data[0].result.data.title}</p>
                <p><strong>Status:</strong> "{data[0].result.data.status}"</p>
                <p><strong>Status Type:</strong> {typeof data[0].result.data.status}</p>
                <p><strong>Organisations:</strong> {data[0].result.data.organisations?.length || 0}</p>
                
                {data[0].result.data.organisations?.map((org: any, index: number) => (
                  <div key={index} className="ml-4">
                    <p>• {org.organisation?.name} - {org.organisationRole}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 