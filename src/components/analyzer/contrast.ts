export type ContrastCheck = { fg: string; bg: string; ratio: number; passes: boolean };

function luminance([r, g, b]: [number, number, number]) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function parseColor(str: string): [number, number, number] | null {
  const hex = str.trim();
  if (/^#([\da-f]{3}|[\da-f]{6})$/i.test(hex)) {
    let h = hex.substring(1);
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const num = parseInt(h, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  const m = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/i.exec(str);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return null;
}

export function contrastRatio(fg: string, bg: string) {
  const f = parseColor(fg); const b = parseColor(bg);
  if (!f || !b) return 0;
  const L1 = luminance(f) + 0.05;
  const L2 = luminance(b) + 0.05;
  const ratio = L1 > L2 ? L1 / L2 : L2 / L1;
  return Number(ratio.toFixed(2));
}

export function sampleContrastChecks(colors: string[] = ["#6b7280", "#1f2937", "#8b5cf6"]) : ContrastCheck[] {
  const bg = "#ffffff";
  return colors.map(c => ({ fg: c, bg, ratio: contrastRatio(c, bg), passes: contrastRatio(c, bg) >= 4.5 }));
}

export function extractColorsFromHtml(html: string): string[] {
  const set = new Set<string>();
  const hexes = html.match(/#[0-9a-fA-F]{3,6}/g) || [];
  hexes.forEach(h => set.add(h));
  const rgbs = html.match(/rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)/g) || [];
  rgbs.forEach(r => set.add(r));
  return Array.from(set).slice(0, 10);
}
