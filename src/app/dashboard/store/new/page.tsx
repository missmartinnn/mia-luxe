"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateStorePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create store");
      }

      // Route back to the dashboard to see the new store
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10">
          <Link href="/dashboard" className="text-xs font-bold text-neutral-400 hover:text-pink-500 uppercase tracking-widest transition-colors flex items-center gap-2 mb-4">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-neutral-900">
            Open a New Store
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Set up your digital boutique and start listing premium items.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-neutral-200 rounded-xs p-6 sm:p-10 shadow-sm">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                Store Name *
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="e.g., Mia Luxe Vintage"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-neutral-300 px-4 py-3 rounded-xs focus:border-neutral-900 focus:ring-neutral-900 sm:text-sm transition-colors"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                Store Description (Optional)
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Tell customers what makes your collection unique..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-neutral-300 px-4 py-3 rounded-xs focus:border-neutral-900 focus:ring-neutral-900 sm:text-sm transition-colors resize-none"
              />
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 text-xs font-bold tracking-widest text-neutral-500 uppercase hover:text-neutral-900 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-neutral-950 text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-pink-400 transition-all rounded-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Store..." : "Launch Store"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}