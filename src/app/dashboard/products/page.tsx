import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getUserByClerkId } from "@/lib/user";
import { Package, Plus, Edit, Eye, Star } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-red-100 text-red-700",
};

export const metadata = { title: "Products — Dashboard" };

export default async function DashboardProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await getUserByClerkId(userId);
  if (!dbUser?.shop) redirect("/onboarding");

  const { status, q } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      shopId: dbUser.shop.id,
      ...(status
        ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" }
        : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    include: {
      category: { select: { name: true } },
      _count: { select: { reviews: true, orderItems: true } },
    },
  });

  const counts = await prisma.product.groupBy({
    by: ["status"],
    where: { shopId: dbUser.shop.id },
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  const tabs = [
    {
      label: "All",
      value: "",
      count: Object.values(countMap).reduce((a, b) => a + b, 0),
    },
    { label: "Published", value: "PUBLISHED", count: countMap.PUBLISHED ?? 0 },
    { label: "Drafts", value: "DRAFT", count: countMap.DRAFT ?? 0 },
    { label: "Archived", value: "ARCHIVED", count: countMap.ARCHIVED ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">
            {products.length} products in your shop
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 px-4 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const isActive = (status ?? "") === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/dashboard/products${tab.value ? `?status=${tab.value}` : ""}`}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-brand-100 text-brand-700" : "bg-slate-200"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No products yet
          </h3>
          <p className="text-slate-500 max-w-sm mb-6 text-sm">
            Start adding products to your shop. Buyers will be able to browse
            and order them.
          </p>
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 px-5 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add your first product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                  Product
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4 hidden md:table-cell">
                  Category
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">
                  Price
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4 hidden lg:table-cell">
                  Stock
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">
                  Status
                </th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.mainImageUrl ? (
                          <img
                            src={product.mainImageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">
                          {product.title}
                        </p>
                        {product.sku && (
                          <p className="text-xs text-slate-400">
                            SKU: {product.sku}
                          </p>
                        )}
                        {product.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{" "}
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-sm text-slate-600">
                      {product.category?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      {product.salePrice ? (
                        <>
                          <p className="text-sm font-bold text-brand-600">
                            ৳{Number(product.salePrice).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-400 line-through">
                            ৳{Number(product.price).toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-bold text-slate-900">
                          ৳{Number(product.price).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span
                      className={`text-sm font-medium ${
                        product.inStock ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {product.inStock
                        ? product.stockQuantity > 0
                          ? `${product.stockQuantity} in stock`
                          : "In stock"
                        : "Out of stock"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        STATUS_COLORS[product.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/shops/${dbUser.shop!.slug}/p/${product.slug}`}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
