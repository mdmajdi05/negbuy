"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "nb-theme";
const CHANGE_EVENT = "nb-theme-change";

type Mode = "dark" | "light";

/** `html[data-theme]` hi sach hai — React state sirf uska mirror (label ke liye). */
function readMode(): Mode {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange); // dusre tab se badla theme
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Header ka light/dark switcher (group 3 me, phone ke saath).
 *
 * Theme `document.documentElement.dataset.theme` par lagta hai aur localStorage
 * ("nb-theme") me save hota hai — pehla paint sahi ho, iske liye layout.tsx ka
 * chhota inline script attribute set kar deta hai (koi dark flash nahi).
 *
 * Icons pure CSS se switch hote hain (theme.css), aur mode `useSyncExternalStore`
 * se DOM attribute se padha jaata hai — isliye SSR HTML aur hydration bilkul
 * match karte hain (koi mismatch ya setState-in-effect nahi).
 */
export default function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, readMode, () => "dark" as const);

  const toggle = useCallback(() => {
    const next: Mode = readMode() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage band ho to bhi theme chalna chahiye */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const label =
    mode === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className="themeBtn"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <svg className="themeIconSun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
      </svg>
      <svg className="themeIconMoon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.8 13.4A8.6 8.6 0 1 1 10.6 3.2a7 7 0 0 0 10.2 10.2Z" />
      </svg>
    </button>
  );
}
