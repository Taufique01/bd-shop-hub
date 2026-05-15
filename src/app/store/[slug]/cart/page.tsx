import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCart } from "@/app/actions/cart";
import { CartItemsList } from "./CartItemsList";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

export default async function CartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const shop = await prisma.shop.findUnique({
    where: { slug },
  });

  if (!shop) notFound();

  const cart = await getCart(shop.id);

  const cartItemsCount = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="container flex items-center h-14">
          <Link
            href={`/store/${shop.slug}`}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to {shop.name}</span>
          </Link>
        </div>
      </nav>

      <div className="container py-10 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
            {shop.logoUrl ? (
              <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Store className="w-6 h-6" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Cart</h1>
            <p className="text-slate-500 text-sm">from {shop.name}</p>
          </div>
        </div>

        {cartItemsCount === 0 || !cart ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Store className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-6">Looks like you haven't added anything from {shop.name} yet.</p>
            <Link
              href={`/store/${shop.slug}`}
              className="px-6 py-3 gradient-brand text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <CartItemsList cartItems={cart.items} shopSlug={shop.slug} />
            </div>

            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Items ({cartItemsCount})</span>
                    <span className="font-medium text-slate-900">
                      ৳{cart.items.reduce((acc: number, item: any) => acc + (Number(item.product.salePrice ?? item.product.price) * item.quantity), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-3">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-brand-700 pt-1">
                    <span>Subtotal</span>
                    <span>
                      ৳{cart.items.reduce((acc: number, item: any) => acc + (Number(item.product.salePrice ?? item.product.price) * item.quantity), 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/store/${shop.slug}/checkout`}
                  className="w-full flex justify-center items-center py-3.5 gradient-brand text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
