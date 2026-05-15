import Link from "next/link";
import { CheckCircle2, Store } from "lucide-react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sParams = await searchParams;
  const orderNumber = sParams.order as string;

  const shop = await prisma.shop.findUnique({
    where: { slug },
  });

  if (!shop) notFound();

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-100 p-8 md:p-12 text-center shadow-sm">
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-4">Order Confirmed!</h1>
        <p className="text-slate-600 mb-8 max-w-sm mx-auto">
          Thank you for your purchase from <span className="font-semibold text-brand-700">{shop.name}</span>. 
          Your order has been received and is being processed.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-10 text-left">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Tracking No.</p>
          <div className="font-mono text-2xl font-bold text-slate-800 tracking-tight break-all">
            {orderNumber || "PENDING"}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="px-8 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            Track My Order
          </Link>
          <Link
            href={`/store/${shop.slug}`}
            className="px-8 py-3.5 gradient-brand text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
