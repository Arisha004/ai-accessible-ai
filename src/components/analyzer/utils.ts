// Readability utilities: Flesch–Kincaid and helpers
export type ReadabilityResult = {
  readingEase: number;
  gradeLevel: number;
  words: number;
  sentences: number;
  syllables: number;
};

// Simple syllable estimator; not perfect but effective for readability
function countSyllables(word: string) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  return (
    (w.match(/[aeiouy]{1,2}/g)?.length || 0) -
    (w.endsWith("e") ? 1 : 0) +
    (/[aeiouy]$/.test(w) ? 1 : 0)
  ) || 1;
}

export function computeReadability(text: string): ReadabilityResult {
  const sentences = Math.max(1, (text.match(/[.!?]+\s|\n/g) || []).length);
  const wordsArr = text.trim().split(/\s+/).filter(Boolean);
  const words = wordsArr.length;
  const syllables = wordsArr.reduce((acc, w) => acc + countSyllables(w), 0);

  const readingEase = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words || 1);
  const gradeLevel = 0.39 * (words / sentences) + 11.8 * (syllables / words || 1) - 15.59;

  return { readingEase: Number(readingEase.toFixed(1)), gradeLevel: Number(gradeLevel.toFixed(1)), words, sentences, syllables };
}
