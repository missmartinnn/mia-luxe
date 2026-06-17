"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { CATEGORIES_DATA } from "../../lib/categories"; // 👇 IMPORT CATEGORIES DATA

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const subCategoryDropdownRef = useRef<HTMLDivElement>(null);
  
  const { cartCount } = useCart();
  const { data: session, status } = useSession();

  const pathname = usePathname();
  const isWorkspace = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (subCategoryDropdownRef.current && !subCategoryDropdownRef.current.contains(event.target as Node)) {
        setIsSubCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLinkClassName = (href: string) => {
    const baseClass = "text-xs font-semibold tracking-widest uppercase transition-all pb-1 border-b-2";
    const isActive = pathname === href;
    
    return isActive 
      ? `${baseClass} text-neutral-900 border-pink-400` 
      : `${baseClass} text-neutral-500 border-transparent hover:text-pink-500`;
  };

  return (
    <nav className="bg-white border-b border-neutral-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {isWorkspace && <div className="w-10 md:w-24"></div>}

          <div className={`flex-shrink-0 ${isWorkspace ? "mx-auto" : ""}`}>
            <Link href="/" className="text-xl font-bold tracking-[0.25em] text-black uppercase">
              MIA<span className="text-pink-400 font-light">LUXE</span>
            </Link>
          </div>

          {!isWorkspace && (
            <div className="hidden md:flex space-x-8 items-center">
              <Link href="/category/new-arrivals" className={getLinkClassName("/category/new-arrivals")}>New Arrivals</Link>
              <Link href="/category/women" className={getLinkClassName("/category/women")}>Women</Link>
              <Link href="/category/men" className={getLinkClassName("/category/men")}>Men</Link>
              <Link href="/category/kids" className={getLinkClassName("/category/kids")}>Kids</Link>

              {/* DYNAMIC SUB COLLECTIONS DROPDOWN */}
              <div className="relative" ref={subCategoryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSubCategoryOpen(!isSubCategoryOpen)}
                  className="text-xs font-semibold tracking-widest uppercase text-neutral-500 hover:text-pink-500 transition-all pb-1 border-b-2 border-transparent flex items-center gap-1"
                >
                  Styles
                  <svg className={`w-3 h-3 transform transition-transform ${isSubCategoryOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isSubCategoryOpen && (
                  <div className="absolute left-0 mt-3 w-64 bg-white border border-neutral-100 shadow-lg py-4 rounded-xs z-50 transition-all max-h-[70vh] overflow-y-auto">
                    {/* Loop through main categories */}
                    {CATEGORIES_DATA.map((category) => (
                      <div key={category.slug} className="mb-4 px-4 last:mb-0">
                        <p className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2 border-b border-neutral-100 pb-1">
                          {category.name}
                        </p>
                        {/* Loop through subcategories */}
                        <div className="space-y-1">
                          {category.subcategories.map((sub) => (
                            <Link 
                              key={`${category.slug}-${sub.slug}`}
                              href={`/category/${category.slug}?type=${sub.slug}`} 
                              onClick={() => setIsSubCategoryOpen(false)} 
                              className="block py-1.5 text-xs font-medium tracking-wider uppercase text-neutral-700 hover:text-pink-500 transition-colors"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 md:space-x-6">
            
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

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-100 shadow-lg py-2 rounded-xs z-50 transition-all">
                    <div className="px-4 py-2 border-b border-neutral-50 mb-1">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest truncate">Signed in as</p>
                      <p className="text-xs font-bold text-neutral-900 truncate">{session.user?.email}</p>
                    </div>
                    
                    <Link href="/account" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-xs font-semibold tracking-wider uppercase text-neutral-700 hover:bg-neutral-50 hover:text-pink-500 transition-colors">
                      My Account
                    </Link>

                    {session.user?.role === "admin" ? (
                      <Link href="/admin" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-xs font-semibold tracking-wider uppercase text-pink-500 hover:bg-pink-50 transition-colors">
                        Super Admin
                      </Link>
                    ) : session.user?.role === "seller" ? (
                      <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-xs font-semibold tracking-wider uppercase text-emerald-600 hover:bg-emerald-50 transition-colors">
                        Seller Dashboard
                      </Link>
                    ) : (
                      <Link href="/dashboard/store/new" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-xs font-semibold tracking-wider uppercase text-emerald-600 hover:bg-emerald-50 transition-colors">
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
              <Link href="/login" className="hidden md:block text-xs font-semibold tracking-wider uppercase text-neutral-700 hover:text-pink-500 transition-colors">
                Log In
              </Link>
            )}

            {!isWorkspace && (
              <Link href="/cart" className="hidden md:flex relative text-neutral-700 hover:text-pink-500 transition-colors p-2 items-center">
                <span className="text-xs font-semibold tracking-wider uppercase">Cart</span>
                <span className="ml-1.5 bg-neutral-950 text-white text-[10px] font-bold px-2 py-0.5 rounded-full transition-all group-hover:bg-pink-400">
                  {cartCount}
                </span>
              </Link>
            )}

            {!isWorkspace && (
              <div className="md:hidden flex items-center space-x-2">
                <button onClick={() => setIsOpen(!isOpen)} className="text-neutral-700 hover:text-neutral-900 focus:outline-none p-2">
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
      </div>

      {isOpen && !isWorkspace && (
        <div className="md:hidden bg-white border-t border-neutral-100 px-4 pt-4 pb-6 space-y-4 shadow-sm flex flex-col text-sm font-medium tracking-widest uppercase overflow-y-auto max-h-[80vh]">
          <Link href="/category/new-arrivals" className="text-left text-neutral-500">New Arrivals</Link>
          <Link href="/category/women" className="text-left text-neutral-500">Women</Link>
          <Link href="/category/men" className="text-left text-neutral-500">Men</Link>
          <Link href="/category/kids" className="text-left text-neutral-500">Kids</Link>
          
          {/* MOBILE DYNAMIC SUB COLLECTIONS */}
          <div className="border-t border-neutral-100 pt-4 space-y-4">
             <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">All Styles</p>
             {CATEGORIES_DATA.map((category) => (
                <div key={`mobile-${category.slug}`} className="pl-2">
                  <p className="text-xs font-bold text-neutral-700 mb-2">{category.name}</p>
                  <div className="space-y-2 pl-2">
                     {category.subcategories.map((sub) => (
                        <Link 
                          key={`mobile-${category.slug}-${sub.slug}`}
                          href={`/category/${category.slug}?type=${sub.slug}`} 
                          className="block text-xs text-neutral-500"
                        >
                          {sub.name}
                        </Link>
                     ))}
                  </div>
                </div>
             ))}
          </div>

          <div className="border-t border-neutral-100 pt-4 flex flex-col space-y-4">
            {status !== "loading" && (
              session ? (
                <>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-widest truncate">
                    Signed in as <span className="font-bold text-neutral-900">{session.user?.email}</span>
                  </div>
                  <Link href="/account" className="text-neutral-900">My Account</Link>

                  {session.user?.role === "admin" ? (
                    <Link href="/admin" className="text-pink-500">Super Admin Dashboard</Link>
                  ) : session.user?.role === "seller" ? (
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