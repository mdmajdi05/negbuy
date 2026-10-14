import type { Metadata } from "next";
import ServicesPage from "@/components/ServicesPage";
import {
  breadcrumbSchema,
  createMetadata,
  serviceSchema,
} from "@/lib/seo";

const SERVICE_LINES = [
  {
    name: "Turbine Solutions",
    description:
      "Gas and steam turbine parts, hot-gas-path overhauls, rotor and balance work, and commissioning support.",
    url: "/services#turbine",
  },
  {
    name: "Oil & Gas",
    description:
      "Rotating equipment, spares and field service for refineries, gas plants and pipelines.",
    url: "/services#oilgas",
  },
  {
    name: "Electrical & Automation",
    description:
      "Generators, switchgear, control systems and instrumentation supply and retrofits.",
    url: "/services#electrical",
  },
  {
    name: "Marine & Offshore",
    description:
      "Propulsion, auxiliary machinery and offshore equipment spares and service.",
    url: "/services#marine",
  },
  {
    name: "EPC Services",
    description:
      "Engineering, procurement and construction for power, energy and industrial projects.",
    url: "/services#epc",
  },
];

export const metadata: Metadata = createMetadata({
  title: "Solutions — Turbine, Oil & Gas, Electrical, Marine, EPC",
  description:
    "Five integrated service lines from NEGBUY: turbine solutions, oil & gas, electrical & automation, marine & offshore, and EPC.",
  path: "/services",
  keywords: [
    "turbine services",
    "oil and gas spares",
    "electrical and automation",
    "marine and offshore",
    "EPC contractor",
  ],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Solutions", url: "/services" },
        ])}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={serviceSchema(SERVICE_LINES)}
      />
      <ServicesPage />
    </>
  );
}
