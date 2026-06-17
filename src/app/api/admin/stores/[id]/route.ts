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

    const { status } = await req.json(); // "verified" or "rejected"

    const updatedStore = await prisma.store.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ message: `Store ${status}.`, store: updatedStore });
  } catch (error) {
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}