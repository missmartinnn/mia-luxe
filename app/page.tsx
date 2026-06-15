// app/page.tsx
export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Banner Section Placeholder */}
      <div className="w-full h-[60vh] bg-neutral-100 flex flex-col justify-center items-center text-center p-6 mb-12 rounded-sm">
        <span className="text-xs tracking-[0.2em] uppercase font-semibold text-neutral-500 mb-2">NEW COLLECTION</span>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-neutral-950">SUMMER TRENDS 2026</h1>
        <p className="text-sm md:text-base text-neutral-600 max-w-md mb-6"> Explore fresh arrivals inspired by the vibrant streets of Kigali.</p>
        <button className="bg-neutral-950 text-white text-xs font-semibold tracking-widest uppercase px-8 py-4 transition-all hover:bg-neutral-800">
          Shop Now
        </button>
      </div>
      
      {/* Content grid placeholder */}
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-6">Trending Categories</h2>
        <p className="text-sm text-neutral-500">Loading your catalog soon...</p>
      </div>
    </div>
  );
}