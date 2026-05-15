import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUserByClerkId } from "@/lib/user";
import { ProductForm } from "../../ProductForm";

export const metadata = { title: "Edit Product — Dashboard" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await getUserByClerkId(userId);
  if (!dbUser?.shop) redirect("/onboarding");

  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, shopId: dbUser.shop.id },
  });

  if (!product) notFound();

  const categories = await prisma.productCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <ProductForm
      mode="edit"
      initialData={{
        id: product.id,
        slug: product.slug,
        title: product.title,
        shortDescription: product.shortDescription ?? "",
        longDescription: product.longDescription ?? "",
        sku: product.sku ?? "",
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        stockQuantity: product.stockQuantity,
        inStock: product.inStock,
        mainImageUrl: product.mainImageUrl ?? "",
        categoryId: product.categoryId ?? "",
        tags: product.tags.join(", "),
        status: product.status as "DRAFT" | "PUBLISHED",
        isFeatured: product.isFeatured,
        orderableInternally: product.orderableInternally,
        externalInquiryOnly: product.externalInquiryOnly,
        whatsappInquiryTemplate: product.whatsappInquiryTemplate ?? "",
        metaTitle: product.metaTitle ?? "",
        metaDescription: product.metaDescription ?? "",
      }}
      categories={categories}
      shopSlug={dbUser.shop.slug}
    />
  );
}
