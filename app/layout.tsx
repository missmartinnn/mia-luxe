// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MiaLuxe | Trends & Fashion Online",
  description: "Shop the latest trends in women's, men's, and kids' fashion at MiaLuxe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-neutral-900 antialiased min-h-screen flex flex-col`}>
        {/* We will insert our Header component here in Phase 3 */}
        <main className="flex-grow">
          {children}
        </main>
        {/* We will insert our Footer component here in Phase 3 */}
      </body>
    </html>
  );
}