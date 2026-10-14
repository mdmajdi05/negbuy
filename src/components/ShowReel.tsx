"use client";

import { useRef, useState } from "react";
import { VIDEO, SERVICE } from "@/lib/media";
import { useAutoVideo } from "@/hooks/useAutoVideo";

export default function ShowReel() {
  const sectionRef = useRef<HTMLElement>(null);
  const { videoRef, armed } = useAutoVideo(sectionRef);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    if (!next) void v.play().catch(() => {});
  };

  return (
    <section className="nbReel" ref={sectionRef} aria-label="NEGBUY showreel">
      <video
        ref={videoRef}
        className="nbReelVideo"
        src={armed ? VIDEO.hero : undefined}
        poster={SERVICE.turbineBanner}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
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
