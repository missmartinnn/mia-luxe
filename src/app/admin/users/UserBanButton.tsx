"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserBanButton({ userId, isBanned }: { userId: string; isBanned: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleBan = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !isBanned }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleBan} 
      disabled={loading}
      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xs transition-colors ${
        isBanned 
          ? "bg-neutral-800 text-white hover:bg-neutral-700" 
          : "border border-red-900/50 text-red-500 hover:bg-red-950"
      }`}
    >
      {loading ? "..." : isBanned ? "Unban User" : "Ban User"}
    </button>
  );
}