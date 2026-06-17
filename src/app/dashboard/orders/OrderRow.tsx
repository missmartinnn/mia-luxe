"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderRow({ order }: { order: any }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (newOrderStatus: string, newPaymentStatus?: string) => {
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/seller/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: newOrderStatus,
          ...(newPaymentStatus && { paymentStatus: newPaymentStatus }),
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      // Refresh the page data, which will automatically move the order to the correct tab!
      router.refresh();
    } catch (error) {
      alert("Error updating order. Please try again.");
      setIsUpdating(false); // Only reset if failed. If success, it stays true while reloading.
    }
  };

  return (
    <div className={`bg-white border rounded-xs shadow-sm overflow-hidden text-xs transition-opacity ${isUpdating ? "opacity-50 pointer-events-none" : "opacity-100"} ${order.orderStatus === 'cancelled' || order.orderStatus === 'refunded' ? "border-red-100" : "border-neutral-200"}`}>
      
      {/* Customer Info Header */}
      <div className={`border-b border-neutral-200 px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-neutral-600 ${order.orderStatus === 'cancelled' || order.orderStatus === 'refunded' ? "bg-red-50/30" : "bg-neutral-50"}`}>
        <div>
          <p className="font-bold text-neutral-900 mb-1">{order.customerName}</p>
          <p>{order.customerEmail}</p>
          <p>{order.customerPhone}</p>
        </div>
        <div>
          <p className="font-bold text-neutral-900 mb-1">Shipping Destination</p>
          <p>{order.shippingAddress}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="font-bold text-neutral-900 mb-1">Order Total</p>
          <p className="text-sm font-bold text-emerald-600">${order.totalAmount.toFixed(2)}</p>
          <p className="text-[10px] uppercase tracking-widest mt-1">ID: {order.id.split("-")[0]}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-neutral-100 px-6">
        {order.items.map((item: any) => (
          <div key={item.id} className="py-4 flex items-center space-x-4">
            <div className="w-12 aspect-[3/4] bg-neutral-100 overflow-hidden shrink-0">
              {item.product?.images?.[0] && (
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-medium text-neutral-950 truncate">{item.product?.name || "Product Unavailable"}</h4>
              <p className="text-[10px] text-neutral-400 mt-0.5">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
            </div>
            <span className="font-bold text-neutral-900">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Control Panel (Action Buttons) */}
      <div className="bg-white border-t border-neutral-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        
        {/* Status Badges */}
        <div className="flex gap-2">
           <span className={`px-2 py-1 rounded-xs text-[9px] font-bold uppercase tracking-wider ${
             order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
             order.paymentStatus === 'refunded' ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-600'
           }`}>
             Payment {order.paymentStatus}
           </span>
           <span className={`px-2 py-1 rounded-xs text-[9px] font-bold uppercase tracking-wider ${
             order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 
             order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
           }`}>
             {order.orderStatus}
           </span>
        </div>

        {/* Action Buttons based on Pipeline Stage */}
        <div className="flex gap-2">
          
          {/* Actions for PENDING / PROCESSING */}
          {(order.orderStatus === "pending" || order.orderStatus === "processing") && (
            <>
              {order.orderStatus === "pending" && (
                <button onClick={() => handleUpdate("processing")} className="px-4 py-2 bg-neutral-100 text-neutral-900 font-bold uppercase tracking-widest text-[9px] hover:bg-neutral-200 transition-colors">
                  Begin Processing
                </button>
              )}
              <button onClick={() => handleUpdate("shipped")} className="px-4 py-2 bg-neutral-900 text-white font-bold uppercase tracking-widest text-[9px] hover:bg-neutral-800 transition-colors">
                Mark Shipped
              </button>
              <button onClick={() => handleUpdate("cancelled", "refunded")} className="px-4 py-2 border border-red-200 text-red-600 font-bold uppercase tracking-widest text-[9px] hover:bg-red-50 transition-colors">
                Cancel
              </button>
            </>
          )}

          {/* Actions for SHIPPED */}
          {order.orderStatus === "shipped" && (
            <>
              <button onClick={() => handleUpdate("delivered")} className="px-4 py-2 bg-emerald-600 text-white font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-700 transition-colors">
                Mark Delivered
              </button>
              <button onClick={() => handleUpdate("refunded", "refunded")} className="px-4 py-2 border border-red-200 text-red-600 font-bold uppercase tracking-widest text-[9px] hover:bg-red-50 transition-colors">
                Refund Issue
              </button>
            </>
          )}

          {/* Actions for DELIVERED */}
          {order.orderStatus === "delivered" && (
             <button onClick={() => handleUpdate("refunded", "refunded")} className="px-4 py-2 border border-red-200 text-red-600 font-bold uppercase tracking-widest text-[9px] hover:bg-red-50 transition-colors">
               Refund Order
             </button>
          )}

        </div>
      </div>
    </div>
  );
}