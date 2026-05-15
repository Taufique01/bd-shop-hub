import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCart } from "@/app/actions/cart";
import { CheckoutFormClient } from "./CheckoutFormClient";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/sign-in?redirect_url=/store/${slug}/checkout`);
  }

  const shop = await prisma.shop.findUnique({
    where: { slug },
  });

  if (!shop) notFound();

  const cart = await getCart(shop.id);
  
  if (!cart || cart.items.length === 0) {
    redirect(`/store/${shop.slug}/cart`);
  }

  const subtotal = cart.items.reduce((acc: number, item: any) => acc + (Number(item.product.salePrice ?? item.product.price) * item.quantity), 0);
  const cartItemsCount = cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="container flex items-center h-14">
          <Link
            href={`/store/${shop.slug}/cart`}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Cart</span>
          </Link>
        </div>
      </nav>

      <div className="container py-10 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
            {shop.logoUrl ? (
              <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Store className="w-6 h-6" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
            <p className="text-slate-500 text-sm">{shop.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <CheckoutFormClient shopId={shop.id} shopSlug={shop.slug} />
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>
                
                <ul className="mb-6 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                   {cart.items.map((item: any) => (
                      <li key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-lg flex-shrink-0 relative overflow-hidden">
                           {item.product.mainImageUrl && (
                             <img src={item.product.mainImageUrl} alt="" className="w-full h-full object-cover" />
                           )}
                           <div className="absolute -top-2 -right-2 bg-slate-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                             {item.quantity}
                           </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{item.product.title}</p>
                          <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                           ৳{(Number(item.product.salePrice ?? item.product.price) * item.quantity).toLocaleString()}
                        </div>
                      </li>
                   ))}
                </ul>

                <div className="space-y-3 text-sm mb-6 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({cartItemsCount} items)</span>
                    <span className="font-medium text-slate-900">
                      ৳{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="font-medium text-slate-900">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-brand-700 pt-3 border-t border-slate-100">
                    <span>Total</span>
                    <span>
                      ৳{subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
