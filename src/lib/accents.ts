import type { AccentKey } from "./types";

export const ACCENTS: { key: AccentKey; label: string; hex: string }[] = [
  { key: "clay", label: "Clay", hex: "#c2563b" },
  { key: "honey", label: "Honey", hex: "#e6b443" },
  { key: "sage", label: "Sage", hex: "#7fa07a" },
  { key: "sky", label: "Sky", hex: "#6b9bc3" },
  { key: "plum", label: "Plum", hex: "#9b6b9b" },
  { key: "slate", label: "Slate", hex: "#6b7280" },
];

export function accentHex(key: AccentKey) {
  return ACCENTS.find((a) => a.key === key)?.hex ?? "#c2563b";
}

export function relativeTime(ms: number) {
  const diff = Date.now() - ms;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
