// app/admin/users/page.tsx
"use client";

import { useEffect, useState } from 'react';

interface User {
  id: number;
  student_id: string;
  username: string;
  name: string;
  email: string;
  faculty: string;
  campus: string;
  eKYC_status: string;
  created_at: string;
}

export default function UserManagementDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      
      setUsers(data.users);
      setCurrentAdminId(data.currentAdminId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    // Add a strict confirmation step to prevent accidental deletions
    const confirmDelete = window.confirm(
      `WARNING: Are you sure you want to permanently delete ${userName}? \n\nThis will also delete all their marketplace listings and data. This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    setIsDeleting(userId);
    setError('');

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      // Instantly remove the deleted user from the frontend table
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading User Directory...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">USER MANAGEMENT</h1>
            <p className="text-gray-400 mt-1">Super Admin Access: View and delete user accounts.</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
            <span className="text-gray-400 text-sm">Total Users:</span>
            <span className="text-blue-400 font-bold ml-2 text-lg">{users.length}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-500 bg-red-900/50 p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => {
                const isSelf = user.id === currentAdminId;
                
                return (
                  <tr key={user.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-gray-400">@{user.username}</div>
                      <div className="text-xs text-gray-500 mt-1">ID: {user.student_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-blue-400">{user.email}</div>
                      <div className="text-xs text-gray-500 mt-1">{user.faculty} • {user.campus}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.eKYC_status === 'Verified' ? 'bg-green-900 text-green-300' : 
                        user.eKYC_status === 'Rejected' ? 'bg-red-900 text-red-300' : 
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {user.eKYC_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        disabled={isSelf || isDeleting === user.id}
                        className={`rounded px-4 py-2 font-medium focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors ${
                          isSelf 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                        }`}
                      >
                        {isDeleting === user.id ? 'Deleting...' : isSelf ? 'Active (You)' : 'Delete User'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}