"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Attaches a muted background film to a section without paying for it up front.
 *
 * The element only gets a `src` once its host is within 300 px of the viewport,
 * so a loop that sits far down a long page never touches the network on first
 * paint — and playback pauses again the moment the host scrolls away or the tab
 * goes to the background.
 *
 * Usage:  const { videoRef, armed } = useAutoVideo(sectionRef);
 *         <video ref={videoRef} src={armed ? VIDEO.hero : undefined} preload="none" … />
 */
export function useAutoVideo(host: RefObject<HTMLElement | null>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    const el = host.current;
    if (!v || !el) return;

    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => {
        setArmed(true);
        void v.play().catch(() => {});
      }, 0);
      return () => window.clearTimeout(t);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setArmed(true);
          void v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [host]);

  // Browsers can hold a muted autoplay element until play() is called
  // explicitly, so nudge it once armed and retry on the first interaction.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !armed) return;
    v.muted = true;
    const kick = () => void v.play().catch(() => {});
    kick();
    window.addEventListener("pointerdown", kick, { once: true });
    return () => window.removeEventListener("pointerdown", kick);
  }, [armed]);

  return { videoRef, armed };
}
