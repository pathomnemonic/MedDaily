import { sfx } from "./audio";

/** Small particle burst + optional floating label at a point (or the centre of an element). Cosmetic only. */
export function burst(origin: Element | { x: number; y: number } | null, label?: string, colors = ["#ffd54a", "#ff5d9e", "#52e3b0", "#36bdf5", "#a99aff"]) {
  if (document.documentElement.dataset.motion === "reduced") return;
  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  if (origin) {
    if ("getBoundingClientRect" in origin) { const b = origin.getBoundingClientRect(); x = b.left + b.width / 2; y = b.top + b.height / 2; }
    else { x = origin.x; y = origin.y; }
  }
  const glyphs = ["★", "✚", "●", "◆"];
  for (let i = 0; i < 16; i++) {
    const dot = document.createElement("i");
    dot.textContent = glyphs[i % glyphs.length];
    const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.4, dist = 40 + Math.random() * 50;
    dot.className = "burst-dot";
    dot.style.cssText = `left:${x}px;top:${y}px;color:${colors[i % colors.length]};--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist}px`;
    document.body.appendChild(dot);
    window.setTimeout(() => dot.remove(), 750);
  }
  if (label) {
    const tag = document.createElement("span");
    tag.className = "float-points"; tag.textContent = label;
    tag.style.cssText = `left:${x - 30}px;top:${y - 20}px`;
    document.body.appendChild(tag);
    window.setTimeout(() => tag.remove(), 950);
  }
}

/** Celebrate a right answer / punish a wrong one with sound and (for rights) a burst. */
export function reward(good: boolean, origin?: Element | null, label?: string) {
  sfx(good ? "correct" : "wrong");
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("pip", { detail: good ? "cheer" : "sad" }));
  if (good) burst(origin ?? null, label);
  else if (origin) { origin.classList.remove("shake"); void (origin as HTMLElement).offsetWidth; origin.classList.add("shake"); }
}

const GOOD = ["right", "matched", "found", "found-cell", "target-found", "step-right", "clue-complete", "complete"];
const BAD = ["wrong", "step-wrong", "error-cell"];

/**
 * Watches a game stage for state classes that signal success or failure and plays the matching sound.
 * A "bad" class in the same batch wins over a "good" one (the correct option is always highlighted
 * after a wrong pick). Games with their own explicit effects opt out by being inside `[data-own-sfx]`.
 */
export function watchStage(root: HTMLElement): () => void {
  let good: Element | null = null, bad: Element | null = null, pending: number | null = null;
  const flush = () => {
    pending = null;
    if (bad) reward(false, bad); else if (good) reward(true, good);
    good = bad = null;
  };
  const schedule = () => { if (pending === null) pending = window.setTimeout(flush, 60); };
  const note = (el: Element, fresh: string[]) => {
    if (el.closest("[data-own-sfx]")) return;
    if (fresh.some((c) => BAD.includes(c))) { bad ??= el; schedule(); }
    else if (fresh.some((c) => GOOD.includes(c))) { good ??= el; schedule(); }
  };
  const observer = new MutationObserver((records) => {
    for (const rec of records) {
      if (rec.type === "attributes" && rec.target instanceof Element) {
        const before = new Set((rec.oldValue ?? "").split(/\s+/));
        note(rec.target, [...rec.target.classList].filter((c) => !before.has(c)));
      } else if (rec.type === "childList") {
        rec.addedNodes.forEach((node) => { if (node instanceof Element) note(node, [...node.classList]); });
      }
    }
  });
  observer.observe(root, { attributes: true, attributeFilter: ["class"], attributeOldValue: true, subtree: true, childList: true });
  return () => { observer.disconnect(); if (pending !== null) window.clearTimeout(pending); };
}
