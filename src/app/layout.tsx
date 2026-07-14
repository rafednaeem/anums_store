import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CartProvider } from "@/hooks/useCart";
import AuthProvider from "@/components/shared/SessionRestoreProvider";
import { storeName } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://anumsstore.pk"
  ),
  title: {
    template: `%s | ${storeName}`,
    default: `${storeName} | Pakistani Fashion & Bridal`,
  },
  description:
    "Discover handcrafted products that blend tradition with modern elegance. Anums Store offers curated collections with timeless design and sustainable craftsmanship.",
  openGraph: {
    type: "website",
    siteName: storeName,
    title: `${storeName} | Handcrafted Elegance`,
    description:
      "Discover handcrafted products that blend tradition with modern elegance.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: storeName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${storeName} | Handcrafted Elegance`,
    description:
      "Discover handcrafted products that blend tradition with modern elegance.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "https://anumsstore.pk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}>
        <CartProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}
