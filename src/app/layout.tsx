import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Fathom from "@/components/core/fathom";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html className={`${geistSans.variable} antialiased`} lang="en">
      <body>
        <Fathom />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
