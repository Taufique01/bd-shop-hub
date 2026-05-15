import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const shops = await prisma.shop.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true, storefrontEnabled: true },
  });

  const shopUrls = (shops as any[]).flatMap((shop) => {
    const urls = [
      {
        url: `${baseUrl}/shops/${shop.slug}`,
        lastModified: shop.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ];

    if (shop.storefrontEnabled) {
      urls.push({
        url: `${baseUrl}/store/${shop.slug}`,
        lastModified: shop.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      });
    }

    return urls;
  });

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shops`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/sign-in`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/sign-up`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...shopUrls,
  ];
}
