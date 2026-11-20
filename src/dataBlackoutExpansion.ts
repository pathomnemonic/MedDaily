import { diagnosisCases, nextStepCases } from "./data";
import type { BlackoutCase } from "./dataBlackout";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Keep the answer out of the narrative so the redaction puzzle remains fair. */
const hideAnswer = (text: string, answer: string): string => {
  let result = text.replace(/\s+/g, " ").trim();
  const parts = answer.split(/[^A-Za-z0-9]+/).filter((part) => part.length >= 4);
  for (const part of parts) {
    result = result.replace(new RegExp("\\b" + escapeRegExp(part) + "(?:s|es|ed|ing)?\\b", "gi"), "the finding");
  }
  return result.split(/\s+/).slice(0, 125).join(" ");
};

/**
 * Reframe the existing diagnosis and management vignettes as word-redaction case files.
 * The underlying clinical facts are retained; only the answer-bearing terms are hidden.
 */
export const generatedBlackoutCases: BlackoutCase[] = [
  ...diagnosisCases.map((item) => ({
    title: item.answer,
    aliases: [],
    text: hideAnswer([...item.clues, item.explanation].join(" "), item.answer)
  })),
  ...nextStepCases.map((item) => {
    const answer = item.options[item.answer];
    return {
      title: answer,
      aliases: [],
      text: hideAnswer([item.vignette, item.question, item.explanation].join(" "), answer)
    };
  })
];
