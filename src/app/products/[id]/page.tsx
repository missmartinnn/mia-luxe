import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import ProductDetailsClient from "./ProductDetailsClient";

export const dynamic = "force-dynamic";

// Next.js 15 requires params to be a Promise
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  // 1. Await the params before using them
  const resolvedParams = await params;
  
  // 2. Fetch the product AND include its related store model to satisfy TypeScript
  const product = await prisma.product.findUnique({
    where: {
      id: resolvedParams.id, 
    },
    include: {
      store: true, // This maps directly to the required 'store' property in ProductWithStore!
    },
  });

  if (!product) {
    notFound();
  }

  // 3. Render with a forced white background wrapper
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-24">
        {/* The component prop type error is now resolved since the store relation is integrated! */}
        <ProductDetailsClient product={product} />
      </div>
    </div>
  );
}