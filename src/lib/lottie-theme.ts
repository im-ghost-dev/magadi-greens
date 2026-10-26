type RGB = [number, number, number];
const hex = (h: string): RGB =>
  [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
const same = (a: number[], b: RGB) =>
  a.slice(0, 3).every((v, i) => Math.abs(v - b[i]) < 0.02);

export const CAT_THEMES = {
  light: { "#1a2d35": "#14401f", "#aaff00": "#2e9a3a", "#ffffff": "#f6f3e8" },
  dark: { "#1a2d35": "#e9f2dc", "#aaff00": "#5fd36b", "#ffffff": "#0f2a17" },
} as const;

export function themeLottie<T>(json: T, mode: "light" | "dark"): T {
  const map = Object.entries(CAT_THEMES[mode]).map(
    ([from, to]) => [hex(from), hex(to)] as [RGB, RGB],
  );
  const copy = structuredClone(json) as any;
  (function walk(o: any) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === "object") {
      if ((o.ty === "fl" || o.ty === "st") && o.c && o.c.a === 0 && Array.isArray(o.c.k)) {
        for (const [from, to] of map) {
          if (same(o.c.k, from)) {
            o.c.k = [...to, o.c.k[3] ?? 1];
            break;
          }
        }
      }
      Object.values(o).forEach(walk);
    }
  })(copy);
  return copy;
}
