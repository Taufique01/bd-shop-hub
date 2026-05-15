import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { syncUser } from "@/lib/user";

/**
 * GET /api/user/sync
 * Called client-side after Clerk sign-in to ensure DB record exists.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ message: "Clerk user not found" }, { status: 404 });
    }

    const user = await syncUser({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: clerkUser.fullName ?? undefined,
      avatarUrl: clerkUser.imageUrl ?? undefined,
    });

    return NextResponse.json({
      id: user.id,
      role: user.role,
      onboardingStatus: user.onboardingStatus,
      needsOnboarding: user.onboardingStatus === "PENDING",
    });
  } catch (error) {
    console.error("[USER_SYNC]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
