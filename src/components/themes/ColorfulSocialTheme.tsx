import Link from "next/link";
import { FacebookIcon } from "@/components/icons";
import {
  Phone,
  MessageCircle,
  Star,
  Package,
  ThumbsUp,
  Users,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import type { ThemeProps } from "./types";
import { formatNumber } from "@/lib/utils";
import { PublicReviewItem } from "@/components/reviews/PublicReviewItem";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { RatingSummaryWidget } from "@/components/reviews/RatingSummaryWidget";

export function ColorfulSocialTheme({ shop, themeSettings, isProfileMode }: ThemeProps) {
  const primaryColor = themeSettings?.primaryColor ?? "#f97316";
  const latestProducts = shop.products.slice(0, 12);

  const avgRating =
    shop.reviews.length > 0
      ? Math.round(
          (shop.reviews.reduce((a, b) => a + b.rating, 0) / shop.reviews.length) * 10
        ) / 10
      : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fff9f5" }}>
      {/* Colorful Navbar */}
      <nav
        className="sticky top-0 z-50"
        style={{ background: "linear-gradient(135deg, #f97316, #ec4899)" }}
      >
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {shop.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="w-10 h-10 rounded-full border-2 border-white/50 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/50">
                <span className="text-sm font-bold text-white">{shop.name[0]}</span>
              </div>
            )}
            <div>
              <span className="font-bold text-white">{shop.name}</span>
              {shop.isVerified && (
                <span className="ml-1.5 text-xs font-medium text-white/80">✓ Verified</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isProfileMode && shop.storefrontEnabled && (
                <Link
                  href={`/store/${shop.slug}`}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-brand-600 rounded-full text-sm font-bold shadow-lg shadow-black/10 hover:bg-slate-50 transition-all group"
                >
                  Visit Store <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
             )}

            {shop.whatsappNumber && !isProfileMode && (
                <a
                  href={`https://wa.me/${shop.whatsappNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white border border-white/30 rounded-full text-xs font-semibold backdrop-blur-sm hover:bg-white/30 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> WhatsApp
                </a>
             )}
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="relative">
        <div
          className="h-64 md:h-80"
          style={{ background: "linear-gradient(135deg, #fed7aa, #fce7f3, #dbeafe)" }}
        >
          {shop.coverUrl && (
            <img src={shop.coverUrl} alt="cover" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        </div>

        {/* Shop Identity Card */}
        <div className="container relative -mt-16 mb-6">
          <div className="bg-white rounded-3xl shadow-2xl p-6 border border-orange-100">
            <div className="flex flex-col md:flex-row gap-5 items-start">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-orange-100 shadow-lg flex-shrink-0">
                {shop.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{shop.name[0]}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900">{shop.name}</h1>
                  {shop.isVerified && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      ✓ Verified
                    </span>
                  )}
                </div>
                {shop.category && (
                  <p className="text-sm text-orange-600 font-medium mb-2">{shop.category.name}</p>
                )}
                {shop.shortDescription && (
                  <p className="text-sm text-slate-500">{shop.shortDescription}</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-5">
                {avgRating && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-900">{avgRating}</div>
                    <div className="flex justify-center mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.round(avgRating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {shop._count.reviews} reviews
                    </div>
                  </div>
                )}
                {shop.facebookConnected && shop.socialMetrics?.followersCount && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-900">
                      {formatNumber(Number(shop.socialMetrics.followersCount))}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-fb-500" />
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Followers</div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
              {shop.whatsappNumber && (
                <a
                  href={`https://wa.me/${shop.whatsappNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-2xl text-sm font-bold hover:bg-green-600 transition-colors"
                >
                  <Phone className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {shop.messengerLink && (
                <a
                  href={shop.messengerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-2xl text-sm font-bold hover:bg-blue-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Messenger
                </a>
              )}
              {shop.facebookPageUrl && (
                <a
                  href={shop.facebookPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-fb-500 text-white rounded-2xl text-sm font-bold hover:bg-fb-600 transition-colors"
                >
                  <FacebookIcon className="w-4 h-4" /> 
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/*  Social Proof */}
      {shop.facebookConnected && shop.socialMetrics && (
        <section className="py-6">
          <div className="container">
            <div
              className="rounded-3xl p-6"
              style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <FacebookIcon className="w-5 h-5 text-fb-500" />
                <h3 className="font-bold text-slate-900"> Page Stats</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Followers", value: shop.socialMetrics.followersCount, icon: Users },
                  { label: "Page Likes", value: shop.socialMetrics.likesCount, icon: ThumbsUp },
                  { label: "Avg Rating", value: shop.socialMetrics.ratingAverageExternal, icon: Star, isRating: true },
                  { label: "Ratings", value: shop.socialMetrics.reviewCountExternal, icon: Star },
                ].map((m) => (
                  <div key={m.label} className="bg-white/70 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <m.icon className="w-5 h-5 text-fb-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900">
                      {m.value != null ? (
                        m.isRating ? m.value : formatNumber(Number(m.value))
                      ) : (
                        <span className="text-base font-normal text-slate-400">—</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="py-10">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              🛍️ Our Products
            </h2>
            <Link
              href={`/store/${shop.slug}/products`}
              className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {latestProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">No products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {latestProducts.map((product) => {
                const discountPct =
                  product.salePrice && Number(product.salePrice) < Number(product.price)
                    ? Math.round(
                        ((Number(product.price) - Number(product.salePrice)) /
                          Number(product.price)) *
                          100
                      )
                    : null;

                return (
                  <Link
                    key={product.id}
                    href={`/store/${shop.slug}/p/${product.slug}`}
                    className="group bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-orange-200"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      {product.mainImageUrl ? (
                        <img
                          src={product.mainImageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
                          <Package className="w-10 h-10 text-orange-200" />
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-bold bg-red-600 px-2 py-1 rounded-full">
                            Sold Out
                          </span>
                        </div>
                      )}
                      {discountPct && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          -{discountPct}%
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                        {product.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-orange-600">
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
              })}
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="py-10 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">💬 Happy Customers</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              {shop.reviews.length > 0 ? (
                <RatingSummaryWidget
                  rating={avgRating || 0}
                  totalReviews={shop._count.reviews}
                  ratingCounts={shop.reviews.reduce((acc: any, review: any) => {
                    acc[review.rating] = (acc[review.rating] || 0) + 1;
                    return acc;
                  }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })}
                />
              ) : (
                <div className="bg-white border border-orange-100 rounded-3xl p-6 text-center shadow-sm">
                   <p className="font-bold text-slate-800">No ratings yet</p>
                   <p className="text-sm text-slate-500 mt-1">Become the first to rate us!</p>
                </div>
              )}
              <ReviewForm type="shop" targetId={shop.id} />
            </div>
            
            <div className="lg:col-span-2 space-y-4">
               {shop.reviews.length > 0 ? (
                 <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 divide-y divide-orange-50">
                   {shop.reviews.map((review: any) => (
                     <PublicReviewItem key={review.id} review={review} type="shop" />
                   ))}
                 </div>
               ) : (
                 <div className="bg-white rounded-3xl p-12 text-center border border-orange-100 shadow-sm">
                    <p className="text-slate-500">Reviews and feedback will appear here.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8"
        style={{ background: "linear-gradient(135deg, #f97316, #ec4899)" }}
      >
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {shop.logoUrl && (
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="w-7 h-7 rounded-full border-2 border-white/50 object-cover"
              />
            )}
            <span className="font-bold text-white">{shop.name}</span>
          </div>
          <p className="text-xs text-white/70">
            Powered by{" "}
            <Link href="/" className="text-white hover:underline">
              Hozoborolo
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
