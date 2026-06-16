// app/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import ProductDetailsClient from "./ProductDetailsClient";

// Next.js 15 requires params to be a Promise
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  // 1. Await the params before using them!
  const resolvedParams = await params;
  
  // 2. Fetch the product
  const product = await prisma.product.findUnique({
    where: {
      id: resolvedParams.id, 
    },
  });

  if (!product) {
    notFound();
  }

  // 3. Render with a forced white background wrapper
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-24">
        <ProductDetailsClient product={product} />
      </div>
    </div>
  );
}