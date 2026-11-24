import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { siteCopy } from "@/content/site";
import { BackgroundVideo } from "./background-video";

/** Small label on every AI-generated photo or video: honest, and required in the EU (AI Act). */
export function AiCredit({
  video = false,
  className = "",
}: {
  video?: boolean;
  className?: string;
}) {
  return (
    // Always shown, but quiet (v7): a small sentence-case caption, not an uppercase badge.
    <span
      className={`pointer-events-none rounded-full bg-black/55 px-2 py-0.5 text-[0.6875rem] font-medium text-white/90 backdrop-blur-sm ${className}`}
    >
      {video ? siteCopy.aiGeneratedVideo : siteCopy.aiGenerated}
    </span>
  );
}

/**
 * A photo in a rounded frame with the AI credit, and optional UI overlay (e.g. a transcript card).
 * Below-the-fold by default: lazy-loaded, sized by `sizes` so phones never download desktop files.
 */
export function Photo(props: {
  src: StaticImageData;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  overlay?: ReactNode;
  overlayClassName?: string;
}) {
  return (
    <figure
      className={`relative overflow-hidden rounded-[1.5rem] bg-panel ${props.className ?? ""}`}
    >
      {/* Below the fold, so a tiny blurred preview shows until the photo arrives. */}
      <Image
        src={props.src}
        alt={props.alt}
        sizes={props.sizes}
        placeholder="blur"
        className={`h-full w-full object-cover ${props.imageClassName ?? ""}`}
      />
      {props.overlay && (
        <div
          className={`absolute rounded-2xl border border-line bg-bg/90 p-4 shadow-float backdrop-blur-md ${props.overlayClassName ?? "right-4 bottom-4 left-4 sm:left-auto sm:w-80"}`}
        >
          {props.overlay}
        </div>
      )}
      <AiCredit className="absolute top-3 left-3" />
    </figure>
  );
}

/** A looping muted video over its poster, starting when scrolled into view. */
export function VideoPanel(props: {
  poster: StaticImageData;
  src: string;
  sizes: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <figure
      className={`relative overflow-hidden rounded-[1.5rem] bg-panel ${props.className ?? ""}`}
    >
      <Image
        src={props.poster}
        alt=""
        sizes={props.sizes}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <BackgroundVideo
        start="visible"
        sources={[{ src: props.src }]}
        className="absolute inset-0 h-full w-full object-cover"
        buttonClassName="absolute right-3 bottom-3 z-10"
      />
      {props.children}
      <AiCredit video className="absolute top-3 left-3" />
    </figure>
  );
}
