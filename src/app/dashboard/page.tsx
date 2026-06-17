import { getServerSession } from "next-auth/next";
import { authOptions } from "../../app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Link from "next/link";

export default async function SellerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "seller" && session.user.role !== "admin")) {
    redirect("/login");
  }

  // FETCH ALL STORES OWNED BY THIS SELLER
  const stores = await prisma.store.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        include: { orderItems: true },
      },
    },
  });

  // Calculate Grand Totals across ALL stores
  let grandTotalItemsSold = 0;
  let grandTotalRevenue = 0;
  let totalProducts = 0;

  stores.forEach((store) => {
    totalProducts += store.products.length;
    store.products.forEach((product) => {
      product.orderItems.forEach((orderItem) => {
        grandTotalItemsSold += orderItem.quantity;
        grandTotalRevenue += orderItem.price * orderItem.quantity;
      });
    });
  });

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
              Manage all your storefronts and inventory from one place.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/dashboard/store/new" 
              className="inline-flex items-center justify-center bg-white border border-neutral-200 text-neutral-900 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-50 transition-colors rounded-xs shadow-sm"
            >
              + Open New Store
            </Link>
            {stores.length > 0 && (
              <>
                <Link 
                  href="/dashboard/products/new" 
                  className="inline-flex items-center justify-center bg-neutral-950 text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-pink-400 transition-colors rounded-xs shadow-sm"
                >
                  + Add Product
                </Link>
                <Link 
                  href="/dashboard/orders" 
                  className="inline-flex items-center justify-center bg-white border border-neutral-200 text-neutral-900 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-50 transition-colors rounded-xs shadow-sm"
                >
                  Manage Orders
                </Link>
              </>
            )}
          </div>
        </div>

        {stores.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xs p-10 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-medium text-neutral-900 mb-4">Welcome to the MIA LUXE Partner Program</h2>
              <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                Before you can start listing luxury fashion items, you need to set up your first digital storefront.
              </p>
              <Link href="/dashboard/store/new" className="inline-block bg-neutral-950 text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-pink-400 transition-colors rounded-xs shadow-sm">
                Create Your Store
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Grand Total Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-neutral-200 rounded-xs p-6 shadow-sm">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Active Stores</p>
                <p className="text-xl font-medium text-neutral-900">{stores.length}</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xs p-6 shadow-sm">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Total Catalog</p>
                <p className="text-xl font-medium text-neutral-900">{totalProducts} Items</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xs p-6 shadow-sm">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Lifetime Sold</p>
                <p className="text-xl font-medium text-neutral-900">{grandTotalItemsSold}</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xs p-6 shadow-sm">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Lifetime Revenue</p>
                <p className="text-xl font-medium text-emerald-600">${grandTotalRevenue.toFixed(2)}</p>
              </div>
            </div>

            {/* Individual Store Tables */}
            {stores.map((store) => {
              let storeRevenue = 0;
              let storeSold = 0;
              store.products.forEach(p => p.orderItems.forEach(oi => {
                storeSold += oi.quantity;
                storeRevenue += (oi.price * oi.quantity);
              }));

              return (
                <div key={store.id} className="bg-white border border-neutral-200 rounded-xs shadow-sm overflow-hidden mb-8">
                  <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <div>
                      <h3 className="text-lg font-medium text-neutral-900">{store.name}</h3>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">
                        Revenue: ${storeRevenue.toFixed(2)} • Sales: {storeSold}
                      </p>
                    </div>
                  </div>
                  
                  {store.products.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-neutral-500">This boutique is currently empty.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-neutral-600">
                        <thead className="bg-white text-[10px] uppercase tracking-widest font-bold text-neutral-400 border-b border-neutral-100">
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
                                  {product.images[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
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
                                <Link href={`/dashboard/products/${product.id}/edit`} className="text-xs font-bold tracking-widest uppercase text-neutral-400 hover:text-pink-500 transition-colors">
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}