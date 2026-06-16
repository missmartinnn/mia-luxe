// app/products/[id]/ProductDetailsClient.tsx
"use client";

import { useState } from "react";
// Import from your Prisma generated types so it matches the DB perfectly
import { Product } from "@prisma/client"; 
import { useCart } from "../../../context/CartContext";

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetailsClient({ product }: ProductDetailsProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 bg-white text-neutral-900">
      
      {/* LEFT COLUMN: Image Gallery */}
      <div className="flex flex-col-reverse md:flex-row gap-4">
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto">
          {product.images.map((img, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveImage(img)}
              className={`w-20 h-24 flex-shrink-0 bg-neutral-50 overflow-hidden border transition-all ${
                activeImage === img ? "border-neutral-900" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
        
        <div className="w-full aspect-[3/4] bg-neutral-100 overflow-hidden relative">
          <img
            src={activeImage}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Product Details */}
      <div className="flex flex-col justify-center">
        <span className="text-xs text-neutral-500 font-bold tracking-widest uppercase mb-2">
          {product.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-medium text-neutral-950 tracking-tight mb-4">
          {product.name}
        </h1>
        <p className="text-xl font-bold text-neutral-900 mb-6">
          ${product.price.toFixed(2)}
        </p>
        
        <p className="text-neutral-600 leading-relaxed mb-8">
          {product.description}
        </p>

        <div className="space-y-6 mb-8">
          {/* Colors */}
          <div>
            <span className="text-xs text-neutral-900 uppercase tracking-wider block mb-3 font-medium">
              Color: {selectedColor}
            </span>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border transition-all text-sm ${
                    selectedColor === color
                      ? "border-pink-400 bg-pink-50 text-pink-700 font-medium"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400 bg-white"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <span className="text-xs text-neutral-900 uppercase tracking-wider block mb-3 font-medium">
              Size: {selectedSize}
            </span>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 flex items-center justify-center border font-bold transition-all text-sm ${
                    selectedSize === size
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400 bg-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className={`w-full py-4 uppercase tracking-widest font-bold transition-all ${
            product.stock === 0
              ? "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
              : isAdded
              ? "bg-emerald-500 text-white"
              : "bg-neutral-950 text-white hover:bg-neutral-800 hover:shadow-lg"
          }`}
        >
          {product.stock === 0 ? "Out of Stock" : isAdded ? "Added to Cart ✔" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}