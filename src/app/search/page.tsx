import { prisma } from "../../lib/prisma";
import ProductCard from "../../components/ui/ProductCard";
import SearchFilters from "./SearchFilters";

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string, category?: string, sort?: string }> 
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const category = resolvedParams.category || "";
  const sort = resolvedParams.sort || "newest";

  // 1. Build Prisma Query dynamically based on filters
  const whereClause: any = {
    // Only search verified store products
    store: { status: "verified" }, 
    name: { contains: q, mode: "insensitive" }
  };

  if (category) {
    whereClause.category = category;
  }

  // 2. Build Sorting logic
  let orderByClause: any = { createdAt: "desc" };
  if (sort === "price_asc") orderByClause = { price: "asc" };
  if (sort === "price_desc") orderByClause = { price: "desc" };

  // 3. Fetch Data
  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: { store: true } // Assuming your ProductCard needs store data
  });

  return (
    <div className="bg-white min-h-screen text-neutral-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 border-b border-neutral-200 pb-6">
          <h1 className="text-3xl font-light tracking-widest uppercase mb-2">Search Results</h1>
          {q ? (
            <p className="text-sm text-neutral-500">Showing {products.length} results for <span className="font-bold text-neutral-900">"{q}"</span></p>
          ) : (
            <p className="text-sm text-neutral-500">Showing all {products.length} products</p>
          )}
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <SearchFilters currentCategory={category} currentSort={sort} />
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-neutral-50 border border-neutral-100 rounded-xs">
                <p className="text-sm tracking-widest uppercase font-semibold">No matches found.</p>
                <p className="text-xs mt-2 text-neutral-500">Try removing filters or searching for different keywords.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}