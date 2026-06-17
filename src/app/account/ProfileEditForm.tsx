"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormProps {
  user: {
    name: string;
    email: string;
    role: string;
    phone: string;
    address: string;
  };
}

export default function ProfileEditForm({ user }: FormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, address }),
      });

      if (!res.ok) throw new Error();

      setSaveStatus("Profile updated successfully ✔");
      router.refresh();
      setTimeout(() => setSaveStatus(""), 3000);
    } catch {
      setSaveStatus("Failed to update profile. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Full Name</label>
          <p className="text-sm font-medium text-neutral-900">{user.name || "Not provided"}</p>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Email Address</label>
          <p className="text-sm font-medium text-neutral-900">{user.email}</p>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Account Type</label>
          <div>
            <span className="inline-block px-3 py-1 bg-neutral-100 text-neutral-800 text-xs font-bold tracking-wider uppercase rounded-xs">
              {user.role}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Phone Number</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="+250 79X XXX XXX" 
            className="w-full border border-neutral-200 p-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none rounded-xs bg-neutral-50/50" 
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Default Shipping Address</label>
          <textarea 
            rows={2} 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="Street Address, City, Kigali" 
            className="w-full border border-neutral-200 p-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none rounded-xs bg-neutral-50/50 resize-none" 
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
        <button 
          type="submit" 
          disabled={isSaving} 
          className="bg-neutral-950 text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-pink-400 transition-colors rounded-xs shadow-sm disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
        {saveStatus && (
          <p className={`text-xs font-medium ${saveStatus.includes("✔") ? "text-emerald-600" : "text-red-500"}`}>
            {saveStatus}
          </p>
        )}
      </div>
    </form>
  );
}