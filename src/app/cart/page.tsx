"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal, clearCart } = useCart();
  const { data: session } = useSession();
  
  const [isMounted, setIsMounted] = useState(false);
  
  // Checkout Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    paymentMethod: "momo"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState("");

  useEffect(() => { 
    setIsMounted(true); 
  }, []);

  // NEW: Pre-fill user details if they are logged in
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  if (!isMounted) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsSubmitting(true);

    try {
      // 1. Format the data to send to our API
      const payload = {
        items: cart,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        totalAmount: cartSubtotal,
      };

      // 2. Fire the request to the database
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to process checkout");
      }

      // 3. Success! Set the real database ID and clear the cart
      setGeneratedOrderId(data.orderId);
      setOrderConfirmed(true);
      clearCart();

    } catch (error: any) {
      console.error("Checkout Error:", error);
      alert(error.message || "There was an error processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl border border-pink-100">✔</div>
        <h1 className="text-2xl font-light tracking-widest text-neutral-950 uppercase mb-2">Order Confirmed</h1>
        <p className="text-xs text-neutral-600 mb-6">Thank you for shopping with MIA LUXE. Your transaction was processed successfully.</p>
        
        <div className="bg-neutral-50 border border-neutral-100 rounded-sm p-6 text-left max-w-md mx-auto mb-8 space-y-3">
          <p className="text-xs text-neutral-600"><span className="font-semibold text-neutral-950">Order ID:</span> {generatedOrderId}</p>
          <p className="text-xs text-neutral-600"><span className="font-semibold text-neutral-950">Deliver To:</span> {formData.name}</p>
          <p className="text-xs text-neutral-600"><span className="font-semibold text-neutral-950">Shipping Destination:</span> {formData.address}</p>
        </div>

        <Link href="/" className="inline-block bg-neutral-950 text-white text-[10px] font-bold tracking-widest uppercase px-8 py-3.5 hover:bg-pink-400 transition-colors">
          Continue Browsing
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-light tracking-widest uppercase text-neutral-950 mb-4">Your Bag is Empty</h2>
        <Link href="/" className="bg-neutral-950 text-white text-[10px] font-bold tracking-widest uppercase px-8 py-4 hover:bg-pink-400 transition-colors">
          Explore Arrivals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-xl font-medium tracking-widest text-neutral-950 uppercase mb-8">Review Shopping Bag</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-6">
          {cart.map((item, index) => (
            <div key={`${item.product.id}-${index}`} className="flex border border-neutral-200 p-4 rounded-xs bg-white space-x-4">
              <div className="w-20 aspect-[3/4] bg-neutral-100 flex-shrink-0 overflow-hidden">
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-950 tracking-tight">{item.product.name}</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Size: {item.selectedSize} | Color: {item.selectedColor}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-neutral-300 rounded-xs">
                    <button onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)} className="px-2.5 py-1 text-xs font-semibold hover:bg-neutral-50">-</button>
                    <span className="px-3 text-xs font-medium text-neutral-950">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)} className="px-2.5 py-1 text-xs font-semibold hover:bg-neutral-50">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)} className="text-[10px] text-red-500 uppercase font-bold">Remove</button>
                </div>
              </div>
              <span className="text-xs font-bold text-neutral-950">${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5 bg-neutral-50 border border-neutral-200 rounded-xs p-6">
          <h2 className="text-xs font-bold tracking-widest uppercase text-neutral-950 mb-4 pb-2 border-b border-neutral-300">Order Summary</h2>
          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            
            {/* If logged in, we hide name/email as we already have them */}
            {!session && (
              <>
                <input type="text" required name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-neutral-300 p-2 text-xs text-neutral-950" placeholder="Full Name" />
                <input type="email" required name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-neutral-300 p-2 text-xs text-neutral-950" placeholder="Email" />
              </>
            )}

            <div className="pt-2">
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-2">Delivery Information</label>
              <input type="text" required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-neutral-300 p-2 text-xs text-neutral-950 mb-4" placeholder="Phone Number" />
              <textarea required rows={3} name="address" value={formData.address} onChange={handleInputChange} className="w-full border border-neutral-300 p-2 text-xs text-neutral-950 resize-none" placeholder="Full Shipping Address" />
            </div>

            <div className="flex justify-between text-sm font-bold text-neutral-950 pt-4 border-t border-neutral-200">
              <span>Total Due:</span>
              <span>${cartSubtotal.toFixed(2)}</span>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest py-4 transition-all hover:bg-pink-400">
              {isSubmitting ? "Processing..." : "Complete Purchase"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}