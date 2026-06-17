import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Link from "next/link";

export default async function SuperAdminDashboard() {
  const session = await getServerSession(authOptions);

  // 1. Not logged in at all? Kick to login screen.
  if (!session) {
    redirect("/login");
  }

  // 2. Logged in, but NOT a Super Admin? Route them to their proper home.
  if (session.user.role === "seller") {
    redirect("/dashboard");
  } else if (session.user.role === "customer") {
    redirect("/account");
  }

  // 1. Fetch Platform-Wide Metrics
  const [totalUsers, pendingStores, allOrders] = await Promise.all([
    prisma.user.count(),
    prisma.store.findMany({ where: { status: "pending" }, include: { owner: true } }),
    prisma.order.findMany({ select: { totalAmount: true, paymentStatus: true, orderStatus: true } })
  ]);

  // 2. Calculate Global Revenue (Net Volume: Excludes Refunded Orders)
  const globalRevenue = allOrders
    .filter((order) => order.paymentStatus !== "refunded")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="min-h-screen bg-neutral-950 py-12 md:py-20 text-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-neutral-800 flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight mt-1">
              Super Admin Control
            </h1>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">
              Exit to Storefront &rarr;
            </Link>
          </div>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Link href="/admin/users" className="bg-neutral-900 border border-neutral-800 rounded-xs p-6 block hover:border-neutral-700 transition-colors">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Total Users</p>
            <p className="text-2xl font-medium">{totalUsers}</p>
          </Link>
          <Link href="/admin/stores" className="bg-neutral-900 border border-neutral-800 rounded-xs p-6 block hover:border-neutral-700 transition-colors">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Pending Verifications</p>
            <p className="text-2xl font-medium text-pink-500">{pendingStores.length}</p>
          </Link>
          
          <Link href="/admin/orders" className="bg-neutral-900 border border-neutral-800 rounded-xs p-6 block hover:border-neutral-700 transition-colors">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Global Orders</p>
            <p className="text-2xl font-medium">{allOrders.length}</p>
          </Link>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xs p-6">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Platform Volume (Net)</p>
            <p className="text-2xl font-medium text-emerald-400">${globalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Action Required: Verification Queue */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xs p-6">
            <h2 className="text-sm font-bold tracking-widest uppercase text-white mb-6">Verification Queue</h2>
            {pendingStores.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4">No stores pending verification.</p>
            ) : (
              <div className="space-y-4">
                {pendingStores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 rounded-xs">
                    <div>
                      <h3 className="text-sm font-medium text-white">{store.name}</h3>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Owner: {store.owner.email}</p>
                    </div>
                    <Link href={`/admin/stores`} className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-pink-400 hover:text-white transition-colors">
                      Review Docs
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links Menu */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xs p-6">
            <h2 className="text-sm font-bold tracking-widest uppercase text-white mb-6">Command Center</h2>
            <div className="flex flex-col space-y-3">
              <Link href="/admin/users" className="p-4 border border-neutral-800 text-xs font-bold uppercase tracking-widest text-neutral-300 hover:bg-neutral-800 transition-colors flex justify-between">
                Manage Users <span>&rarr;</span>
              </Link>
              <Link href="/admin/orders" className="p-4 border border-neutral-800 text-xs font-bold uppercase tracking-widest text-neutral-300 hover:bg-neutral-800 transition-colors flex justify-between">
                Global Orders <span>&rarr;</span>
              </Link>
              <Link href="/admin/stores" className="p-4 border border-neutral-800 text-xs font-bold uppercase tracking-widest text-neutral-300 hover:bg-neutral-800 transition-colors flex justify-between">
                All Storefronts <span>&rarr;</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}