import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { shopSearchSchema } from "@/lib/validations";

/**
 * GET /api/shops
 * Public shop directory with search, filter, and sort.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = shopSearchSchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const { q, category, city, sortBy, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: "ACTIVE",
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { fullAbout: { contains: q, mode: "insensitive" } },
      ];
    }

    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }

    if (category) {
      where.category = {
        OR: [
          { slug: { equals: category, mode: "insensitive" } },
          { name: { equals: category, mode: "insensitive" } },
        ],
      };
    }

    // Build order by
    let orderBy: any = { createdAt: "desc" };
    switch (sortBy) {
      case "featured":
        orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
        break;
      case "rating":
        orderBy = { reviews: { _count: "desc" } };
        break;
      case "followers":
        orderBy = { socialMetrics: { followersCount: "desc" } };
        break;
      case "likes":
        orderBy = { socialMetrics: { likesCount: "desc" } };
        break;
      case "most_reviewed":
        orderBy = { reviews: { _count: "desc" } };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          logoUrl: true,
          coverUrl: true,
          city: true,
          isVerified: true,
          isFeatured: true,
          facebookConnected: true,
          whatsappNumber: true,
          messengerLink: true,
          facebookPageUrl: true,
          internalShopEnabled: true,
          storefrontEnabled: true,
          category: { select: { name: true, slug: true } },
          socialMetrics: {
            select: {
              followersCount: true,
              likesCount: true,
              syncedAt: true,
            },
          },
          reviews: {
            where: { status: "APPROVED" },
            select: { rating: true },
          },
          _count: { select: { reviews: true, products: true } },
        },
      }),
      prisma.shop.count({ where }),
    ]);

    // Compute average rating (omit socialMetrics — BigInt is not JSON-serializable)
    const shopsWithStats = shops.map((shop) => {
      const ratings = shop.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10,
            ) / 10
          : null;

      const { reviews, socialMetrics, _count, ...rest } = shop;

      return {
        ...rest,
        avgRating,
        reviewCount: _count.reviews,
        productCount: _count.products,
        followersCount: socialMetrics?.followersCount?.toString() ?? null,
        likesCount: socialMetrics?.likesCount?.toString() ?? null,
      };
    });

    return NextResponse.json({
      shops: shopsWithStats,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[SHOPS_LIST]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
