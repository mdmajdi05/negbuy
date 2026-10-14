import type { Metadata } from "next";
import ContactPage from "@/components/ContactPage";
import {
  breadcrumbSchema,
  contactPageSchema,
  createMetadata,
} from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Contact & Request a Quote",
  description:
    "Request a fixed quote for turbine parts, service or projects. 24-hour quote turnaround and 24/7 breakdown support.",
  path: "/contact",
  keywords: [
    "request a quote",
    "turbine parts quote",
    "emergency turbine spares",
    "contact NEGBUY",
  ],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ])}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={contactPageSchema()}
      />
      <ContactPage />
    </>
  );
}
