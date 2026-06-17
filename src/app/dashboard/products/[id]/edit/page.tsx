import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import Link from "next/link";
import EditProductForm from "./EditProductForm";


export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "seller" && session.user.role !== "admin")) {
    redirect("/login");
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: true },
  });

  if (!product || product.store?.ownerId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-xs font-bold text-neutral-400 hover:text-pink-500 uppercase tracking-widest transition-colors flex items-center gap-2 mb-4">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-medium tracking-tight text-neutral-900">
            Edit: {product.name}
          </h1>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xs p-6 sm:p-10 shadow-sm">
           <EditProductForm product={product} />
        </div>
      </div>
    </div>
  );
}