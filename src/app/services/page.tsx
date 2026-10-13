import type { Metadata } from "next";
import ServicesPage from "@/components/ServicesPage";

export const metadata: Metadata = {
  title: "Solutions — Turbine, Oil & Gas, Electrical, Marine, EPC | NEGBUY",
  description:
    "Five integrated service lines from NEGBUY: turbine solutions, oil & gas, electrical & automation, marine & offshore, and EPC.",
};

export default function Page() {
  return <ServicesPage />;
}
