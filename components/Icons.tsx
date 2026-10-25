import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 22, height: 22, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
  "aria-hidden": true,
};

export const HeartIcon = () => (
  <svg {...base}><path d="M12 20s-7-4.4-9-9.1C1.7 7.6 3.8 4.5 7 4.5c2 0 3.3 1 5 3 1.7-2 3-3 5-3 3.2 0 5.3 3.1 4 6.4C19 15.6 12 20 12 20z" /></svg>
);
export const MessageIcon = () => (
  <svg {...base}><path d="M21 12a8 8 0 0 1-11.8 7L3 20.5l1.6-5A8 8 0 1 1 21 12z" /></svg>
);
export const SearchIcon = () => (
  <svg {...base} width={18} height={18}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const ProfileIcon = () => (
  <svg {...base}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
);
export const SignInIcon = () => (
  <svg {...base}><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg>
);
export const ChevronIcon = ({ dir }: { dir: "left" | "right" }) => (
  <svg {...base}><path d={dir === "left" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} /></svg>
);
