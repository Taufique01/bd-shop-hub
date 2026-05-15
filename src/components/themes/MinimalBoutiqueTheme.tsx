import Link from "next/link";
import { FacebookIcon } from "@/components/icons";
import {
  Phone,
  MessageCircle,
  Star,
  Package,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import type { ThemeProps } from "./types";
import { PublicReviewItem } from "@/components/reviews/PublicReviewItem";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { RatingSummaryWidget } from "@/components/reviews/RatingSummaryWidget";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MinimalBoutiqueTheme({ shop, themeSettings, isProfileMode }: ThemeProps) {
  const latestProducts = shop.products.slice(0, 8);
  const featuredProducts = shop.products.filter((p) => p.isFeatured).slice(0, 3);

  const avgRating =
    shop.reviews.length > 0
      ? Math.round(
          (shop.reviews.reduce((a, b) => a + b.rating, 0) / shop.reviews.length) * 10
        ) / 10
      : null;

  return (
    <div className="min-h-screen bg-[#fafaf9]" style={{ fontFamily: "'Georgia', serif" }}>
      {/* Minimal Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="container py-5">
          <div className="flex flex-col items-center text-center">
            {shop.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="w-16 h-16 rounded-full object-cover mb-3 grayscale hover:grayscale-0 transition-all duration-300"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-stone-600">{shop.name[0]}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900 tracking-wide">{shop.name}</h1>
              {shop.isVerified && (
                <CheckCircle className="w-4 h-4 text-stone-400 fill-stone-200" />
              )}
            </div>
            {isProfileMode && shop.storefrontEnabled && (
                <div className="mt-6">
                  <Link
                    href={`/store/${shop.slug}`}
                    className="inline-flex items-center gap-3 px-10 py-3 border border-stone-900 text-stone-900 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-stone-900 hover:text-white transition-all duration-500"
                  >
                    Visit Official Store <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
            )}

            {shop.category && !isProfileMode && (
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mt-1">
                {shop.category.name}
              </p>
            )}
            {avgRating && !isProfileMode && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(avgRating)
                          ? "text-stone-700 fill-stone-700"
                          : "text-stone-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-stone-500">
                  {avgRating} ({shop._count.reviews})
                </span>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav className="flex justify-center gap-8 mt-5 border-t border-stone-100 pt-4">
            <a
              href="#collection"
              className="text-xs tracking-[0.15em] uppercase text-stone-600 hover:text-stone-900 transition-colors"
            >
              Collection
            </a>
            <a
              href="#about"
              className="text-xs tracking-[0.15em] uppercase text-stone-600 hover:text-stone-900 transition-colors"
            >
              About
            </a>
            {shop.whatsappNumber && (
              <a
                href={`https://wa.me/${shop.whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-[0.15em] uppercase text-green-700 hover:text-green-900 transition-colors"
              >
                Contact
              </a>
            )}
            <Link
              href={`/store/${shop.slug}`}
              className="text-xs tracking-[0.15em] uppercase text-stone-400 hover:text-stone-600 transition-colors"
            >
              Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Image */}
      {shop.coverUrl && (
        <section className="h-[50vh] max-h-[500px] overflow-hidden">
          <img
            src={shop.coverUrl}
            alt="cover"
            className="w-full h-full object-cover grayscale-[20%]"
          />
        </section>
      )}

      {/* Short intro */}
      {shop.shortDescription && (
        <section className="py-12 bg-white">
          <div className="container text-center max-w-2xl mx-auto">
            <p className="text-stone-600 leading-relaxed text-lg italic">
              &ldquo;{shop.shortDescription}&rdquo;
            </p>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12">
          <div className="container">
            <div className="text-center mb-8">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-1">Curated</p>
              <h2 className="text-2xl font-bold text-stone-900">Editor&#39;s Picks</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <BoutiqueProductCard key={product.id} product={product} shopSlug={shop.slug} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full Collection */}
      <section id="collection" className="py-12 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-1">Explore</p>
              <h2 className="text-2xl font-bold text-stone-900">The Collection</h2>
            </div>
            <Link
              href={`/store/${shop.slug}/products`}
              className="text-xs tracking-[0.1em] uppercase text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {latestProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-400 text-sm italic">No collection yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <BoutiqueProductCard key={product.id} product={product} shopSlug={shop.slug} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Testimonials</p>
            <h2 className="text-2xl font-bold text-stone-900">What Clients Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Left Col: Widget & Form */}
            <div className="md:col-span-4 space-y-8">
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
                <div className="bg-white border border-stone-200 p-8 text-center shadow-sm">
                   <p className="font-bold text-stone-800 tracking-wide">No ratings yet</p>
                   <p className="text-sm text-stone-500 mt-2 italic">Be the first to share your experience.</p>
                </div>
              )}
              <ReviewForm type="shop" targetId={shop.id} />
            </div>
            
            {/* Right Col: Review List */}
            <div className="md:col-span-8 space-y-6">
               {shop.reviews.length > 0 ? (
                 <div className="bg-white p-8 shadow-sm border border-stone-200 divide-y divide-stone-100">
                   {shop.reviews.map((review: any) => (
                     <PublicReviewItem key={review.id} review={review} type="shop" />
                   ))}
                 </div>
               ) : (
                 <div className="bg-white p-12 text-center border border-stone-200 shadow-sm">
                    <p className="text-stone-500 italic">Client impressions and feedback will appear here.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 bg-white">
        <div className="container max-w-3xl">
          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-1">Our Story</p>
            <h2 className="text-2xl font-bold text-stone-900">About {shop.name}</h2>
          </div>
          {shop.fullAbout && (
            <p className="text-stone-600 leading-loose text-center">{shop.fullAbout}</p>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {shop.city && (
              <div className="flex flex-col items-center gap-2">
                <MapPin className="w-5 h-5 text-stone-400" />
                <p className="text-sm text-stone-600">{shop.city}</p>
              </div>
            )}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  shop.isOpen ? "bg-green-500" : "bg-red-400"
                }`}
              />
              <p className={`text-sm ${shop.isOpen ? "text-green-700" : "text-red-600"}`}>
                {shop.isOpen ? "Open Now" : "Currently Closed"}
              </p>
            </div>
            {shop.businessPhone && (
              <div className="flex flex-col items-center gap-2">
                <Phone className="w-5 h-5 text-stone-400" />
                <p className="text-sm text-stone-600">{shop.businessPhone}</p>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {shop.whatsappNumber && (
              <a
                href={`https://wa.me/${shop.whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 border border-stone-800 text-stone-800 text-sm font-semibold tracking-wide hover:bg-stone-800 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" /> WhatsApp Us
              </a>
            )}
            {shop.messengerLink && (
              <a
                href={shop.messengerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 border border-stone-300 text-stone-600 text-sm font-semibold tracking-wide hover:bg-stone-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Messenger
              </a>
            )}
            {shop.facebookPageUrl && (
              <a
                href={shop.facebookPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 border border-stone-300 text-stone-600 text-sm font-semibold tracking-wide hover:bg-stone-100 transition-colors"
              >
                <FacebookIcon className="w-4 h-4" /> Facebook Page
              </a>
            )}
          </div>
        </div>
      </section>

      {/* FAQs */}
      {shop.faqs.length > 0 && (
        <section className="py-12 bg-stone-50">
          <div className="container max-w-2xl">
            <h2 className="text-xl font-bold text-stone-900 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {shop.faqs.map((faq) => (
                <div key={faq.id} className="border-b border-stone-200 pb-4">
                  <p className="text-sm font-semibold text-stone-900 mb-1">{faq.question}</p>
                  <p className="text-sm text-stone-500">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 bg-stone-900 text-white">
        <div className="container text-center">
          <p className="text-sm tracking-widest uppercase text-stone-400 mb-2">{shop.name}</p>
          <div className="flex justify-center gap-6 mb-4">
            {shop.policies.map((p) => (
              <Link
                key={p.id}
                href={`/store/${shop.slug}/policy/${p.type}`}
                className="text-xs text-stone-500 hover:text-white transition-colors"
              >
                {p.title}
              </Link>
            ))}
          </div>
          <p className="text-xs text-stone-600">
            Powered by{" "}
            <Link href="/" className="text-stone-500 hover:text-white">
              Hozoborolo
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

function BoutiqueProductCard({
  product,
  shopSlug,
}: {
  product: any;
  shopSlug: string;
}) {
  const discountPct =
    product.salePrice && Number(product.salePrice) < Number(product.price)
      ? Math.round(
          ((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100
        )
      : null;

  return (
    <Link
      href={`/store/${shopSlug}/p/${product.slug}`}
      className="group block"
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-stone-100 mb-3">
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale-[15%] group-hover:grayscale-0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-stone-300" />
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-stone-700 text-xs font-bold tracking-widest uppercase">
              Sold Out
            </span>
          </div>
        )}
        {discountPct && (
          <span className="absolute top-3 left-3 bg-stone-900 text-white text-xs font-bold px-2 py-1">
            -{discountPct}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-stone-800 group-hover:text-stone-600 transition-colors mb-1 line-clamp-2">
          {product.title}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-900">
            ৳{Number(product.salePrice ?? product.price).toLocaleString()}
          </span>
          {product.salePrice && (
            <span className="text-xs text-stone-400 line-through">
              ৳{Number(product.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
