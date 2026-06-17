"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StoreActionButtons({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: "verified" | "rejected") => {
    setLoading(true);
    try {
      await fetch(`/api/admin/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <button 
        onClick={() => updateStatus("rejected")} 
        disabled={loading}
        className="px-6 py-3 border border-red-900/50 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-xs hover:bg-red-950 transition-colors"
      >
        Reject
      </button>
      <button 
        onClick={() => updateStatus("verified")} 
        disabled={loading}
        className="px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-xs hover:bg-emerald-400 transition-colors"
      >
        {loading ? "Processing..." : "Verify Store"}
      </button>
    </div>
  );
}