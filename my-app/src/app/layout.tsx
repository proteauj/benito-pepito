import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import MiniCartDrawer from "@/components/MiniCartDrawer";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${displaySerif.variable} antialiased`}
      >
        <CartProvider>
          {/* Ensure content is above the overlay */}
          <div className="relative z-10">
            <SiteHeader />
            {children}
            <SiteFooter />
            <MiniCartDrawer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
