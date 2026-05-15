import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations";
import { completeBuyerOnboarding, completeSellerOnboarding, syncUser } from "@/lib/user";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { role, name, phone, city } = parsed.data;

    // Get Clerk user to sync
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Ensure db user exists
    await syncUser({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: name ?? clerkUser.fullName ?? undefined,
      avatarUrl: clerkUser.imageUrl ?? undefined,
    });

    if (role === "BUYER") {
      await completeBuyerOnboarding(userId, { name, phone, city });
      return NextResponse.json({ success: true, role: "BUYER" });
    }

    if (role === "SELLER") {
      const shopName = body.shopName as string;
      const shopSlug = body.shopSlug as string;
      const shortDescription = body.shortDescription as string | undefined;

      if (!shopName || !shopSlug) {
        return NextResponse.json(
          { message: "Shop name and slug are required for sellers" },
          { status: 400 }
        );
      }

      // Check slug uniqueness
      const existing = await prisma.shop.findUnique({ where: { slug: shopSlug } });
      if (existing) {
        return NextResponse.json(
          { message: "This shop URL is already taken. Please choose another." },
          { status: 409 }
        );
      }

      await completeSellerOnboarding(userId, {
        name,
        phone,
        city,
        shopName,
        shopSlug,
        shortDescription,
      });

      return NextResponse.json({ success: true, role: "SELLER" });
    }

    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  } catch (error) {
    console.error("[ONBOARDING]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
