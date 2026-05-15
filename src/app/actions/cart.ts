"use server";

import prisma from "@/lib/prisma";
import { getSessionId } from "@/lib/session";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function addToCart(
  shopId: string,
  productId: string,
  quantity: number = 1
) {
  try {
    const { userId } = await auth();
    const sessionId = userId ? undefined : await getSessionId();

    if (!shopId || !productId) {
      throw new Error("Missing required fields");
    }

    // First check if cart exists for user/session AND shop
    let cart = await prisma.cart.findFirst({
      where: {
        shopId,
        ...(userId ? { userId } : { sessionId }),
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          shopId,
          ...(userId ? { userId } : { sessionId }),
        },
      });
    }

    // Check if the item already exists in the cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: { increment: quantity },
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    revalidatePath("/store/[slug]/p/[productSlug]", "page");
    revalidatePath("/store/[slug]/cart", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
) {
  try {
    const { userId } = await auth();
    const sessionId = userId ? undefined : await getSessionId();

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) throw new Error("Cart item not found");

    if (
      (userId && cartItem.cart.userId !== userId) ||
      (!userId && cartItem.cart.sessionId !== sessionId)
    ) {
      throw new Error("Unauthorized");
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    } else {
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    revalidatePath("/store/[slug]/cart", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeFromCart(cartItemId: string) {
  return updateCartItemQuantity(cartItemId, 0);
}

export async function getCart(shopId: string) {
  try {
    const { userId } = await auth();
    const sessionId = userId ? undefined : await getSessionId();

    const cart = await prisma.cart.findFirst({
      where: {
        shopId,
        ...(userId ? { userId } : { sessionId }),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                salePrice: true,
                mainImageUrl: true,
                inStock: true,
                stockQuantity: true,
              },
            },
          },
        },
      },
    });

    // Merge carts if user just logged in? (Advanced logic omitted for now to keep things simple)
    
    return cart;
  } catch (error) {
    console.error("Fetch cart error:", error);
    return null;
  }
}

export async function emptyCart(shopId: string) {
  try {
    const { userId } = await auth();
    const sessionId = userId ? undefined : await getSessionId();

    const cart = await prisma.cart.findFirst({
      where: { shopId, ...(userId ? { userId } : { sessionId }) },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
  } catch (error) {
    console.error("Empty cart error:", error);
  }
}
