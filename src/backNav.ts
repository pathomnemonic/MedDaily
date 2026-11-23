/** What the system Back button / browser back should do from the current screen. */
export type BackAction = "close-completion" | "close-game" | "go-home" | "exit";

export function backAction(s: { activeGame: boolean; completion: boolean; screen: string }): BackAction {
  if (s.completion) return "close-completion";
  if (s.activeGame) return "close-game";
  if (s.screen !== "home") return "go-home";
  return "exit";
}
