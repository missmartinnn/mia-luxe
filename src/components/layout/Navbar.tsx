"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <nav className="bg-white border-b border-neutral-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold tracking-[0.25em] text-neutral-900 uppercase">
              MIA<span className="text-pink-400 font-light">LUXE</span>
            </Link>
          </div>

          <div className="hidden md:flex space-x-8 text-xs font-medium tracking-widest uppercase">
            <Link href="/category/new-arrivals" className="text-neutral-900 hover:text-pink-500 transition-colors">New Arrivals</Link>
            <Link href="/category/women" className="text-neutral-500 hover:text-pink-500 transition-colors">Women</Link>
            <Link href="/category/men" className="text-neutral-500 hover:text-pink-500 transition-colors">Men</Link>
            <Link href="/category/kids" className="text-neutral-500 hover:text-pink-500 transition-colors">Kids</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/cart" className="relative text-neutral-700 hover:text-pink-500 transition-colors p-2 flex items-center">
              <span className="text-xs font-semibold tracking-wider uppercase">Cart</span>
              <span className="ml-1.5 bg-neutral-950 text-white text-[10px] font-bold px-2 py-0.5 rounded-full transition-all group-hover:bg-pink-400">
                {cartCount}
              </span>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-neutral-700 hover:text-neutral-900 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 px-4 pt-2 pb-4 space-y-3 shadow-sm">
          <Link href="/category/new-arrivals" className="text-neutral-900 hover:text-pink-500 transition-colors">New Arrivals</Link>
          <Link href="/category/women" className="text-neutral-500 hover:text-pink-500 transition-colors">Women</Link>
          <Link href="/category/men" className="text-neutral-500 hover:text-pink-500 transition-colors">Men</Link>
          <Link href="/category/kids" className="text-neutral-500 hover:text-pink-500 transition-colors">Kids</Link>
          <div className="border-t border-neutral-100 pt-2">
            <Link href="/cart" className="flex justify-between text-xs font-medium tracking-widest uppercase text-pink-600">
              <span>View Active Cart</span>
              <span>({cartCount} Items)</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}