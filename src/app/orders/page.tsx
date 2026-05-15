import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Clock, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function BuyerOrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/orders");
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  
  const orders = dbUser ? await prisma.order.findMany({
    where: { buyerId: dbUser.id },
    include: {
      shop: { select: { name: true, slug: true, logoUrl: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  }) : [];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No orders yet</h2>
            <p className="text-slate-500 mb-6">You haven't placed any orders yet. Start exploring shops!</p>
            <Link href="/" className="px-6 py-3 gradient-brand text-white rounded-xl font-semibold">
              Browse Shops
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <Link href={`/shops/${order.shop.slug}`} className="font-bold text-slate-900 hover:text-brand-600 block mb-1">
                      {order.shop.name}
                    </Link>
                    <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Order #{order.orderNumber}</span>
                       <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDistanceToNow(order.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit
                      ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      Total: ৳{Number(order.total).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                          {item.productImage ? (
                            <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-slate-300 m-auto mt-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{item.productTitle}</p>
                          <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          ৳{Number(item.totalPrice).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
