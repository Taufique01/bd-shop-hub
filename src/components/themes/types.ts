// Shared types for all themes
import { Prisma } from "@prisma/client";

export type ShopWithRelations = Prisma.ShopGetPayload<{
  include: {
    category: true;
    socialMetrics: true;
    themeSettings: true;
    faqs: true;
    policies: true;
    businessHours: true;
    products: {
      include: {
        category: { select: { name: true } };
        _count: { select: { reviews: true } };
      };
    };
    reviews: {
      include: {
        user: { select: { name: true; avatarUrl: true } };
      };
    };
    _count: {
      select: {
        products: true;
        reviews: true;
      };
    };
  };
}> & {
  storefrontEnabled: boolean;
  storefrontTheme: string | null;
};

export interface ThemeProps {
  shop: ShopWithRelations;
  themeSettings: Record<string, any> | null;
  isProfileMode?: boolean;
  profileImage?: string;
  coverImage?: string;
}
