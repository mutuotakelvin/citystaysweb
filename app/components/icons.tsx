import type { SVGProps } from "react";

// Lucide-style stroked icons on a consistent 24x24 grid.
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ShieldCheck = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const Lock = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <path d="M12 14.5v2" />
  </svg>
);

export const HomeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 11 12 4l8 7" />
    <path d="M6 9.5V20h12V9.5" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

export const Concierge = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 5h16v11H8l-4 3V5Z" />
    <path d="M8.5 10.5h7M8.5 13h4" />
  </svg>
);

export const Heart = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 20s-7-4.4-9.2-8.5C1.2 8.3 2.7 5.5 5.6 5.5c1.8 0 3.1 1 4.4 2.6 1.3-1.6 2.6-2.6 4.4-2.6 2.9 0 4.4 2.8 2.8 6C19 15.6 12 20 12 20Z" />
  </svg>
);

export const Star = (p: IconProps) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
  </svg>
);

export const MapPin = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" />
    <circle cx="12" cy="11" r="2.2" />
  </svg>
);

export const Calendar = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="5.5" width="16" height="15" rx="2" />
    <path d="M4 9.5h16M8 3.5v4M16 3.5v4" />
  </svg>
);

export const ArrowRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const Search = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);

export const Menu = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const Close = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Bed = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 17v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
    <path d="M3 13h18M3 17v2M21 17v2" />
    <path d="M7 9V7.5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 17 7.5V9" />
  </svg>
);

export const Bath = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
    <path d="M6 12V6.5A2.5 2.5 0 0 1 8.5 4 2.2 2.2 0 0 1 11 6" />
    <path d="M6 19l-1 1.5M18 19l1 1.5" />
  </svg>
);

export const Users = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2A3 3 0 0 1 16 11M16.5 13.2A5.5 5.5 0 0 1 20.5 18.5" />
  </svg>
);

export const Facebook = (p: IconProps) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="M13.5 21v-7h2.3l.4-2.7h-2.7V9.5c0-.8.3-1.3 1.4-1.3h1.4V5.8c-.7-.1-1.5-.2-2.3-.2-2.3 0-3.8 1.4-3.8 3.9v2.1H7.7V14h2.6v7h3.2Z" />
  </svg>
);

export const Instagram = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="4" width="16" height="16" rx="4.5" />
    <circle cx="12" cy="12" r="3.4" />
    <circle cx="16.4" cy="7.6" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const XSocial = (p: IconProps) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="M17.5 4h2.6l-5.7 6.5L21 20h-5.2l-4-5.3L7 20H4.4l6.1-7L3.6 4h5.3l3.6 4.8L17.5 4Zm-.9 14.4h1.4L8.9 5.5H7.4l9.2 12.9Z" />
  </svg>
);

export const LogoMark = (p: IconProps) => (
  <svg viewBox="0 0 24 24" width={24} height={24} {...p}>
    <text
      x="12"
      y="17"
      textAnchor="middle"
      fontFamily="var(--font-cormorant), serif"
      fontSize="16"
      fontWeight="600"
      fill="currentColor"
    >
      C
    </text>
  </svg>
);
