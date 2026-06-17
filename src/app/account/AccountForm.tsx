"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AccountFormProps {
  initialPhone: string;
  initialAddress: string;
}

export default function AccountForm({ initialPhone, initialAddress }: AccountFormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone || "");
  const [address, setAddress] = useState(initialAddress || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", isError: false });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, address }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to alter profile dataset");

      setMessage({ text: "Delivery coordinates securely cached.", isError: false });
      router.refresh();
    } catch (err: any) {
      setMessage({ text: err.message, isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <h2 className="text-xs font-bold tracking-widest uppercase text-neutral-950 pb-2 border-b border-neutral-200">
        Saved Logistics Preferences
      </h2>

      {message.text && (
        <div className={`p-3 text-xs rounded-xs border ${message.isError ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-600"}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Primary Contact Number</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 79X XXX XXX" className="w-full border border-neutral-300 p-2 text-xs text-neutral-950 focus:border-neutral-900 outline-none" />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Default Shipping Destination</label>
        <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street Number, Neighborhood, City, Country" className="w-full border border-neutral-300 p-2 text-xs text-neutral-950 resize-none focus:border-neutral-900 outline-none" />
      </div>

      <button type="submit" disabled={isSaving} className="bg-neutral-950 text-white font-bold text-[10px] tracking-widest uppercase px-6 py-3 transition-colors hover:bg-pink-400 disabled:opacity-50">
        {isSaving ? "Syncing..." : "Update Default Logistics"}
      </button>
    </form>
  );
}