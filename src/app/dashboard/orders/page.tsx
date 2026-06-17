import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import OrdersClient from "./OrdersClient";

export default async function SellerOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "seller" && session.user.role !== "admin")) {
    redirect("/login");
  }

  // Fetch orders that contain AT LEAST ONE product belonging to this seller's stores
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            store: {
              ownerId: session.user.id,
            },
          },
        },
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-neutral-50 py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pass the server-fetched data into our interactive client component */}
        <OrdersClient initialOrders={orders} />
      </div>
    </div>
  );
}