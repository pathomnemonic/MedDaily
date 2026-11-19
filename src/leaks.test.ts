import { describe, expect, it } from "vitest";
import { diagnosisCases, labPrompts } from "./data";
import { scrambleWordsExtended } from "./dataExtra";
import { triviaQuestions } from "./dataArcade";
import { riddles } from "./dataRiddles";
import { deepDivePromptsExpanded } from "./dataDeepDiveExtra";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
/** True when `text` contains `answer` as whole words (or any significant word of a multi-word answer for riddles). */
const contains = (text: string, answer: string) => (" " + norm(text) + " ").includes(" " + norm(answer) + " ");

describe("pre-answer text never contains the answer", () => {
  it("Trivia Rumble questions do not repeat the correct option", () => {
    const bad = triviaQuestions.filter((q) => norm(q.options[q.answer]).length >= 4 && contains(q.question, q.options[q.answer])).map((q) => q.id + ": " + q.question);
    expect(bad).toEqual([]);
  });
  it("Differential clues and titles do not name the diagnosis", () => {
    const bad = diagnosisCases.filter((c) => [c.title, ...c.clues].some((t) => contains(t, c.answer))).map((c) => c.id);
    expect(bad).toEqual([]);
  });
  it("Riddle Lab clues do not contain the answer", () => {
    const bad = riddles.filter((r) => r.clues.some((c) => contains(c, r.answer))).map((r) => r.answer);
    expect(bad).toEqual([]);
  });
  it("Labline prompts do not print the value", () => {
    const bad = labPrompts.filter((l) => l.value !== 0 && (l.prompt.includes(String(l.value)))).map((l) => l.id + ": " + l.prompt);
    expect(bad).toEqual([]);
  });
  it("Anagram Sprint hints do not contain the word", () => {
    const bad = scrambleWordsExtended.filter(([w, hint]) => contains(hint, w)).map(([w]) => w);
    expect(bad).toEqual([]);
  });
  it("Deep Scan prompts do not contain a listed answer", () => {
    const bad = deepDivePromptsExpanded.filter((p) => p.answers.some((a) => norm(a.answer).length >= 5 && contains(p.prompt, a.answer))).map((p) => p.prompt);
    expect(bad).toEqual([]);
  });
});
