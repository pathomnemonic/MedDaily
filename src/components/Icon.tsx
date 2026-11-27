import type { ReactNode } from "react";

export type IconName = "flame" | "star" | "home" | "party" | "trophy" | "gear" | "music" | "musicOff" | "speaker" | "speakerOff" | "palette" | "dice" | "bolt" | "brain" | "letters" | "steth" | "all" | "calendar";
const INK = "#2a1658";
const ICONS: Record<IconName, ReactNode> = {
  flame: <><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-7 1 1 2 1 3-5z" fill="#ff8a3d" stroke={INK} /><path d="M12 12c1 2 3 3 3 5a3 3 0 0 1-6 0c0-2 2-3 3-5z" fill="#ffd54a" stroke={INK} /></>,
  star: <path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.1 6.1 20.4l1.3-6.5L2.5 9.3l6.6-.8z" fill="#ffd54a" stroke={INK} />,
  home: <><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="#ffd54a" stroke={INK} /><path d="M10 21v-6h4v6" fill="#ff8dbd" stroke={INK} /></>,
  party: <><path d="M3 21l5-14 9 9z" fill="#ff63a9" stroke={INK} /><path d="M12 5l1-3M17 8l3-1M16 4l2-2" stroke="#ffd54a" /><circle cx="19" cy="14" r="1.6" fill="#52e3b0" stroke="none" /><circle cx="14" cy="2.6" r="1.2" fill="#36bdf5" stroke="none" /></>,
  trophy: <><path d="M7 3h10v6a5 5 0 0 1-10 0z" fill="#ffd54a" stroke={INK} /><path d="M7 5H4a3 3 0 0 0 3 5M17 5h3a3 3 0 0 1-3 5" fill="none" stroke="#fff7ea" strokeWidth={2.2} /><path d="M12 14v4M8 21h8l-1-3H9z" fill="#ff8dbd" stroke={INK} /></>,
  gear: <><circle cx="12" cy="12" r="3.2" fill="#ffd54a" stroke={INK} /><path d="M12 2l1.6 3 3.4-.6.6 3.4 3 1.6-1.6 3 1.6 3-3 1.6-.6 3.4-3.4-.6L12 22l-1.6-3-3.4.6-.6-3.4-3-1.6 1.6-3-1.6-3 3-1.6.6-3.4 3.4.6z" fill="#8f7fe0" stroke={INK} /><circle cx="12" cy="12" r="3" fill="#ffd54a" stroke={INK} /></>,
  music: <><path d="M9 18V6l11-2v12" fill="none" stroke="#fff7ea" strokeWidth={2.2} /><circle cx="6.5" cy="18" r="3" fill="#52e3b0" stroke={INK} /><circle cx="17.5" cy="16" r="3" fill="#52e3b0" stroke={INK} /></>,
  musicOff: <><path d="M9 18V6l11-2v12" fill="none" stroke="#9a90c9" /><circle cx="6.5" cy="18" r="3" fill="#6d648f" stroke="#9a90c9" /><circle cx="17.5" cy="16" r="3" fill="#6d648f" stroke="#9a90c9" /><path d="M3 3l18 18" stroke="#ff5d8f" strokeWidth={2.6} /></>,
  speaker: <><path d="M4 9h4l5-4v14l-5-4H4z" fill="#ffd54a" stroke={INK} /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" fill="none" stroke="#52e3b0" strokeWidth={2} /></>,
  speakerOff: <><path d="M4 9h4l5-4v14l-5-4H4z" fill="#6d648f" stroke="#9a90c9" /><path d="M3 3l18 18" stroke="#ff5d8f" strokeWidth={2.6} /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2.5 1.5-2.5H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3z" fill="#fff7ea" stroke={INK} /><circle cx="7.5" cy="11" r="1.6" fill="#ff5d9e" stroke="none" /><circle cx="11" cy="7" r="1.6" fill="#ffd54a" stroke="none" /><circle cx="16" cy="8" r="1.6" fill="#52e3b0" stroke="none" /><circle cx="8" cy="15.5" r="1.6" fill="#36bdf5" stroke="none" /></>,
  dice: <><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="#fff7ea" stroke={INK} /><circle cx="8.5" cy="8.5" r="1.7" fill={INK} stroke="none" /><circle cx="15.5" cy="8.5" r="1.7" fill={INK} stroke="none" /><circle cx="12" cy="12" r="1.7" fill={INK} stroke="none" /><circle cx="8.5" cy="15.5" r="1.7" fill={INK} stroke="none" /><circle cx="15.5" cy="15.5" r="1.7" fill={INK} stroke="none" /></>,
  bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="#ffd54a" stroke={INK} />,
  brain: <><path d="M9 4a3.5 3.5 0 0 0-3.5 3.5A3.5 3.5 0 0 0 3 11a3.5 3.5 0 0 0 2 3.2A3.5 3.5 0 0 0 9 19.5a3 3 0 0 0 3-2V6a3 3 0 0 0-3-2z" fill="#ff9fc2" stroke={INK} /><path d="M15 4a3.5 3.5 0 0 1 3.5 3.5A3.5 3.5 0 0 1 21 11a3.5 3.5 0 0 1-2 3.2 3.5 3.5 0 0 1-4 5.3 3 3 0 0 1-3-2V6a3 3 0 0 1 3-2z" fill="#ffb3d0" stroke={INK} /></>,
  letters: <><rect x="2.5" y="4" width="19" height="16" rx="3.5" fill="#fff7ea" stroke={INK} /><text x="12" y="16.5" textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize="11" fill={INK} stroke="none">Aa</text></>,
  steth: <><path d="M6 3v6a4 4 0 0 0 8 0V3" fill="none" stroke="#fff7ea" strokeWidth={2.2} /><path d="M10 13v2a5 5 0 0 0 10 0v-2" fill="none" stroke="#fff7ea" strokeWidth={2.2} /><circle cx="20" cy="11.5" r="2.2" fill="#52e3b0" stroke={INK} /><circle cx="6" cy="3" r="1.3" fill="#ff5d9e" stroke="none" /><circle cx="14" cy="3" r="1.3" fill="#ff5d9e" stroke="none" /></>,
  all: <><rect x="3" y="3" width="8" height="8" rx="2.5" fill="#ff63a9" stroke={INK} /><rect x="13" y="3" width="8" height="8" rx="2.5" fill="#52e3b0" stroke={INK} /><rect x="3" y="13" width="8" height="8" rx="2.5" fill="#ffd54a" stroke={INK} /><rect x="13" y="13" width="8" height="8" rx="2.5" fill="#36bdf5" stroke={INK} /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" fill="#fff7ea" stroke={INK} /><path d="M3 10h18" stroke={INK} /><path d="M8 3v4M16 3v4" stroke={INK} /><circle cx="8" cy="14" r="1.4" fill="#ff5d9e" stroke="none" /><circle cx="12" cy="14" r="1.4" fill="#52e3b0" stroke="none" /><circle cx="16" cy="14" r="1.4" fill="#36bdf5" stroke="none" /><circle cx="8" cy="17.5" r="1.4" fill="#ffd54a" stroke="none" /><circle cx="12" cy="17.5" r="1.4" fill="#ff8a3d" stroke="none" /></>
};
/** Original duotone icon set; consistent on every platform, unlike emoji. */
export default function Icon({ name, size = 22, className = "" }: { name: IconName; size?: number; className?: string }) {
  return <svg className={"icon " + className} viewBox="0 0 24 24" width={size} height={size} fill="none" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{ICONS[name]}</svg>;
}
