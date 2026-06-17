import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "seller" && session.user.role !== "admin")) {
      return NextResponse.json({ message: "Unauthorized access detected." }, { status: 403 });
    }

    const body = await req.json();
    const { orderStatus, paymentStatus } = body;

    // Secure Update: Ensure we are only updating valid fields
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
      },
    });

    return NextResponse.json({ message: "Order updated successfully.", order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ message: "Internal server error during order update." }, { status: 500 });
  }
}