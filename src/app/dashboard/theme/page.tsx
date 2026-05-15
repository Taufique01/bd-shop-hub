import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/user";
import { ThemeSettingsClient } from "./ThemeSettingsClient";

export const metadata = { title: "Theme Settings — Dashboard" };

export default async function ThemePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await getUserByClerkId(userId);
  if (!dbUser?.shop) redirect("/onboarding");

  const shop = dbUser.shop as any;
  return (
    <ThemeSettingsClient
      currentTheme={shop.activeTheme}
      shopSlug={shop.slug}
      internalShopEnabled={shop.internalShopEnabled}
      storefrontEnabled={shop.storefrontEnabled}
    />
  );
}
