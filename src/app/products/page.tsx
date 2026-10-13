import type { Metadata } from "next";
import ProductsPage from "@/components/ProductsPage";

export const metadata: Metadata = {
  title: "Turbine Parts & Systems — NEGBUY",
  description:
    "Genuine and OEM-grade gas and steam turbines, generators and hot-section spares from NEGBUY.",
};

export default function Page() {
  return <ProductsPage />;
}
