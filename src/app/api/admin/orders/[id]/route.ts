import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const { paymentStatus, orderStatus } = body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { paymentStatus, orderStatus },
    });

    return NextResponse.json({ message: "Order updated successfully.", order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}