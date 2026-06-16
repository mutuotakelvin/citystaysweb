/**
 * Returns true when animations should be skipped and content shown in its
 * final state: either the user prefers reduced motion, or the page is loaded
 * with a `?static` query param (used for visual testing / snapshots).
 */
export function staticMode(): boolean {
  if (typeof window === "undefined") return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flagged = new URLSearchParams(window.location.search).has("static");
  return reduce || flagged;
}
