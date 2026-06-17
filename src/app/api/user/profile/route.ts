import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { phone, address } = body;

    // Persist changes back to the authenticated users table record
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        phone: phone || null,
        address: address || null,
      },
    });

    return NextResponse.json(
      { message: "Profile telemetry synchronized.", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile synchronization crash:", error);
    return NextResponse.json({ message: "Internal record mutation error." }, { status: 500 });
  }
}