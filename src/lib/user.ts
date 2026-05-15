/**
 * User / Profile service
 * Syncs Clerk users to our database and manages roles/profiles.
 */

import prisma from "@/lib/prisma";
import { Role, OnboardingStatus } from "@prisma/client";

interface SyncUserParams {
  clerkId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

/**
 * Upsert a user record after Clerk sign-in/sign-up.
 * Called from the webhook or middleware sync.
 */
export async function syncUser(params: SyncUserParams) {
  const { clerkId, email, name, avatarUrl } = params;

  const user = await prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email,
      name: name ?? null,
      avatarUrl: avatarUrl ?? null,
      role: Role.BUYER,
      onboardingStatus: OnboardingStatus.PENDING,
      profile: { create: {} },
    },
    update: {
      email,
      name: name ?? undefined,
      avatarUrl: avatarUrl ?? undefined,
    },
    include: { profile: true },
  });

  return user;
}

/**
 * Get full user with profile by Clerk ID.
 */
export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      profile: true,
      shop: {
        include: {
          facebookConnection: {
            include: { facebookPage: true },
          },
          socialMetrics: true,
          category: true,
        },
      },
    },
  });
}

/**
 * Complete buyer onboarding.
 */
export async function completeBuyerOnboarding(
  clerkId: string,
  data: { name: string; phone?: string; city?: string }
) {
  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

  return prisma.user.update({
    where: { clerkId },
    data: {
      name: data.name,
      role: Role.BUYER,
      onboardingStatus: OnboardingStatus.BUYER_COMPLETE,
      profile: {
        update: {
          phone: data.phone,
          city: data.city,
        },
      },
    },
  });
}

/**
 * Complete seller onboarding — creates their shop.
 */
export async function completeSellerOnboarding(
  clerkId: string,
  data: {
    name: string;
    phone?: string;
    city?: string;
    shopName: string;
    shopSlug: string;
    shopCategory?: string;
    shortDescription?: string;
  }
) {
  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");
  if (user.shop) throw new Error("Seller already has a shop");

  return prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { clerkId },
      data: {
        name: data.name,
        role: Role.SELLER,
        onboardingStatus: OnboardingStatus.SELLER_COMPLETE,
        profile: {
          update: {
            phone: data.phone,
            city: data.city,
          },
        },
      },
    });

    const shop = await tx.shop.create({
      data: {
        ownerId: updatedUser.id,
        name: data.shopName,
        slug: data.shopSlug,
        shortDescription: data.shortDescription,
        city: data.city,
        status: "DRAFT",
        socialMetrics: { create: {} },
      },
    });

    return { user: updatedUser, shop };
  });
}
