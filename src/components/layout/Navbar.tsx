"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const { cartCount } = useCart();
  const { data: session, status } = useSession();

  // Detect if we are in the seller dashboard
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  // Close profile dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-neutral-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* FLEX TRICK: If dashboard, add a blank invisible div on the left 
            so justify-between keeps the logo perfectly centered 
          */}
          {isDashboard && <div className="w-24 hidden md:block"></div>}

          {/* Logo */}
          <div className={`flex-shrink-0 ${isDashboard ? "mx-auto" : ""}`}>
            <Link href="/" className="text-xl font-bold tracking-[0.25em] text-black uppercase">
              MIA<span className="text-pink-400 font-light">LUXE</span>
            </Link>
          </div>

          {/* Desktop Categories (HIDDEN ON DASHBOARD) */}
          {!isDashboard && (
            <div className="hidden md:flex space-x-8 text-xs font-medium tracking-widest uppercase">
              <Link href="/category/new-arrivals" className="text-neutral-500 hover:text-pink-500 transition-colors">New Arrivals</Link>
              <Link href="/category/women" className="text-neutral-500 hover:text-pink-500 transition-colors">Women</Link>
              <Link href="/category/men" className="text-neutral-500 hover:text-pink-500 transition-colors">Men</Link>
              <Link href="/category/kids" className="text-neutral-500 hover:text-pink-500 transition-colors">Kids</Link>
            </div>
          )}

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Auth State (Profile Icon Dropdown) */}
            {status === "loading" ? (
              <div className="w-5 h-5 rounded-full animate-pulse bg-neutral-100"></div>
            ) : session ? (
              <div className="relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-2 text-neutral-700 hover:text-pink-500 transition-colors focus:outline-none flex items-center justify-center"
                  aria-label="User Profile"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {/* The Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-100 shadow-lg py-2 rounded-xs z-50 transition-all">
                    <div className="px-4 py-2 border-b border-neutral-50 mb-1">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest truncate">Signed in as</p>
                      <p className="text-xs font-bold text-neutral-900 truncate">{session.user?.email}</p>
                    </div>
                    
                    <Link 
                      href="/account" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold tracking-wider uppercase text-neutral-700 hover:bg-neutral-50 hover:text-pink-500 transition-colors"
                    >
                      My Account
                    </Link>

                    {/* DYNAMIC SELLER LINK */}
                    {session.user?.role === "seller" || session.user?.role === "admin" ? (
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold tracking-wider uppercase text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        Seller Dashboard
                      </Link>
                    ) : (
                      <Link 
                        href="/dashboard/store/new" 
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold tracking-wider uppercase text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        Become a Seller
                      </Link>
                    )}

                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-xs font-semibold tracking-wider uppercase text-red-500 hover:bg-red-50 transition-colors border-t border-neutral-50 mt-1"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-xs font-semibold tracking-wider uppercase text-neutral-700 hover:text-pink-500 transition-colors">
                Log In
              </Link>
            )}

            {/* Cart Button (HIDDEN ON DASHBOARD) */}
            {!isDashboard && (
              <Link href="/cart" className="relative text-neutral-700 hover:text-pink-500 transition-colors p-2 flex items-center">
                <span className="text-xs font-semibold tracking-wider uppercase">Cart</span>
                <span className="ml-1.5 bg-neutral-950 text-white text-[10px] font-bold px-2 py-0.5 rounded-full transition-all group-hover:bg-pink-400">
                  {cartCount}
                </span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Actions (HIDDEN ON DASHBOARD) */}
          {!isDashboard && (
            <div className="md:hidden flex items-center space-x-4">
              <Link href="/cart" className="relative text-neutral-700 flex items-center">
                <span className="bg-neutral-950 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              </Link>
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="text-neutral-700 hover:text-neutral-900 focus:outline-none p-2"
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
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown (HIDDEN ON DASHBOARD) */}
      {isOpen && !isDashboard && (
        <div className="md:hidden bg-white border-t border-neutral-100 px-4 pt-4 pb-6 space-y-4 shadow-sm flex flex-col text-sm font-medium tracking-widest uppercase">
          <Link href="/category/new-arrivals" className="text-neutral-500 hover:text-pink-500 transition-colors">New Arrivals</Link>
          <Link href="/category/women" className="text-neutral-500 hover:text-pink-500 transition-colors">Women</Link>
          <Link href="/category/men" className="text-neutral-500 hover:text-pink-500 transition-colors">Men</Link>
          <Link href="/category/kids" className="text-neutral-500 hover:text-pink-500 transition-colors">Kids</Link>
          
          <div className="border-t border-neutral-100 pt-4 flex flex-col space-y-4">
            {status !== "loading" && (
              session ? (
                <>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-widest truncate">
                    Signed in as <span className="font-bold text-neutral-900">{session.user?.email}</span>
                  </div>
                  <Link href="/account" className="text-neutral-900">My Account</Link>

                  {/* DYNAMIC SELLER LINK (MOBILE) */}
                  {session.user?.role === "seller" || session.user?.role === "admin" ? (
                    <Link href="/dashboard" className="text-emerald-600">Seller Dashboard</Link>
                  ) : (
                    <Link href="/dashboard/store/new" className="text-emerald-600">Become a Seller</Link>
                  )}

                  <button onClick={() => signOut()} className="text-left text-red-500">Log Out</button>
                </>
              ) : (
                <Link href="/login" className="text-neutral-900">Log In / Register</Link>
              )
            )}
            <Link href="/cart" className="flex justify-between text-pink-600 pt-2 border-t border-neutral-50">
              <span>View Cart</span>
              <span>({cartCount})</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}