// app/add-product/page.tsx
"use client";

import { useRef, useState } from 'react';

export default function AddProductPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: 1,
    category_id: 1, 
    listing_condition: 'Brand new',
  });

  // State to hold the actual selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle when a user selects a picture from their device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a temporary URL to show an instant preview to the user
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (parseFloat(formData.price) > 99999999.99) {
      setError('Price cannot exceed 99999999.99 based on current database schema.');
      return;
    }

    setIsLoading(true);
    let finalImageUrl = '';

    try {
      // Step 1: Upload the image if one was selected
      if (selectedFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData, // Note: fetch automatically sets the correct multipart headers
        });

        if (!uploadRes.ok) throw new Error('Image upload failed');
        const uploadData = await uploadRes.json();
        
        // This is the /uploads/filename.jpg URL returned from your backend
        finalImageUrl = uploadData.imageUrl; 
      }

      // Step 2: Submit the product data with the newly generated image URL
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity.toString(), 10),
          category_id: parseInt(formData.category_id.toString(), 10),
          images: finalImageUrl ? [finalImageUrl] : [], 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        formRef.current?.reset();
        setFormData({
          title: '',
          description: '',
          price: '',
          quantity: 1,
          category_id: 1,
          listing_condition: 'Brand new',
        });
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSuccess('Product listed successfully. You can create another listing.');
      } else {
        setError(data.error || 'Failed to list product');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create New Listing</h1>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700" role="status">
            {success}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          {/* File Upload Section */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-black file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            {previewUrl && (
              <div className="mt-3 h-40 w-40 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Listing Title (Max 150 chars)</label>
            <input
              name="title"
              type="text"
              required
              maxLength={150}
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description (Max 150 chars)</label>
            <textarea
              name="description"
              required
              maxLength={150}
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Price (Max 999999.99)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">฿</span>
                <input
                  name="price"
                  type="number"
                  required
                  step="0.01"
                  max="99999999.99"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
              <input
                name="quantity"
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={1}>Electronics</option>
                <option value={2}>Textbooks</option>
                <option value={3}>Furniture</option>
                <option value={4}>Stationery</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Condition</label>
              <select
                name="listing_condition"
                value={formData.listing_condition}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Brand new">Brand new</option>
                <option value="Used">Used</option>
                <option value="Refurbished">Refurbished</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-md bg-blue-600 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {isLoading ? 'Posting...' : 'List Item for Sale'}
          </button>
        </form>
      </div>
    </div>
  );
}