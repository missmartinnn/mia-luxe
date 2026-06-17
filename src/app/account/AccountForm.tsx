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

      setMessage({ text: "Delivery details successfully saved. These will auto-fill at checkout.", isError: false });
      
      // Refresh the current route to update the server components with the new data
      router.refresh();
      
    } catch (err: any) {
      setMessage({ text: err.message, isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 bg-white p-6 md:p-8 border border-neutral-100 rounded-xs shadow-sm max-w-xl">
      <h2 className="text-xs font-bold tracking-widest uppercase text-neutral-950 pb-4 border-b border-neutral-100">
        Default Delivery Information
      </h2>

      {message.text && (
        <div className={`p-4 text-xs font-bold rounded-xs border ${message.isError ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-600"}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Primary Contact Number</label>
        <input 
          type="tel" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          placeholder="+1 (555) 000-0000" 
          className="w-full border border-neutral-300 p-3 text-xs text-neutral-950 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition-all rounded-xs" 
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Default Shipping Destination</label>
        <textarea 
          rows={4} 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          placeholder="123 Luxury Ave, Suite 100&#10;New York, NY 10001" 
          className="w-full border border-neutral-300 p-3 text-xs text-neutral-950 resize-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition-all rounded-xs" 
        />
      </div>

      <button 
        type="submit" 
        disabled={isSaving} 
        className="w-full bg-neutral-950 text-white font-bold text-[10px] tracking-widest uppercase px-6 py-4 transition-colors hover:bg-pink-400 disabled:opacity-50 rounded-xs"
      >
        {isSaving ? "Syncing to Server..." : "Save Delivery Defaults"}
      </button>
    </form>
  );
}