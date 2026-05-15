import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReviewClientManager from "./ReviewClientManager";

export const metadata = {
  title: "Review Management",
};

export default async function ReviewsDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const shop = await prisma.shop.findUnique({ where: { ownerId: user.id } });

  if (!shop) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Review Management</h1>
        <p className="text-slate-500">You need to complete your shop setup first.</p>
      </div>
    );
  }

  // Fetch shop reviews
  const shopReviews = await prisma.shopReview.findMany({
    where: { shopId: shop.id },
    include: {
      user: true,
      reply: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch product reviews
  const productReviews = await prisma.productReview.findMany({
    where: { product: { shopId: shop.id } },
    include: {
      user: true,
      reply: true,
      product: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Stats
  const avgShopRating = shopReviews.length 
    ? shopReviews.reduce((a, b) => a + b.rating, 0) / shopReviews.length 
    : 0;

  const avgProductRating = productReviews.length
    ? productReviews.reduce((a, b) => a + b.rating, 0) / productReviews.length
    : 0;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Review Management</h1>
        <p className="text-slate-500 mt-1">Manage and reply to customer feedback for your shop and products.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Shop Reviews</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{shopReviews.length}</span>
            <span className="text-sm text-slate-500 font-medium">total</span>
          </div>
          <p className="text-sm text-amber-600 font-semibold mt-1">
            ★ {avgShopRating.toFixed(1)} avg rating
          </p>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Product Reviews</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{productReviews.length}</span>
            <span className="text-sm text-slate-500 font-medium">total</span>
          </div>
          <p className="text-sm text-amber-600 font-semibold mt-1">
            ★ {avgProductRating.toFixed(1)} avg rating
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Unreplied Reviews</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {shopReviews.filter(r => !r.reply).length + productReviews.filter(r => !r.reply).length}
            </span>
          </div>
        </div>
      </div>

      <ReviewClientManager shopReviews={shopReviews} productReviews={productReviews} />
    </div>
  );
}
