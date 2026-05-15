import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";
import { ModernCleanTheme } from "@/components/themes/ModernCleanTheme";
import { ColorfulSocialTheme } from "@/components/themes/ColorfulSocialTheme";
import { MinimalBoutiqueTheme } from "@/components/themes/MinimalBoutiqueTheme";
import { ThemeType } from "@prisma/client";
import { AlertCircle, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { getCart } from "@/app/actions/cart";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getShop(slug: string) {
  return prisma.shop.findUnique({
    where: { slug },
    include: {
      category: true,
      facebookConnection: {
        include: { facebookPage: true },
      },
      socialMetrics: true,
      faqs: { orderBy: { sortOrder: "asc" } },
      policies: true,
      businessHours: { orderBy: { dayOfWeek: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, avatarUrl: true } },
          reply: true,
        },
      },
      products: {
        where: { status: "PUBLISHED" },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      },
      themeSettings: true,
      _count: {
        select: { products: true, reviews: true },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const shop = (await getShop(slug)) as any;
  if (!shop) return { title: "Shop not found" };

  return {
    title: `${shop.name} | Store`,
    description:
      shop.shortDescription ?? `Shop from ${shop.name} on Hozoborolo`,
    openGraph: {
      title: `${shop.name} Store`,
      description: shop.shortDescription ?? "",
      images: shop.coverUrl ? [shop.coverUrl] : [],
      url: absoluteUrl(`/store/${shop.slug}`),
    },
  };
}

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params;
  const shop = (await getShop(slug)) as any;
  if (!shop) notFound();

  // 🛑 Storefront Protection
  if (!shop.storefrontEnabled) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-slate-100 shadow-xl text-center">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-4">
            Storefront Locked
          </h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            This shop premium storefront hasn't been activated by the seller.
            You can still view their profile and contact them directly.
          </p>
          <Link
            href={`/shops/${shop.slug}`}
            className="inline-flex items-center gap-2 font-bold text-brand-600 hover:text-brand-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Go back to Shop Profile
          </Link>
        </div>
      </div>
    );
  }

  const cart = await getCart(shop.id);
  const cartItemCount =
    cart?.items?.reduce(
      (sumValue: number, item: any) => sumValue + item.quantity,
      0,
    ) || 0;

  // 🧱 Themes implementation
  const themeProps = {
    shop,
    cartItemCount,
    themeSettings: shop.themeSettings || [],
  };

  switch (shop.activeTheme) {
    case ThemeType.COLORFUL_SOCIAL:
      return <ColorfulSocialTheme {...themeProps} />;
    case ThemeType.MINIMAL_BOUTIQUE:
      return <MinimalBoutiqueTheme {...themeProps} />;
    case ThemeType.MODERN_CLEAN:
    default:
      return <ModernCleanTheme {...themeProps} />;
  }
}
