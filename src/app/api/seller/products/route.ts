import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../app/api/auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "seller" && session.user.role !== "admin")) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const { storeId, name, description, price, category, subcategory, sizes, colors, stock, images } = body;

    if (!storeId || !name || !price || !category) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // Security Check: Verify the store exists AND belongs to the seller
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || store.ownerId !== session.user.id) {
       return NextResponse.json({ message: "Invalid store selected." }, { status: 403 });
    }

    const newProduct = await prisma.product.create({
      data: {
        storeId, // <--- NOW IT SAVES TO THE SELECTED STORE!
        name,
        description,
        price: parseFloat(price),
        category,
        subcategory: subcategory || "General",
        sizes: sizes || [],
        colors: colors || [],
        stock: parseInt(stock, 10),
        images: images || [],
      },
    });

    return NextResponse.json(
      { message: "Product created successfully", product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}