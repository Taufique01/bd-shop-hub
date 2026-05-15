import prisma from "@/lib/prisma";

/**
 * Prisma seed script
 * Run with: npx prisma db seed
 * Or: npx ts-node prisma/seed.ts
 */

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up (order matters due to FK constraints)
  await prisma.facebookSyncLog.deleteMany();
  await prisma.facebookPagePost.deleteMany();
  await prisma.facebookPageConnection.deleteMany();
  await prisma.facebookPage.deleteMany();
  await prisma.facebookAccount.deleteMany();
  await prisma.shopSocialMetrics.deleteMany();
  await prisma.orderStatusLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.shippingAddress.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.shopReview.deleteMany();
  await prisma.favoriteProduct.deleteMany();
  await prisma.favoriteShop.deleteMany();
  await prisma.productVariantOption.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shopBusinessHour.deleteMany();
  await prisma.shopFaq.deleteMany();
  await prisma.shopPolicy.deleteMany();
  await prisma.shopThemeSettings.deleteMany();
  await prisma.shopVerification.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.shopCategory.deleteMany();
  await prisma.setting.deleteMany();

  // Shop categories
  const categories = await Promise.all([
    prisma.shopCategory.create({ data: { name: "Fashion & Clothing", slug: "fashion", icon: "👗", sortOrder: 1 } }),
    prisma.shopCategory.create({ data: { name: "Electronics", slug: "electronics", icon: "📱", sortOrder: 2 } }),
    prisma.shopCategory.create({ data: { name: "Food & Grocery", slug: "food-grocery", icon: "🛒", sortOrder: 3 } }),
    prisma.shopCategory.create({ data: { name: "Handicrafts", slug: "handicrafts", icon: "🧵", sortOrder: 4 } }),
    prisma.shopCategory.create({ data: { name: "Beauty & Skincare", slug: "beauty", icon: "💄", sortOrder: 5 } }),
    prisma.shopCategory.create({ data: { name: "Home & Decor", slug: "home-decor", icon: "🏠", sortOrder: 6 } }),
  ]);

  // Product categories
  const productCategories = await Promise.all([
    prisma.productCategory.create({ data: { name: "T-Shirts", slug: "t-shirts" } }),
    prisma.productCategory.create({ data: { name: "Phones", slug: "phones" } }),
    prisma.productCategory.create({ data: { name: "Accessories", slug: "accessories" } }),
    prisma.productCategory.create({ data: { name: "Handmade", slug: "handmade" } }),
  ]);

  // Demo Buyer
  const buyer = await prisma.user.create({
    data: {
      clerkId: "demo_buyer_clerk_id",
      email: "buyer@demo.hozoborolo.com",
      name: "Rahim Ahmed",
      role: "BUYER",
      onboardingStatus: "BUYER_COMPLETE",
      profile: {
        create: {
          phone: "+8801712345678",
          city: "Dhaka",
        },
      },
    },
  });

  // Demo Seller 1 — Fashion Shop
  const seller1 = await prisma.user.create({
    data: {
      clerkId: "demo_seller1_clerk_id",
      email: "fashionhouse@demo.hozoborolo.com",
      name: "Salma Begum",
      role: "SELLER",
      onboardingStatus: "SELLER_COMPLETE",
      profile: {
        create: {
          phone: "+8801987654321",
          city: "Dhaka",
        },
      },
    },
  });

  // Demo Seller 2 — Tech Shop
  const seller2 = await prisma.user.create({
    data: {
      clerkId: "demo_seller2_clerk_id",
      email: "techzone@demo.hozoborolo.com",
      name: "Karim Tech",
      role: "SELLER",
      onboardingStatus: "SELLER_COMPLETE",
      profile: {
        create: {
          phone: "+8801812345678",
          city: "Dhaka",
        },
      },
    },
  });

  // Fashion Shop
  const fashionShop = await prisma.shop.create({
    data: {
      ownerId: seller1.id,
      categoryId: categories[0].id,
      name: "Dhaka Fashion House",
      slug: "dhaka-fashion-house",
      shortDescription: "Premium fashion and accessories for men & women",
      fullAbout: "We are a Dhaka-based fashion brand operating through Facebook and WhatsApp since 2018. We offer premium quality clothing for both men and women at affordable prices.",
      status: "ACTIVE",
      isVerified: true,
      isFeatured: true,
      city: "Dhaka",
      businessPhone: "+8801712000001",
      whatsappNumber: "+8801712000001",
      messengerLink: "https://m.me/dhakaFashionHouseDemo",
      facebookPageUrl: "https://www.facebook.com/dhakaFashionHouseDemo",
      facebookPageId: "123456789",
      facebookUsername: "dhakaFashionHouseDemo",
      facebookConnected: true,
      facebookSyncEnabled: true,
      externalShopEnabled: true,
      internalShopEnabled: true,
      isOpen: true,
      socialMetrics: {
        create: {
          facebookPageId: "123456789",
          facebookPageUrl: "https://www.facebook.com/dhakaFashionHouseDemo",
          followersCount: BigInt(12500),
          likesCount: BigInt(9800),
          commentsCount: null, // not available without special permissions
          ratingAverageExternal: 4.8,
          reviewCountExternal: 142,
          syncedAt: new Date(),
          syncStatus: "SUCCESS",
        },
      },
      faqs: {
        create: [
          { question: "Do you offer home delivery?", answer: "Yes! We deliver all over Bangladesh within 3-5 business days.", sortOrder: 1 },
          { question: "What is your return policy?", answer: "We accept returns within 7 days if the item is unused and in original condition.", sortOrder: 2 },
          { question: "How can I track my order?", answer: "We'll send you tracking updates via WhatsApp once your order is dispatched.", sortOrder: 3 },
        ],
      },
      policies: {
        create: [
          { type: "return", title: "Return Policy", content: "Items can be returned within 7 days of delivery if unused and in original condition. Contact us on WhatsApp to initiate a return." },
          { type: "shipping", title: "Shipping Policy", content: "We ship all over Bangladesh. Delivery takes 3-5 business days for Dhaka and 5-7 days for other cities." },
        ],
      },
    },
  });

  // Fashion Shop — Facebook page connection record
  const fbAccount1 = await prisma.facebookAccount.create({
    data: {
      userId: seller1.id,
      facebookUserId: "demo_fb_user_1",
      facebookName: "Salma Begum",
      tokenStatus: "ACTIVE",
      scopes: ["pages_show_list", "pages_read_engagement"],
    },
  });

  const fbPage1 = await prisma.facebookPage.create({
    data: {
      facebookAccountId: fbAccount1.id,
      pageId: "123456789",
      pageName: "Dhaka Fashion House",
      pageUsername: "dhakaFashionHouseDemo",
      pageUrl: "https://www.facebook.com/dhakaFashionHouseDemo",
      category: "Clothing (Brand)",
      about: "Premium fashion for everyone",
      followersCount: BigInt(12500),
      likesCount: BigInt(9800),
      ratingValue: 4.8,
      ratingCount: 142,
      tokenStatus: "ACTIVE",
      syncStatus: "SUCCESS",
      syncSource: "page_token",
      lastSyncedAt: new Date(),
    },
  });

  await prisma.facebookPageConnection.create({
    data: {
      shopId: fashionShop.id,
      facebookAccountId: fbAccount1.id,
      facebookPageId: fbPage1.id,
      connectedVia: "oauth",
      isActive: true,
      syncEnabled: true,
    },
  });

  // Fashion products
  const tshirt = await prisma.product.create({
    data: {
      shopId: fashionShop.id,
      categoryId: productCategories[0].id,
      title: "Premium Cotton T-Shirt",
      slug: "premium-cotton-tshirt",
      shortDescription: "100% cotton, comfortable everyday wear",
      longDescription: "Our bestselling premium cotton t-shirt available in multiple sizes and colors. Made from high-quality Bangladeshi cotton.",
      price: "450",
      salePrice: "380",
      stockQuantity: 50,
      inStock: true,
      status: "PUBLISHED",
      isFeatured: true,
      orderableInternally: true,
      tags: ["cotton", "t-shirt", "casual"],
    },
  });

  // Tech Shop
  const techShop = await prisma.shop.create({
    data: {
      ownerId: seller2.id,
      categoryId: categories[1].id,
      name: "TechZone BD",
      slug: "techzone-bd",
      shortDescription: "Latest gadgets, phones & accessories at best prices",
      fullAbout: "TechZone BD is your trusted source for genuine electronics and tech accessories. We source directly from manufacturers and authorized distributors.",
      status: "ACTIVE",
      isVerified: true,
      isFeatured: false,
      city: "Dhaka",
      businessPhone: "+8801812000002",
      whatsappNumber: "+8801812000002",
      facebookPageUrl: "https://www.facebook.com/techzonebdDemo",
      facebookPageId: "987654321",
      facebookConnected: true,
      facebookSyncEnabled: true,
      externalShopEnabled: true,
      internalShopEnabled: true,
      isOpen: true,
      socialMetrics: {
        create: {
          facebookPageId: "987654321",
          followersCount: BigInt(34200),
          likesCount: BigInt(28700),
          commentsCount: null,
          ratingAverageExternal: null, // not available without special permissions
          syncedAt: new Date(),
          syncStatus: "PARTIAL",
          syncError: "rating data unavailable: insufficient app permissions",
        },
      },
    },
  });

  // Tech product
  await prisma.product.create({
    data: {
      shopId: techShop.id,
      categoryId: productCategories[1].id,
      title: "Wireless Earbuds Pro",
      slug: "wireless-earbuds-pro",
      shortDescription: "True wireless earbuds with 24hr battery life",
      price: "1800",
      salePrice: "1499",
      stockQuantity: 25,
      inStock: true,
      status: "PUBLISHED",
      tags: ["earbuds", "wireless", "audio"],
    },
  });

  // Demo reviews for fashion shop
  await prisma.shopReview.create({
    data: {
      shopId: fashionShop.id,
      userId: buyer.id,
      rating: 5,
      title: "Excellent quality!",
      body: "The t-shirt quality is amazing. Very fast delivery and responsive seller. Highly recommended!",
      status: "APPROVED",
      isVerifiedPurchase: true,
      helpfulCount: 12,
    },
  });

  // Platform settings
  await prisma.setting.createMany({
    data: [
      { key: "platform_name", value: "Hozoborolo", type: "string", group: "general" },
      { key: "reviews_require_approval", value: "false", type: "boolean", group: "reviews" },
      { key: "max_products_per_shop", value: "500", type: "number", group: "limits" },
    ],
  });

  console.log("✅ Seed complete!");
  console.log(`   👤 Demo buyer: ${buyer.email}`);
  console.log(`   🏪 Fashion Shop: /shop/${fashionShop.slug}`);
  console.log(`   🏪 Tech Shop: /shop/${techShop.slug}`);
  console.log(`   📘 Facebook: Connected demo data with partial metrics to show graceful fallback`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
