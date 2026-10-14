"use client";

import { useEffect, useRef, useState } from "react";
import { VIDEO, SERVICE } from "@/lib/media";

export default function ShowReel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Some browsers hold a muted `autoPlay` element until play() is called
  // explicitly, so nudge it once on mount and retry on the first interaction.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const kick = () => void v.play().catch(() => {});
    kick();
    window.addEventListener("pointerdown", kick, { once: true });
    window.addEventListener("scroll", kick, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("scroll", kick);
    };
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    if (!next) void v.play().catch(() => {});
  };

  return (
    <section className="nbReel" aria-label="NEGBUY showreel">
      <video
        ref={videoRef}
        className="nbReelVideo"
        src={VIDEO.hero}
        poster={SERVICE.turbineBanner}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <span className="nbReelScrim" aria-hidden="true" />

      <div className="nbReelInner">
        <div className="nbReelCopy rv">
          <div className="kicker">Showreel</div>
          <h2>
            THE WORK,
            <br />
            <span>IN MOTION.</span>
          </h2>
          <p>
            Real turbines, real plants, real crews. A look at the equipment we
            supply, the overhauls we run and the sites we keep producing.
          </p>
          <ul className="nbReelStats">
            <li>
              <b>45,000+</b>
              <span>Part numbers</span>
            </li>
            <li>
              <b>40+</b>
              <span>Countries</span>
            </li>
            <li>
              <b>24/7</b>
              <span>Breakdown desk</span>
            </li>
          </ul>
        </div>

        <button
          type="button"
          className={`nbReelToggle${muted ? "" : " is-on"}`}
          onClick={toggle}
          aria-pressed={!muted}
        >
          <span className="nbReelIcon" aria-hidden="true">
            <i />
            <i />
          </span>
          {muted ? "Unmute showreel" : "Mute showreel"}
        </button>
      </div>

      <span className="nbReelBadge" aria-hidden="true">
        <i /> LIVE · AUTOPLAY
      </span>
    </section>
  );
}
