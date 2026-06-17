import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

// 1. FETCH THE USER'S SAVED DEFAULTS
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { name: true, email: true, phone: true, address: true }
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Profile fetch crash:", error);
    return NextResponse.json({ message: "Internal fetch error." }, { status: 500 });
  }
}

// 2. UPDATE THE USER'S SAVED DEFAULTS
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address } = body; // Make sure to pull name out too!

    // Persist changes back to the authenticated users table record
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || undefined, // undefined prevents erasing the name if it wasn't sent
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