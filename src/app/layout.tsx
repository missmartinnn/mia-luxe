import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "../components/layout/Navbar";
import { CartProvider } from "../context/CartContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MIA LUXE | Premium Fashion & Trends",
  description: "Discover curated elegance and modern luxury fashion designs at MIA LUXE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-neutral-900 antialiased min-h-screen flex flex-col`}>
        <CartProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <footer className="bg-neutral-50 border-t border-neutral-100 py-6 text-center text-xs text-neutral-400 tracking-wider">
            © {new Date().getFullYear()} MIA LUXE. All Rights Reserved.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}