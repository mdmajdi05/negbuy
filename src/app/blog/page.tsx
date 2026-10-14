import type { Metadata } from "next";
import BlogPage from "@/components/BlogPage";
import { POSTS_SORTED } from "@/lib/posts";
import {
  breadcrumbSchema,
  createMetadata,
  itemListSchema,
} from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Journal — Turbine Field Notes",
  description:
    "Inspection intervals, outage planning, lube-oil diagnostics and spares sourcing — field notes from the gas and steam turbine aftermarket.",
  path: "/blog",
  keywords: [
    "turbine journal",
    "compressor fouling",
    "hot gas path planning",
    "lube oil diagnostics",
    "turbine spares sourcing",
  ],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Journal", url: "/blog" },
        ])}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={itemListSchema(
          POSTS_SORTED.map((post) => ({
            name: post.title,
            url: `/blog/${post.slug}`,
            description: post.excerpt,
            image: post.cover,
          })),
        )}
      />
      <BlogPage />
    </>
  );
}
