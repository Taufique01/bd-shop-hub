import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserByClerkId } from "@/lib/user";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";

/**
 * GET /api/orders
 * Returns orders for the current user (buyer or seller scoped).
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") ?? "buyer"; // "buyer" or "seller"
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (scope === "seller" && dbUser.shop) {
      where.shopId = dbUser.shop.id;
    } else {
      where.buyerId = dbUser.id;
    }
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { product: { select: { title: true, mainImageUrl: true } } },
          },
          shippingAddress: true,
          shop: { select: { name: true, slug: true, logoUrl: true } },
          buyer: { select: { name: true, profile: { select: { phone: true } } } },
          statusLogs: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[ORDERS_LIST]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Place an order from cart items.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid input", errors: parsed.error.flatten() }, { status: 400 });
    }

    const { shopId, shippingAddress, paymentMethod, notes } = parsed.data;

    // Get cart for this user and shop
    const cart = await prisma.cart.findFirst({
      where: { userId: dbUser.id, shopId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      const price = Number(item.product.salePrice ?? item.product.price);
      return sum + price * item.quantity;
    }, 0);

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          buyerId: dbUser.id,
          shopId,
          paymentMethod,
          notes,
          subtotal: subtotal.toString(),
          total: subtotal.toString(),
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: (item.product.salePrice ?? item.product.price).toString(),
              totalPrice: (Number(item.product.salePrice ?? item.product.price) * item.quantity).toString(),
              variantInfo: item.variantInfo ?? undefined,
              productTitle: item.product.title,
              productImage: item.product.mainImageUrl,
            })),
          },
          shippingAddress: {
            create: shippingAddress,
          },
          statusLogs: {
            create: { status: "PENDING", note: "Order placed" },
          },
        },
      });

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return NextResponse.json({ order, orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    console.error("[ORDER_CREATE]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
