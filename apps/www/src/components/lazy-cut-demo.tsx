"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

function DemoPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="min-h-[34rem] rounded-[1.25rem] border border-line-strong bg-raised sm:min-h-[31rem]"
    />
  );
}

// The demo's JavaScript is its own chunk, fetched only when it is needed.
const CutDemo = dynamic(() => import("./cut-demo").then((module) => module.CutDemo), {
  loading: DemoPlaceholder,
});

/**
 * Section-level lazy loading (adobe.com's "lazy" phase): the interactive demo mounts, and its code
 * downloads, only when the visitor scrolls near it. A same-size placeholder avoids layout shift.
 */
export function LazyCutDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{show ? <CutDemo /> : <DemoPlaceholder />}</div>;
}
