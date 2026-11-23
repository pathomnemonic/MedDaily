/** When the next daily puzzles arrive, in the player's own clock. The daily rolls over at 00:00 UTC for everyone. */
export function nextDailyLabel(now: Date = new Date(), timeZone?: string): { time: string; when: "today" | "tomorrow"; text: string } {
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", timeZone };
  const time = new Intl.DateTimeFormat(undefined, opts).format(next);
  const dayOf = (d: Date) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone }).format(d);
  const when = dayOf(next) === dayOf(now) ? "today" : "tomorrow";
  return { time, when, text: when + " at " + time };
}
