// app/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Banner from "@/components/Banner";

// Define the shape of the data returned by your API
interface Listing {
  listing_id: number;
  title: string;
  description: string;
  price: string;
  listing_condition: string;
  created_at: string;
  category_name: string;
  primary_image: string | null;
  seller_username: string;
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  seller_rating: string;
  seller_faculty: string;
  seller_campus: string;
}

export default function MainFeed() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch('/api/listings');
        if (!res.ok) throw new Error('Failed to fetch listings');
        
        const data = await res.json();
        setListings(data.listings);
      } catch (err) {
        setError('Could not load the marketplace feed.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-600">Loading marketplace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded bg-red-100 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  return (
  
    <main className="min-h-screen bg-gray-50 p-6">
      
      <Banner/>
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Reccommend Item</h1>
        
        {listings.length === 0 ? (
          <p className="text-gray-600">No active listings available right now.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((item) => (
              <div 
                key={item.listing_id} 
                className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full bg-gray-200">
                  {item.primary_image ? (
                    <img 
                      src={item.primary_image} 
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No Image Provided
                    </div>
                  )}
                  <span className="absolute right-2 top-2 rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white shadow">
                    ฿{item.price}
                  </span>
                </div>

                {/* Item Details Section */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {item.category_name}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {item.listing_condition}
                    </span>
                  </div>
                  
                  <h2 className="mb-2 text-lg font-bold text-gray-900 line-clamp-1">
                    {item.title}
                  </h2>
                  <p className="mb-4 flex-1 text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>

                  <hr className="my-4 border-gray-100" />

                  {/* Seller & Contact Section */}
                  <div className="rounded-md bg-gray-50 p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.seller_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.seller_faculty} • {item.seller_campus}
                        </p>
                      </div>
                      <div className="flex items-center rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800">
                        ⭐ {item.seller_rating}
                      </div>
                    </div>
                    
                    <div className="space-y-1 pt-2">
                      <a 
                        href={`mailto:${item.seller_email}`}
                        className="flex items-center text-sm text-blue-600 hover:underline"
                      >
                        ✉️ {item.seller_email}
                      </a>
                      <a 
                        href={`tel:${item.seller_phone}`}
                        className="flex items-center text-sm text-green-600 hover:underline"
                      >
                        📞 {item.seller_phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  
  );
}