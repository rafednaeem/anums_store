import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://anumsstore.pk"),
  title: {
    default: "Anums Store — Pakistani Fashion Lahore",
    template: "%s | Anums Store",
  },
  description: "Buy ready-to-wear and bridal wear online from Lahore. Pakistani fashion — kurtas, shalwar kameez, lehengas. Fast delivery across Pakistan. Shop now at Anums Store.",
  keywords: [
    "Pakistani clothes online",
    "buy kurta online Pakistan",
    "bridal wear Lahore",
    "shalwar kameez online PKR",
    "ready to wear Pakistan",
    "Anums Store Lahore",
    "Pakistani fashion online",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://anumsstore.pk",
    siteName: "Anums Store",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Anums Store — Pakistani Fashion Lahore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://anumsstore.pk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} font-body antialiased`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#F7F4F0',
            color: '#1A1A1A',
            border: '1px solid #C8C2BA',
            fontFamily: 'var(--font-geist-sans)',
            fontSize: '0.875rem',
          }
        }} />
        <Analytics />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
