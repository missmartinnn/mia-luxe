"use client";

import { useRouter } from "next/navigation";

export default function SearchFilters({ currentCategory, currentSort }: { currentCategory: string, currentSort: string }) {
  const router = useRouter();

  const updateFilters = (key: string, value: string) => {
    // Read current URL params
    const params = new URLSearchParams(window.location.search);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Push new URL securely
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-8 sticky top-24">
      {/* Category Filter */}
      <div>
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-4 border-b border-neutral-100 pb-2">Category</h3>
        <div className="space-y-3">
          {["Women", "Men", "Kids", "Accessories"].map((cat) => (
            <label key={cat} className="flex items-center space-x-3 text-sm cursor-pointer group">
              <input 
                type="radio" 
                name="category" 
                checked={currentCategory === cat}
                onChange={() => updateFilters("category", cat)}
                className="text-pink-500 focus:ring-pink-500 accent-pink-500 w-4 h-4"
              />
              <span className={`transition-colors group-hover:text-pink-500 ${currentCategory === cat ? "font-bold text-neutral-900" : "text-neutral-600"}`}>
                {cat}
              </span>
            </label>
          ))}
          <label className="flex items-center space-x-3 text-sm cursor-pointer group pt-2">
            <input 
              type="radio" 
              name="category" 
              checked={!currentCategory}
              onChange={() => updateFilters("category", "")}
              className="text-pink-500 focus:ring-pink-500 accent-pink-500 w-4 h-4"
            />
            <span className={`transition-colors group-hover:text-pink-500 ${!currentCategory ? "font-bold text-neutral-900" : "text-neutral-600"}`}>
              All Categories
            </span>
          </label>
        </div>
      </div>

      {/* Sort Filter */}
      <div>
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-4 border-b border-neutral-100 pb-2">Sort By</h3>
        <select 
          value={currentSort}
          onChange={(e) => updateFilters("sort", e.target.value)}
          className="w-full border border-neutral-300 rounded-xs px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none bg-white text-neutral-700"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}