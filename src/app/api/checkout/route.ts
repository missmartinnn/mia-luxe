import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "../../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    
    const { items, customerName, customerEmail, customerPhone, shippingAddress, totalAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty." }, { status: 400 });
    }

    let authenticatedUserId = null;
    if (session?.user?.email) {
      const userRecord = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (userRecord) {
        authenticatedUserId = userRecord.id;
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      
      const newOrder = await tx.order.create({
        data: {
          // FIX: Use Prisma's relational 'connect' syntax instead of the raw userId scalar
          user: authenticatedUserId ? { connect: { id: authenticatedUserId } } : undefined,
          
          customerName,
          customerEmail,
          customerPhone: customerPhone || "", 
          shippingAddress,
          totalAmount,
          paymentStatus: "paid",
          orderStatus: "processing",
          
          items: {
            create: items.map((item: any) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price, 
              size: item.selectedSize,
              color: item.selectedColor,
            })),
          },
        },
      });

      // Deduct stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return NextResponse.json(
      { message: "Order placed successfully", orderId: order.id }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error("🔥 PRISMA CHECKOUT CRASH:", error);
    return NextResponse.json(
      { message: `Database Error: ${error.message}` }, 
      { status: 500 }
    );
  }
}