"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { SITE } from "@/lib/site";

const NAV_LINKS = [
  { href: "/", label: "Home", index: "01" },
  { href: "/products", label: "Products", index: "02" },
  { href: "/services", label: "Solutions", index: "03" },
  { href: "/about", label: "About", index: "04" },
  { href: "/#industries", label: "Industries", index: "05" },
  { href: "/blog", label: "Blog", index: "06" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Compact glass bar and viewport-top progress line while scrolling.
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
    <>
      <i
        className="scrollProgress"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      <header className={`siteHeader${scrolled ? " is-scrolled" : ""}`}>
        {/* Group 1 — logo (apna tile) */}
        <div className="hGroup hGroupLogo">
          <Link className="logo" href="/" aria-label="NEGBUY home">
            <Image
              src="/header-logo.png"
              alt="NEGBUY"
              width={659}
              height={302}
              sizes="120px"
              priority
            />
          </Link>
        </div>

        {/* Group 2 — navbar (apna glass pill) */}
        <nav
          id="primary-navigation"
          className={`hGroup hGroupNav nav${open ? " open" : ""}`}
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

        {/* Group 3 — phone number + light/dark + menu (apna glass pill) */}
        <div className="hGroup hActions">
          <a
            className="phoneTile"
            href={SITE.phoneHref}
            aria-label={`Call NEGBUY at ${SITE.phone}`}
          >
            <svg className="phoneIcon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
            </svg>
            <span className="phoneNum">{SITE.phone}</span>
          </a>

          <ThemeToggle />

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
        </div>
      </header>
    </>
  );
}
