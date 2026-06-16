"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { staticMode } from "../lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** seconds between staggered children */
  stagger?: number;
  /** travel distance in px */
  y?: number;
  id?: string;
};

/**
 * Wraps a section and animates any descendant carrying the `reveal` class
 * into view on scroll. The `.reveal` class hides elements via CSS first, so
 * there is no flash before GSAP takes over, and reduced-motion / no-JS users
 * simply see the content in place.
 */
export default function Reveal({
  children,
  className,
  as,
  stagger = 0.09,
  y = 30,
  id,
}: RevealProps) {
  const scope = useRef<HTMLElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useGSAP(
    () => {
      // Content is visible by default. In static / reduced-motion mode we leave
      // it exactly as rendered.
      if (staticMode()) return;

      const items = gsap.utils.toArray<HTMLElement>(".reveal", scope.current);
      const list = items.length ? items : [scope.current as HTMLElement];

      // Apply the hidden start state before the browser paints (useGSAP runs in
      // a layout effect), then reveal each element as it scrolls into view.
      gsap.set(list, { opacity: 0, y });
      ScrollTrigger.batch(list, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger,
          }),
      });
    },
    { scope },
  );

  return (
    <Tag ref={scope} className={className} id={id}>
      {children}
    </Tag>
  );
}
