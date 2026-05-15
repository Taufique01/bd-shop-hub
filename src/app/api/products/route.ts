import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserByClerkId } from "@/lib/user";
import { productSchema, productUpdateSchema } from "@/lib/validations";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

async function getUniqueSlug(shopId: string, baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 0;
  while (true) {
    const existing = await prisma.product.findUnique({
      where: { shopId_slug: { shopId, slug } },
    });
    if (!existing || existing.id === excludeId) return slug;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

/**
 * GET /api/products
 * Returns products for the seller's shop (dashboard use).
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser?.shop) return NextResponse.json({ message: "No shop found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const where: any = { shopId: dbUser.shop.id };
    if (status) where.status = status;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: {
          category: { select: { name: true } },
          _count: { select: { reviews: true, orderItems: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[PRODUCTS_LIST]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/products
 * Create a new product. Auto-generates slug from title if not provided.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser?.shop) return NextResponse.json({ message: "No shop found" }, { status: 404 });

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const baseSlug = data.slug || toSlug(data.title);
    const slug = await getUniqueSlug(dbUser.shop.id, baseSlug);

    const product = await prisma.product.create({
      data: {
        shopId: dbUser.shop.id,
        title: data.title,
        slug,
        shortDescription: data.shortDescription ?? null,
        longDescription: data.longDescription ?? null,
        sku: data.sku ?? null,
        price: data.price.toString(),
        salePrice: data.salePrice ? data.salePrice.toString() : null,
        stockQuantity: data.stockQuantity,
        inStock: data.inStock,
        mainImageUrl: data.mainImageUrl || null,
        categoryId: data.categoryId || null,
        tags: data.tags,
        status: data.status,
        isFeatured: data.isFeatured,
        orderableInternally: data.orderableInternally,
        externalInquiryOnly: data.externalInquiryOnly,
        whatsappInquiryTemplate: data.whatsappInquiryTemplate ?? null,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("[PRODUCT_CREATE]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
