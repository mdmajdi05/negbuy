import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import ContactWidget from "@/components/ContactWidget";
import { SITE } from "@/lib/site";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import "./globals.css";
import "./nb.css";
import "./theme.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.defaultTitle,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.defaultDescription,
  keywords: [...SITE.defaultKeywords],
  applicationName: SITE.name,
  authors: [{ name: SITE.companyName }],
  creator: SITE.companyName,
  publisher: SITE.companyName,
  formatDetection: { telephone: false, address: false, email: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    locale: SITE.locale,
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    images: [{ url: SITE.ogImage, alt: SITE.defaultTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    images: [SITE.ogImage],
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
        {/* Theme (light/dark) — pehle paint se pehle html par lag jaata hai,
            isliye light mode me dark flash nahi hota. Key: "nb-theme"
            (ThemeToggle button isi ko update karta hai). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("nb-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}',
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={organizationSchema()}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={websiteSchema()}
        />
        <a className="skipLink" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
        <SiteFooter />
        <ContactWidget />
      </body>
    </html>
  );
}
