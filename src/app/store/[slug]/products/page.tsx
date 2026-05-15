import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";
import { Package, Search, ArrowLeft, Star, Filter } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}

async function getShopAndProducts(
  slug: string,
  opts: { q?: string; category?: string; sort?: string; page: number }
) {
  const shop = await prisma.shop.findUnique({
    where: { slug, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      coverUrl: true,
      isVerified: true,
      activeTheme: true,
      _count: { select: { products: { where: { status: "PUBLISHED" } } } },
    },
  });
  if (!shop) return null;

  const PER_PAGE = 24;
  const skip = (opts.page - 1) * PER_PAGE;

  const where = {
    shopId: shop.id,
    status: "PUBLISHED" as const,
    ...(opts.q
      ? {
          OR: [
            { title: { contains: opts.q, mode: "insensitive" as const } },
            { tags: { has: opts.q.toLowerCase() } },
          ],
        }
      : {}),
    ...(opts.category ? { categoryId: opts.category } : {}),
  };

  const orderBy =
    opts.sort === "price_asc"
      ? [{ price: "asc" as const }]
      : opts.sort === "price_desc"
      ? [{ price: "desc" as const }]
      : opts.sort === "newest"
      ? [{ createdAt: "desc" as const }]
      : [{ isFeatured: "desc" as const }, { createdAt: "desc" as const }];

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        salePrice: true,
        mainImageUrl: true,
        inStock: true,
        isFeatured: true,
        category: { select: { id: true, name: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.productCategory.findMany({
      where: {
        products: {
          some: { shopId: shop.id, status: "PUBLISHED" },
        },
        isActive: true,
      },
      select: { id: true, name: true },
    }),
  ]);

  return { shop, products, total, categories, totalPages: Math.ceil(total / PER_PAGE) };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!shop) return { title: "Shop not found" };
  return {
    title: `Products — ${shop.name}`,
    alternates: { canonical: absoluteUrl(`/store/${slug}/products`) },
  };
}

export default async function ShopProductsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { q, category, sort, page: pageParam } = await searchParams;
  const page = parseInt(pageParam ?? "1", 10);

  const data = await getShopAndProducts(slug, { q, category, sort, page });
  if (!data) notFound();

  const { shop, products, total, categories, totalPages } = data;

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (category) sp.set("category", category);
    if (sort) sp.set("sort", sort);
    if (page > 1) sp.set("page", String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    const str = sp.toString();
    return `/store/${slug}/products${str ? `?${str}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="container flex items-center gap-4 h-14">
          <Link
            href={`/store/${slug}`}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">{shop.name}</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-700">Products</span>
        </div>
      </nav>

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Products</h1>
            <p className="text-slate-500 mt-0.5 text-sm">{total} products available</p>
          </div>
          {shop.isVerified && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-semibold">
              ✓ Verified Shop
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
          <form className="flex flex-col md:flex-row gap-3">
            <input type="hidden" name="category" value={category ?? ""} />
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none text-sm transition-colors"
              />
            </div>
            {categories.length > 0 && (
              <select
                name="category"
                defaultValue={category ?? ""}
                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 outline-none text-sm bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            <select
              name="sort"
              defaultValue={sort ?? ""}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 outline-none text-sm bg-white"
            >
              <option value="">Featured First</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <button
              type="submit"
              className="px-5 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
            <p className="text-sm text-slate-400">
              {q ? `No results for "${q}"` : "This shop has no products yet."}
            </p>
            {q && (
              <Link
                href={`/store/${slug}/products`}
                className="mt-4 text-sm text-brand-600 font-medium hover:text-brand-700"
              >
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => {
                const discountPct =
                  product.salePrice &&
                  Number(product.salePrice) < Number(product.price)
                    ? Math.round(
                        ((Number(product.price) - Number(product.salePrice)) /
                          Number(product.price)) *
                          100
                      )
                    : null;

                return (
                  <Link
                    key={product.id}
                    href={`/store/${slug}/p/${product.slug}`}
                    className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-brand-200 hover:shadow-xl transition-all duration-200 card-hover"
                  >
                    <div className="aspect-square relative overflow-hidden bg-slate-50">
                      {product.mainImageUrl ? (
                        <img
                          src={product.mainImageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-slate-200" />
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-bold tracking-wider">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                      {discountPct && (
                        <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          -{discountPct}%
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="absolute top-2.5 right-2.5 bg-amber-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          ★
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-brand-700 transition-colors leading-snug">
                        {product.title}
                      </p>
                      {product.category && (
                        <p className="text-xs text-slate-400 mb-2">{product.category.name}</p>
                      )}
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
                      {product._count.reviews > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs text-slate-400">
                            {product._count.reviews} reviews
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {page > 1 && (
                  <Link
                    href={buildUrl({ page: String(page - 1) })}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    ← Prev
                  </Link>
                )}
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <Link
                      key={p}
                      href={buildUrl({ page: String(p) })}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        p === page
                          ? "gradient-brand text-white"
                          : "bg-white border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
                {page < totalPages && (
                  <Link
                    href={buildUrl({ page: String(page + 1) })}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
