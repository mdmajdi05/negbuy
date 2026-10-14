import type { Metadata } from "next";
import AboutPage from "@/components/AboutPage";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Our Company",
  description:
    "NEGBUY is an energy, turbine, marine and electrical solutions company keeping demanding plants, refineries and fleets running.",
  path: "/about",
  keywords: [
    "about NEGBUY",
    "turbine solutions company",
    "energy aftermarket",
    "industrial spares supplier",
  ],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Our Company", url: "/about" },
        ])}
      />
      <AboutPage />
    </>
  );
}
