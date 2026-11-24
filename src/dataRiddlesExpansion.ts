import { diagnosisCases, nextStepCases } from "./data";
import type { Riddle } from "./dataRiddles";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hideAnswer = (text: string, answer: string) => {
  let result = text.replace(/\s+/g, " ").trim();
  for (const part of answer.split(/[^A-Za-z0-9]+/).filter((word) => word.length >= 3)) {
    result = result.replace(new RegExp("\\b" + escapeRegExp(part) + "[A-Za-z]*\\b", "gi"), "the finding");
  }
  return result.replace(/\bthe finding(?:\s+(?:the\s+)?finding)+\b/gi, "the finding");
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
    kind: "Diagnosis" as const,
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
