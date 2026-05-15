import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserByClerkId } from "@/lib/user";
import { shopUpdateSchema } from "@/lib/validations";

/**
 * GET /api/shops/me
 * Returns the authenticated seller's shop.
 */

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const shop = await prisma.shop.findUnique({
      where: { ownerId: dbUser.id },
      include: {
        category: true,
        facebookConnection: { include: { facebookPage: true } },
        socialMetrics: true,
        themeSettings: true,
        faqs: { orderBy: { sortOrder: "asc" } },
        policies: true,
        businessHours: { orderBy: { dayOfWeek: "asc" } },
        _count: { select: { products: true, reviews: true, orders: true } },
      },
    });

    if (!shop) {
      return NextResponse.json({ shop: null });
    }
    const safeShop = serializeBigInt(shop);
    console.log(safeShop);

    return NextResponse.json({ shop: safeShop });
  } catch (error) {
    console.error("[SHOP_ME]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/shops/me
 * Update the authenticated seller's shop.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser?.shop) {
      return NextResponse.json({ message: "No shop found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = shopUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { slug, ...updates } = parsed.data;

    // If slug is changing, verify it's unique
    if (slug && slug !== dbUser.shop.slug) {
      const existing = await prisma.shop.findUnique({ where: { slug } });
      if (existing && existing.id !== dbUser.shop.id) {
        return NextResponse.json(
          { message: "This URL slug is already taken" },
          { status: 409 },
        );
      }
    }

    const shop = await prisma.shop.update({
      where: { id: dbUser.shop.id },
      data: {
        ...(slug ? { slug } : {}),
        ...updates,
      },
    });

    return NextResponse.json({ shop });
  } catch (error) {
    console.error("[SHOP_UPDATE]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
