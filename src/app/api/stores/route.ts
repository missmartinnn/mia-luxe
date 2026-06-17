import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/api/auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the request
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // 2. Ensure they are authorized to create a store
    if (session.user.role !== "seller" && session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Only sellers can create stores." }, { status: 403 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ message: "Store name is required" }, { status: 400 });
    }

    // 3. Create the store and link it to the user
    const newStore = await prisma.store.create({
      data: {
        name,
        description,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Store created successfully", store: newStore },
      { status: 201 }
    );
  } catch (error) {
    console.error("Store creation error:", error);
    return NextResponse.json(
      { message: "Something went wrong while creating the store" },
      { status: 500 }
    );
  }
}