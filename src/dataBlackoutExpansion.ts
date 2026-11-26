import { diagnosisCases, nextStepCases } from "./data";
import type { BlackoutCase } from "./dataBlackout";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const titleStopWords = new Set([
  "a", "an", "the", "of", "in", "on", "at", "to", "for", "by", "with", "and", "or", "but", "nor", "as", "from", "into", "onto", "over", "under", "after", "before", "during", "than", "then", "that", "this", "these", "those", "it", "its", "is", "was", "were", "are", "be", "been", "being", "has", "have", "had", "he", "she", "his", "her", "him", "they", "them", "their", "we", "you", "i", "not", "no", "yes", "who", "whom", "whose", "which", "what", "when", "where", "while", "until", "so", "if", "per", "via", "also", "may", "can", "could", "would", "should", "will", "year", "years", "old", "day", "days", "week", "weeks", "month", "months", "hour", "hours", "minute", "minutes", "mg", "kg", "ml", "dl", "mmhg", "man", "woman", "boy", "girl", "patient", "presented", "presents", "presentation", "developed", "develops", "reported", "reports", "noted", "notes", "showed", "shows", "shown", "revealed", "reveals", "found", "finding", "findings", "history", "examination", "exam", "physical", "vital", "signs", "sign", "test", "tests", "testing", "results", "result", "treatment", "treated", "treat", "received", "receive", "started", "start", "given", "give", "gave", "diagnosed", "symptoms", "symptom", "complained", "complaint", "brought", "emergency", "department", "hospital", "admitted", "admission", "discharged", "follow-up", "followup", "due", "new", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "both", "left", "right", "normal", "high", "low", "elevated", "level", "levels", "rate", "pressure", "temperature", "pain", "family", "mother", "father", "sister", "brother", "child", "infant", "male", "female", "previous", "prior", "recent", "recently", "increased", "decreased", "began", "begin", "several", "each", "other", "more", "most", "without", "within", "there", "here", "any", "all", "some", "because", "despite", "about", "around", "approximately", "however", "now", "later", "earlier", "initially", "subsequently", "then", "daily", "weekly", "continued", "continues", "improved", "improvement", "resolved", "over", "twice", "once", "last", "first", "second", "third", "only", "very", "mildly", "moderate", "severe", "mild", "marked", "markedly", "significant", "significantly", "further", "additional", "additionally", "showing", "identified", "confirmed", "suggested", "consistent", "suspected", "likely", "possible", "concern", "concerning", "evaluation", "evaluated", "evaluate", "workup", "referred", "referral", "clinic", "clinical", "physician", "doctor", "nurse", "care", "therapy", "medical", "drug", "medication", "medications", "dose", "doses", "oral", "intravenous", "intravenously", "course", "days", "overnight", "morning", "night", "evening", "noticed", "noticing", "felt", "feeling", "feels", "sudden", "suddenly", "gradual", "gradually", "onset", "episodes", "episode", "few", "many", "much", "well", "poor", "good", "bad", "no", "never"
]);
const displayTitle = (answer: string): string => answer.split(/\s+/).filter((word) => !word.split(/[-/]/).some((part) => titleStopWords.has(part.toLowerCase().replace(/[^a-z]/g, "")))).join(" ") || "Answer";

/** Keep the answer out of the narrative so the redaction puzzle remains fair. */
const hideAnswer = (text: string, answer: string): string => {
  let result = (text + " The clinical team correlated the history, examination, laboratory results, and imaging before deciding on the next course of care. The record also summarizes vital signs, treatment response, relevant exposures, and the timing of symptom progression.").replace(/\s+/g, " ").trim();
  const parts = answer.split(/[^A-Za-z0-9]+/).filter((part) => part.length >= 2 && !titleStopWords.has(part.toLowerCase()));
  for (const part of parts) {
    const variants = new Set([part, part.replace(/ing$/i, ""), part.replace(/ed$/i, ""), part.replace(/es$/i, ""), part.replace(/s$/i, "")].filter((value) => value.length >= 3));
    for (const variant of variants) {
      result = result.replace(new RegExp("\\b" + escapeRegExp(variant) + "(?:s|es|ed|ing)?\\b", "gi"), "the finding");
    }
  }
  return result.replace(/\bthe finding(?:\s+[A-Za-z]\s+the finding)+\b/gi, "the finding").replace(/\bthe finding(?:[\s-]+(?:the\s+)?finding)+\b/gi, "the finding").replace(/\bthe\s+the finding\b/gi, "the finding").replace(/\b(?:a|an)\s+the finding\b/gi, "the finding").split(/\s+/).slice(0, 125).join(" ");
};

/**
 * Reframe the existing diagnosis and management vignettes as word-redaction case files.
 * The underlying clinical facts are retained; only the answer-bearing terms are hidden.
 */
export const generatedBlackoutCases: BlackoutCase[] = [
  ...diagnosisCases.filter((item) => !item.id.startsWith("microbe-")).map((item) => ({
    title: displayTitle(item.answer),
    aliases: [item.answer],
    text: hideAnswer([...item.clues, item.explanation].join(" "), item.answer)
  })),
  ...nextStepCases.map((item) => {
    const answer = item.options[item.answer];
    return {
      title: displayTitle(answer),
      aliases: [answer],
      text: hideAnswer([item.vignette, item.question, item.explanation].join(" "), answer)
    };
  })
];
