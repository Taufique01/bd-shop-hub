import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Store,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  Settings,
  Palette,
  Share2,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/facebook", label: "Facebook Page", icon: Share2 },
  { href: "/dashboard/theme", label: "Theme & Store", icon: Palette },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-40 shadow-sm hidden md:flex">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Hozoborolo</span>
          </Link>
          <div className="mt-3 px-2 py-1.5 bg-brand-50 rounded-lg">
            <p className="text-xs font-semibold text-brand-700">Seller Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-all group text-sm font-medium"
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">My Account</p>
              <Link
                href="/shops"
                className="text-xs text-slate-400 hover:text-brand-600 transition-colors"
              >
                View as buyer
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-100 flex items-center px-4 gap-3 z-30 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
            <Store className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Dashboard</span>
        </Link>
        <div className="flex-1" />
        <UserButton />
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
