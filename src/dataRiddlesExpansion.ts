import { diagnosisCases, nextStepCases } from "./data";
import type { Riddle } from "./dataRiddles";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/**
 * Function words are never the answer-bearing part of a phrase, so they are never redacted: replacing them
 * garbles the sentence ("mass with shoulder pain" became "mass the finding shoulder pain", and "What is the
 * next diagnostic step?" became "What is the finding next diagnostic step?" when an answer phrase happened
 * to contain "with" or "the"). Mirrors the stopword filtering already used by dataBlackoutExpansion.
 */
const redactionStopWords = new Set([
  "a", "an", "the", "of", "in", "on", "at", "to", "for", "by", "with", "and", "or", "but", "nor", "as", "from", "into", "onto", "over", "under", "after", "before", "during", "than", "then", "that", "this", "these", "those", "it", "its", "is", "was", "were", "are", "be", "been", "being", "has", "have", "had", "he", "she", "his", "her", "him", "they", "them", "their", "we", "you", "i", "not", "no", "yes", "who", "whom", "whose", "which", "what", "when", "where", "while", "until", "so", "if", "per", "via", "also", "may", "can", "could", "would", "should", "will"
]);
/** Collapse the artifacts adjacent redactions leave behind: repeated tokens, hyphen-joined repeats, and an article doubled by a redaction ("the the finding"). */
const cleanRedactions = (text: string): string => text
  .replace(/\bthe finding(?:\s+[A-Za-z]\s+the finding)+\b/gi, "the finding")
  .replace(/\bthe finding(?:[\s-]+(?:the\s+)?finding)+\b/gi, "the finding")
  .replace(/\bthe\s+the finding\b/gi, "the finding")
  .replace(/\b(?:a|an)\s+the finding\b/gi, "the finding");
const hideAnswer = (text: string, answer: string) => {
  let result = text.replace(/\s+/g, " ").trim();
  for (const part of answer.split(/[^A-Za-z0-9]+/).filter((word) => word.length >= 3 && !redactionStopWords.has(word.toLowerCase()))) {
    result = result.replace(new RegExp("\\b" + escapeRegExp(part) + "[A-Za-z]*\\b", "gi"), "the finding");
  }
  return cleanRedactions(result);
};

/** Cases that reveal one sentence in growing pieces would repeat the same opening in every riddle clue; give each clue only its new words. */
const increments = (clues: readonly string[]): string[] => clues.map((clue, i) => {
  if (i === 0) return clue;
  const before = clues[i - 1].replace(/…$/, "").trim();
  return clue.startsWith(before) ? "…" + clue.slice(before.length).trim() : clue;
});

export const generatedRiddles: Riddle[] = [
  ...diagnosisCases.map((item) => ({
    id: "dx-" + item.id,
    // Microbe cases ask the player to name an organism, so the "I am a…" header and the same-kind
    // distractor pool must say Microbe, not Diagnosis (issue 129).
    kind: item.id.startsWith("microbe-") ? "Microbe" as const : "Diagnosis" as const,
    answer: item.answer,
    clues: [
      "My story begins: " + hideAnswer(increments(item.clues)[0], item.answer),
      "Another clue: " + hideAnswer(increments(item.clues)[1], item.answer),
      "A key finding is: " + hideAnswer(increments(item.clues)[2], item.answer),
      "Put together, these findings point to: " + hideAnswer(item.explanation, item.answer)
    ] as [string, string, string, string]
  })),
  ...nextStepCases.map((item) => {
    const answer = item.options[item.answer];
    return {
      id: "ns-" + item.id,
      kind: "Next step" as const,
      answer,
      clues: [
        "I am caring for a patient with: " + hideAnswer(item.vignette, answer),
        "The clinical question is: " + hideAnswer(item.question, answer),
        "The decision is informed by: " + hideAnswer(item.explanation, answer),
        "This problem belongs to the " + item.specialty.toLowerCase() + " service."
      ] as [string, string, string, string]
    };
  })
];
