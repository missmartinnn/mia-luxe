// src/lib/mockData.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;    // Main department: "Women", "Men", "Kids"
  subcategory: string; // Specific type: "Dresses", "Skirts", "Knitwear", "Jeans"
  sizes: string[];
  colors: string[];
  stock: number;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Amour Pastel Silk Slip Dress",
    description: "A luxurious, lightweight silk slip dress featuring an elegant drape and soft pastel undertones.",
    price: 89.00,
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80"],
    category: "Women",
    subcategory: "Dresses",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Blush Pink", "Cream"],
    stock: 12
  },
  {
    id: "prod-2",
    name: "Classic Linen Oversized Blazer",
    description: "Tailored structured blazer woven from breathable linen. Perfect for layering from brunch to evening events.",
    price: 120.00,
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80"],
    category: "Women",
    subcategory: "Outerwear",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Oatmeal", "Black"],
    stock: 8
  },
  {
    id: "prod-3",
    name: "Mia Soft Knit Cropped Cardigan",
    description: "Ultra-soft premium knit cardigan styled with elegant tortoiseshell accent buttons.",
    price: 65.00,
    images: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80"],
    category: "Women",
    subcategory: "Knitwear",
    sizes: ["XS", "S", "M"],
    colors: ["Pastel Rose", "Powder Blue"],
    stock: 15
  },
  {
    id: "prod-4",
    name: "Ethereal Pleated Midi Skirt",
    description: "High-waisted flowing midi skirt featuring precise sunburst pleating and a hidden side zipper closure.",
    price: 75.00,
    images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"],
    category: "Women",
    subcategory: "Skirts",
    sizes: ["S", "M", "L"],
    colors: ["Champagne", "Soft Sage"],
    stock: 20
  },
  {
    id: "prod-5",
    name: "Vintage Wash Straight Jeans",
    description: "Classic high-rise straight leg denim with a vintage faded wash.",
    price: 85.00,
    images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80"],
    category: "Women",
    subcategory: "Jeans",
    sizes: ["26", "28", "30", "32"],
    colors: ["Vintage Blue", "Charcoal"],
    stock: 30
  }
];