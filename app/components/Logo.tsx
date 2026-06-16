import type { SVGProps } from "react";

/**
 * City Stays logomark — a map pin framing a city skyline, recreated as vector
 * from the brand artwork. Gold reads on both the dark hero and the sand UI.
 */
export function LogoMark({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 48"
      className={className}
      role="img"
      aria-label="City Stays"
      {...props}
    >
      <defs>
        <linearGradient id="cs-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d2a85b" />
          <stop offset="0.55" stopColor="#b8893f" />
          <stop offset="1" stopColor="#a6864e" />
        </linearGradient>
      </defs>
      {/* Pin */}
      <path
        d="M20 2.5C29.5 2.5 35.5 9.5 35.5 18.5C35.5 29.5 26 39 20 45.5C14 39 4.5 29.5 4.5 18.5C4.5 9.5 10.5 2.5 20 2.5Z"
        fill="none"
        stroke="url(#cs-gold)"
        strokeWidth="2.4"
      />
      {/* Skyline */}
      <path
        d="M11 30.5L11 25L13 25L13 22L15 22L15 26L17 26L17 16.8L17.8 16.8L17.8 12.4L18.7 12.4L18.7 16.8L20 16.8L20 14.6L22 14.6L22 20L24 20L24 24L26 24L26 21L28 21L28 26L29 26L29 30.5Z"
        fill="url(#cs-gold)"
      />
      {/* Ground line */}
      <rect x="10.5" y="31.2" width="19" height="1.5" rx="0.75" fill="url(#cs-gold)" />
    </svg>
  );
}

type LogoProps = {
  tone?: "light" | "dark";
  className?: string;
  /** size of the mark in px */
  size?: number;
};

export default function Logo({ tone = "dark", className = "", size = 38 }: LogoProps) {
  const stays = tone === "light" ? "text-white" : "text-ink-deep";
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark style={{ width: size, height: size }} className="shrink-0" />
      <span className="flex items-baseline leading-none">
        <span className="font-display text-[1.55em] font-semibold tracking-tight text-gold">
          City
        </span>
        <span
          className={`-ml-0.5 font-script text-[1.5em] leading-none ${stays}`}
          style={{ fontFamily: "var(--font-script)" }}
        >
          Stays
        </span>
      </span>
    </span>
  );
}
