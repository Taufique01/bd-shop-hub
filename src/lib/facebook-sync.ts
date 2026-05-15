/**
 * Facebook Page Sync Service
 * Orchestrates syncing Facebook Page metrics to our database.
 */

import prisma from "@/lib/prisma";
import {
  fetchPageMetadata,
  fetchPublicPageMetadata,
  normalizePageMetrics,
  NormalizedPageMetrics,
} from "@/lib/facebook";
import { SyncStatus, TokenStatus } from "@prisma/client";

interface SyncResult {
  success: boolean;
  metrics?: NormalizedPageMetrics;
  error?: string;
  metricsUpdated: string[];
}

/**
 * Sync a connected Facebook Page for a given shop.
 * Handles both token-based (full) and public-only (partial) sync.
 */
export async function syncFacebookPageForShop(
  shopId: string
): Promise<SyncResult> {
  const startTime = Date.now();

  // Get the connection and page info
  const connection = await prisma.facebookPageConnection.findUnique({
    where: { shopId },
    include: {
      facebookPage: true,
    },
  });

  if (!connection) {
    return { success: false, error: "No Facebook Page connected", metricsUpdated: [] };
  }

  const page = connection.facebookPage;

  // Mark sync as in-progress
  await prisma.facebookPage.update({
    where: { id: page.id },
    data: { syncStatus: SyncStatus.SYNCING },
  });

  try {
    let rawData: Partial<any>;
    let syncSource: string;

    if (page.pageAccessToken && page.tokenStatus === TokenStatus.ACTIVE) {
      // Full sync with page access token
      rawData = await fetchPageMetadata(page.pageId, page.pageAccessToken);
      syncSource = "page_token";
    } else {
      // Public sync — fewer metrics available
      rawData = await fetchPublicPageMetadata(page.pageId);
      syncSource = "public";
    }

    const metrics = normalizePageMetrics(rawData);
    const metricsUpdated: string[] = [];

    // Build update data, tracking what changed
    const updateData: Record<string, any> = {
      syncStatus: SyncStatus.SUCCESS,
      syncError: null,
      syncSource,
      lastSyncedAt: new Date(),
    };

    if (metrics.pageName) { updateData.pageName = metrics.pageName; metricsUpdated.push("pageName"); }
    if (metrics.pageUsername !== undefined) { updateData.pageUsername = metrics.pageUsername; metricsUpdated.push("pageUsername"); }
    if (metrics.pageUrl !== undefined) { updateData.pageUrl = metrics.pageUrl; metricsUpdated.push("pageUrl"); }
    if (metrics.profilePictureUrl !== undefined) { updateData.profilePictureUrl = metrics.profilePictureUrl; metricsUpdated.push("profilePictureUrl"); }
    if (metrics.coverImageUrl !== undefined) { updateData.coverImageUrl = metrics.coverImageUrl; metricsUpdated.push("coverImageUrl"); }
    if (metrics.category !== undefined) { updateData.category = metrics.category; metricsUpdated.push("category"); }
    if (metrics.about !== undefined) { updateData.about = metrics.about; metricsUpdated.push("about"); }
    if (metrics.description !== undefined) { updateData.description = metrics.description; metricsUpdated.push("description"); }
    if (metrics.likesCount !== undefined) { updateData.likesCount = metrics.likesCount; metricsUpdated.push("likesCount"); }
    if (metrics.followersCount !== undefined) { updateData.followersCount = metrics.followersCount; metricsUpdated.push("followersCount"); }
    if (metrics.commentsCount !== undefined) { updateData.commentsCount = metrics.commentsCount; }
    if (metrics.ratingValue !== undefined) { updateData.ratingValue = metrics.ratingValue; metricsUpdated.push("ratingValue"); }
    if (metrics.ratingCount !== undefined) { updateData.ratingCount = metrics.ratingCount; metricsUpdated.push("ratingCount"); }
    if (metrics.verificationStatus !== undefined) { updateData.verificationStatus = metrics.verificationStatus; }

    // Update the facebook_pages record
    await prisma.facebookPage.update({
      where: { id: page.id },
      data: updateData,
    });

    // Update shop_social_metrics
    await prisma.shopSocialMetrics.upsert({
      where: { shopId },
      create: {
        shopId,
        facebookPageId: metrics.pageId,
        facebookPageUrl: metrics.pageUrl,
        likesCount: metrics.likesCount,
        followersCount: metrics.followersCount,
        commentsCount: metrics.commentsCount,
        ratingAverageExternal: metrics.ratingValue,
        reviewCountExternal: metrics.ratingCount,
        syncedAt: new Date(),
        syncStatus: SyncStatus.SUCCESS,
      },
      update: {
        facebookPageId: metrics.pageId,
        facebookPageUrl: metrics.pageUrl,
        likesCount: metrics.likesCount,
        followersCount: metrics.followersCount,
        commentsCount: metrics.commentsCount,
        ratingAverageExternal: metrics.ratingValue,
        reviewCountExternal: metrics.ratingCount,
        syncedAt: new Date(),
        syncStatus: SyncStatus.SUCCESS,
        syncError: null,
      },
    });

    // Log the sync
    await prisma.facebookSyncLog.create({
      data: {
        facebookPageId: page.id,
        syncStatus: SyncStatus.SUCCESS,
        syncSource,
        metricsUpdated,
        duration: Date.now() - startTime,
      },
    });

    return { success: true, metrics, metricsUpdated };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown sync error";

    // Update page with error state
    await prisma.facebookPage.update({
      where: { id: page.id },
      data: {
        syncStatus: SyncStatus.FAILED,
        syncError: errorMessage,
        lastSyncedAt: new Date(),
      },
    });

    await prisma.shopSocialMetrics.upsert({
      where: { shopId },
      create: {
        shopId,
        syncStatus: SyncStatus.FAILED,
        syncError: errorMessage,
        syncedAt: new Date(),
      },
      update: {
        syncStatus: SyncStatus.FAILED,
        syncError: errorMessage,
        syncedAt: new Date(),
      },
    });

    // Log failure
    await prisma.facebookSyncLog.create({
      data: {
        facebookPageId: page.id,
        syncStatus: SyncStatus.FAILED,
        errorMessage,
        metricsUpdated: [],
        duration: Date.now() - startTime,
      },
    });

    return { success: false, error: errorMessage, metricsUpdated: [] };
  }
}
