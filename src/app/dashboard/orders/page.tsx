import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/user";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Package, Search, Filter } from "lucide-react";

export default async function DashboardOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await getUserByClerkId(userId);
  if (!user || !user.shop) redirect("/onboarding");

  const orders = await prisma.order.findMany({
    where: { shopId: user.shop.id },
    include: {
      items: true,
      buyer: { select: { name: true, profile: { select: { phone: true } } } },
      shippingAddress: true,
    },
    orderBy: { createdAt: "desc" },
  }) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm">Manage and fulfill your shop's orders</p>
        </div>
        <div className="flex items-center gap-2">
           <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Back to Dashboard</Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
           <div className="flex items-center gap-3">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search orders..." 
                 className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
               />
             </div>
             <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
               <Filter className="w-4 h-4" /> Filter
             </button>
           </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No orders found</h3>
            <p className="text-slate-500">You haven't received any orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Order ID & Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-brand-700">#{order.orderNumber}</div>
                      <div className="text-xs text-slate-400 mt-1">{formatDistanceToNow(order.createdAt, { addSuffix: true })}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-semibold text-slate-800">{order.shippingAddress?.fullName || order.buyer.name}</div>
                      <div className="text-xs text-slate-500">{order.shippingAddress?.phone || order.buyer.profile?.phone}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px] mt-1">
                        {order.shippingAddress?.city}, {order.shippingAddress?.addressLine1}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold w-fit
                        ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-slate-900">৳{Number(order.total).toLocaleString()}</div>
                      <div className="text-xs text-slate-500">{order.items.length} item(s)</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <Link 
                        href={`/dashboard/orders/${order.id}`}
                        className="text-brand-600 hover:text-brand-800 font-semibold text-sm underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
