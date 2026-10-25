// app/admin/listings/page.tsx
"use client";

import { useEffect, useState } from 'react';

interface AdminListing {
  listing_id: number;
  title: string;
  price: string;
  listing_status: string;
  seller_username: string;
  seller_name: string;
  created_at: string;
}

export default function AdminListingsDashboard() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [adminRole, setAdminRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/admin/listings');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to load listings');
      
      setListings(data.listings);
      setAdminRole(data.adminRole); // Will be 'Moderator' or 'Super admin'
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: number, title: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete the product: "${title}"?`
    );
    
    if (!confirmDelete) return;

    setIsDeleting(listingId);
    setError('');

    try {
      const res = await fetch(`/api/admin/listings?id=${listingId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      // Instantly remove the deleted product from the frontend table
      setListings((prevListings) => prevListings.filter((l) => l.listing_id !== listingId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Product Directory...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">MARKETPLACE MODERATION</h1>
            <p className="text-gray-400 mt-1">
              Logged in as: <span className="font-semibold text-blue-400">{adminRole}</span>. View and remove user products.
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
            <span className="text-gray-400 text-sm">Total Active Listings:</span>
            <span className="text-blue-400 font-bold ml-2 text-lg">{listings.length}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-500 bg-red-900/50 p-4 text-red-200">
            {error}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-12 text-center text-gray-400">
            No products available on the marketplace.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-4">Product details</th>
                  <th className="px-6 py-4">Seller</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Listed Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {listings.map((item) => (
                  <tr key={item.listing_id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white line-clamp-1">{item.title}</div>
                      <div className="text-green-400 mt-1 font-semibold">฿{item.price}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-200">{item.seller_name}</div>
                      <div className="text-xs text-gray-500 mt-1">@{item.seller_username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.listing_status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {item.listing_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteListing(item.listing_id, item.title)}
                        disabled={isDeleting === item.listing_id}
                        className="rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
                      >
                        {isDeleting === item.listing_id ? 'Deleting...' : 'Delete Product'}
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