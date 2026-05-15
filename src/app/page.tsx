import Link from "next/link";
import {
  Search,
  Store,
  Star,
  Users,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  MessageCircle,
} from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { auth } from "@clerk/nextjs/server";
import { getDashboardData } from "@/lib/db/getDashboardData";

async function getFeaturedShops() {
  return [
    {
      id: "1",
      name: "Dhaka Fashion House",
      slug: "dhaka-fashion-house",
      shortDescription: "Premium fashion and accessories for men & women",
      category: "Fashion",
      city: "Dhaka",
      logoUrl: null,
      coverUrl: null,
      isVerified: true,
      followersCount: "12500",
      likesCount: "9800",
      rating: 4.8,
      reviewCount: 142,
    },
    {
      id: "2",
      name: "TechZone BD",
      slug: "techzone-bd",
      shortDescription: "Latest gadgets, phones & accessories at best prices",
      category: "Electronics",
      city: "Dhaka",
      logoUrl: null,
      coverUrl: null,
      isVerified: true,
      followersCount: "34200",
      likesCount: "28700",
      rating: 4.6,
      reviewCount: 287,
    },
    {
      id: "3",
      name: "Gouri Handicrafts",
      slug: "gouri-handicrafts",
      shortDescription: "Authentic handmade crafts from rural Bangladesh",
      category: "Handicrafts",
      city: "Rajshahi",
      logoUrl: null,
      coverUrl: null,
      isVerified: false,
      followersCount: "5400",
      likesCount: "4200",
      rating: 4.9,
      reviewCount: 67,
    },
  ];
}

const categories = [
  { name: "Fashion", icon: "👗", slug: "fashion", count: 234 },
  { name: "Electronics", icon: "📱", slug: "electronics", count: 189 },
  { name: "Food & Grocery", icon: "🛒", slug: "food-grocery", count: 156 },
  { name: "Handicrafts", icon: "🧵", slug: "handicrafts", count: 98 },
  { name: "Beauty", icon: "💄", slug: "beauty", count: 143 },
  { name: "Home Decor", icon: "🏠", slug: "home-decor", count: 87 },
  { name: "Books", icon: "📚", slug: "books", count: 76 },
  { name: "Sports", icon: "⚽", slug: "sports", count: 54 },
];

const stats = [
  { label: "Active Shops", value: "2,400+", icon: Store },
  { label: "Happy Buyers", value: "18,000+", icon: Users },
  { label: "Products Listed", value: "95,000+", icon: Zap },
  { label: "5-Star Reviews", value: "12,000+", icon: Star },
];

const features = [
  {
    icon: Shield,
    title: "Verified Seller Badges",
    description:
      "We verify seller identity and Facebook Page ownership so you know who you're buying from.",
  },
  {
    icon: Star,
    title: "Real Reviews Only",
    description:
      "Platform reviews are separate from Facebook metrics — no fake social proof, just honest ratings.",
  },
  {
    icon: MessageCircle,
    title: "Direct Contact",
    description:
      "Message sellers instantly via WhatsApp or Messenger — no middleman, just fast communication.",
  },
  {
    icon: Zap,
    title: "Facebook Page Sync",
    description:
      "Live follower counts and page data synced from Facebook so you can gauge a seller's real reach.",
  },
];

export default async function HomePage() {
  const { userId } = await auth();
  const featuredShops = await getFeaturedShops();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Hozoborolo</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/shops"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Browse Shops
            </Link>
            <Link
              href="/shops?sortBy=featured"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Featured
            </Link>
            {SellerDashboardLink(userId)}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!userId ? (
              <>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex min-w-[132px] items-center justify-center rounded-full gradient-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <UserMenu />
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 h-[360px] w-[360px] rounded-full bg-blue-600/20 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 h-[360px] w-[360px] rounded-full bg-purple-600/10 blur-[100px]" />
        </div>

        <div className="container relative z-10 py-16 md:py-24">
          <div className="mx-auto flex min-h-[400px] max-w-5xl flex-col items-center justify-center gap-6 text-center md:min-h-[500px] md:gap-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              <span className="text-slate-300">
                2,400+ verified shops across Bangladesh
              </span>
            </div>

            <div className="space-y-3 md:space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight leading-tight sm:text-5xl md:text-6xl lg:text-8xl">
                The Hub for Trusted <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Facebook Sellers
                </span>
              </h1>

              <p className="mx-auto max-w-3xl text-base leading-7 text-slate-400 md:text-lg md:leading-8">
                Browse verified local brands, read authentic reviews, and
                connect with sellers directly — without the social media noise.
              </p>
            </div>

            <div className="group mx-auto w-full max-w-3xl">
              <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/80 p-2 backdrop-blur-xl transition-all duration-300 focus-within:border-blue-500/50 focus-within:shadow-[0_0_30px_0_rgba(59,130,246,0.18)] sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 px-3 sm:px-4">
                  <Search className="h-5 w-5 shrink-0 text-slate-500 transition-colors duration-300 group-focus-within:text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search verified shops..."
                    className="w-full appearance-none border-none bg-transparent py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-600 focus:outline-none focus:ring-0 md:text-base"
                    style={{ boxShadow: "none", outline: "none" }}
                  />
                </div>

                <button className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold uppercase tracking-[0.08em] text-slate-950 transition hover:bg-blue-50 active:scale-[0.98] sm:min-w-[170px]">
                  <span className="hidden sm:inline">Search Directory</span>
                  <span className="sm:hidden">Search</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="font-medium text-slate-400">Popular:</span>
              {["Fashion", "Electronics", "Handicrafts", "Gifts"].map((tag) => (
                <Link
                  key={tag}
                  href={`/shops?category=${tag.toLowerCase()}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100 bg-white py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50">
                  <stat.icon className="h-5 w-5 text-brand-600" />
                </div>
                <div className="mb-1 text-2xl font-bold text-slate-900 md:text-3xl">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-surface-elevated py-12 md:py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between md:mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Browse Categories
              </h2>
              <p className="mt-1 text-slate-500">
                Find exactly what you're looking for
              </p>
            </div>

            <Link
              href="/shops"
              className="flex items-center gap-1 text-sm font-medium text-brand-600 transition hover:gap-2"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shops?category=${cat.slug}`}
                className="group flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-brand-200 hover:shadow-sm"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs font-semibold text-slate-700 transition group-hover:text-brand-700">
                  {cat.name}
                </span>
                <span className="text-xs text-slate-400">
                  {cat.count} shops
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Shops */}
      <section className="bg-white py-12 md:py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between md:mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Featured Shops
              </h2>
              <p className="mt-1 text-slate-500">
                Hand-picked sellers with top ratings
              </p>
            </div>

            <Link
              href="/shops?sortBy=featured"
              className="flex items-center gap-1 text-sm font-medium text-brand-600 transition hover:gap-2"
            >
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredShops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-brand-200 hover:shadow-lg"
              >
                <div className="relative h-36 bg-gradient-to-br from-brand-100 to-brand-200">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Store className="h-20 w-20 text-brand-500" />
                  </div>

                  {shop.isVerified && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-brand-700 backdrop-blur-sm">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="-mt-8 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-white bg-brand-100 shadow-sm">
                      <Store className="h-6 w-6 text-brand-600" />
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <h3 className="truncate font-bold text-slate-900 transition group-hover:text-brand-700">
                        {shop.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{shop.category}</span>
                        <span>·</span>
                        <span>{shop.city}</span>
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-slate-600">
                    {shop.shortDescription}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-slate-700">
                          {shop.rating}
                        </span>
                        <span>({shop.reviewCount})</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                        <span>
                          {Number(shop.followersCount).toLocaleString()}{" "}
                          followers
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-brand-400 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust */}
      <section className="bg-surface-elevated py-12 md:py-16">
        <div className="container">
          <div className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
            <h2 className="mb-3 text-2xl font-bold text-slate-900 md:text-3xl">
              Why Buyers Trust Hozoborolo
            </h2>
            <p className="text-slate-500">
              We fill the gap between Facebook shopping and real consumer
              protection.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-brand-200 hover:shadow-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                  <feature.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="mb-2 font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-12 md:py-16">
        <div className="container">
          <div className="mb-8 text-center md:mb-10">
            <h2 className="mb-3 text-2xl font-bold text-slate-900 md:text-3xl">
              How It Works
            </h2>
            <p className="text-slate-500">
              Simple steps to find your perfect seller
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Browse Shops",
                desc: "Search the directory by category, city, or keyword. Filter by ratings and followers.",
              },
              {
                step: "02",
                title: "Check Reviews & Metrics",
                desc: "View platform reviews, Facebook page followers, and verified seller badges side by side.",
              },
              {
                step: "03",
                title: "Connect & Buy",
                desc: "Contact via WhatsApp or Messenger, or place an order directly on the seller's mini website.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-brand text-lg font-bold text-white shadow-lg shadow-brand-500/20">
                  {item.step}
                </div>
                <h3 className="mb-2 font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="gradient-hero py-16 text-white md:py-20">
        <div className="container text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Sell Smarter on Hozoborolo
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-blue-100">
              Connect your Facebook Page, showcase your products, and reach
              thousands of new buyers — all for free.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="rounded-xl bg-white px-8 py-4 font-bold text-brand-700 shadow-xl transition-colors hover:bg-blue-50"
              >
                Start Selling — It&apos;s Free
              </Link>
              <Link
                href="/shops"
                className="rounded-xl border border-white/30 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse Shops First
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-10 text-slate-400 md:py-12">
        <div className="container">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
                  <Store className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Hozoborolo</span>
              </div>
              <p className="mb-4 text-sm leading-relaxed">
                The trusted marketplace for Facebook-based sellers in
                Bangladesh.
              </p>
            </div>

            {[
              {
                title: "Buyers",
                links: [
                  { label: "Browse Shops", href: "/shops" },
                  { label: "How It Works", href: "/#how-it-works" },
                  { label: "Reviews", href: "/shops?sortBy=rating" },
                ],
              },
              {
                title: "Sellers",
                links: [
                  { label: "Start Selling", href: "/sign-up" },
                  { label: "Seller Dashboard", href: "/dashboard" },
                  {
                    label: "Facebook Integration",
                    href: "/dashboard/facebook",
                  },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About", href: "/about" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms", href: "/terms" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-semibold text-white">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 md:flex-row">
            <p className="text-sm">© 2024 Hozoborolo. All rights reserved.</p>
            <p className="text-sm">Made with ❤️ in Bangladesh</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
async function SellerDashboardLink(userId: string | null) {
  if (!userId)
    return (
      <Link
        href="/sign-in"
        className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
      >
        Start Selling
      </Link>
    );
  const data = await getDashboardData(userId);

  if (!data?.shop) {
    return (
      <Link
        href="/onboarding"
        className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
      >
        Start Selling
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard"
      className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
    >
      Seller Dashboard
    </Link>
  );
}
