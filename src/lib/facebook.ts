/**
 * Facebook Graph API Service
 * Handles all interaction with Meta's Graph API for page data fetching.
 * If a metric is unavailable due to permissions/app review, it stores null
 * and callers should show "Unavailable" rather than fake values.
 */

const FB_API_VERSION = process.env.FACEBOOK_API_VERSION ?? "v19.0";
const FB_BASE = `https://graph.facebook.com/${FB_API_VERSION}`;

export interface FacebookPageData {
  id: string;
  name: string;
  username?: string | null;
  link?: string | null;
  about?: string | null;
  description?: string | null;
  category?: string | null;
  picture?: { data: { url: string } } | null;
  cover?: { source: string } | null;
  fan_count?: number | null; // likes count
  followers_count?: number | null;
  overall_star_rating?: number | null;
  rating_count?: number | null;
  verification_status?: string | null;
  messenger_ads_default_icebreakers?: string[] | null;
}

export interface FacebookUserPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  picture?: { data: { url: string } };
}

export interface NormalizedPageMetrics {
  pageId: string;
  pageName: string;
  pageUsername: string | null;
  pageUrl: string | null;
  profilePictureUrl: string | null;
  coverImageUrl: string | null;
  category: string | null;
  about: string | null;
  description: string | null;
  likesCount: bigint | null;
  followersCount: bigint | null;
  commentsCount: bigint | null; // usually null unless special permissions
  ratingValue: number | null;
  ratingCount: number | null;
  verificationStatus: string | null;
}

/**
 * Fetch the list of Pages that the authenticated user manages.
 */
export async function fetchUserPages(
  userAccessToken: string,
): Promise<FacebookUserPage[]> {
  const fields = "id,name,access_token,category,picture";
  const url = `${FB_BASE}/me/accounts?fields=${fields}&access_token=${userAccessToken}`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Facebook API error fetching pages: ${err?.error?.message ?? res.statusText}`,
    );
  }

  const data = await res.json();
  return (data?.data ?? []) as FacebookUserPage[];
}

/**
 * Fetch full page metadata for a given Page ID using a page access token.
 * Falls back gracefully when fields are unavailable.
 */
export async function fetchPageMetadata(
  pageId: string,
  accessToken: string,
): Promise<FacebookPageData> {
  const fields = [
    "id",
    "name",
    "username",
    "link",
    "about",
    "description",
    "category",
    "picture.type(large)",
    "cover",
    "fan_count",
    "followers_count",
    "overall_star_rating",
    "rating_count",
    "verification_status",
  ].join(",");

  const url = `${FB_BASE}/${pageId}?fields=${fields}&access_token=${accessToken}`;
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Facebook API error for page ${pageId}: ${err?.error?.message ?? res.statusText}`,
    );
  }

  return res.json() as Promise<FacebookPageData>;
}

/**
 * Fetch public page metadata using App Token (no user auth required).
 * Used when seller connects via URL or Page ID only.
 * Returns fewer metrics due to permission restrictions.
 */
export async function fetchPublicPageMetadata(
  pageIdOrUrl: string,
): Promise<Partial<FacebookPageData>> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("Facebook App credentials not configured");
  }

  // Get app access token
  const tokenRes = await fetch(
    `${FB_BASE}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`,
    { next: { revalidate: 3600 } },
  );

  if (!tokenRes.ok) {
    throw new Error("Failed to obtain Facebook app access token");
  }

  const { access_token: appToken } = await tokenRes.json();

  // Extract page ID from URL if needed
  let pageId = pageIdOrUrl;
  if (pageIdOrUrl.includes("facebook.com/")) {
    const match = pageIdOrUrl.match(
      /facebook\.com\/(?:pg\/|pages\/[^/]+\/)?([^/?]+)/,
    );
    if (match) pageId = match[1];
  }

  const fields = [
    "id",
    "name",
    "username",
    "link",
    "about",
    "description",
    "category",
    "picture.type(large)",
    "cover",
    "fan_count",
    "followers_count",
    "verification_status",
  ].join(",");

  const url = `${FB_BASE}/${pageId}?fields=${fields}&access_token=${appToken}`;
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Facebook public API error: ${err?.error?.message ?? res.statusText}`,
    );
  }

  return res.json();
}

/**
 * Normalize raw Facebook page data into our internal metrics format.
 * Always null-safe — missing metrics become null, never fake values.
 */
export function normalizePageMetrics(
  raw: Partial<FacebookPageData>,
): NormalizedPageMetrics {
  return {
    pageId: raw.id ?? "",
    pageName: raw.name ?? "",
    pageUsername: raw.username ?? null,
    pageUrl: raw.link ?? null,
    profilePictureUrl: raw.picture?.data?.url ?? null,
    coverImageUrl: raw.cover?.source ?? null,
    category: raw.category ?? null,
    about: raw.about ?? null,
    description: raw.description ?? null,
    likesCount: raw.fan_count != null ? BigInt(raw.fan_count) : null,
    followersCount:
      raw.followers_count != null ? BigInt(raw.followers_count) : null,
    commentsCount: null, // Not available via standard Graph API without special permissions
    ratingValue: raw.overall_star_rating ?? null,
    ratingCount: raw.rating_count ?? null,
    verificationStatus: raw.verification_status ?? null,
  };
}

/**
 * Exchange a short-lived user token for a long-lived token (60 days).
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
): Promise<{ access_token: string; expires_in: number }> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("Facebook App credentials not configured");
  }

  const url = `${FB_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Token exchange failed: ${err?.error?.message ?? res.statusText}`,
    );
  }

  return res.json();
}

/**
 * Build the Facebook OAuth authorization URL.
 */
export function buildFacebookAuthUrl(state?: string): string {
  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  if (!appId || !redirectUri) {
    throw new Error("Facebook App ID or redirect URI not configured");
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: ["public_profile", "pages_show_list", "pages_read_engagement"].join(
      ",",
    ),
    response_type: "code",
    ...(state ? { state } : {}),
  });

  return `https://www.facebook.com/dialog/oauth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token.
 */
export async function exchangeCodeForToken(
  code: string,
): Promise<{ access_token: string; expires_in?: number }> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    throw new Error("Facebook App credentials not configured");
  }

  const url = `${FB_BASE}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Code exchange failed: ${err?.error?.message ?? res.statusText}`,
    );
  }

  return res.json();
}
