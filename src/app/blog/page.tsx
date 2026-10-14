import type { Metadata } from "next";
import BlogPage from "@/components/BlogPage";

export const metadata: Metadata = {
  title: "Journal — Turbine Field Notes | NEGBUY",
  description:
    "Inspection intervals, outage planning, lube-oil diagnostics and spares sourcing — field notes from the gas and steam turbine aftermarket.",
  openGraph: {
    title: "Journal — Turbine Field Notes | NEGBUY",
    description:
      "Field notes on compressor fouling, hot gas path planning, borescope decisions and long-lead turbine spares.",
    url: "https://negbuy.com/blog",
    siteName: "NEGBUY",
    type: "website",
  },
};

export default function Page() {
  return <BlogPage />;
}
