// app/admin/ekyc/page.tsx
"use client";

import { useEffect, useState } from 'react';

interface EkycRequest {
  verification_id: number;
  document_url: string;
  submitted_at: string;
  user_id: number;
  student_id: string;
  name: string;
  email: string;
  faculty: string;
  campus: string;
}

export default function AdminEkycDashboard() {
  const [requests, setRequests] = useState<EkycRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/ekyc');
      if (!res.ok) throw new Error('Failed to load pending requests. Ensure you are logged in as Admin.');
      
      const data = await res.json();
      setRequests(data.requests);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (verification_id: number, action: 'Accept' | 'Reject') => {
    if (!confirm(`Are you sure you want to ${action.toUpperCase()} this student's registration?`)) return;
    
    setProcessingId(verification_id);
    
    try {
      const res = await fetch('/api/admin/ekyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_id, action }),
      });

      if (!res.ok) throw new Error(`Failed to ${action} request`);

      // Remove the processed row from the UI instantly
      setRequests((prev) => prev.filter((req) => req.verification_id !== verification_id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">E-KYC APPROVALS</h1>
            <p className="text-gray-400 mt-1">Review student IDs to grant marketplace access.</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
            <span className="text-gray-400 text-sm">Pending Requests:</span>
            <span className="text-blue-400 font-bold ml-2 text-lg">{requests.length}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-500 bg-red-900/50 p-4 text-red-200">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-12 text-center text-gray-400">
            No pending eKYC requests at this time.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Faculty & Campus</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4 text-center">Identity Document</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {requests.map((req) => (
                  <tr key={req.verification_id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{req.name}</div>
                      <div className="text-gray-400">ID: {req.student_id}</div>
                      <div className="text-blue-400">{req.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{req.faculty}</div>
                      <div className="text-xs text-gray-500">{req.campus}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(req.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a 
                        //href={req.document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-600 transition-colors"
                      >
                        View Document ↗
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleAction(req.verification_id, 'Accept')}
                        disabled={processingId === req.verification_id}
                        className="rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(req.verification_id, 'Reject')}
                        disabled={processingId === req.verification_id}
                        className="rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}