import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import TurbineCursor from "@/components/TurbineCursor";
import "./globals.css";
import "./nb.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEGBUY — Energy, Turbine, Marine & Electrical Solutions",
  description:
    "NEGBUY provides turbine, energy, marine, electrical, automation, oil and gas, EV and solar solutions.",
  metadataBase: new URL("https://negbuy.com"),
  keywords: [
    "NEGBUY",
    "turbine",
    "energy",
    "marine",
    "electrical",
    "automation",
    "oil and gas",
    "EV",
    "solar",
  ],
  openGraph: {
    title: "NEGBUY — Energy, Turbine, Marine & Electrical Solutions",
    description:
      "NEGBUY provides turbine, energy, marine, electrical, automation, oil and gas, EV and solar solutions.",
    url: "https://negbuy.com",
    siteName: "NEGBUY",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} overflow-x-hidden`}>
        <a className="skipLink" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
        <SiteFooter />
        <TurbineCursor />
      </body>
    </html>
  );
}
