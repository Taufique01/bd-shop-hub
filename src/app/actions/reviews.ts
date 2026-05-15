"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { shopReviewSchema, productReviewSchema, reviewReplySchema } from "@/lib/validations";

export async function createShopReview(data: z.infer<typeof shopReviewSchema>) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsed = shopReviewSchema.parse(data);

    // Get the internal user relation
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return { error: "User not found" };

    // Check if review already exists
    const existing = await prisma.shopReview.findUnique({
      where: {
        shopId_userId: {
          shopId: parsed.shopId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return { error: "You have already reviewed this shop" };
    }

    const review = await prisma.shopReview.create({
      data: {
        shopId: parsed.shopId,
        userId: user.id,
        rating: parsed.rating,
        title: parsed.title,
        body: parsed.body,
        status: "APPROVED", // Auto-approve for demo, can be PENDING based on settings
      },
    });

    const shop = await prisma.shop.findUnique({ where: { id: parsed.shopId } });
    if (shop) {
      revalidatePath(`/shops/${shop.slug}`);
      revalidatePath(`/store/${shop.slug}`);
    }

    return { success: true, data: review };
  } catch (err: any) {
    return { error: err.message || "Something went wrong" };
  }
}

export async function createProductReview(data: z.infer<typeof productReviewSchema>) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsed = productReviewSchema.parse(data);

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return { error: "User not found" };

    const existing = await prisma.productReview.findUnique({
      where: {
        productId_userId: {
          productId: parsed.productId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return { error: "You have already reviewed this product" };
    }

    const review = await prisma.productReview.create({
      data: {
        productId: parsed.productId,
        userId: user.id,
        rating: parsed.rating,
        title: parsed.title,
        body: parsed.body,
        status: "APPROVED",
      },
      include: {
        product: {
          include: { shop: true },
        },
      },
    });

    revalidatePath(`/store/${review.product.shop.slug}/p/${review.product.slug}`);
    revalidatePath(`/shops/${review.product.shop.slug}`);

    return { success: true, data: review };
  } catch (err: any) {
    return { error: err.message || "Something went wrong" };
  }
}

export async function toggleReviewVote(reviewId: string, type: "shop" | "product", isHelpful: boolean = true) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return { error: "User not found" };

    // Simply log a helpful vote or unvote
    // Find if voted
    const existingVote = await prisma.reviewVote.findFirst({
      where: {
        userId: user.id,
        shopReviewId: type === "shop" ? reviewId : undefined,
        productReviewId: type === "product" ? reviewId : undefined,
      },
    });

    if (existingVote) {
      // Toggle logic - if already voted to the same, remove it
      if (existingVote.isHelpful === isHelpful) {
        await prisma.reviewVote.delete({ where: { id: existingVote.id } });
        // update count
        if (type === "shop") {
          await prisma.shopReview.update({
            where: { id: reviewId },
            data: { helpfulCount: { decrement: 1 } },
          });
        } else {
          await prisma.productReview.update({
            where: { id: reviewId },
            data: { helpfulCount: { decrement: 1 } },
          });
        }
        return { success: true, voted: false };
      } else {
         // Changing vote isn't supported gracefully right now, just ignore or update if downvotes were added
         return { success: true, voted: true };
      }
    } else {
      await prisma.reviewVote.create({
        data: {
          userId: user.id,
          shopReviewId: type === "shop" ? reviewId : undefined,
          productReviewId: type === "product" ? reviewId : undefined,
          isHelpful,
        },
      });
      // update count
      if (type === "shop") {
        await prisma.shopReview.update({
          where: { id: reviewId },
          data: { helpfulCount: { increment: 1 } },
        });
      } else {
        await prisma.productReview.update({
          where: { id: reviewId },
          data: { helpfulCount: { increment: 1 } },
        });
      }
      return { success: true, voted: true };
    }
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function reportReview(reviewId: string, type: "shop" | "product", reason: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return { error: "User not found" };

    await prisma.reviewReport.create({
      data: {
        userId: user.id,
        shopReviewId: type === "shop" ? reviewId : undefined,
        productReviewId: type === "product" ? reviewId : undefined,
        reason,
      },
    });

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ----------------------------------------------------
// Seller Actions
// ----------------------------------------------------

export async function replyToReview(reviewId: string, type: "shop" | "product", replyBody: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsed = reviewReplySchema.parse({ body: replyBody });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return { error: "User not found" };

    // Verify ownership
    if (type === "shop") {
      const review = await prisma.shopReview.findUnique({
        where: { id: reviewId },
        include: { shop: true },
      });
      if (!review || review.shop.ownerId !== user.id) return { error: "Unauthorized to reply" };
      
      await prisma.sellerReviewReply.upsert({
        where: { shopReviewId: reviewId },
        update: { body: parsed.body },
        create: { shopReviewId: reviewId, body: parsed.body },
      });
    } else {
      const review = await prisma.productReview.findUnique({
        where: { id: reviewId },
        include: { product: { include: { shop: true } } },
      });
      if (!review || review.product.shop.ownerId !== user.id) return { error: "Unauthorized to reply" };

      await prisma.sellerReviewReply.upsert({
        where: { productReviewId: reviewId },
        update: { body: parsed.body },
        create: { productReviewId: reviewId, body: parsed.body },
      });
    }

    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateReviewStatus(reviewId: string, type: "shop" | "product", status: "APPROVED" | "REJECTED" | "HIDDEN") {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return { error: "User not found" };

    if (type === "shop") {
      const review = await prisma.shopReview.findUnique({
        where: { id: reviewId },
        include: { shop: true },
      });
      if (!review || review.shop.ownerId !== user.id) return { error: "Unauthorized" };
      await prisma.shopReview.update({ where: { id: reviewId }, data: { status } });
    } else {
      const review = await prisma.productReview.findUnique({
        where: { id: reviewId },
        include: { product: { include: { shop: true } } },
      });
      if (!review || review.product.shop.ownerId !== user.id) return { error: "Unauthorized" };
      await prisma.productReview.update({ where: { id: reviewId }, data: { status } });
    }

    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
