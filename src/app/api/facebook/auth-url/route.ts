import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserByClerkId } from "@/lib/user";
import {
  buildFacebookAuthUrl,
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  fetchUserPages,
  fetchPageMetadata,
  normalizePageMetrics,
} from "@/lib/facebook";
import { syncFacebookPageForShop } from "@/lib/facebook-sync";
import { TokenStatus, SyncStatus } from "@prisma/client";

/**
 * GET /api/facebook/auth-url
 * Returns the Facebook OAuth URL for the seller to initiate login.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const state = Buffer.from(userId).toString("base64");
    const url = buildFacebookAuthUrl(state);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[FB_AUTH_URL]", error);
    return NextResponse.json({ message: "Failed to generate auth URL" }, { status: 500 });
  }
}
