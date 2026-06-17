import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route"; // Double check this path matches your directory structure
import { prisma } from "../../../../../lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "seller" && session.user.role !== "admin")) {
      return NextResponse.json({ message: "Unauthorized access detected." }, { status: 403 });
    }

    // Security Check: Ensure the product belongs to a store owned by this user
    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!product || product.store?.ownerId !== session.user.id) {
      return NextResponse.json({ message: "You do not have permission to edit this product." }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, category, subcategory, sizes, colors, stock, images } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ message: "Missing required form fields." }, { status: 400 });
    }

    // Execute the update
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
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

    return NextResponse.json({ message: "Product successfully updated.", product: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ message: "Internal server error during product update." }, { status: 500 });
  }
}