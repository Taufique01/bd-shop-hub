import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserByClerkId } from "@/lib/user";
import { syncFacebookPageForShop } from "@/lib/facebook-sync";

/**
 * POST /api/facebook/sync
 * Triggers a sync of Facebook Page metrics for the seller's shop.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser?.shop) {
      return NextResponse.json({ message: "No shop found" }, { status: 404 });
    }

    if (!dbUser.shop.facebookConnected) {
      return NextResponse.json(
        { message: "No Facebook Page connected. Connect your page first." },
        { status: 400 }
      );
    }

    const result = await syncFacebookPageForShop(dbUser.shop.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, metricsUpdated: [] },
        { status: 200 } // 200 with error flag so UI can show graceful state
      );
    }

    return NextResponse.json({
      success: true,
      metricsUpdated: result.metricsUpdated,
      metrics: result.metrics
        ? {
            pageId: result.metrics.pageId,
            pageName: result.metrics.pageName,
            likesCount: result.metrics.likesCount?.toString() ?? null,
            followersCount: result.metrics.followersCount?.toString() ?? null,
            commentsCount: result.metrics.commentsCount?.toString() ?? null,
            ratingValue: result.metrics.ratingValue,
            ratingCount: result.metrics.ratingCount,
          }
        : null,
    });
  } catch (error) {
    console.error("[FB_SYNC]", error);
    return NextResponse.json({ message: "Sync failed" }, { status: 500 });
  }
}
