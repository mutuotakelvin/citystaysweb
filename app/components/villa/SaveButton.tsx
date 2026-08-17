"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "../../components/icons";

export default function SaveButton({ slug }: { slug: string }) {
  const key = `lobelia-pearl:saved:${slug}`;
  const saved = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("lobelia-saved", onChange);
      return () => window.removeEventListener("lobelia-saved", onChange);
    },
    () => window.localStorage.getItem(key) === "true",
    () => false,
  );

  function toggleSaved() {
    window.localStorage.setItem(key, String(!saved));
    window.dispatchEvent(new Event("lobelia-saved"));
  }

  return (
    <button
      type="button"
      onClick={toggleSaved}
      aria-pressed={saved}
      aria-label={saved ? "Remove this villa from saved homes" : "Save this villa"}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium underline-offset-4 transition-colors cursor-pointer ${
        saved
          ? "bg-terracotta text-white"
          : "text-ink-deep hover:bg-sand-deep hover:underline"
      }`}
    >
      <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
