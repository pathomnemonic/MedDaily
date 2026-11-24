import { nativePlatform } from "./native";

export const APP_VERSION = "1.8";
export const SUPPORT_EMAIL = "patho.mnemonic1@gmail.com";

export interface ReportContext { game: string; date: string; seed: number; mode: "daily" | "free play" | "party"; note?: string }

/** An email prefilled with everything needed to reproduce a puzzle: game, date, seed and mode. Opens the player's own mail app; nothing is sent automatically. */
export function reportMailto(ctx: ReportContext, platform: string = nativePlatform()): string {
  const subject = "Roundsy: problem with " + ctx.game;
  const body = [
    "What looked wrong? (Quote the question or answer if you can.)",
    "",
    ctx.note ?? "",
    "",
    "-----",
    "Please leave the details below so we can find the puzzle.",
    "Game: " + ctx.game,
    "Mode: " + ctx.mode,
    "Date: " + ctx.date,
    "Puzzle seed: " + ctx.seed,
    "App version: " + APP_VERSION + " (" + platform + ")"
  ].join("\n");
  return "mailto:" + SUPPORT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}
export const feedbackMailto = (): string =>
  "mailto:" + SUPPORT_EMAIL + "?subject=" + encodeURIComponent("Roundsy feedback") + "&body=" + encodeURIComponent("\n\n-----\nApp version: " + APP_VERSION + " (" + nativePlatform() + ")");
