import type { Metadata } from "next";
import ProductsPage from "@/components/ProductsPage";
import {
  breadcrumbSchema,
  createMetadata,
  itemListSchema,
} from "@/lib/seo";

const PRODUCT_LINES = [
  { name: "Gas Turbines", url: "/products#turbines" },
  { name: "GT Spare Parts", url: "/products#spares" },
  { name: "Steam Turbines", url: "/products#steam" },
  { name: "Generators", url: "/products#generators" },
  { name: "Siemens SGT Spares", url: "/products#siemens" },
];

export const metadata: Metadata = createMetadata({
  title: "Turbine Parts & Systems",
  description:
    "Genuine and OEM-grade gas and steam turbines, generators and hot-section spares from NEGBUY.",
  path: "/products",
  keywords: [
    "gas turbine parts",
    "steam turbine spares",
    "hot gas path components",
    "generators",
    "Siemens SGT spares",
  ],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
        ])}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={itemListSchema(PRODUCT_LINES)}
      />
      <ProductsPage />
    </>
  );
}
