import type { Metadata } from "next";
import ContactPage from "@/components/ContactPage";

export const metadata: Metadata = {
  title: "Contact & Request a Quote — NEGBUY",
  description:
    "Request a fixed quote for turbine parts, service or projects. 24-hour quote turnaround and 24/7 breakdown support.",
};

export default function Page() {
  return <ContactPage />;
}
