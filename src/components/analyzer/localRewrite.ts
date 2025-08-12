// Simple local, offline rewrite utility (no external APIs)
// - Replaces jargon with simpler words
// - Applies inclusive language substitutions (subset)
// - Breaks up very long sentences
// - Iteratively simplifies toward a target reading grade

import { computeReadability } from "./utils";

const JARGON_MAP: Array<[RegExp, string]> = [
  [/\butilize\b/gi, "use"],
  [/\bleverage\b/gi, "use"],
  [/\bapproximately\b/gi, "about"],
  [/\bcommence\b/gi, "start"],
  [/\bterminate\b/gi, "end"],
  [/\bprior to\b/gi, "before"],
  [/\bsubsequent to\b/gi, "after"],
  [/\bin order to\b/gi, "to"],
  [/\bendeavor\b/gi, "try"],
  [/\bfacilitate\b/gi, "help"],
  [/\bassist\b/gi, "help"],
];

const INCLUSIVE_MAP: Array<[RegExp, string]> = [
  [/\bblacklist(s|ed|ing)?\b/gi, "blocklist"],
  [/\bwhitelist(s|ed|ing)?\b/gi, "allowlist"],
  [/\b(master|slave)s?\b/gi, "primary/replica"],
  [/\bcrazy\b/gi, "confusing"],
  [/\bguys\b/gi, "everyone"],
  [/\bhandicap(ped)?\b/gi, "disabled"],
  [/\bgrandfathered\b/gi, "legacy"],
  [/\bdummy\b/gi, "placeholder"],
  [/\bman[-\s]?hours\b/gi, "person-hours"],
];

function simplifySentence(s: string, maxLen = 24) {
  const words = s.trim().split(/\s+/);
  if (words.length <= maxLen) return s.trim();
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxLen) {
    chunks.push(words.slice(i, i + maxLen).join(" "));
  }
  return chunks.join(". ");
}

export function localRewrite(text: string, targetGrade = 6): string {
  const normalize = (t: string) => t.replace(/\s+$/g, "").replace(/\r\n/g, "\n");
  const applyMaps = (t: string) => {
    let o = t;
    INCLUSIVE_MAP.forEach(([re, repl]) => { o = o.replace(re, repl); });
    JARGON_MAP.forEach(([re, repl]) => { o = o.replace(re, repl); });
    // Light adverb pruning and fillers
    o = o.replace(/\b(really|very|actually|basically|simply)\b/gi, "");
    // Passive voice hint: "is|was <verb>ed" -> make active where safe (very naive)
    o = o.replace(/\b(is|was|were) ([a-z]+)ed\b/gi, "$2");
    return o;
  };

  const shorten = (t: string, maxLen: number) => t
    .split(/(?<=[.!?])\s+|\n+/)
    .filter(Boolean)
    .map((s) => simplifySentence(s, maxLen))
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();

  let out = shorten(applyMaps(normalize(text)), Math.max(10, Math.min(24, Math.round(targetGrade * 2))));

  // Iterate up to 5 times toward target grade
  for (let i = 0; i < 5; i++) {
    const r = computeReadability(out);
    if (r.gradeLevel <= targetGrade + 0.2) break;
    const nextMax = Math.max(8, Math.round(Math.max(10, Math.min(24, Math.round(targetGrade * 2))) - (i + 1) * 2));
    out = shorten(applyMaps(out), nextMax);
  }

  return out;
}
