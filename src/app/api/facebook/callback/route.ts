import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  fetchUserPages,
} from "@/lib/facebook";
import { TokenStatus } from "@prisma/client";

/**
 * GET /api/facebook/callback
 * Handles the OAuth callback from Facebook.
 * Exchanges code for token, saves FacebookAccount and Pages.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // User denied permission
  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/facebook?error=${encodeURIComponent(errorDescription ?? error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/dashboard/facebook?error=missing_params`);
  }

  // Decode state to get clerkId
  let clerkId: string;
  try {
    clerkId = Buffer.from(state, "base64").toString("utf-8");
  } catch {
    return NextResponse.redirect(`${baseUrl}/dashboard/facebook?error=invalid_state`);
  }

  // Get our DB user
  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) {
    return NextResponse.redirect(`${baseUrl}/dashboard/facebook?error=user_not_found`);
  }

  try {
    // Exchange code for short-lived token
    const { access_token: shortToken } = await exchangeCodeForToken(code);

    // Exchange for long-lived token (60 days)
    const { access_token: longToken, expires_in } = await exchangeForLongLivedToken(shortToken);

    const tokenExpiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // default 60 days

    // Fetch user info
    const meRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture&access_token=${longToken}`
    );
    const meData = await meRes.json();

    // Fetch user's pages
    const pages = await fetchUserPages(longToken);

    // Upsert FacebookAccount
    const fbAccount = await prisma.facebookAccount.upsert({
      where: { facebookUserId: meData.id },
      create: {
        userId: dbUser.id,
        facebookUserId: meData.id,
        facebookName: meData.name,
        facebookEmail: meData.email,
        facebookAvatarUrl: meData.picture?.data?.url,
        accessToken: longToken,
        tokenExpiresAt,
        tokenStatus: TokenStatus.ACTIVE,
        scopes: ["pages_show_list", "pages_read_engagement"],
      },
      update: {
        facebookName: meData.name,
        facebookEmail: meData.email,
        facebookAvatarUrl: meData.picture?.data?.url,
        accessToken: longToken,
        tokenExpiresAt,
        tokenStatus: TokenStatus.ACTIVE,
        lastRefreshedAt: new Date(),
      },
    });

    // Upsert each page the user manages
    for (const page of pages) {
      await prisma.facebookPage.upsert({
        where: { pageId: page.id },
        create: {
          facebookAccountId: fbAccount.id,
          pageId: page.id,
          pageName: page.name,
          category: page.category,
          profilePictureUrl: page.picture?.data?.url,
          pageAccessToken: page.access_token,
          tokenStatus: TokenStatus.ACTIVE,
          syncStatus: "PENDING",
        },
        update: {
          pageName: page.name,
          category: page.category,
          profilePictureUrl: page.picture?.data?.url,
          pageAccessToken: page.access_token,
          tokenStatus: TokenStatus.ACTIVE,
        },
      });
    }

    return NextResponse.redirect(
      `${baseUrl}/dashboard/facebook?connected=true&pages=${pages.length}`
    );
  } catch (error) {
    console.error("[FB_CALLBACK]", error);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/facebook?error=${encodeURIComponent("Failed to connect Facebook account")}`
    );
  }
}
