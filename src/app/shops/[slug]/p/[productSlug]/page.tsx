import { FacebookIcon } from "@/components/icons";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { absoluteUrl, formatNumber } from "@/lib/utils";
import { PublicReviewItem } from "@/components/reviews/PublicReviewItem";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getCart } from "@/app/actions/cart";
import { CartLink } from "@/components/cart/CartLink";
import {
  Package,
  Star,
  Phone,
  MessageCircle,
  CheckCircle,
  ShoppingCart,
  ArrowLeft,
  Tag,
  Truck,
  RotateCcw,
  Share2,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/user";

interface PageProps {
  params: Promise<{ slug: string; productSlug: string }>;
}

async function getProduct(shopSlug: string, productSlug: string) {
  const { userId } = await auth();
  const user = await getUserByClerkId(userId ?? "");

  return prisma.product.findFirst({
    where: {
      slug: productSlug,
      OR: [
        {
          status: "PUBLISHED",
          shop: {
            slug: shopSlug,
            status: "ACTIVE",
          },
        },
        {
          shop: {
            slug: shopSlug,
            ownerId: user?.id ?? "",
          },
        },
      ],
    },
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          whatsappNumber: true,
          messengerLink: true,
          facebookPageUrl: true,
          isVerified: true,
          internalShopEnabled: true,
        },
      },
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, avatarUrl: true } },
          reply: true,
        },
      },
      _count: { select: { reviews: true } },
    },
  });
}

export default async function ProductPublicPage({ params }: PageProps) {
  const { slug, productSlug } = await params;
  const product = await getProduct(slug, productSlug);
  if (!product) notFound();

  const allImages = [
    ...(product.mainImageUrl
      ? [{ url: product.mainImageUrl, altText: product.title }]
      : []),
    ...product.images.map((img) => ({
      url: img.url,
      altText: img.altText ?? product.title,
    })),
  ];

  const reviewRatings = product.reviews.map((r) => r.rating);
  const avgRating =
    reviewRatings.length > 0
      ? Math.round(
          (reviewRatings.reduce((a, b) => a + b, 0) / reviewRatings.length) *
            10,
        ) / 10
      : null;

  const discountPct =
    product.salePrice && Number(product.salePrice) < Number(product.price)
      ? Math.round(
          ((Number(product.price) - Number(product.salePrice)) /
            Number(product.price)) *
            100,
        )
      : null;

  // const cart = await getCart(product.shopId);
  // const cartItemCount =
  //   cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) ||
  //   0;

  const whatsappUrl = product.shop.whatsappNumber
    ? (() => {
        const template =
          product.whatsappInquiryTemplate?.replace(
            "{product_name}",
            product.title,
          ) ?? `Hi, I'm interested in "${product.title}". Can you help me?`;
        return `https://wa.me/${product.shop.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(template)}`;
      })()
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4 flex-1 overflow-hidden pr-4">
            <Link
              href={`/shops/${product.shop.slug}`}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">{product.shop.name}</span>
            </Link>
            <span className="text-slate-300">/</span>
            {product.category && (
              <>
                <span className="text-sm text-slate-500 whitespace-nowrap">
                  {product.category.name}
                </span>
                <span className="text-slate-300">/</span>
              </>
            )}
            <span className="text-sm text-slate-700 truncate font-medium">
              {product.title}
            </span>
          </div>
          {/* {product.orderableInternally && (
            <CartLink shopSlug={product.shop.slug} itemCount={cartItemCount} />
          )} */}
        </div>
      </nav>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {allImages.length > 0 ? (
                <img
                  src={allImages[0].url}
                  alt={allImages[0].altText ?? product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-slate-200" />
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {allImages.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 border-slate-100 hover:border-brand-300 cursor-pointer transition-colors"
                  >
                    <img
                      src={img.url}
                      alt={img.altText ?? ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isFeatured && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />{" "}
                  Featured
                </span>
              )}
              {product.category && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                  {product.category.name}
                </span>
              )}
              {!product.inStock && (
                <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-slate-900 leading-snug">
              {product.title}
            </h1>

            {/* Rating */}
            {avgRating && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(avgRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-amber-700">
                  {avgRating}
                </span>
                <span className="text-sm text-slate-400">
                  ({product._count.reviews} reviews)
                </span>
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-slate-900">
                ৳{Number(product.salePrice ?? product.price).toLocaleString()}
              </span>
              {product.salePrice && (
                <>
                  <span className="text-xl text-slate-400 line-through">
                    ৳{Number(product.price).toLocaleString()}
                  </span>
                  {discountPct && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                      -{discountPct}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-slate-600 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full text-xs"
                  >
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3 pt-2">
              {product.orderableInternally &&
                !product.externalInquiryOnly &&
                product.inStock && (
                  <AddToCartButton
                    shopId={product.shopId}
                    productId={product.id}
                    shopSlug={product.shop.slug}
                  />
                )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Inquire on WhatsApp
                </a>
              )}

              {product.shop.messengerLink && (
                <a
                  href={product.shop.messengerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" /> Chat on Messenger
                </a>
              )}
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <Truck className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-600">Home Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-600">Easy Returns</span>
              </div>
              {product.shop.isVerified && (
                <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl col-span-2">
                  <CheckCircle className="w-4 h-4 text-brand-500" />
                  <span className="text-xs text-brand-700 font-medium">
                    Verified Seller — {product.shop.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Long Description */}
            {product.longDescription && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="font-bold text-slate-900 mb-4">
                  Product Details
                </h2>
                <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {product.longDescription}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div
              className="bg-white rounded-2xl border border-slate-100 p-6"
              id="reviews-section"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-slate-900 text-xl">
                    Customer Reviews
                  </h2>
                  {avgRating && (
                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-amber-700">
                        {avgRating}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Form */}
              <div className="mb-8">
                <ReviewForm type="product" targetId={product.id} />
              </div>

              {/* Reviews List */}
              {product.reviews.length > 0 ? (
                <div className="space-y-2">
                  {product.reviews.map((review) => (
                    <PublicReviewItem
                      key={review.id}
                      review={review}
                      type="product"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-t border-slate-100 bg-slate-50 rounded-xl">
                  <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No reviews yet.</p>
                  <p className="text-sm text-slate-400">
                    Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Shop Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-bold text-slate-900 mb-4">
                About the Seller
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                  {product.shop.logoUrl ? (
                    <img
                      src={product.shop.logoUrl}
                      alt={product.shop.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="text-lg font-bold text-brand-600">
                      {product.shop.name[0]}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {product.shop.name}
                  </p>
                  {product.shop.isVerified && (
                    <p className="flex items-center gap-1 text-xs text-brand-600">
                      <CheckCircle className="w-3 h-3" /> Verified Seller
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={`/shops/${product.shop.slug}`}
                className="w-full block text-center px-4 py-2.5 border-2 border-brand-200 text-brand-700 rounded-xl text-sm font-semibold hover:bg-brand-50 transition-colors"
              >
                Visit Shop →
              </Link>
            </div>

            {/* SKU & Details */}
            {product.sku && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 mb-3">Product Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">SKU</span>
                    <span className="font-mono text-slate-700">
                      {product.sku}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Availability</span>
                    <span
                      className={`font-semibold ${product.inStock ? "text-green-600" : "text-red-500"}`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
