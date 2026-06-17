"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabaseClient";
import Link from "next/link";
import { CATEGORIES_DATA } from "../../../../../lib/categories";

type ProductProps = {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    subcategory: string | null;
    stock: number;
    sizes: string[];
    colors: string[];
    images: string[];
  };
};

export default function EditProductForm({ product }: ProductProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  
  // Initialize image state with existing images from the database
  const [uploadedImages, setUploadedImages] = useState<string[]>(product.images || []);

  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    category: product.category.toLowerCase(), // Normalize for the select match
    subcategory: product.subcategory?.toLowerCase() || "",
    stock: product.stock.toString(),
    sizes: product.sizes.join(", "),
    colors: product.colors.join(", "),
  });

  // Calculate dynamic subcategories based on current category selection
  const activeCategoryData = CATEGORIES_DATA.find((c) => c.slug === formData.category);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "category") {
      // Auto-reset subcategory when switching main category
      setFormData({ ...formData, category: value, subcategory: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(uploadedImages.filter((_, idx) => idx !== indexToRemove));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError("");
    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
      const randomId = Math.random().toString(36).substring(2, 7);
      const timestamp = Date.now();
      const filePath = `${timestamp}-${randomId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setIsUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      urls.push(publicUrl);
    }

    // Append new images to the existing array
    setUploadedImages((prev) => [...prev, ...urls]);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImages.length === 0) {
      setError("Products must have at least one image.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    const formattedData = {
      ...formData,
      sizes: formData.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: formData.colors.split(",").map((c) => c.trim()).filter(Boolean),
      images: uploadedImages, 
    };

    try {
      const res = await fetch(`/api/seller/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      // SAFE CHECK: Check if the response is actually JSON before parsing
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned an invalid response (${res.status}). Please verify your API route file path.`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update product");

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xs">
          {error}
        </div>
      )}

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

      {/* DYNAMIC CATEGORIZATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-100">
        <div>
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Category *</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 rounded-xs focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm bg-white" required>
            <option value="">Select Category</option>
            {CATEGORIES_DATA.map((cat) => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Subcategory *</label>
          <select name="subcategory" value={formData.subcategory} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 rounded-xs focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:text-sm bg-white disabled:bg-neutral-50" disabled={!activeCategoryData} required>
            <option value="">Select Subcategory</option>
            {activeCategoryData?.subcategories.map((sub) => (
              <option key={sub.slug} value={sub.slug}>{sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Variants & Details */}
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
                  <span>Upload additional files</span>
                  <input id="file-upload" name="file-upload" type="file" accept="image/*" multiple onChange={handleImageUpload} className="sr-only" disabled={isUploading} />
                </label>
              </div>
            </div>
          </div>

          {/* Live upload thumbnail grid preview with Remove functionality */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-6">
              {uploadedImages.map((url, idx) => (
                <div key={idx} className="aspect-square bg-neutral-100 border border-neutral-200 overflow-hidden relative group rounded-xs">
                  <img src={url} alt="Product" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 text-xs font-bold"
                  >
                    &times;
                  </button>
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
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}