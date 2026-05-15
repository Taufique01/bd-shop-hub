"use client";
import { FacebookIcon } from "@/components/icons";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Users,
  ThumbsUp,
  MessageSquare,
  Star,
  Unlink,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { formatNumber, timeAgo } from "@/lib/utils";

interface FacebookPageInfo {
  connected: boolean;
  account?: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    tokenStatus: string;
  };
  pages?: Array<{
    id: string;
    pageId: string;
    pageName: string;
    category?: string;
    profilePictureUrl?: string;
    followersCount?: string;
    likesCount?: string;
  }>;
}

interface ShopMetrics {
  followersCount: string | null;
  likesCount: string | null;
  commentsCount: string | null;
  ratingAverageExternal: number | null;
  syncedAt: string | null;
  syncStatus: string;
  syncError: string | null;
}

export default function FacebookSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [fbInfo, setFbInfo] = useState<FacebookPageInfo | null>(null);
  const [shopConnected, setShopConnected] = useState(false);
  const [metrics, setMetrics] = useState<ShopMetrics | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [shopFbPageName, setShopFbPageName] = useState<string>("");

  useEffect(() => {
    loadFacebookData();
  }, []);

  async function loadFacebookData() {
    setLoading(true);
    try {
      const [fbRes, shopRes] = await Promise.all([
        fetch("/api/facebook/pages"),
        fetch("/api/shops/me"),
      ]);
      const fbData = await fbRes.json();
      const shopData = await shopRes.json();

      setFbInfo(fbData);
      if (shopData.shop) {
        setShopConnected(shopData.shop.facebookConnected);
        setMetrics(shopData.shop.socialMetrics);
        setShopFbPageName(
          shopData.shop.facebookConnection.facebookPage.pageName,
        );
      }
    } catch (err) {
      toast.error("Failed to load  data");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectFacebook() {
    try {
      const res = await fetch("/api/facebook/auth-url");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Failed to start  connection");
    }
  }

  async function handleConnectPage() {
    setConnecting(true);
    try {
      let body: any = { connectedVia: "oauth" };
      body.pageId = selectedPageId;

      const res = await fetch("/api/facebook/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(`Connected "${data.pageName}" successfully!`);
      loadFacebookData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to connect page",
      );
    } finally {
      setConnecting(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/facebook/sync", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        toast.success(`Synced! Updated: ${data.metricsUpdated.join(", ")}`);
        loadFacebookData();
      } else {
        toast.error(
          data.error ??
            "Sync returned no data — some metrics may be unavailable due to app permissions.",
        );
      }
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900"> Integration</h1>
        <p className="text-slate-500 mt-1">
          Connect your Page to display social proof to buyers.
        </p>
      </div>

      {/*  Account */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <FacebookIcon className="w-5 h-5 text-fb-500" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900"> Account</h2>
            <p className="text-xs text-slate-500">Used to access your Pages</p>
          </div>
        </div>

        {fbInfo?.connected && fbInfo.account ? (
          <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
            {fbInfo.account.avatarUrl && (
              <img
                src={fbInfo.account.avatarUrl}
                alt={fbInfo.account.name}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-slate-900">
                {fbInfo.account.name}
              </p>
              {fbInfo.account.email && (
                <p className="text-xs text-slate-500">{fbInfo.account.email}</p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Connected · Token {fbInfo.account.tokenStatus}
                </span>
              </div>
            </div>
            <button
              onClick={handleConnectFacebook}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Reconnect
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <FacebookIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-600 mb-4 text-sm">
              Connect your account to access your Pages and sync metrics.
            </p>
            <button
              onClick={handleConnectFacebook}
              className="flex items-center gap-2 px-6 py-3 bg-fb-500 text-white rounded-xl font-semibold hover:bg-fb-600 transition-colors mx-auto"
            >
              <FacebookIcon className="w-4 h-4" />
              Connect with
            </button>
          </div>
        )}
      </div>

      {/* Connect a Page */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-bold text-slate-900 mb-5">Connect Page</h2>

        <div>
          {fbInfo?.pages && fbInfo.pages.length > 0 ? (
            <div className="space-y-2 mb-4">
              {fbInfo.pages.map((page) => (
                <label
                  key={page.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPageId === page.pageId
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-200 hover:border-brand-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="page"
                    value={page.pageId}
                    checked={selectedPageId === page.pageId}
                    onChange={() => setSelectedPageId(page.pageId)}
                    className="text-brand-600"
                  />
                  {page.profilePictureUrl ? (
                    <img
                      src={page.profilePictureUrl}
                      alt={page.pageName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FacebookIcon className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {page.pageName}
                    </p>
                    {page.category && (
                      <p className="text-xs text-slate-500">{page.category}</p>
                    )}
                  </div>
                  {page.followersCount && (
                    <span className="text-xs text-slate-500">
                      {formatNumber(parseInt(page.followersCount))} followers
                    </span>
                  )}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 mb-4 text-center py-4">
              {fbInfo?.connected
                ? "No pages found. Make sure you manage at least one  Page."
                : "Connect your  account first to see your pages."}
            </p>
          )}
          <button
            onClick={handleConnectPage}
            disabled={!selectedPageId || connecting}
            className="w-full py-3 gradient-brand text-white font-semibold rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {connecting ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              "Connect Selected Page"
            )}
          </button>
        </div>
      </div>

      {/* Synced Metrics */}
      {shopConnected && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-slate-900">Facebook Page</h2>
              <p className="text-sm text-slate-600">{shopFbPageName}</p>

              {metrics?.syncedAt && (
                <p className="text-xs text-slate-400 mt-1">
                  Last synced {timeAgo(metrics.syncedAt)}
                </p>
              )}
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-xl text-sm font-semibold hover:bg-brand-100 transition-colors disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync Now"}
            </button>
          </div>

          {metrics?.syncError && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-700">Sync error</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {metrics.syncError}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Followers",
                value: metrics?.followersCount,
                icon: Users,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Page Likes",
                value: metrics?.likesCount,
                icon: ThumbsUp,
                color: "text-brand-600",
                bg: "bg-brand-50",
              },
              {
                label: "Comments",
                value: metrics?.commentsCount,
                icon: MessageSquare,
                color: "text-purple-600",
                bg: "bg-purple-50",
                note: "Requires special permissions",
              },
              {
                label: "Avg Rating",
                value: metrics?.ratingAverageExternal,
                icon: Star,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map((metric) => (
              <div key={metric.label} className={`${metric.bg} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                  <span className="text-xs text-slate-600 font-medium">
                    {metric.label}
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {metric.value != null ? (
                    formatNumber(Number(metric.value))
                  ) : (
                    <span className="text-sm font-normal text-slate-400">
                      Unavailable
                    </span>
                  )}
                </div>
                {metric.note && (
                  <p className="text-xs text-slate-400 mt-1 italic">
                    {metric.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
