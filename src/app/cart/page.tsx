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
    paymentMethod: "momo" // Default payment type simulation
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState("");

  useEffect(() => { 
    setIsMounted(true); 
  }, []);

  // 👇 NEW: Pre-fill user details from session AND fetch saved database defaults
  useEffect(() => {
    if (session?.user) {
      // 1. Instantly fill what we already know from the active session
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));

      // 2. Fetch the extra database defaults (phone & address)
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setFormData((prev) => ({
              ...prev,
              phone: data.phone || prev.phone,
              address: data.address || prev.address,
            }));
          }
        })
        .catch((err) => console.error("Failed to fetch user delivery defaults", err));
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
      // 1. Format the data to send to our API (Including payment method simulation)
      const payload = {
        items: cart,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        paymentMethod: formData.paymentMethod,
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

  // Map the slug values to pretty UI display names
  const getPaymentLabel = (method: string) => {
    const mapping: { [key: string]: string } = {
      momo: "Mobile Money (MoMo)",
      card: "Credit / Debit Card",
      paypal: "PayPal Express Checkout"
    };
    return mapping[method] || method;
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
          <p className="text-xs text-neutral-600"><span className="font-semibold text-neutral-950">Payment Simulated via:</span> <span className="uppercase text-pink-600 font-semibold">{getPaymentLabel(formData.paymentMethod)}</span></p>
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
                    <button type="button" onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)} className="px-2.5 py-1 text-xs font-semibold hover:bg-neutral-50">-</button>
                    <span className="px-3 text-xs font-medium text-neutral-950">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)} className="px-2.5 py-1 text-xs font-semibold hover:bg-neutral-50">+</button>
                  </div>
                  <button type="button" onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)} className="text-[10px] text-red-500 uppercase font-bold">Remove</button>
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
                <input type="text" required name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-neutral-300 p-2 text-xs text-neutral-950 bg-white focus:outline-none focus:border-neutral-950" placeholder="Full Name" />
                <input type="email" required name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-neutral-300 p-2 text-xs text-neutral-950 bg-white focus:outline-none focus:border-neutral-950" placeholder="Email" />
              </>
            )}

            <div className="pt-2">
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-2">Delivery Information</label>
              <input type="text" required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-neutral-300 p-2 text-xs text-neutral-950 mb-3 bg-white focus:outline-none focus:border-neutral-950" placeholder="Phone Number" />
              <textarea required rows={3} name="address" value={formData.address} onChange={handleInputChange} className="w-full border border-neutral-300 p-2 text-xs text-neutral-950 resize-none bg-white focus:outline-none focus:border-neutral-950" placeholder="Full Shipping Address" />
            </div>

            <div className="pt-2">
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-2">Payment Option (Simulation)</label>
              <select 
                name="paymentMethod" 
                value={formData.paymentMethod} 
                onChange={handleInputChange} 
                className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-950 bg-white focus:outline-none focus:border-neutral-950"
                required
              >
                <option value="momo">Mobile Money (MoMo)</option>
                <option value="card">Credit / Debit Card</option>
                <option value="paypal">PayPal Express Checkout</option>
              </select>
            </div>

            <div className="flex justify-between text-sm font-bold text-neutral-950 pt-4 border-t border-neutral-200">
              <span>Total Due:</span>
              <span>${cartSubtotal.toFixed(2)}</span>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest py-4 transition-all hover:bg-pink-400 disabled:opacity-50">
              {isSubmitting ? "Processing Transaction..." : "Complete Purchase"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}