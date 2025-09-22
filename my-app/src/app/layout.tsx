import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import MiniCartDrawer from "@/components/MiniCartDrawer";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { I18nProvider } from "@/i18n/I18nProvider";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const displaySerif = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Benito Pepito",
  description: "Discover amazing products through our artistic gallery.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side default locale from Accept-Language
  const hdrs = await headers();
  const accept = (hdrs.get("accept-language") || "en").toLowerCase();
  const initialLocale = accept.startsWith("fr") ? "fr" : "en";
  return (
    <html lang={initialLocale}>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${displaySerif.variable} antialiased`}
      >
        <I18nProvider initialLocale={initialLocale}>
          <CartProvider>
            {/* Ensure content is above the overlay */}
            <div className="relative z-10">
              <SiteHeader />
              {children}
              <SiteFooter />
              <MiniCartDrawer />
            </div>
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
