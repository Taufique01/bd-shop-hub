"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/user";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await getUserByClerkId(userId);
    if (!user || !user.shop) {
      throw new Error("Unauthorized");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.shopId !== user.shop.id) {
      throw new Error("Order not found or unauthorized");
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      await tx.orderStatusLog.create({
         data: {
           orderId,
           status,
           note: `Status updated to ${status} by seller`
         }
      });
    });

    revalidatePath(`/dashboard/orders`);
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
