// Simple local, offline rewrite utility (no external APIs)
// - Replaces jargon with simpler words
// - Applies inclusive language substitutions (subset)
// - Breaks up very long sentences

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

export function localRewrite(text: string): string {
  let out = text
    .replace(/\s+$/g, "")
    .replace(/\r\n/g, "\n");

  // Apply inclusive language substitutions
  INCLUSIVE_MAP.forEach(([re, repl]) => {
    out = out.replace(re, repl);
  });

  // Apply jargon simplifications
  JARGON_MAP.forEach(([re, repl]) => {
    out = out.replace(re, repl);
  });

  // Split into sentences and shorten long ones
  const sentences = out
    .split(/(?<=[.!?])\s+|\n+/)
    .filter(Boolean)
    .map((s) => simplifySentence(s));

  // Rejoin with single spaces and normalized newlines
  const result = sentences.join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return result;
}
