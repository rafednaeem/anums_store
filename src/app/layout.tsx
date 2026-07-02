import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import { CartProvider } from "@/components/providers/cart-provider";
import { Toaster } from "sonner";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

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
  title: {
    template: "%s | Anums Store",
    default: "Anums Store | Handcrafted Elegance",
  },
  description:
    "Discover handcrafted products that blend tradition with modern elegance. Anums Store offers curated collections with timeless design and sustainable craftsmanship.",
  keywords: [
    "handcrafted",
    "artisan",
    "luxury",
    "home decor",
    "fashion",
    "sustainable",
    "elegant",
    "traditional",
    "modern design",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Anums Store",
    title: "Anums Store | Handcrafted Elegance",
    description:
      "Discover handcrafted products that blend tradition with modern elegance.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Anums Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anums Store | Handcrafted Elegance",
    description:
      "Discover handcrafted products that blend tradition with modern elegance.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://anumsstore.com",
  },
  metadataBase: new URL("https://anumsstore.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body
        className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}
      >
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster richColors position="top-right" />
        </CartProvider>
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
