"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center w-full border border-neutral-300 bg-white rounded-xs overflow-hidden focus-within:border-neutral-900 transition-colors shadow-sm">
      <input
        type="text"
        placeholder="Search dresses, knits, or accessories..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 text-sm focus:outline-none placeholder-neutral-400 text-neutral-900"
      />
      <button 
        type="submit" 
        className="bg-neutral-950 text-white px-6 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-pink-400 transition-colors"
      >
        Search
      </button>
    </form>
  );
}