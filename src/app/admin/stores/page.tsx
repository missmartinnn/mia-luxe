import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import StoreActionButtons from "./StoreActionButtons"; // Created below

export default async function AdminStoresPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  // Fetch all stores, placing pending ones at the top
  const stores = await prisma.store.findMany({
    include: { owner: true },
    orderBy: [
      { status: 'desc' }, // 'pending' comes before 'verified' alphabetically, but let's just sort by date
      { createdAt: 'desc' }
    ],
  });

  return (
    <div className="min-h-screen bg-neutral-950 py-12 text-neutral-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8 border-b border-neutral-800 pb-6">
          <Link href="/admin" className="text-[10px] text-pink-500 uppercase tracking-widest hover:text-white mb-2 block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-medium tracking-tight">Store Management</h1>
        </div>

        <div className="space-y-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-neutral-900 border border-neutral-800 rounded-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-medium text-white">{store.name}</h3>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-xs ${
                    store.status === 'verified' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' : 
                    store.status === 'rejected' ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 
                    'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
                  }`}>
                    {store.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">Owner: {store.owner.email}</p>
                {store.verificationDoc && (
                  <a href={store.verificationDoc} target="_blank" rel="noreferrer" className="text-[10px] text-pink-500 hover:underline mt-2 inline-block">
                    View Business License/ID &rarr;
                  </a>
                )}
              </div>
              
              {/* Only show action buttons if it's pending */}
              {store.status === "pending" && (
                <StoreActionButtons storeId={store.id} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}