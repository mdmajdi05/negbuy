import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { SITE } from "@/lib/site";
import { FAQS } from "@/lib/faqs";
import { breadcrumbSchema, createMetadata, faqSchema } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: SITE.defaultTitle,
  description: SITE.defaultDescription,
  path: "/",
  keywords: SITE.defaultKeywords,
  absolute: true,
});

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema([{ name: "Home", url: "/" }])}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={faqSchema(
          FAQS.map((faq) => ({ question: faq.q, answer: faq.a })),
        )}
      />
      <LandingPage />
    </>
  );
}
