/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal, clearCart } = useCart();
  
  // Checkout Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    paymentMethod: "momo" // Defaulting to MoMo for Rwandan Context bonus!
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    // Simulate a secure API roundtrip transaction delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a random mock Invoice ID for the presentation receipt
    const mockId = `MIA-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedOrderId(mockId);
    setIsSubmitting(false);
    setOrderConfirmed(true);
    clearCart(); // Flush state out of localStorage upon successful invoice execution
  };

  // 1. Order Confirmation Overlay State
  if (orderConfirmed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl border border-pink-100">
          ✔
        </div>
        <h1 className="text-2xl font-light tracking-widest text-neutral-900 uppercase mb-2">Order Confirmed</h1>
        <p className="text-xs text-neutral-500 mb-6">Thank you for shopping with MIA LUXE. Your transaction was processed successfully.</p>
        
        <div className="bg-neutral-50 border border-neutral-100 rounded-sm p-6 text-left max-w-md mx-auto mb-8 space-y-3">
          <p className="text-xs text-neutral-600"><span className="font-semibold text-neutral-800">Order ID:</span> {generatedOrderId}</p>
          <p className="text-xs text-neutral-600"><span className="font-semibold text-neutral-800">Deliver To:</span> {formData.name}</p>
          <p className="text-xs text-neutral-600"><span className="font-semibold text-neutral-800">Shipping Destination:</span> {formData.address}</p>
          <p className="text-xs text-neutral-600"><span className="font-semibold text-neutral-800">Notification Alert Sent To:</span> {formData.email}</p>
          <p className="text-xs text-neutral-600"><span className="font-semibold text-neutral-800">Payment Channel:</span> {formData.paymentMethod === "momo" ? "MTN Mobile Money (Simulated)" : "Credit / Debit Card"}</p>
        </div>

        <Link href="/" className="inline-block bg-neutral-950 text-white text-[10px] font-bold tracking-widest uppercase px-8 py-3.5 hover:bg-pink-400 transition-colors">
          Continue Browsing
        </Link>
      </div>
    );
  }

  // 2. Empty Shopping State UI
  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-light tracking-widest uppercase text-neutral-900 mb-4">Your Bag is Empty</h2>
        <p className="text-xs text-neutral-500 mb-8 tracking-wide">Look around the storefront to discover the latest curated trends.</p>
        <Link href="/" className="bg-neutral-950 text-white text-[10px] font-bold tracking-widest uppercase px-8 py-4 hover:bg-pink-400 transition-colors">
          Explore Arrivals
        </Link>
      </div>
    );
  }

  // 3. Complete Checkout Split Grid Interface
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-xl font-medium tracking-widest text-neutral-900 uppercase mb-8">Review Shopping Bag</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Hand Column: Item Management Cards */}
        <div className="lg:col-span-7 space-y-6">
          {cart.map((item, index) => (
            <div key={`${item.product.id}-${index}`} className="flex border border-neutral-100 p-4 rounded-xs bg-white space-x-4">
              <div className="w-20 aspect-[3/4] bg-neutral-50 flex-shrink-0 rounded-xs overflow-hidden">
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-grow text-left flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-800 tracking-tight">{item.product.name}</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Size: {item.selectedSize} | Color: {item.selectedColor}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {/* Quantity Adjustment Controls */}
                  <div className="flex items-center border border-neutral-200 rounded-xs">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs font-semibold hover:bg-neutral-50"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-medium text-neutral-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs font-semibold hover:bg-neutral-50"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                    className="text-[10px] text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors font-bold"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-neutral-900">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Hand Column: Shipping Details Capture & Invoicing Summary */}
        <div className="lg:col-span-5 bg-neutral-50 border border-neutral-100 rounded-xs p-6 text-left">
          <h2 className="text-xs font-bold tracking-widest uppercase text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
            Order Summary
          </h2>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Full Name</label>
              <input 
                type="text" required name="name" value={formData.name} onChange={handleInputChange}
                className="w-full bg-white border border-neutral-200 px-3 py-2 text-xs rounded-xs focus:outline-none focus:border-neutral-900 text-neutral-800" 
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Email Address</label>
              <input 
                type="email" required name="email" value={formData.email} onChange={handleInputChange}
                className="w-full bg-white border border-neutral-200 px-3 py-2 text-xs rounded-xs focus:outline-none focus:border-neutral-900 text-neutral-800" 
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Shipping & Delivery Address</label>
              <textarea 
                required rows={2} name="address" value={formData.address} onChange={handleInputChange}
                className="w-full bg-white border border-neutral-200 px-3 py-2 text-xs rounded-xs focus:outline-none focus:border-neutral-900 text-neutral-800 resize-none" 
                placeholder="KG 12 Ave, Kigali, Rwanda"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Phone Number</label>
              <input 
                type="tel" required name="phone" value={formData.phone} onChange={handleInputChange}
                className="w-full bg-white border border-neutral-200 px-3 py-2 text-xs rounded-xs focus:outline-none focus:border-neutral-900 text-neutral-800" 
                placeholder="+250 78X XXX XXX"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Payment Channel</label>
              <select 
                name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}
                className="w-full bg-white border border-neutral-200 px-3 py-2 text-xs rounded-xs focus:outline-none focus:border-neutral-900 text-neutral-600 font-medium"
              >
                <option value="momo">MTN Mobile Money (Rwanda Innovation Bonus)</option>
                <option value="card">Credit / Debit Card</option>
              </select>
            </div>

            <div className="pt-4 border-t border-neutral-200 space-y-2">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Shipping Fee</span>
                <span className="text-emerald-600 uppercase font-semibold text-[10px] tracking-wider">Free Delivery</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-1">
                <span>Total Due:</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-neutral-950 text-white text-[10px] font-bold tracking-widest uppercase py-4 rounded-xs hover:bg-pink-400 transition-all disabled:bg-neutral-300"
            >
              {isSubmitting ? "Verifying Transaction..." : "Complete Secure Purchase"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}