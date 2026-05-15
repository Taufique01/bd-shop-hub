import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export const metadata = {
  title: "Shop Settings | Dashboard",
};

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user with shop
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { shop: true },
  });

  if (!dbUser || !dbUser.shop) {
    redirect("/onboarding");
  }

  // Fetch categories for the dropdown
  const categories = await prisma.shopCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Shop Settings</h1>
        <p className="text-slate-500 mt-1">Update your shop details, branding, and contact information.</p>
      </div>

      <SettingsForm shop={dbUser.shop} categories={categories} />
    </div>
  );
}
