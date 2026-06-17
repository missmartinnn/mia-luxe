import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Link from "next/link";
import AccountForm from "./AccountForm"; 

export default async function AccountPage() {
  // 1. Securely fetch the session on the server
  const session = await getServerSession(authOptions);

  // Safely check that the session AND the email exist
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // 2. Fetch the user's latest data using their EMAIL
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }, 
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5, // Show their 5 most recent purchases
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-neutral-900 mb-10">
          My Account
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* LEFT COLUMN: Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white border border-neutral-200 rounded-xs p-5 flex flex-col space-y-4 sticky top-24 shadow-sm">
              <Link href="#profile" className="text-xs font-bold tracking-widest uppercase text-pink-500 transition-colors">
                Profile Overview
              </Link>
              <Link href="#delivery-info" className="text-xs font-bold tracking-widest uppercase text-neutral-400 hover:text-neutral-900 transition-colors">
                Delivery Info
              </Link>
              <Link href="#orders" className="text-xs font-bold tracking-widest uppercase text-neutral-400 hover:text-neutral-900 transition-colors">
                Order History
              </Link>
              
              {/* Conditional link: Only visible to Sellers or Admins */}
              {(user.role === 'seller' || user.role === 'admin') && (
                 <Link href="/dashboard" className="text-xs font-bold tracking-widest uppercase text-emerald-500 hover:text-emerald-600 transition-colors mt-4 pt-4 border-t border-neutral-100">
                  Seller Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Main Content Area */}
          <div className="md:col-span-3 space-y-8">
            
            {/* STATIC READ-ONLY PROFILE OVERVIEW */}
            <div id="profile" className="bg-white border border-neutral-200 rounded-xs p-6 sm:p-8 shadow-sm scroll-mt-28">
              <h2 className="text-lg font-medium text-neutral-900 mb-6 pb-4 border-b border-neutral-100">
                Profile Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Full Name</p>
                  <p className="text-sm font-medium text-neutral-950">{user.name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Email Address</p>
                  <p className="text-sm font-medium text-neutral-950">{user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Account Tier</p>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-xs ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' : user.role === 'seller' ? 'bg-emerald-50 text-emerald-600' : 'bg-pink-50 text-pink-600'}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Settings / Logistics Component (Interactive Form) */}
            <div id="delivery-info" className="scroll-mt-28">
              <AccountForm 
                initialPhone={user.phone || ""} 
                initialAddress={user.address || ""} 
              />
            </div>

            {/* LIVE: Recent Orders Section */}
            <div id="orders" className="bg-white border border-neutral-200 rounded-xs p-6 sm:p-8 shadow-sm scroll-mt-28">
              <h2 className="text-lg font-medium text-neutral-900 mb-6 pb-4 border-b border-neutral-100">
                Recent Orders
              </h2>
              
              {user.orders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-neutral-500 mb-6">
                    You haven't placed any orders yet.
                  </p>
                  <Link href="/" className="inline-block bg-neutral-950 text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-pink-400 transition-colors rounded-xs shadow-sm">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {user.orders.map((order) => (
                    <div key={order.id} className="border border-neutral-200 rounded-xs overflow-hidden text-xs">
                      {/* Order Header */}
                      <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-3 flex justify-between items-center text-neutral-600 flex-wrap gap-2">
                        <div>
                          <span className="font-semibold text-neutral-900">Order ID:</span> <span className="font-mono">{order.id}</span>
                        </div>
                        <div className="flex gap-4 font-medium">
                          <span>{new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
                          <span className="text-neutral-900 font-bold">${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Line Items */}
                      <div className="divide-y divide-neutral-100 px-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-3 flex items-center space-x-4">
                            <div className="w-12 aspect-[3/4] bg-neutral-100 overflow-hidden shrink-0">
                              {item.product?.images?.[0] && (
                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="font-medium text-neutral-950 truncate">{item.product?.name || "Luxury Item"}</h4>
                              <p className="text-[10px] text-neutral-400 mt-0.5">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                            </div>
                            <span className="font-bold text-neutral-900">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Order Status Bar */}
                      <div className="bg-neutral-50/50 border-t border-neutral-100 px-4 py-2 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-neutral-500">Status: <span className="text-pink-500">{order.orderStatus}</span></span>
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-xs">Payment {order.paymentStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}