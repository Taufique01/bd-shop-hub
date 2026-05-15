"use server";

import prisma from "@/lib/prisma";
import { getCart, emptyCart } from "@/app/actions/cart";
import { auth } from "@clerk/nextjs/server";
import { checkoutSchema } from "@/lib/validations";
import { redirect } from "next/navigation";

function generateOrderNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "ORD-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function processCheckout(data: any, shopId: string) {
  try {
    const { userId } = await auth();
    // Validate schema
    const parsedData = checkoutSchema.parse(data);

    // Fetch cart
    const cart = await getCart(shopId);
    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    const subtotal = cart.items.reduce(
      (acc: number, item: any) =>
        acc + Number(item.product.salePrice ?? item.product.price) * item.quantity,
      0
    );

    const dbUser = userId 
      ? await prisma.user.findUnique({ where: { clerkId: userId } }) 
      : null;

    if (!dbUser && !userId) {
      throw new Error("You must be logged in to place an order. Please sign in or register.");
    }
    
    if (userId && !dbUser) {
        throw new Error("User record not found. Please re-login.");
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId: dbUser!.id,
          shopId,
          status: "PENDING",
          paymentMethod: parsedData.paymentMethod,
          paymentStatus: "UNPAID",
          subtotal,
          discountAmount: 0,
          total: subtotal,
          notes: parsedData.notes,
        },
      });

      // 2. Create Shipping Address
      await tx.shippingAddress.create({
        data: {
          orderId: newOrder.id,
          ...parsedData.shippingAddress,
        },
      });

      // 3. Create OrderItems & Deduct Inventory
      for (const cartItem of cart.items) {
        const itemPrice = Number(cartItem.product.salePrice ?? cartItem.product.price);
        
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            unitPrice: itemPrice,
            totalPrice: itemPrice * cartItem.quantity,
            productTitle: cartItem.product.title,
            productImage: cartItem.product.mainImageUrl,
          },
        });

        // Basic inventory deduction
        if (cartItem.product.inStock) {
           await tx.product.update({
             where: { id: cartItem.productId },
             data: {
               stockQuantity: {
                 decrement: cartItem.quantity,
               },
             }
           });
           
           // If it becomes 0 or less we should mark out of stock. We can't do logic directly in Prisma's decrement
           // But normally you'd check afterwards or omit it for simple apps. By default hozoborolo lets the cron/update do it.
        }
      }

      return newOrder;
    });

    // 4. Empty Cart
    await emptyCart(shopId);

    return { success: true, orderNumber: order.orderNumber };
  } catch (error: any) {
    console.error("Checkout processing error", error);
    return { success: false, error: error.message || "Failed to process checkout" };
  }
}
