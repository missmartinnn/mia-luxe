import { prisma } from "../lib/prisma"; 
import ProductCard from "../components/ui/ProductCard";
import SearchBar from "../components/SearchBar";
export const dynamic = "force-dynamic";

// 1. Make the component `async` so we can securely fetch from the database
export default async function Home() {
  
  // 2. Fetch the 8 most recently added products for the homepage
  const displayProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 8, 
  });

  return (
    <div className="bg-white text-neutral-900 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Editorial High-Fashion Hero Banner */}
        <div className="w-full h-[50vh] bg-pink-50/60 flex flex-col justify-center items-center text-center p-6 mb-12 rounded-sm border border-pink-100/40">
          <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-pink-400 mb-3">MIA LUXE SUMMER COLLECTION</span>
          <h1 className="text-3xl md:text-5xl font-extralight tracking-widest mb-4 uppercase">
            Elegance Defined
          </h1>
          <p className="text-xs text-neutral-500 max-w-sm tracking-wide leading-relaxed mb-8">
            Explore curated linen tailoring, soft knits, and romantic silhouettes designed to elevate your everyday rotation.
          </p>
          <button className="bg-neutral-950 text-white text-[10px] font-bold tracking-[0.2em] uppercase px-8 py-3.5 transition-all hover:bg-pink-400 shadow-xs">
            Discover Runway
          </button>
        </div>
        
        {/* 👇 NEW: Search Bar Section */}
        <div className="max-w-2xl mx-auto mb-16 text-center">
          <h2 className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-4">Find Your Signature Look</h2>
          <SearchBar />
        </div>

        {/* Dynamic Product Grid Header */}
        <div className="text-left mb-8">
          <h2 className="text-lg font-medium tracking-widest uppercase mb-2">Curated Arrivals</h2>
          <div className="h-[2px] w-12 bg-pink-300"></div>
        </div>

        {/* Dynamic Product Grid Render */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-neutral-500 border border-neutral-100 bg-neutral-50 rounded-sm">
            <p className="text-sm tracking-widest uppercase font-semibold">No products found.</p>
            <p className="text-xs mt-2">Our sellers are preparing new items. Check back soon for fresh drops.</p>
          </div>
        )}
        
      </div>
    </div>
  );
}