"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/products", label: "Products", index: "01" },
  { href: "/services", label: "Solutions", index: "02" },
  { href: "/about", label: "About", index: "03" },
  { href: "/#industries", label: "Industries", index: "04" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Compact glass bar + top progress line while scrolling.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (y / h) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on Escape and return focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Close the mobile panel when the user navigates with browser back/forward.
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    const base = href.split("#")[0];
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(base + "/");
  };

  return (
    <header className={scrolled ? "is-scrolled" : ""}>
      <i
        className="navProgress"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      <Link className="logo" href="/" aria-label="NEGBUY home">
        <Image
          src="/header-logo.png"
          alt="NEGBUY"
          width={150}
          height={60}
          priority
        />
        <span className="logoBadge">ENERGY · INDUSTRIAL</span>
      </Link>

      <nav
        id="primary-navigation"
        className={`nav${open ? " open" : ""}`}
        aria-label="Primary"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            data-label={link.label}
            className={isActive(link.href) ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            <span className="navNo">{link.index}</span>
            <span className="navLabel">{link.label}</span>
            <i className="navUnder" aria-hidden="true" />
            <i className="navDot" aria-hidden="true" />
          </Link>
        ))}
        <Link className="contact" href="/contact" onClick={() => setOpen(false)}>
          <span className="ctaText">Get a quote</span>
          <svg className="ctaArrow" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1 6h9M7 3l3 3-3 3" />
          </svg>
          <i className="ctaShine" aria-hidden="true" />
        </Link>
      </nav>

      <button
        type="button"
        className={`menu${open ? " open" : ""}`}
        ref={buttonRef}
        aria-expanded={open}
        aria-controls="primary-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="menuLines" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
    </header>
  );
}
