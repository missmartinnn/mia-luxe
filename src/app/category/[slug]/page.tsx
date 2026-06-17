// src/app/category/[slug]/page.tsx
import { prisma } from "../../../lib/prisma"; // Real database import
import ProductCard from "../../../components/ui/ProductCard";
import SearchBar from "../../../components/SearchBar";
export const dynamic = "force-dynamic";

// Next.js 15 requires both params and searchParams to be awaited as Promises
export default async function CategoryPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  
  // 1. Resolve the URLs
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const currentSlug = resolvedParams.slug;
  const currentTypeFilter = typeof resolvedSearchParams.type === 'string' ? resolvedSearchParams.type : null;

  // 2. Format the title
  const pageTitle = currentSlug.replace("-", " ");

  // 3. Fetch the base products for the main category FROM PRISMA
  let baseCategoryProducts;

  if (currentSlug === "new-arrivals") {
    baseCategoryProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 24, 
    });
  } else {
    baseCategoryProducts = await prisma.product.findMany({
      where: {
        category: {
          equals: currentSlug,
          mode: "insensitive" 
        }
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 4. Apply the subcategory filter behind the scenes if present in the URL query (?type=dresses)
  const displayProducts = currentTypeFilter
    ? baseCategoryProducts.filter(p => p.subcategory?.toLowerCase() === currentTypeFilter.toLowerCase())
    : baseCategoryProducts;

  return (
    <div className="bg-white text-neutral-900 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Category Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-light tracking-widest uppercase mb-4">
            {pageTitle} {currentTypeFilter && `• ${currentTypeFilter}`}
          </h1>
          <div className="h-[2px] w-16 bg-pink-300 mx-auto"></div>
        </div>

        {/* Category-Specific Search Bar */}
        <div className="max-w-xl mx-auto mb-16 text-center bg-white p-4 relative z-10">
          <SearchBar />
        </div>

        {/* 👇 THE SUBCATEGORY BUTTON ROW REMOVED FOR A CLEAN HIGH-FASHION LOOK 👇 */}

        {/* Product Grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-neutral-500 border border-neutral-100 bg-neutral-50 rounded-sm">
            <p className="text-sm tracking-widest uppercase font-semibold">No products found.</p>
            <p className="text-xs mt-2">Try checking back later for fresh drops in this collection.</p>
          </div>
        )}
      </div>
    </div>
  );
}