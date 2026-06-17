import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import NewProductForm from "./NewProductForm";

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "seller" && session.user.role !== "admin")) {
    redirect("/login");
  }

  // Securely fetch the seller's available stores to populate the dropdown
  const stores = await prisma.store.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, name: true }
  });

  if (stores.length === 0) {
    redirect("/dashboard/store/new"); // They can't make a product without a store!
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 md:py-20">
       <div className="max-w-4xl mx-auto px-4">
         <h1 className="text-3xl font-medium tracking-tight text-neutral-900 mb-8">Add New Product</h1>
         <div className="bg-white border border-neutral-200 rounded-xs p-6 shadow-sm">
           {/* Pass the valid stores down to the client form */}
           <NewProductForm stores={stores} />
         </div>
       </div>
    </div>
  );
}