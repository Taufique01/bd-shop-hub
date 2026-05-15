import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserByClerkId } from "@/lib/user";
import { productUpdateSchema } from "@/lib/validations";

/**
 * GET /api/products/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        shop: {
          select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true },
        },
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { include: { options: true } },
        reviews: {
          where: { status: "APPROVED" },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, avatarUrl: true } },
            reply: true,
          },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/products/[id]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const dbUser = await getUserByClerkId(userId);
    if (!dbUser?.shop) return NextResponse.json({ message: "No shop" }, { status: 404 });

    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id, shopId: dbUser.shop.id },
    });
    if (!product) {
      return NextResponse.json({ message: "Product not found or unauthorized" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription } : {}),
        ...(data.longDescription !== undefined ? { longDescription: data.longDescription } : {}),
        ...(data.sku !== undefined ? { sku: data.sku } : {}),
        ...(data.price !== undefined ? { price: data.price.toString() } : {}),
        ...(data.salePrice !== undefined
          ? { salePrice: data.salePrice ? data.salePrice.toString() : null }
          : {}),
        ...(data.stockQuantity !== undefined ? { stockQuantity: data.stockQuantity } : {}),
        ...(data.inStock !== undefined ? { inStock: data.inStock } : {}),
        ...(data.mainImageUrl !== undefined ? { mainImageUrl: data.mainImageUrl || null } : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId || null } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
        ...(data.orderableInternally !== undefined
          ? { orderableInternally: data.orderableInternally }
          : {}),
        ...(data.externalInquiryOnly !== undefined
          ? { externalInquiryOnly: data.externalInquiryOnly }
          : {}),
        ...(data.whatsappInquiryTemplate !== undefined
          ? { whatsappInquiryTemplate: data.whatsappInquiryTemplate }
          : {}),
        ...(data.metaTitle !== undefined ? { metaTitle: data.metaTitle } : {}),
        ...(data.metaDescription !== undefined ? { metaDescription: data.metaDescription } : {}),
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("[PRODUCT_UPDATE]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/products/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const dbUser = await getUserByClerkId(userId);
    if (!dbUser?.shop) return NextResponse.json({ message: "No shop" }, { status: 404 });

    const product = await prisma.product.findFirst({
      where: { id, shopId: dbUser.shop.id },
    });
    if (!product) {
      return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
