import type { Metadata } from "next";
import AboutPage from "@/components/AboutPage";

export const metadata: Metadata = {
  title: "Our Company — NEGBUY",
  description:
    "NEGBUY is an energy, turbine, marine and electrical solutions company keeping demanding plants, refineries and fleets running.",
};

export default function Page() {
  return <AboutPage />;
}
