import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import localFont from "next/font/local";
import Fathom from "@/components/core/fathom";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--inter-font",
  subsets: ["latin"],
});

const seasonSans = localFont({
  variable: "--font-season-sans",
  display: "swap",
  src: [
    {
      path: "./fonts/SeasonSans-TRIAL-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/SeasonSans-TRIAL-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/SeasonSans-TRIAL-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
});

const seasonSerif = localFont({
  variable: "--season-serif-font",
  display: "swap",
  src: [
    {
      path: "./fonts/SeasonSerif-TRIAL-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/SeasonSerif-TRIAL-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://usebuzz.ai"),
  title: "Buzz",
  description: "Buzz",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={`${geistSans.variable} ${inter.variable} ${seasonSans.variable} ${seasonSerif.variable} antialiased`}
      lang="en"
    >
      <body>
        <Fathom />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
