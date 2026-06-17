"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefundButton({ 
  orderId, 
  paymentStatus, 
  orderStatus 
}: { 
  orderId: string, 
  paymentStatus: string, 
  orderStatus: string 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isRefunded = paymentStatus === "refunded" || orderStatus === "refunded";

  const handleRefund = async () => {
    // Safety check so you don't accidentally click it!
    if (!window.confirm("Are you sure you want to force-refund this order? This action cannot be undone.")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Set both the payment to refunded AND the fulfillment status to refunded
        body: JSON.stringify({ paymentStatus: "refunded", orderStatus: "refunded" }),
      });

      if (!res.ok) throw new Error("Refund failed");
      router.refresh(); // Automatically updates the table data
    } catch (error) {
      alert("Error processing refund. Please try again.");
      setLoading(false);
    }
  };

  if (isRefunded) {
    return <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Refunded</span>;
  }

  return (
    <button
      onClick={handleRefund}
      disabled={loading}
      className="px-4 py-2 border border-red-900/50 text-red-500 text-[9px] font-bold uppercase tracking-widest rounded-xs hover:bg-red-950 transition-colors disabled:opacity-50"
    >
      {loading ? "Processing..." : "Force Refund"}
    </button>
  );
}