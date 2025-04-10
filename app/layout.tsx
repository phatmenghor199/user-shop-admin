// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { Inter, Noto_Sans_TC, Nokora } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./auth-provider";

// Font definitions
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-tc",
});

const nokora = Nokora({
  subsets: ["khmer"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-nokora",
});

export const metadata: Metadata = {
  title: "Smart Shop Admin",
  description: "Admin dashboard for Smart Shop e-commerce platform",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${inter.variable} ${notoSansTC.variable} ${nokora.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
