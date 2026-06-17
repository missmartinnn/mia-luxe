import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import UserBanButton from "./UserBanButton"; 
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-neutral-950 py-12 text-neutral-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8 border-b border-neutral-800 pb-6">
          <Link href="/admin" className="text-[10px] text-pink-500 uppercase tracking-widest hover:text-white mb-2 block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-medium tracking-tight">User Management</h1>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xs overflow-hidden">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950 text-[10px] uppercase tracking-widest font-bold text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-neutral-800 text-[9px] uppercase tracking-widest rounded-xs">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    {/* Don't let admins ban themselves! */}
                    {user.id !== session.user.id ? (
                      <UserBanButton userId={user.id} isBanned={user.isBanned} />
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest text-neutral-500">Super Admin</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}