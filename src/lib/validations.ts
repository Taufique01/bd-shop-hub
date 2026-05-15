import { z } from "zod";

// ------------------------------------------
// Auth & Onboarding
// ------------------------------------------
export const onboardingSchema = z.object({
  role: z.enum(["BUYER", "SELLER"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  city: z.string().optional(),
});

// ------------------------------------------
// Shop
// ------------------------------------------
export const shopCreateSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  shortDescription: z.string().max(200).optional(),
  fullAbout: z.string().optional(),
  categoryId: z.string().optional(),
  subcategory: z.string().optional(),
  businessPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  messengerLink: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  externalShopEnabled: z.boolean().default(true),
  internalShopEnabled: z.boolean().default(false),
});

export const shopUpdateSchema = shopCreateSchema.partial().extend({
  activeTheme: z.enum(["MODERN_CLEAN", "COLORFUL_SOCIAL", "MINIMAL_BOUTIQUE"]).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).optional(),
  isOpen: z.boolean().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  coverUrl: z.string().url().optional().or(z.literal("")),
  facebookPageUrl: z.string().url().optional().or(z.literal("")),
  facebookPageId: z.string().optional(),
  facebookUsername: z.string().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(155).optional(),
  storefrontEnabled: z.boolean().optional(),
  storefrontTheme: z.string().optional(),
  storefrontSettings: z.any().optional(),
  storefrontPublishedAt: z.coerce.date().optional(),
});

// ------------------------------------------
// Product
// ------------------------------------------
export const productSchema = z.object({
  title: z.string().min(2, "Product title required"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens")
    .optional(),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  salePrice: z.coerce.number().positive().optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  inStock: z.boolean().default(true),
  mainImageUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .nullable(),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  orderableInternally: z.boolean().default(true),
  externalInquiryOnly: z.boolean().default(false),
  whatsappInquiryTemplate: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const productUpdateSchema = productSchema.partial();

// ------------------------------------------
// Review
// ------------------------------------------
export const shopReviewSchema = z.object({
  shopId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(2000).optional(),
});

export const productReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(2000).optional(),
});

export const reviewReplySchema = z.object({
  body: z.string().min(1).max(1000),
});

// ------------------------------------------
// Order / Checkout
// ------------------------------------------
export const shippingAddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Bangladesh"),
});

export const checkoutSchema = z.object({
  shopId: z.string(),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z
    .enum(["CASH_ON_DELIVERY", "BANK_TRANSFER", "MOBILE_BANKING"])
    .default("CASH_ON_DELIVERY"),
  notes: z.string().optional(),
});

// ------------------------------------------
// Facebook Page connection
// ------------------------------------------
export const connectFacebookPageSchema = z
  .object({
    pageId: z.string().optional(),
    pageUrl: z.string().url().optional().or(z.literal("")),
    connectedVia: z.enum(["oauth", "url", "page_id"]),
  })
  .refine((data) => data.pageId || data.pageUrl, {
    message: "Either pageId or pageUrl is required",
  });

// ------------------------------------------
// Search / Filter
// ------------------------------------------
export const shopSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  sortBy: z
    .enum(["newest", "rating", "followers", "likes", "featured", "most_reviewed"])
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

// Types
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ShopCreateInput = z.infer<typeof shopCreateSchema>;
export type ShopUpdateInput = z.infer<typeof shopUpdateSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ShopReviewInput = z.infer<typeof shopReviewSchema>;
export type ProductReviewInput = z.infer<typeof productReviewSchema>;
export type ReviewReplyInput = z.infer<typeof reviewReplySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type ConnectFacebookPageInput = z.infer<typeof connectFacebookPageSchema>;
export type ShopSearchInput = z.infer<typeof shopSearchSchema>;
