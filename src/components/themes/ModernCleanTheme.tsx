import Link from "next/link";
import { FacebookIcon } from "@/components/icons";
import {
  Phone,
  MessageCircle,
  Star,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Users,
  ThumbsUp,
  ChevronRight,
  Globe,
} from "lucide-react";
import type { ThemeProps } from "./types";
import { formatNumber } from "@/lib/utils";
import { PublicReviewItem } from "@/components/reviews/PublicReviewItem";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { RatingSummaryWidget } from "@/components/reviews/RatingSummaryWidget";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getContrastTextColor(hex?: string) {
  if (!hex) return "#ffffff";
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#ffffff";

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.65 ? "#0f172a" : "#ffffff";
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function ModernCleanTheme({
  shop,
  themeSettings,
  isProfileMode,
  profileImage,
  coverImage,
}: ThemeProps) {
  const accentColor = themeSettings?.accentColor ?? "#3b6ef6";
  const accentTextColor = getContrastTextColor(accentColor);

  const featuredProducts = shop.products
    .filter((p) => p.isFeatured)
    .slice(0, 4);
  const latestProducts = shop.products.slice(0, 8);

  const avgRating =
    shop.reviews.length > 0
      ? Math.round(
          (shop.reviews.reduce((a, b) => a + b.rating, 0) /
            shop.reviews.length) *
            10,
        ) / 10
      : null;

  const websiteHref =
    shop.websiteUrl?.trim() ||
    (shop.storefrontEnabled ? `/store/${shop.slug}` : null);

  const websiteIsExternal = websiteHref ? isExternalUrl(websiteHref) : false;

  const showFacebookMetrics =
    shop.facebookConnected &&
    (shop.socialMetrics?.reviewCountExternal != null ||
      shop.socialMetrics?.ratingAverageExternal != null ||
      shop.socialMetrics?.followersCount != null);

  const facebookMetrics = [
    {
      label: "Facebook Followers",
      value:
        shop.socialMetrics?.followersCount != null
          ? formatNumber(Number(shop.socialMetrics.followersCount))
          : "—",
      icon: Users,
    },
    {
      label: "Page Likes",
      value:
        shop.socialMetrics?.likesCount != null
          ? formatNumber(Number(shop.socialMetrics.likesCount))
          : "—",
      icon: ThumbsUp,
    },
    {
      label: "FB Reviews",
      value:
        shop.socialMetrics?.reviewCountExternal != null &&
        Number(shop.socialMetrics.reviewCountExternal) > 0
          ? formatNumber(Number(shop.socialMetrics.reviewCountExternal))
          : "—",
      icon: MessageCircle,
    },
    {
      label: "FB Rating",
      value:
        shop.socialMetrics?.ratingAverageExternal != null &&
        Number(shop.socialMetrics.ratingAverageExternal) > 0
          ? Number(shop.socialMetrics.ratingAverageExternal).toFixed(1)
          : "—",
      icon: Star,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="container h-16 flex items-center justify-between gap-4">
          <Link
            href={isProfileMode ? "/" : `/shops/${shop.slug}`}
            className="flex min-w-0 items-center gap-3"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt={shop.name}
                className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200">
                <span className="text-sm font-bold text-slate-700">
                  {shop.name[0]}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                {shop.name}
              </p>
              {shop.category?.name && (
                <p className="truncate text-xs text-slate-500">
                  {shop.category.name}
                </p>
              )}
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a
              href="#products"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Products
            </a>
            <a
              href="#reviews"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Reviews
            </a>
            <a
              href="#about"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              About
            </a>
            {!isProfileMode && (
              <Link
                href={`/shops/${shop.slug}`}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                View Profile
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {websiteHref &&
              isProfileMode &&
              (websiteIsExternal ? (
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition-all hover:opacity-95 sm:px-4"
                  style={{
                    backgroundColor: accentColor,
                    color: accentTextColor,
                  }}
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">Visit Website</span>
                  <span className="sm:hidden">Website</span>
                </a>
              ) : (
                <Link
                  href={websiteHref}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition-all hover:opacity-95 sm:px-4"
                  style={{
                    backgroundColor: accentColor,
                    color: accentTextColor,
                  }}
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">Visit Website</span>
                  <span className="sm:hidden">Website</span>
                </Link>
              ))}

            {shop.whatsappNumber && !isProfileMode && (
              <a
                href={`https://wa.me/${shop.whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 sm:px-4"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Mobile nav row */}
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="container overflow-x-auto">
            <div className="flex min-w-max items-center gap-4 py-1 text-xs font-medium text-slate-600">
              <a
                href="#products"
                className="whitespace-nowrap hover:text-slate-900 transition-colors"
              >
                Products
              </a>
              <a
                href="#reviews"
                className="whitespace-nowrap hover:text-slate-900 transition-colors"
              >
                Reviews
              </a>
              <a
                href="#about"
                className="whitespace-nowrap hover:text-slate-900 transition-colors"
              >
                About
              </a>
              {!isProfileMode && (
                <Link
                  href={`/shops/${shop.slug}`}
                  className="whitespace-nowrap hover:text-slate-900 transition-colors"
                >
                  View Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="h-72 bg-gradient-to-br from-slate-100 to-slate-200 sm:h-80 md:h-[420px]">
          {coverImage ? (
            <img
              src={coverImage}
              alt="cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, ${accentColor}18 0%, #e2e8f0 100%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="absolute inset-x-0 bottom-0 pb-6 sm:pb-8">
          <div className="container">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl sm:h-28 sm:w-28">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100">
                    <span className="text-3xl font-bold text-slate-700">
                      {shop.name[0]}
                    </span>
                  </div>
                )}
              </div>

              <div className="max-w-3xl pb-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                    {shop.name}
                  </h1>
                  {shop.isVerified && (
                    <CheckCircle className="h-5 w-5 fill-blue-400 text-blue-400 sm:h-6 sm:w-6" />
                  )}
                </div>

                {shop.category?.name && (
                  <p className="text-sm text-white/80">{shop.category.name}</p>
                )}

                {shop.shortDescription && (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90 sm:text-base">
                    {shop.shortDescription}
                  </p>
                )}

                {avgRating && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(avgRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-white/35"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-white/90">
                      {avgRating} ({shop._count.reviews} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Action Bar */}
      <section className="border-b border-slate-100 bg-white py-4">
        <div className="container flex flex-wrap gap-3">
          {shop.whatsappNumber && (
            <a
              href={`https://wa.me/${shop.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
            >
              <Phone className="h-4 w-4" />
              WhatsApp
            </a>
          )}

          {shop.messengerLink && (
            <a
              href={shop.messengerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
            >
              <MessageCircle className="h-4 w-4" />
              Messenger
            </a>
          )}

          {shop.facebookPageUrl && (
            <a
              href={shop.facebookPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
            >
              <FacebookIcon className="h-4 w-4" />
              Facebook Page
            </a>
          )}
        </div>
      </section>

      {/* Social Metrics */}
      {(shop.facebookConnected ||
        shop.socialMetrics?.reviewCountExternal ||
        shop.socialMetrics?.ratingAverageExternal) && (
        <section className="py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Followers */}
              <MetricCard
                icon={Users}
                label="Followers"
                value={
                  shop.socialMetrics?.followersCount != null
                    ? formatNumber(Number(shop.socialMetrics.followersCount))
                    : "—"
                }
              />

              {/* Likes */}
              <MetricCard
                icon={ThumbsUp}
                label="Page Likes"
                value={
                  shop.socialMetrics?.likesCount != null
                    ? formatNumber(Number(shop.socialMetrics.likesCount))
                    : "—"
                }
              />
              {/* FB Rating */}
              <MetricCard
                icon={Star}
                label="FB Rating"
                value={
                  shop.socialMetrics?.ratingAverageExternal
                    ? Number(shop.socialMetrics.ratingAverageExternal).toFixed(
                        1,
                      )
                    : "—"
                }
              />

              {/* FB Reviews */}
              <MetricCard
                icon={MessageCircle}
                label="FB Reviews"
                value={
                  shop.socialMetrics?.reviewCountExternal
                    ? formatNumber(
                        Number(shop.socialMetrics.reviewCountExternal),
                      )
                    : "—"
                }
              />
            </div>

            {shop.socialMetrics?.syncedAt && (
              <p className="text-xs text-slate-400 mt-3">
                Updated{" "}
                {new Date(shop.socialMetrics.syncedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section id="products" className="py-12 md:py-16">
          <div className="container">
            <div className="mb-8 flex items-center gap-4">
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: accentColor }}
                >
                  Featured
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Top Picks
                </h2>
              </div>
              <Link
                href={`/shops/${shop.slug}/products`}
                className="ml-auto inline-flex items-center gap-1 text-sm font-semibold hover:opacity-80"
                style={{ color: accentColor }}
              >
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  shopSlug={shop.slug}
                  accentColor={accentColor}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section
        id="products"
        className={
          featuredProducts.length > 0
            ? "bg-slate-50 py-12 md:py-16"
            : "py-12 md:py-16"
        }
      >
        <div className="container">
          <div className="mb-8 flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Our Products
              </h2>
              <p className="mt-1 text-slate-500">
                {shop._count.products} items available
              </p>
            </div>
            <Link
              href={`/shops/${shop.slug}/products`}
              className="ml-auto inline-flex items-center gap-1 text-sm font-semibold hover:opacity-80"
              style={{ color: accentColor }}
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {latestProducts.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-white py-16 text-center">
              <Package className="mx-auto mb-3 h-12 w-12 text-slate-200" />
              <p className="text-slate-400">No products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-5">
              {latestProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  shopSlug={shop.slug}
                  accentColor={accentColor}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="bg-slate-50 py-12 md:py-16">
        <div className="container max-w-6xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Customer Reviews
            </h2>
            <p className="mt-1 text-slate-500">
              Real feedback from actual customers
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              {shop.reviews.length > 0 ? (
                <RatingSummaryWidget
                  rating={avgRating || 0}
                  totalReviews={shop._count.reviews}
                  ratingCounts={shop.reviews.reduce(
                    (acc: any, review: any) => {
                      acc[review.rating] = (acc[review.rating] || 0) + 1;
                      return acc;
                    },
                    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                  )}
                />
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center">
                  <p className="font-bold text-slate-800">No ratings yet</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Become the first to rate us.
                  </p>
                </div>
              )}

              <ReviewForm type="shop" targetId={shop.id} />
            </div>

            <div className="space-y-4 lg:col-span-2">
              {shop.reviews.length > 0 ? (
                <div className="divide-y divide-slate-50 rounded-2xl border border-slate-100 bg-white p-6">
                  {shop.reviews.map((review: any) => (
                    <PublicReviewItem
                      key={review.id}
                      review={review}
                      type="shop"
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
                  <p className="text-slate-500">
                    Reviews and feedback will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      {(shop.fullAbout || shop.shortDescription || shop.faqs.length > 0) && (
        <section id="about" className="py-12 md:py-16">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8">
                <h2 className="mb-5 text-2xl font-bold text-slate-900">
                  About {shop.name}
                </h2>

                {shop.fullAbout ? (
                  <p className="text-slate-600 leading-8">{shop.fullAbout}</p>
                ) : shop.shortDescription ? (
                  <p className="text-slate-600 leading-8">
                    {shop.shortDescription}
                  </p>
                ) : null}

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {shop.city && (
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        Location
                      </div>
                      <p className="text-sm text-slate-600">{shop.city}</p>
                    </div>
                  )}

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Clock className="h-4 w-4 text-slate-400" />
                      Status
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div
                        className={`h-2 w-2 rounded-full ${shop.isOpen ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span
                        className={
                          shop.isOpen
                            ? "font-medium text-green-700"
                            : "font-medium text-red-600"
                        }
                      >
                        {shop.isOpen ? "Open Now" : "Closed"}
                      </span>
                    </div>
                  </div>
                </div>

                {shop.businessHours.length > 0 && (
                  <div className="mt-8 rounded-2xl bg-slate-50 p-4 md:p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Clock className="h-4 w-4 text-slate-400" />
                      Business Hours
                    </div>
                    <div className="space-y-2">
                      {shop.businessHours.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <span className="text-slate-500">
                            {DAYS[h.dayOfWeek]}
                          </span>
                          <span className="text-slate-700">
                            {h.isClosed
                              ? "Closed"
                              : `${h.openTime}–${h.closeTime}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {shop.faqs.length > 0 && (
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 md:p-8">
                  <h3 className="mb-5 text-xl font-bold text-slate-900">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {shop.faqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="rounded-2xl border border-slate-100 bg-white p-4"
                      >
                        <p className="mb-1 text-sm font-semibold text-slate-900">
                          {faq.question}
                        </p>
                        <p className="text-sm leading-6 text-slate-600">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 py-10 text-white">
        <div className="container">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              {shop.logoUrl ? (
                <img
                  src={shop.logoUrl}
                  alt={shop.name}
                  className="h-9 w-9 rounded-xl object-cover"
                />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  <span className="text-sm font-bold">{shop.name[0]}</span>
                </div>
              )}
              <span className="font-bold">{shop.name}</span>
            </div>

            <div className="flex flex-wrap gap-4">
              {shop.policies.map((p) => (
                <Link
                  key={p.id}
                  href={`/store/${shop.slug}/policy/${p.type}`}
                  className="text-xs text-slate-400 transition-colors hover:text-white"
                >
                  {p.title}
                </Link>
              ))}
            </div>

            <p className="text-xs text-slate-500">
              Powered by{" "}
              <Link href="/" className="text-slate-400 hover:text-white">
                Hozoborolo
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({
  product,
  shopSlug,
  accentColor,
}: {
  product: any;
  shopSlug: string;
  accentColor: string;
}) {
  const discountPct =
    product.salePrice && Number(product.salePrice) < Number(product.price)
      ? Math.round(
          ((Number(product.price) - Number(product.salePrice)) /
            Number(product.price)) *
            100,
        )
      : null;

  return (
    <Link
      href={`/shops/${shopSlug}/p/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-slate-200" />
          </div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-xs font-bold text-white">OUT OF STOCK</span>
          </div>
        )}

        {discountPct && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            -{discountPct}%
          </span>
        )}
      </div>

      <div className="p-4">
        <p
          className="mb-2 line-clamp-2 text-sm font-semibold text-slate-800 transition-colors"
          style={{}}
        >
          {product.title}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-900">
            ৳{Number(product.salePrice ?? product.price).toLocaleString()}
          </span>
          {product.salePrice && (
            <span className="text-sm text-slate-400 line-through">
              ৳{Number(product.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: any;
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
