// Lucide icon path data (ISC, lucide v1.61.0). Rendered as inline SVG strings
// for email templates, which cannot load external icon fonts or scripts.
type LucideElement = [string, Record<string, string | number>];

const ICONS: Record<string, LucideElement[]> = {
  "at-sign": [
    ["circle", { cx: 12, cy: 12, r: 4 }],
    ["path", { d: "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" }],
  ],
  clock: [
    ["circle", { cx: 12, cy: 12, r: 10 }],
    ["path", { d: "M12 6v6l4 2" }],
  ],
  globe: [
    ["circle", { cx: 12, cy: 12, r: 10 }],
    ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }],
    ["path", { d: "M2 12h20" }],
  ],
  "key-round": [
    [
      "path",
      {
        d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
      },
    ],
    ["circle", { cx: 16.5, cy: 7.5, fill: "currentColor", r: 0.5 }],
  ],
  "lock-keyhole": [
    ["circle", { cx: 12, cy: 16, r: 1 }],
    ["rect", { height: 12, rx: 2, width: 18, x: 3, y: 10 }],
    ["path", { d: "M7 10V7a5 5 0 0 1 10 0v3" }],
  ],
  mail: [
    ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" }],
    ["rect", { height: 16, rx: 2, width: 20, x: 2, y: 4 }],
  ],
  "mail-check": [
    [
      "path",
      { d: "M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" },
    ],
    ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" }],
    ["path", { d: "m16 19 2 2 4-4" }],
  ],
  "mail-open": [
    [
      "path",
      {
        d: "M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z",
      },
    ],
    ["path", { d: "m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" }],
  ],
  "shield-check": [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      },
    ],
    ["path", { d: "m9 12 2 2 4-4" }],
  ],
  x: [
    ["path", { d: "M18 6 6 18" }],
    ["path", { d: "m6 6 12 12" }],
  ],
};

function attrsToString(attrs: Record<string, string | number>): string {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
}

export function renderLucideIcon(
  name: string,
  size: number,
  color: string
): string {
  const elements = ICONS[name];
  if (!elements) {
    return "";
  }
  const inner = elements
    .map(([tag, attrs]) => `<${tag} ${attrsToString(attrs)} />`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle" aria-hidden="true" focusable="false">${inner}</svg>`;
}
