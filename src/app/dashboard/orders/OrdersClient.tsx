"use client";

import { useState } from "react";
import Link from "next/link";
import OrderRow from "./OrderRow";

interface OrdersClientProps {
  initialOrders: any[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [activeTab, setActiveTab] = useState("action_required");

  // Filter the orders dynamically based on the active tab
  const filteredOrders = initialOrders.filter((order) => {
    switch (activeTab) {
      case "action_required":
        return order.orderStatus === "pending" || order.orderStatus === "processing";
      case "shipped":
        return order.orderStatus === "shipped";
      case "delivered":
        return order.orderStatus === "delivered";
      case "closed":
        return order.orderStatus === "cancelled" || order.orderStatus === "refunded";
      default:
        return true;
    }
  });

  const tabs = [
    { id: "action_required", label: "Action Required" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "closed", label: "Cancelled / Refunded" },
  ];

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <Link href="/dashboard" className="text-[10px] font-bold text-neutral-400 hover:text-pink-500 uppercase tracking-widest transition-colors mb-2 block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-medium tracking-tight text-neutral-900">
            Order Management
          </h1>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-neutral-200 mb-8 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap py-4 px-6 text-xs font-bold tracking-widest uppercase transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-700 hover:border-neutral-300"
            }`}
          >
            {tab.label}
            {/* Show a notification badge for Action Required items */}
            {tab.id === "action_required" && (
              <span className="ml-2 bg-pink-500 text-white text-[9px] px-2 py-0.5 rounded-full">
                {initialOrders.filter(o => o.orderStatus === "pending" || o.orderStatus === "processing").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xs p-16 text-center shadow-sm">
          <p className="text-sm font-medium text-neutral-900 mb-2">No orders in this pipeline stage.</p>
          <p className="text-xs text-neutral-500">Orders will appear here as their status changes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </>
  );
}