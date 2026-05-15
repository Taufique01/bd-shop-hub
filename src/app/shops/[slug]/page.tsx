import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ModernCleanTheme } from "@/components/themes";
import { auth } from "@clerk/nextjs/server";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}

async function getShop(slug: string, userId: string | null) {
  return prisma.shop.findFirst({
    where: {
      slug,
      OR: [
        { status: "ACTIVE" },
        {
          owner: {
            clerkId: userId ?? "",
          },
        },
      ],
    },
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
        take: 12,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: {
          category: { select: { name: true } },
          _count: { select: { reviews: true } },
        },
      },
      themeSettings: true,
      _count: {
        select: { products: true, reviews: true },
      },
    },
  });
}

export default async function ShopProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const { userId } = await auth();

  const shop = (await getShop(slug, userId)) as any;

  console.log("shop", slug);
  console.log("user id", userId);
  if (!shop) notFound();

  // 🧱 Themes implementation for Discovery Profile
  const themeProps = {
    shop,
    isProfileMode: true,
    profileImage:
      shop.logoUrl ??
      shop.facebookConnection?.facebookPage?.profilePictureUrl ??
      undefined,
    coverImage:
      shop.coverUrl ??
      shop.coverUrl ??
      shop.facebookConnection?.facebookPage?.coverImageUrl ??
      undefined,

    themeSettings:
      shop.themeSettings?.find((s: any) => s.isActive)?.settings || {},
  };

  return <ModernCleanTheme {...themeProps} />;

  // switch (shop.activeTheme) {
  //   case ThemeType.COLORFUL_SOCIAL:
  //     return <ColorfulSocialTheme {...themeProps} />;
  //   case ThemeType.MINIMAL_BOUTIQUE:
  //     return <MinimalBoutiqueTheme {...themeProps} />;
  //   case ThemeType.MODERN_CLEAN:
  //   default:
  //     return <ModernCleanTheme {...themeProps} />;
  // }
}
