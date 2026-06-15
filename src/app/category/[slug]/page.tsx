// src/app/category/[slug]/page.tsx
import { MOCK_PRODUCTS } from "../../../lib/mockData";
import ProductCard from "../../../components/ui/ProductCard";
import Link from "next/link";

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

  // 3. Get the base products for the main category (Women, Men, etc.)
  const baseCategoryProducts = currentSlug === "new-arrivals" 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(product => product.category.toLowerCase() === currentSlug.toLowerCase());

  // 4. Extract a unique list of subcategories so we can build the filter menu dynamically
  const availableSubcategories = Array.from(new Set(baseCategoryProducts.map(p => p.subcategory)));

  // 5. Apply the subcategory filter if the user clicked one
  const displayProducts = currentTypeFilter
    ? baseCategoryProducts.filter(p => p.subcategory.toLowerCase() === currentTypeFilter.toLowerCase())
    : baseCategoryProducts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Category Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-light tracking-widest text-neutral-900 uppercase mb-4">
          {pageTitle}
        </h1>
        <div className="h-[2px] w-16 bg-pink-300 mx-auto"></div>
      </div>

      {/* Subcategory Filter Menu */}
      {availableSubcategories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {/* "All" button clears the filter */}
          <Link 
            href={`/category/${currentSlug}`} 
            className={`text-[10px] font-bold tracking-widest uppercase px-4 py-2 border transition-all ${
              !currentTypeFilter 
                ? "border-neutral-900 bg-neutral-900 text-white" 
                : "border-neutral-200 text-neutral-600 hover:border-neutral-900"
            }`}
          >
            All
          </Link>
          
          {/* Dynamic buttons for Jeans, Skirts, Dresses, etc. */}
          {availableSubcategories.map((sub) => (
            <Link 
              key={sub} 
              href={`/category/${currentSlug}?type=${sub.toLowerCase()}`}
              className={`text-[10px] font-bold tracking-widest uppercase px-4 py-2 border transition-all ${
                currentTypeFilter === sub.toLowerCase()
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-900"
              }`}
            >
              {sub}
            </Link>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {displayProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-neutral-500 border border-neutral-100 bg-neutral-50 rounded-sm">
          <p className="text-sm tracking-widest uppercase font-semibold">No {currentTypeFilter} found.</p>
          <p className="text-xs mt-2">Try clearing your filters or check back later for fresh drops.</p>
        </div>
      )}
    </div>
  );
}