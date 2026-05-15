import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUserByClerkId } from "@/lib/user";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "Add Product — Dashboard" };

export default async function NewProductPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await getUserByClerkId(userId);
  if (!dbUser?.shop) redirect("/onboarding");

  const categories = await prisma.productCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <ProductForm
      mode="create"
      categories={categories}
      shopSlug={dbUser.shop.slug}
    />
  );
}
