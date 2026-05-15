import prisma from "@/lib/prisma";
import { getUserByClerkId } from "@/lib/user";

export async function getDashboardData(userId: string) {
  const dbUser = await getUserByClerkId(userId);
  if (!dbUser) return null;

  if (!dbUser.shop) return { dbUser, shop: null };

  const shopId = dbUser.shop.id;

  const [
    productCount,
    orderCount,
    reviewCount,
    pendingOrders,
    socialMetrics,
    recentOrders,
    revenueResult,
  ] = await Promise.all([
    prisma.product.count({ where: { shopId, status: "PUBLISHED" } }),
    prisma.order.count({ where: { shopId } }),
    prisma.shopReview.count({ where: { shopId, status: "APPROVED" } }),
    prisma.order.count({ where: { shopId, status: "PENDING" } }),
    prisma.shopSocialMetrics.findUnique({ where: { shopId } }),
    prisma.order.findMany({
      where: { shopId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { select: { name: true } },
        items: { take: 1, include: { product: { select: { title: true } } } },
      },
    }),
    prisma.order.aggregate({
      where: { shopId, status: { notIn: ["CANCELLED", "RETURNED"] } },
      _sum: { total: true },
    }),
  ]);

  return {
    dbUser,
    shop: dbUser.shop,
    stats: {
      productCount,
      orderCount,
      reviewCount,
      pendingOrders,
      revenue: revenueResult?._sum?.total
        ? Number(revenueResult._sum.total)
        : 0,
    },
    socialMetrics,
    recentOrders,
  };
}
