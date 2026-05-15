import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserByClerkId } from "@/lib/user";
import { fetchPublicPageMetadata, normalizePageMetrics } from "@/lib/facebook";
import { syncFacebookPageForShop } from "@/lib/facebook-sync";
import { connectFacebookPageSchema } from "@/lib/validations";
import { TokenStatus, SyncStatus } from "@prisma/client";

/**
 * GET /api/facebook/pages
 * Returns pages the seller's connected Facebook account manages.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const fbAccount = await prisma.facebookAccount.findUnique({
      where: { userId: dbUser.id },
      include: {
        pages: true,
      },
    });

    if (!fbAccount) {
      return NextResponse.json({ connected: false, pages: [] });
    }

    return NextResponse.json({
      connected: true,
      account: {
        id: fbAccount.id,
        name: fbAccount.facebookName,
        email: fbAccount.facebookEmail,
        avatarUrl: fbAccount.facebookAvatarUrl,
        tokenStatus: fbAccount.tokenStatus,
      },
      pages: fbAccount.pages.map((p) => ({
        id: p.id,
        pageId: p.pageId,
        pageName: p.pageName,
        category: p.category,
        profilePictureUrl: p.profilePictureUrl,
        followersCount: p.followersCount?.toString() ?? null,
        likesCount: p.likesCount?.toString() ?? null,
      })),
    });
  } catch (error) {
    console.error("[FB_PAGES]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/facebook/pages
 * Connect a Page to the seller's shop (by selecting from list, URL, or Page ID).
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser?.shop) {
      return NextResponse.json({ message: "No shop found. Complete setup first." }, { status: 400 });
    }

    const body = await req.json();
    const parsed = connectFacebookPageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid input", errors: parsed.error.flatten() }, { status: 400 });
    }

    const { pageId, pageUrl, connectedVia } = parsed.data;
    const shopId = dbUser.shop.id;

    let facebookPageRecord: any;

    if (connectedVia === "oauth" && pageId) {
      // Page was selected from OAuth-connected list
      facebookPageRecord = await prisma.facebookPage.findUnique({
        where: { pageId },
      });
      if (!facebookPageRecord) {
        return NextResponse.json({ message: "Page not found. Please reconnect your Facebook account." }, { status: 404 });
      }
    } else {
      // URL or Page ID — fetch public metadata
      const identifier = pageId || pageUrl!;
      try {
        const rawData = await fetchPublicPageMetadata(identifier);
        const metrics = normalizePageMetrics(rawData);

        if (!metrics.pageId) {
          return NextResponse.json({ message: "Could not resolve this Facebook Page. Check the URL or ID." }, { status: 400 });
        }

        // Find or create the page record
        facebookPageRecord = await prisma.facebookPage.upsert({
          where: { pageId: metrics.pageId },
          create: {
            facebookAccountId: (await prisma.facebookAccount.findFirst({ where: { userId: dbUser.id } }))?.id ?? (() => { throw new Error("Connect your Facebook account first to use token-based sync."); })(),
            pageId: metrics.pageId,
            pageName: metrics.pageName,
            pageUsername: metrics.pageUsername,
            pageUrl: metrics.pageUrl,
            category: metrics.category,
            about: metrics.about,
            description: metrics.description,
            profilePictureUrl: metrics.profilePictureUrl,
            coverImageUrl: metrics.coverImageUrl,
            likesCount: metrics.likesCount,
            followersCount: metrics.followersCount,
            ratingValue: metrics.ratingValue,
            ratingCount: metrics.ratingCount,
            syncStatus: SyncStatus.SUCCESS,
            syncSource: "public",
            lastSyncedAt: new Date(),
          },
          update: {
            pageName: metrics.pageName,
            pageUsername: metrics.pageUsername,
            pageUrl: metrics.pageUrl,
            category: metrics.category,
            profilePictureUrl: metrics.profilePictureUrl,
            coverImageUrl: metrics.coverImageUrl,
            likesCount: metrics.likesCount,
            followersCount: metrics.followersCount,
            syncStatus: SyncStatus.SUCCESS,
            syncSource: "public",
            lastSyncedAt: new Date(),
          },
        });
      } catch (fbError) {
        const msg = fbError instanceof Error ? fbError.message : "Facebook API error";
        // Save with nulls — don't block the connection
        facebookPageRecord = await prisma.facebookPage.upsert({
          where: { pageId: pageId ?? pageUrl! },
          create: {
            facebookAccountId: (await prisma.facebookAccount.findFirst({ where: { userId: dbUser.id } }))?.id!,
            pageId: pageId ?? pageUrl!,
            pageName: "Unknown Page",
            syncStatus: SyncStatus.FAILED,
            syncError: msg,
          },
          update: {
            syncStatus: SyncStatus.FAILED,
            syncError: msg,
          },
        });
      }
    }

    // Create or update the connection
    await prisma.facebookPageConnection.upsert({
      where: { shopId },
      create: {
        shopId,
        facebookAccountId: facebookPageRecord.facebookAccountId ?? null,
        facebookPageId: facebookPageRecord.id,
        connectedVia,
      },
      update: {
        facebookAccountId: facebookPageRecord.facebookAccountId ?? null,
        facebookPageId: facebookPageRecord.id,
        connectedVia,
        isActive: true,
        connectedAt: new Date(),
      },
    });

    // Mark shop as connected
    await prisma.shop.update({
      where: { id: shopId },
      data: {
        facebookConnected: true,
        facebookPageId: facebookPageRecord.pageId,
        facebookPageUrl: facebookPageRecord.pageUrl,
        facebookUsername: facebookPageRecord.pageUsername,
        facebookSyncEnabled: true,
      },
    });

    // Trigger async sync
    syncFacebookPageForShop(shopId).catch((e) =>
      console.error("[BACKGROUND_SYNC]", e)
    );

    return NextResponse.json({
      success: true,
      pageId: facebookPageRecord.pageId,
      pageName: facebookPageRecord.pageName,
    });
  } catch (error) {
    console.error("[FB_CONNECT_PAGE]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
