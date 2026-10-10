"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "#services", label: "Solutions", index: "01" },
  { href: "#industries", label: "Industries", index: "02" },
  { href: "#about", label: "About", index: "03" },
];

const SECTION_IDS = ["services", "industries", "about", "contact"];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("");
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

  // Highlight the nav link of the section currently in view.
  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
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

  const closeMenu = () => setOpen(false);

  return (
    <header className={scrolled ? "is-scrolled" : ""}>
      <i className="navProgress" style={{ width: `${progress}%` }} aria-hidden="true" />

      <a className="logo" href="https://negbuy.com/" aria-label="NEGBUY home">
        <Image
          src="/header-logo.png"
          alt="NEGBUY"
          width={150}
          height={60}
          priority
        />
        <span className="logoBadge">ENERGY · INDUSTRIAL</span>
      </a>

      <nav
        id="primary-navigation"
        className={`nav${open ? " open" : ""}`}
        aria-label="Primary"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            data-label={link.label}
            className={active === link.href ? "active" : ""}
            onClick={closeMenu}
          >
            <span className="navNo">{link.index}</span>
            <span className="navLabel">{link.label}</span>
            <i className="navUnder" aria-hidden="true" />
            <i className="navDot" aria-hidden="true" />
          </a>
        ))}
        <a className="contact" href="#contact" onClick={closeMenu}>
          <span className="ctaText">Contact</span>
          <svg className="ctaArrow" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1 6h9M7 3l3 3-3 3" />
          </svg>
          <i className="ctaShine" aria-hidden="true" />
        </a>
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