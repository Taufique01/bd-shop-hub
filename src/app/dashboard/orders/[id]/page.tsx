import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/user";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Package, User, MapPin, FileText, CheckCircle } from "lucide-react";
import { OrderStatusUpdater } from "./OrderStatusUpdater";

export default async function DashboardOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await getUserByClerkId(userId);
  if (!user || !user.shop) redirect("/onboarding");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      buyer: { select: { name: true, email: true, profiles: { select: { phone: true } } } },
      shippingAddress: true,
      statusLogs: { orderBy: { createdAt: "desc" } },
    },
  }) as any;

  if (!order || order.shopId !== user.shop.id) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Order #{order.orderNumber}
            </h1>
            <p className="text-slate-500 text-sm">Placed on {format(order.createdAt, "MMMM d, yyyy h:mm a")}</p>
          </div>
        </div>
        
        <div className="w-full sm:w-auto">
           <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-500" /> Order Items ({order.items.length})
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-lg border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.productImage ? (
                        <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{item.productTitle}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity} × ৳{Number(item.unitPrice).toLocaleString()}</p>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      ৳{Number(item.totalPrice).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 pl-0 sm:pl-1/2 md:pl-[60%]">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>৳{Number(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 border-b border-slate-100 pb-3">
                  <span>Discount</span>
                  <span>-৳{Number(order.discountAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-slate-900 pt-1">
                  <span>Total</span>
                  <span className="text-brand-700">৳{Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Timeline / Status Logs */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex items-center gap-2">
               Timeline
            </div>
            <div className="p-6">
               {order.statusLogs.length > 0 ? (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                     {order.statusLogs.map((log: any) => (
                        <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-brand-50 text-slate-500 group-[.is-active]:text-brand-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <CheckCircle className="w-5 h-5 fill-current" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                              <div className="font-bold text-slate-900 text-sm">{log.status}</div>
                              <time className="text-xs font-medium text-slate-500">{format(log.createdAt, "h:mm a, MMM d")}</time>
                            </div>
                            <div className="text-slate-500 text-xs">{log.note}</div>
                          </div>
                        </div>
                     ))}
                  </div>
               ) : (
                 <p className="text-sm text-slate-500">No status logs recorded.</p>
               )}
            </div>
          </div>

        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Customer
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
               <div>
                 <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Account</span>
                 <p className="font-medium text-slate-900">{order.buyer.name || "Guest User"}</p>
                 <p>{order.buyer.email}</p>
               </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" /> Shipping
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              {order.shippingAddress ? (
                <>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Shipping To</span>
                    <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Address</span>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress.city}{order.shippingAddress.district ? `, ${order.shippingAddress.district}` : ''} {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Contact Phone</span>
                    <p>{order.shippingAddress.phone}</p>
                  </div>
                </>
              ) : (
                <p>No shipping address provided.</p>
              )}
            </div>
          </div>

          {/* Payment & Notes */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" /> Payment & Notes
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
               <div>
                  <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Method</span>
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    {order.paymentMethod.replace(/_/g, " ")} 
                    <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-500">{order.paymentStatus}</span>
                  </p>
               </div>
               
               {order.notes && (
                 <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Customer Notes</span>
                    <p className="p-3 bg-yellow-50 text-yellow-800 rounded-xl italic border border-yellow-100 text-xs">
                      "{order.notes}"
                    </p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
