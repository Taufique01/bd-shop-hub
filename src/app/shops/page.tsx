"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Grid3X3, List, Store, Star, Users, ThumbsUp, CheckCircle, Phone, MessageCircle, Package, ChevronDown, X } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { FacebookIcon } from "@/components/icons";
import { UserMenu } from "@/components/UserMenu";
import { useUser } from "@clerk/nextjs";

interface Shop {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  city: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  facebookConnected: boolean;
  whatsappNumber: string | null;
  messengerLink: string | null;
  facebookPageUrl: string | null;
  internalShopEnabled: boolean;
  category: { name: string; slug: string } | null;
  avgRating: number | null;
  reviewCount: number;
  productCount: number;
  followersCount: string | null;
  likesCount: string | null;
  storefrontEnabled: boolean;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Top Rated" },
  { value: "followers", label: "Most Followers" },
  { value: "likes", label: "Most Liked" },
  { value: "most_reviewed", label: "Most Reviewed" },
];

const CITIES = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Mymensingh", "Rangpur"];

function ShopsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded } = useUser();

  const [shops, setShops] = useState<Shop[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") ?? "newest");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const fetchShops = useCallback(async (params: Record<string, string>) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();
      const res = await fetch(`/api/shops?${qs}`);
      const data = await res.json();
      setShops(data.shops ?? []);
      setMeta(data.meta ?? null);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchShops({ q: query, category, city, sortBy, page: page.toString() });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, category, city, sortBy, page, fetchShops]);

  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setCity("");
    setSortBy("newest");
    setPage(1);
  };

  const hasFilters = query || category || city || sortBy !== "newest";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="container flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Store className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Hozoborolo</span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoaded && (
              isSignedIn ? (
                <UserMenu />
              ) : (
                <>
                  <Link href="/sign-in" className="text-sm text-slate-600 hover:text-slate-900">Sign in</Link>
                  <Link href="/sign-up" className="text-sm font-semibold text-white px-3 py-1.5 rounded-lg gradient-brand hover:opacity-90">
                    Join
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-8">
        <div className="container">
          <h1 className="text-2xl font-bold text-slate-900 mb-5">Browse Shops</h1>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-brand-400 transition-colors">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search shops by name, description..."
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(1); }}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-brand-400"
              >
                <option value="">All Cities</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-brand-400"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <div className="flex items-center gap-1 border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 ${viewMode === "grid" ? "bg-brand-50 text-brand-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 ${viewMode === "list" ? "bg-brand-50 text-brand-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-slate-500">Active filters:</span>
              {query && (
                <span className="flex items-center gap-1 text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full">
                  "{query}" <button onClick={() => setQuery("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {city && (
                <span className="flex items-center gap-1 text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full">
                  {city} <button onClick={() => setCity("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {sortBy !== "newest" && (
                <span className="flex items-center gap-1 text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full">
                  Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                  <button onClick={() => setSortBy("newest")}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-700 underline">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container py-8">
        {meta && (
          <p className="text-sm text-slate-500 mb-5">
            {meta.total} shop{meta.total !== 1 ? "s" : ""} found
          </p>
        )}

        {loading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="animate-shimmer h-32" />
                <div className="p-5">
                  <div className="animate-shimmer h-4 rounded mb-2" />
                  <div className="animate-shimmer h-3 rounded w-2/3 mb-4" />
                  <div className="animate-shimmer h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No shops found</h3>
            <p className="text-slate-500 text-sm mb-4">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="px-4 py-2 gradient-brand text-white rounded-xl text-sm font-semibold">
              Clear Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {shops.map((shop) => (
              <ShopListItem key={shop.id} shop={shop} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:border-brand-300 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === meta.totalPages}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:border-brand-300 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading...</div>}>
      <ShopsPageContent />
    </Suspense>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden card-hover group">
      {/* Cover */}
      <div className="h-32 bg-gradient-to-br from-brand-100 to-brand-200 relative overflow-hidden">
        {shop.coverUrl && (
          <img src={shop.coverUrl} alt="" className="w-full h-full object-cover" />
        )}
        {shop.isVerified && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 text-xs font-semibold text-brand-700">
            <CheckCircle className="w-3 h-3" /> Verified
          </div>
        )}
        {shop.isFeatured && (
          <div className="absolute top-2 left-2 bg-amber-400 text-white rounded-full px-2 py-0.5 text-xs font-bold">
            ★ Featured
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center border-2 border-white shadow-sm -mt-8 flex-shrink-0">
            {shop.logoUrl ? (
              <img src={shop.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <span className="text-lg font-bold text-brand-600">{shop.name[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <Link href={`/shops/${shop.slug}`}>
              <h3 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors truncate">
                {shop.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              {shop.category?.name && <span>{shop.category.name}</span>}
              {shop.city && <><span>·</span><span>{shop.city}</span></>}
            </div>
          </div>
        </div>

        {shop.shortDescription && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{shop.shortDescription}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          {shop.avgRating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-slate-700">{shop.avgRating}</span>
              <span>({shop.reviewCount})</span>
            </div>
          )}
          {shop.followersCount && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-500" />
              <span>{formatNumber(parseInt(shop.followersCount))}</span>
            </div>
          )}
          {shop.likesCount && (
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3 text-brand-500" />
              <span>{formatNumber(parseInt(shop.likesCount))}</span>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex gap-1.5 flex-wrap">
          {shop.whatsappNumber && (
            <a
              href={`https://wa.me/${shop.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors"
            >
              <Phone className="w-3 h-3" /> WA
            </a>
          )}
          {shop.messengerLink && (
            <a
              href={shop.messengerLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              <MessageCircle className="w-3 h-3" /> Msg
            </a>
          )}
          {shop.facebookPageUrl && (
            <a
              href={shop.facebookPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-fb-500 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              <FacebookIcon className="w-3 h-3" /> Page
            </a>
          )}
          <Link
            href={`/shops/${shop.slug}`}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-semibold hover:bg-brand-100 transition-colors ml-auto"
          >
            <Store className="w-3 h-3" /> View Shop
          </Link>
          {shop.storefrontEnabled && (
            <Link
              href={`/store/${shop.slug}`}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              <Package className="w-3 h-3" /> Visit Store
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopListItem({ shop }: { shop: Shop }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex gap-5 card-hover">
      <div className="w-16 h-16 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
        {shop.logoUrl ? (
          <img src={shop.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
        ) : (
          <span className="text-2xl font-bold text-brand-600">{shop.name[0]}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <Link href={`/shops/${shop.slug}`}>
            <h3 className="font-bold text-slate-900 hover:text-brand-700 transition-colors">{shop.name}</h3>
          </Link>
          {shop.isVerified && (
            <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-1.5">
          {shop.category?.name && <span>{shop.category.name}</span>}
          {shop.city && <span>{shop.city}</span>}
          {shop.avgRating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{shop.avgRating} ({shop.reviewCount})</span>
            </div>
          )}
          {shop.followersCount && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-500" />
              <span>{formatNumber(parseInt(shop.followersCount))} followers</span>
            </div>
          )}
        </div>
        {shop.shortDescription && (
          <p className="text-sm text-slate-600 line-clamp-1">{shop.shortDescription}</p>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-shrink-0">
        {shop.whatsappNumber && (
          <a
            href={`https://wa.me/${shop.whatsappNumber.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100"
          >
            <Phone className="w-3 h-3" /> WhatsApp
          </a>
        )}
        <Link
          href={`/shops/${shop.slug}`}
          className="flex items-center gap-1.5 px-3 py-1.5 gradient-brand text-white rounded-lg text-xs font-semibold hover:opacity-90"
        >
          <Store className="w-3 h-3" /> View Shop
        </Link>
        {shop.storefrontEnabled && (
          <Link
            href={`/store/${shop.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
          >
            <Package className="w-3 h-3" /> Visit Store
          </Link>
        )}
      </div>
    </div>
  );
}
