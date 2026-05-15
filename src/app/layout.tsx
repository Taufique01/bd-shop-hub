import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hozoborolo — Discover Trusted Facebook Sellers",
    template: "%s | Hozoborolo",
  },
  description:
    "Find and connect with verified Facebook sellers. Browse shops, view products, and shop with confidence.",
  keywords: [
    "facebook sellers",
    "online marketplace",
    "bangladesh ecommerce",
    "shop directory",
    "trusted sellers",
  ],
  authors: [{ name: "Hozoborolo" }],
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Hozoborolo",
    title: "Hozoborolo — Discover Trusted Facebook Sellers",
    description:
      "Find and connect with verified Facebook sellers. Browse shops, view products, and shop with confidence.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hozoborolo — Discover Trusted Facebook Sellers",
    description:
      "Find and connect with verified Facebook sellers. Browse shops, view products, and shop with confidence.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
