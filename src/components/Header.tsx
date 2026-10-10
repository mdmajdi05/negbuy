"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "#services", label: "Solutions" },
  { href: "#industries", label: "Industries" },
  { href: "#about", label: "About" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    <header>
      <a className="logo" href="https://negbuy.com/" aria-label="NEGBUY home">
        <Image
          src="/header-logo.png"
          alt="NEGBUY"
          width={150}
          height={60}
          priority
        />
      </a>

      <nav
        id="primary-navigation"
        className={`nav${open ? " open" : ""}`}
        aria-label="Primary"
      >
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}
        <a className="contact" href="#contact" onClick={closeMenu}>
          Contact
        </a>
      </nav>

      <button
        type="button"
        className="menu"
        ref={buttonRef}
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        Menu
      </button>
    </header>
  );
}
