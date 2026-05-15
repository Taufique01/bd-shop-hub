"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateShopSettings(data: any) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { shop: true },
  });

  if (!dbUser || !dbUser.shop) {
    return { success: false, error: "Shop not found" };
  }

  try {
    await prisma.shop.update({
      where: { id: dbUser.shop.id },
      data: {
        name: data.name,
        shortDescription: data.shortDescription,
        fullAbout: data.fullAbout,
        categoryId: data.categoryId || null,
        subcategory: data.subcategory,
        logoUrl: data.logoUrl,
        coverUrl: data.coverUrl,
        address: data.address,
        city: data.city,
        businessPhone: data.businessPhone,
        whatsappNumber: data.whatsappNumber,
        messengerLink: data.messengerLink,
        websiteUrl: data.websiteUrl,
        facebookPageUrl: data.facebookPageUrl,
        facebookUsername: data.facebookUsername,
        isOpen: data.isOpen,
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    revalidatePath(`/shops/${dbUser.shop.slug}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update shop settings:", error);
    return { success: false, error: "Failed to update shop settings." };
  }
}
