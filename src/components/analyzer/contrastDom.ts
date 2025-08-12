export type DomContrastResult = {
  selector: string;
  snippet: string;
  fg: string; // hex like #RRGGBB
  bg: string; // hex like #RRGGBB
  ratio: number;
  passes: boolean;
  fontSize: number;
  suggestedFg?: string; // suggested alternative color for AA
};

function toCssSelector(el: Element): string {
  if (!(el instanceof Element)) return '';
  const parts: string[] = [];
  while (el && el.nodeType === 1 && parts.length < 5) {
    let selector = el.nodeName.toLowerCase();
    if ((el as Element).id) {
      selector += `#${(el as Element).id}`;
      parts.unshift(selector);
      break;
    } else {
      let sib = el as Element;
      let nth = 1;
      while ((sib = sib.previousElementSibling as Element)) {
        if (sib.nodeName.toLowerCase() === selector) nth++;
      }
      selector += `:nth-of-type(${nth})`;
    }
    parts.unshift(selector);
    el = el.parentElement as Element;
  }
  return parts.join(' > ');
}

// Utilities
function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }
function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}

function parseColorToRgba(input: string): [number, number, number, number] | null {
  const s = input.trim();
  // hex
  const mHex = s.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (mHex) {
    let h = mHex[1];
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const num = parseInt(h, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 1];
  }
  // rgb/rgba
  const mRgb = s.match(/^rgba?\(([^)]+)\)$/i);
  if (mRgb) {
    const parts = mRgb[1].split(',').map(p => p.trim());
    const r = Number(parts[0]);
    const g = Number(parts[1]);
    const b = Number(parts[2]);
    const a = parts[3] !== undefined ? Number(parts[3]) : 1;
    if ([r,g,b].some(n => Number.isNaN(n))) return null;
    return [r, g, b, Number.isNaN(a) ? 1 : a];
  }
  // named colors (limited)
  if (s === 'transparent') return [0, 0, 0, 0];
  return null;
}

function compositeOver(fg: [number, number, number, number], bg: [number, number, number, number]): [number, number, number, number] {
  const [r1, g1, b1, a1] = fg;
  const [r2, g2, b2, a2] = bg;
  const a = a1 + a2 * (1 - a1);
  if (a === 0) return [0,0,0,0];
  const r = (r1 * a1 + r2 * a2 * (1 - a1)) / a;
  const g = (g1 * a1 + g2 * a2 * (1 - a1)) / a;
  const b = (b1 * a1 + b2 * a2 * (1 - a1)) / a;
  return [r, g, b, a];
}

function luminance([r, g, b]: [number, number, number]) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrastRatioFromRGB(f: [number, number, number], b: [number, number, number]) {
  const L1 = luminance(f) + 0.05;
  const L2 = luminance(b) + 0.05;
  const ratio = L1 > L2 ? L1 / L2 : L2 / L1;
  return Number(ratio.toFixed(2));
}

function getEffectiveBg(el: Element): [number, number, number, number] {
  let cur: Element | null = el as Element;
  let acc: [number, number, number, number] | null = null;
  const defaultBg: [number, number, number, number] = [255, 255, 255, 1]; // assume white canvas
  while (cur) {
    const cs = window.getComputedStyle(cur as Element);
    const bg = parseColorToRgba(cs.backgroundColor || 'transparent') || [0,0,0,0];
    acc = acc ? compositeOver(bg, acc) : bg;
    if (acc[3] >= 0.999) break; // opaque enough
    cur = cur.parentElement;
  }
  return acc ?? defaultBg;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [r * 255, g * 255, b * 255];
}

function suggestForegroundAA(fg: [number, number, number], bg: [number, number, number], target: number): [number, number, number] {
  const [h, s, l0] = rgbToHsl(fg[0], fg[1], fg[2]);
  // Try moving lightness toward 0 or 1 whichever increases contrast faster
  let best: [number, number, number] = fg.slice() as [number, number, number];
  let bestRatio = contrastRatioFromRGB(fg, bg);
  for (const dir of [-1, 1]) {
    for (let step = 0; step <= 100; step += 2) {
      const l = clamp(l0 + dir * step/100, 0, 1);
      const [r, g, b] = hslToRgb(h, s, l);
      const ratio = contrastRatioFromRGB([r, g, b], bg);
      if (ratio >= target) return [r, g, b];
      if (ratio > bestRatio) { bestRatio = ratio; best = [r, g, b]; }
    }
  }
  return best; // best effort
}

export function analyzeContrastInDom(limit = 30): DomContrastResult[] {
  const results: DomContrastResult[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode() as Element | null;
  while (node) {
    const el = node as Element;
    // Ignore decorative/hidden
    const cs = window.getComputedStyle(el);
    if (el.getAttribute('aria-hidden') === 'true' || el.getAttribute('role') === 'presentation' || el.hasAttribute('hidden')) {
      node = walker.nextNode() as Element | null; continue;
    }
    if (cs.display === 'none' || cs.visibility === 'hidden' || (el as HTMLElement).offsetParent === null) {
      node = walker.nextNode() as Element | null; continue;
    }
    const text = (el.textContent || '').trim();
    if (!text) { node = walker.nextNode() as Element | null; continue; }

    const colorRgba = parseColorToRgba(cs.color || 'rgb(0,0,0)') || [0,0,0,1];
    const bgRgba = getEffectiveBg(el);
    const ratio = contrastRatioFromRGB([colorRgba[0], colorRgba[1], colorRgba[2]], [bgRgba[0], bgRgba[1], bgRgba[2]]);
    const fontSizePx = parseFloat(cs.fontSize || '16');
    const isBold = (parseInt(cs.fontWeight || '400', 10) >= 700);
    const large = isBold ? fontSizePx >= 14 * (96/72) : fontSizePx >= 18 * (96/72); // 14pt bold or 18pt ~ 18.66px/24px
    const target = large ? 3.0 : 4.5;
    const passes = ratio >= target;

    let suggestedFg: string | undefined;
    if (!passes) {
      const [r, g, b] = suggestForegroundAA([colorRgba[0], colorRgba[1], colorRgba[2]], [bgRgba[0], bgRgba[1], bgRgba[2]], target);
      suggestedFg = rgbToHex(r, g, b);
    }

    results.push({
      selector: toCssSelector(el),
      snippet: text.slice(0, 60),
      fg: rgbToHex(colorRgba[0], colorRgba[1], colorRgba[2]),
      bg: rgbToHex(bgRgba[0], bgRgba[1], bgRgba[2]),
      ratio,
      passes,
      fontSize: Math.round(fontSizePx),
      suggestedFg,
    });

    if (results.length >= limit) break;
    node = walker.nextNode() as Element | null;
  }
  return results;
}
