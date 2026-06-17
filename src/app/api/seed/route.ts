import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    // 1. Fetch available stores
    const stores = await prisma.store.findMany();
    
    if (stores.length === 0) {
      return NextResponse.json(
        { error: "No stores found! Please create a store in the dashboard first." },
        { status: 400 }
      );
    }

    // 2. Wipe the old mock products clean
    await prisma.product.deleteMany({});

    // 3. Define the fast-fashion, trendy batch of products (Shein/Zara vibes)
    const trendyProducts = [
      // WOMEN
      { name: "Ruched Mesh Bodycon Dress", category: "women", subcategory: "dresses", price: 24.99 },
      { name: "Sheer Organza Corset Top", category: "women", subcategory: "tops-blouses", price: 18.50 },
      { name: "Y2K Low-Rise Cargo Flare Jeans", category: "women", subcategory: "jeans", price: 32.99 },
      { name: "Pleated Micro-Mini Skirt", category: "women", subcategory: "skirts", price: 15.99 },
      { name: "Oversized Faux-Leather Moto Jacket", category: "women", subcategory: "outerwear", price: 54.99 },
      { name: "Chunky Platform Loafers", category: "women", subcategory: "shoes", price: 38.00 },
      
      // MEN
      { name: "Abstract Print Camp Collar Shirt", category: "men", subcategory: "shirts", price: 19.99 },
      { name: "Relaxed Fit Carpenter Jeans", category: "men", subcategory: "jeans", price: 29.99 },
      { name: "Heavyweight Boxy Graphic Hoodie", category: "men", subcategory: "hoodies-sweats", price: 28.50 },
      { name: "Unstructured Oversized Blazer", category: "men", subcategory: "suits-tailoring", price: 45.99 },
      { name: "Nylon Parachute Bomber Jacket", category: "men", subcategory: "outerwear", price: 49.99 },
      { name: "Chunky Sole Tech Sneakers", category: "men", subcategory: "shoes", price: 42.00 },
      
      // KIDS
      { name: "Ribbed Neutral Romper Set", category: "kids", subcategory: "baby-unisex", price: 14.99 },
      { name: "Checkered Knit Cardigan", category: "kids", subcategory: "girls-clothing", price: 22.50 },
      { name: "Relaxed Fit Cargo Pants", category: "kids", subcategory: "boys-clothing", price: 24.99 },
      { name: "Mini Velcro Platform Kicks", category: "kids", subcategory: "shoes", price: 26.99 },
    ];

    // 4. Map the products and distribute them evenly across the available stores
    const productsToInsert = trendyProducts.map((p, index) => {
      // Rotate through stores evenly
      const assignedStore = stores[index % stores.length]; 

      return {
        name: p.name,
        description: "A trendy, everyday staple to level up your closet. Great fit, comfortable fabric, and totally aesthetic.",
        price: p.price,
        category: p.category,
        subcategory: p.subcategory,
        stock: 50,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Black", "White", "Beige", "Pink"], // Normal, everyday colors
        // A clean, neutral placeholder image so your grid looks nice until you edit them
        images: ["https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop"],
        storeId: assignedStore.id,
      };
    });

    // 5. Bulk insert into the database
    await prisma.product.createMany({
      data: productsToInsert,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully wiped the old items and dropped ${productsToInsert.length} affordable fast-fashion items distributed across ${stores.length} stores.` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}