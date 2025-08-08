export type InclusiveIssue = { term: string; suggestion: string; index: number; context: string };

const dictionary: Array<{ pattern: RegExp; suggestion: string; term: string }> = [
  { term: "blacklist", pattern: /\bblacklist(s|ed|ing)?\b/gi, suggestion: "blocklist" },
  { term: "whitelist", pattern: /\bwhitelist(s|ed|ing)?\b/gi, suggestion: "allowlist" },
  { term: "master/slave", pattern: /\b(master|slave)s?\b/gi, suggestion: "primary/replica" },
  { term: "crazy", pattern: /\bcrazy\b/gi, suggestion: "confusing" },
  { term: "guys", pattern: /\bguys\b/gi, suggestion: "everyone" },
  { term: "handicapped", pattern: /\bhandicap(ped)?\b/gi, suggestion: "disabled" },
  { term: "grandfathered", pattern: /\bgrandfathered\b/gi, suggestion: "legacy" },
  { term: "dummy", pattern: /\bdummy\b/gi, suggestion: "placeholder" },
  { term: "man-hours", pattern: /\bman[-\s]?hours\b/gi, suggestion: "person-hours" },
];

export function findInclusiveLanguageIssues(text: string): InclusiveIssue[] {
  const issues: InclusiveIssue[] = [];
  dictionary.forEach(({ pattern, suggestion, term }) => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const start = Math.max(0, match.index - 20);
      const end = Math.min(text.length, match.index + match[0].length + 20);
      issues.push({ term, suggestion, index: match.index, context: text.slice(start, end) });
    }
  });
  return issues.sort((a, b) => a.index - b.index);
}
