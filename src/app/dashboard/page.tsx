import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { FacebookIcon } from "@/components/icons";
import {
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
  ThumbsUp,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import { getDashboardData } from "../../lib/db/getDashboardData";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await getDashboardData(userId);

  if (!data) redirect("/onboarding");
  if (!data.shop) redirect("/onboarding");

  const { shop, stats, socialMetrics, recentOrders } = data;

  const statCards = [
    {
      label: "Published Products",
      value: stats?.productCount ?? 0,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/dashboard/products",
    },
    {
      label: "Total Orders",
      value: stats?.orderCount ?? 0,
      icon: ShoppingBag,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/dashboard/orders",
    },
    {
      label: "Reviews",
      value: stats?.reviewCount ?? 0,
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/dashboard/reviews",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: "text-red-600",
      bg: "bg-red-50",
      href: "/dashboard/orders?status=PENDING",
    },
    {
      label: "Total Revenue (৳)",
      value: (stats?.revenue ?? 0).toLocaleString(),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/dashboard/orders",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back! Here's what's happening with{" "}
            <span className="font-semibold text-slate-700">{shop.name}</span>
          </p>
        </div>
        <Link
          href={`/shops/${shop.slug}?mode=preview`}
          className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-xl text-sm font-semibold hover:bg-brand-100 transition-colors"
        >
          View Shop <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Setup alerts */}
      {!shop.facebookConnected && (
        <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <FacebookIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">
              Connect your Page
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Sync follower counts and page data to build trust with buyers.
            </p>
          </div>
          <Link
            href="/dashboard/facebook"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap"
          >
            Connect →
          </Link>
        </div>
      )}

      {shop.status === "DRAFT" && (
        <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Shop is in Draft mode
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your shop won't appear in the directory until you publish it.
            </p>
          </div>
          <Link
            href="/dashboard/settings"
            className="text-sm font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap"
          >
            Publish →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all group"
          >
            <div
              className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}
            >
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {card.value}
            </div>
            <div className="text-xs text-slate-500">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Facebook Metrics */}
      {shop.facebookConnected && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <FacebookIcon className="w-5 h-5 text-fb-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900"> Page Metrics</h2>
                {socialMetrics?.syncedAt && (
                  <p className="text-xs text-slate-400">
                    Last synced:{" "}
                    {new Date(socialMetrics.syncedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/dashboard/facebook"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Manage →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Page Followers",
                value: socialMetrics?.followersCount,
                icon: Users,
                color: "text-blue-600",
              },
              {
                label: "Page Likes",
                value: socialMetrics?.likesCount,
                icon: ThumbsUp,
                color: "text-brand-600",
              },
              {
                label: "Avg Rating",
                value: socialMetrics?.ratingAverageExternal,
                icon: Star,
                color: "text-amber-600",
              },
              {
                label: "Rating Count",
                value: socialMetrics?.reviewCountExternal,
                icon: TrendingUp,
                color: "text-green-600",
              },
            ].map((metric) => (
              <div key={metric.label} className="bg-slate-50 rounded-xl p-4">
                <metric.icon className={`w-4 h-4 ${metric.color} mb-2`} />
                <div className="text-xl font-bold text-slate-900">
                  {metric.value != null ? (
                    formatNumber(Number(metric.value))
                  ) : (
                    <span className="text-sm font-normal text-slate-400">
                      Unavailable
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-900">Recent Orders</h2>
          <Link
            href="/dashboard/orders"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all →
          </Link>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order: any) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {order.buyer.name} · {order.items[0]?.product.title}
                    {order.items.length > 1 &&
                      ` +${order.items.length - 1} more`}
                  </p>
                </div>
                <div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      order.status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : order.status === "DELIVERED"
                          ? "bg-green-100 text-green-700"
                          : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 ml-2">
                  ৳{Number(order.total).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              No orders yet. Share your shop to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
