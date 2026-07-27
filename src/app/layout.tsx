import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FunziToys - Premium Toys & Games for Kids | Shop Online",
    template: "%s | FunziToys",
  },
  description: "Shop premium toys, action figures, building blocks, educational games and more at FunziToys. Fast delivery, best prices, quality guaranteed.",
  keywords: ["toys", "kids toys", "action figures", "building blocks", "educational toys", "board games", "remote control toys", "online toy store"],
  authors: [{ name: "FunziToys" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "FunziToys - Premium Toys & Games for Kids",
    description: "Shop premium toys, action figures, building blocks, educational games and more. Fast delivery, best prices, quality guaranteed.",
    siteName: "FunziToys",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FunziToys - Premium Toys & Games for Kids",
    description: "Shop premium toys, action figures, building blocks, educational games and more.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF6B35",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
