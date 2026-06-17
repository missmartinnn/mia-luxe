import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import RefundButton from "./RefundButton"; // <-- Import the new button

export default async function AdminGlobalOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  // Fetch every order on the platform
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            include: {
              store: true
            }
          }
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-neutral-950 py-12 text-neutral-50">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="mb-8 border-b border-neutral-800 pb-6">
          <Link href="/admin" className="text-[10px] text-pink-500 uppercase tracking-widest hover:text-white mb-2 block">&larr; Back to Admin Control</Link>
          <h1 className="text-3xl font-medium tracking-tight">Global Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xs p-16 text-center">
            <p className="text-sm font-medium text-white mb-2">No orders have been placed yet.</p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xs overflow-hidden">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950 text-[10px] uppercase tracking-widest font-bold text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th> {/* <-- Added Actions Column */}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-neutral-400">
                      {order.id.split('-')[0]}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{order.customerName}</p>
                      <p className="text-[10px] text-neutral-500">{order.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-400">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-xs text-[9px] font-bold uppercase tracking-wider ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-900/30 text-emerald-400' : 
                          order.paymentStatus === 'refunded' ? 'bg-red-900/30 text-red-400' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {order.paymentStatus}
                        </span>
                        <span className={`px-2 py-1 rounded-xs text-[9px] font-bold uppercase tracking-wider ${
                          order.orderStatus === 'delivered' ? 'bg-emerald-900/30 text-emerald-400' : 
                          order.orderStatus === 'refunded' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* 👇 Insert the Refund Button */}
                      <RefundButton 
                        orderId={order.id} 
                        paymentStatus={order.paymentStatus} 
                        orderStatus={order.orderStatus} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}