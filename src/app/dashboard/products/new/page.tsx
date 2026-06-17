"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient"; // Import our new storage client
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Women",
    subcategory: "",
    stock: "10",
    sizes: "XS, S, M, L, XL",
    colors: "Black, White",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- UPDATED: BULLETPROOF FILE PATH SANITIZATION ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError("");
    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Clean up the extension and create a strictly alphanumeric name structure
      const fileExt = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
      const randomId = Math.random().toString(36).substring(2, 7);
      const timestamp = Date.now();
      const filePath = `${timestamp}-${randomId}.${fileExt}`;

      // Upload file directly to the Supabase bucket we created
      const { data, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setIsUploading(false);
        return;
      }

      // Get the public internet URL for the uploaded asset
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      urls.push(publicUrl);
    }

    setUploadedImages((prev) => [...prev, ...urls]);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImages.length === 0) {
      setError("Please upload at least one image for your luxury product.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    const formattedData = {
      ...formData,
      sizes: formData.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: formData.colors.split(",").map((c) => c.trim()).filter(Boolean),
      images: uploadedImages, // Inject our real Supabase URLs here!
    };

    try {
      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
        });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link href="/dashboard" className="text-xs font-bold text-neutral-400 hover:text-pink-500 uppercase tracking-widest transition-colors flex items-center gap-2 mb-4">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-medium tracking-tight text-neutral-900">Add New Product</h1>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xs p-6 sm:p-10 shadow-sm">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Product Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 rounded-xs focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Price ($) *</label>
                <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 rounded-xs focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Inventory Stock *</label>
                <input type="number" name="stock" required value={formData.stock} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 rounded-xs focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm" />
              </div>
            </div>

            {/* Categorization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-100">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 rounded-xs focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm bg-white">
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Kids">Kids</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Subcategory</label>
                <input type="text" name="subcategory" placeholder="e.g., Dresses, Tops" value={formData.subcategory} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 rounded-xs focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm" />
              </div>
            </div>

            {/* Variants */}
            <div className="pt-6 border-t border-neutral-100 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Sizes (Comma Separated)</label>
                <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 rounded-xs focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Colors (Comma Separated)</label>
                <input type="text" name="colors" value={formData.colors} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 rounded-xs focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Description *</label>
                <textarea name="description" rows={4} required value={formData.description} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 rounded-xs focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm resize-none"></textarea>
              </div>

              {/* IMAGE UPLOAD ZONE */}
              <div className="pt-6 border-t border-neutral-100">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Product Gallery Images *</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-xs hover:border-pink-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-neutral-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-neutral-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-bold text-pink-500 hover:text-pink-600 focus-within:outline-none">
                        <span>Upload media files</span>
                        <input id="file-upload" name="file-upload" type="file" accept="image/*" multiple onChange={handleImageUpload} className="sr-only" disabled={isUploading} />
                      </label>
                    </div>
                    <p className="text-xs text-neutral-400">PNG, JPG, WEBP up to 50MB</p>
                  </div>
                </div>

                {/* Live upload thumbnail grid preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className="aspect-square bg-neutral-100 border border-neutral-200 overflow-hidden relative group rounded-xs">
                        <img src={url} alt="Upload Preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {isUploading && <p className="text-xs text-neutral-500 mt-2 animate-pulse">Uploading high-resolution assets to storage infrastructure...</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 border-t border-neutral-100 flex justify-end gap-4">
              <Link href="/dashboard" className="px-6 py-3 text-xs font-bold tracking-widest text-neutral-500 uppercase hover:text-neutral-900 transition-colors">
                Cancel
              </Link>
              <button type="submit" disabled={isLoading || isUploading} className="bg-neutral-950 text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-pink-400 transition-all rounded-xs shadow-sm disabled:opacity-50">
                {isLoading ? "Publishing..." : "Publish Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}