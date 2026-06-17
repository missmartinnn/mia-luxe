import { getServerSession } from "next-auth/next";
import { authOptions } from "../../app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Link from "next/link";

export default async function SellerDashboard() {
  // 1. Secure the route
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 2. Role-Based Access Control (Kick out regular customers)
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    redirect("/account");
  }

  // 3. Fetch the seller's store, their products, AND the connected sales (OrderItems)
  const store = await prisma.store.findFirst({
    where: { ownerId: session.user.id },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: true, // <--- Pulls in all sales data for these products
        },
      },
    },
  });

  // 4. Calculate dynamic financial metrics
  let totalItemsSold = 0;
  let totalRevenue = 0;

  if (store) {
    store.products.forEach((product) => {
      product.orderItems.forEach((orderItem) => {
        totalItemsSold += orderItem.quantity;
        totalRevenue += orderItem.price * orderItem.quantity;
      });
    });
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-neutral-900">
              Seller Dashboard
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Manage your premium storefront and inventory.
            </p>
          </div>
          
          {store && (
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/dashboard/store/new" 
                className="inline-flex items-center justify-center bg-white border border-neutral-200 text-neutral-900 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-50 transition-colors rounded-xs shadow-sm"
              >
                Open New Store
              </Link>
              <Link 
                href="/dashboard/products/new" 
                className="inline-flex items-center justify-center bg-neutral-950 text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-pink-400 transition-colors rounded-xs shadow-sm"
              >
                + Add Product
              </Link>
            </div>
          )}
        </div>

        {/* CONDITION 1: Seller hasn't created a store yet */}
        {!store ? (
          <div className="bg-white border border-neutral-200 rounded-xs p-10 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-medium text-neutral-900 mb-4">
                Welcome to the MIA LUXE Partner Program
              </h2>
              <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                Before you can start listing your luxury fashion items, you need to set up your digital storefront.
              </p>
              <Link 
                href="/dashboard/store/new" 
                className="inline-block bg-neutral-950 text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-pink-400 transition-colors rounded-xs shadow-sm"
              >
                Create Your Store
              </Link>
            </div>
          </div>
        ) : (
          /* CONDITION 2: Seller has a store, show the dashboard */
          <div className="space-y-8">
            
            {/* Quick Stats - UPDATED to 4 columns to include Revenue and Items Sold */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-neutral-200 rounded-xs p-6 shadow-sm">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Store Name</p>
                <p className="text-xl font-medium text-neutral-900 truncate">{store.name}</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xs p-6 shadow-sm">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Total Products</p>
                <p className="text-xl font-medium text-neutral-900">{store.products.length}</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xs p-6 shadow-sm">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Items Sold</p>
                <p className="text-xl font-medium text-neutral-900">{totalItemsSold}</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xs p-6 shadow-sm">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Total Revenue</p>
                <p className="text-xl font-medium text-emerald-600">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            {/* Product Inventory Table */}
            <div className="bg-white border border-neutral-200 rounded-xs shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center">
                <h3 className="text-lg font-medium text-neutral-900">Your Inventory</h3>
              </div>
              
              {store.products.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-neutral-500 mb-4">Your boutique is currently empty.</p>
                  <Link href="/dashboard/products/new" className="text-xs font-bold text-pink-500 uppercase tracking-widest hover:text-pink-600 transition-colors">
                    Upload your first product &rarr;
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-neutral-600">
                    <thead className="bg-neutral-50 text-[10px] uppercase tracking-widest font-bold text-neutral-400 border-b border-neutral-100">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {store.products.map((product) => (
                        <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-neutral-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-100 rounded-xs overflow-hidden shrink-0">
                              {product.images[0] && (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <span className="truncate max-w-[200px]">{product.name}</span>
                          </td>
                          <td className="px-6 py-4">{product.category}</td>
                          <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-xs text-[10px] font-bold uppercase tracking-wider ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link 
                              href={`/dashboard/products/${product.id}/edit`}
                              className="text-xs font-bold tracking-widest uppercase text-neutral-400 hover:text-pink-500 transition-colors"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}