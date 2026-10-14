"use client";

import { useRef } from "react";
import { VIDEO, SERVICE } from "@/lib/media";
import { useAutoVideo } from "@/hooks/useAutoVideo";

/**
 * Company capability film. Wrapped in a client component so the clip is only
 * fetched once the story section approaches the viewport — and paused again
 * the moment it leaves.
 */
export default function CompanyFilm() {
  const figureRef = useRef<HTMLElement>(null);
  const { videoRef, armed } = useAutoVideo(figureRef);

  return (
    <figure className="nbAboutFilm rv" data-rv-delay="120" ref={figureRef}>
      <video
        ref={videoRef}
        src={armed ? VIDEO.about : undefined}
        poster={SERVICE.aboutVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
      />
      <figcaption>
        <b>NEGBUY — capability film</b>
        <span>Autoplaying · company footage</span>
      </figcaption>
    </figure>
  );
}
