// src/components/ui/ProductCard.tsx
"use client";

import { useState } from "react";
import { Product } from "../../lib/mockData";
import { useCart } from "../../context/CartContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="group relative flex flex-col bg-white border border-neutral-100 p-3 rounded-xs transition-shadow hover:shadow-md">
      {/* Product Image */}
      <div className="w-full aspect-[3/4] bg-neutral-50 overflow-hidden relative rounded-xs">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-102"
        />
      </div>

      {/* Item Metadata & Interactive Options */}
      <div className="mt-4 flex flex-col flex-grow text-left">
        <span className="text-[9px] text-neutral-400 font-bold tracking-widest uppercase mb-1">{product.category}</span>
        <h3 className="text-sm font-medium text-neutral-800 tracking-tight mb-2">
          {product.name}
        </h3>
        
        {/* Variant Selectors */}
        <div className="space-y-2 mb-4">
          {/* Size Selectors */}
          <div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">Size:</span>
            <div className="flex gap-1.5 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`text-[10px] font-bold px-2 py-0.5 border rounded-xs transition-all ${
                    selectedSize === size
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selectors */}
          <div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">Color:</span>
            <div className="flex gap-1.5 flex-wrap">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`text-[10px] px-2 py-0.5 border rounded-xs transition-all ${
                    selectedColor === color
                      ? "border-pink-400 bg-pink-50 text-pink-700"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Price & Add to Cart Trigger */}
        <div className="mt-auto pt-2 border-t border-neutral-50 flex items-center justify-between">
          <span className="text-sm font-bold text-neutral-900">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            className={`text-[10px] font-bold tracking-widest uppercase px-3 py-2 transition-all rounded-xs ${
              isAdded
                ? "bg-emerald-500 text-white"
                : "bg-neutral-950 text-white hover:bg-pink-400"
            }`}
          >
            {isAdded ? "Added ✔" : "Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}