import { Suspense, lazy, useEffect, useRef, useState } from "react";
/** All game code and puzzle data load on first play, keeping the first screen light. */
const GameBoard = lazy(() => import("./Games").then((m) => ({ default: m.GameBoard })));
import GameArt from "./components/GameArt";
import { computeTrophies } from "./achievements";
import Mascot from "./components/Mascot";
import Icon from "./components/Icon";
import Splash from "./components/Splash";
import StageScene from "./components/StageScene";
import PipCompanion from "./components/PipCompanion";
import { levelFor, starsFor, xpForResult } from "./levels";
import { DEFAULT_THEME, PRESETS, applyTheme, normalizeTheme, swatch, type ThemeSettings } from "./theme";
import { watchStage, resetCombo } from "./juice";
import { setHapticsEnabled, vibrate } from "./haptics";
import { installAudioUnlock, setMusicEnabled, setScene, setSfxEnabled, sfx } from "./audio";
import type { GameId } from "./lib";
import { hashSeed, dailyDateKey, normalizeRoomCode, pointsText, randomRoomCode, roomGame, roomSeed, withRoomGame, PARTY_GAMES, LISTED_GAME_IDS } from "./lib";
import { accountsEnabled, useAccount } from "./useAccount";
import { getSupabase, hasStoredSupabaseSession } from "./supabaseClient";
import { eraseStoredData } from "./eraseData";
import { averageByGroup, bestStreak, scoreDistribution, streakCalendar } from "./statsInsights";
import { initNative, isNative, onBackButton, refreshReminders, shareText } from "./native";
import { backAction } from "./backNav";
import ErrorBoundary from "./ErrorBoundary";
import { APP_VERSION, feedbackMailto, reportMailto } from "./support";
import { nextDailyLabel } from "./dailyTime";
import { TIP_URL, tipLink } from "./tip";
import { monitoringAvailable, monitoringPreference, setMonitoringPreference } from "./monitoring";
import ReminderCard from "./ReminderCard";
import AccountCard from "./AccountCard";
import ProCard from "./ProCard";
import PaywallPage from "./Paywall";
import { usePurchases, type PurchasesController } from "./usePurchases";
import type { AccountController } from "./useAccount";
import { completedToday, loadPlayer, playStreak, recordResult, savePlayer, type PlayerData } from "./storage";
import { planFreezes } from "./freezes";
import { archiveDays, resultsForDay } from "./archive";
import { joinOrCreateRoom, leaveRoom, multiplayerConfigured, rankRoomPlayers, RoomError, submitRoomScore, watchRoom, type RoomState } from "./rooms";
import { connectAndSync, googleDriveConfigured, hasDriveConnection, syncIfConnected } from "./googleDrive";

type Mode = "general" | "specialty";
/** Specialty-focused daily tracks are built but hidden: the per-specialty puzzle banks are too thin to sustain them (decided Nov 2026). Flip on only after the content is deep enough. */
const SPECIALTY_TRACKS_VISIBLE = false;
type Specialty = "internal" | "familymed" | "neurology" | "cardiology" | "emergency" | "criticalcare" | "anesthesia" | "surgery" | "orthopedics" | "urology" | "otolaryngology" | "ophthalmology" | "pediatrics" | "obgyn" | "psychiatry" | "infectious" | "allergy" | "nephrology" | "pulmonology" | "endocrine" | "dermatology" | "rheumatology" | "hemeonc" | "gastro" | "geriatrics" | "radiology" | "anatomy" | "pathology" | "pharmacology" | "biostatistics";
type Screen = "home" | "stats" | "settings" | "friends" | "archive" | "pro";
interface GameMeta { id: GameId; title: string; subtitle: string; description: string; icon: string; wash: string; time: string; category: string; difficulty: 1 | 2 | 3; hidden?: boolean; }
/** Per-game finale stamps: [perfect, great, complete, try again]. */
const FINALE: Partial<Record<GameId,[string,string,string,string]>> = {
  medle:["FLAWLESS LAB WORK","RESULT CONFIRMED","SAMPLE LOGGED","RETEST NEEDED"],
  diagnosis:["SPOT-ON DIAGNOSIS","CASE SOLVED","CHART FILED","MISSED THE DX"],
  connections:["BOARD CLEARED","SQUAD ASSEMBLED","GROUPS FILED","ERASE & RETRY"],
  glyph:["FULLY DEVELOPED","IMAGE CLEAR","FILM PROCESSED","OVEREXPOSED"],
  casefile:["CASE CLOSED","DEDUCTION SOUND","CASE FILED","WRONG ACCUSATION"],
  blackout:["UNREDACTED","DECLASSIFIED","CHART OPENED","STILL CLASSIFIED"],
  riddle:["MASTER SLEUTH","RIDDLE SOLVED","FILES CLOSED","COLD TRAIL"],
  trivia:["CHAMPION","WEDGE WINNER","ARENA CLEARED","BACK TO THE WHEEL"],
  pairs:["PERFECT MEMORY","MATCH MASTER","SLIDES SORTED","TIME RAN OUT"],
  lettergrid:["GRID CLEARED","WORD WIZARD","TRAY EMPTIED","SHAKE AGAIN"],
  splice:["SPLICE PERFECT","PRESS-READY","EDITION PRINTED","UNREADABLE"],
  labline:["BULLSEYE","WELL CALIBRATED","SPECIMENS LOGGED","RECALIBRATE"],
  hive:["QUEEN CELL","FIELD COMPLETE","SLIDE LOGGED","OUT OF FOCUS"],
  trail:["END OF THE LINE","ALL STATIONS","ROUTE DONE","MISSED YOUR STOP"],
  ladder:["TOP RUNG","CLIMBED","LADDER DONE","SLIPPED"],
  horses:["SKY HIGH","UP IN THE AIR","LANDED","STILL GROUNDED"],
  dive:["DEEPEST DIVE","DEEP SCAN","SURFACED","SHALLOW DIVE"],
  mime:["STANDING OVATION","STAGE STAR","CURTAIN CALL","TOUGH CROWD"],
  higher:["HOT STREAK","SHARP EYE","ROUND OVER","LOST THE THREAD"],
  scale:["PERFECT SCALE","WELL JUDGED","WEIGHED IN","OFF THE SCALE"],
  branch:["FULL TREE","FOUND IT","BRANCH CLOSED","LOST IN THE TREE"],
  cross:["GRID COMPLETE","WELL MATCHED","CROSSED","MISMATCH"],
  crossword:["PERFECT CHART","CHART COMPLETE","SIGNED OFF","INCOMPLETE CHART"],
};
const GAMES: GameMeta[] = [
// Ordered by how fun, impressive, and replayable each game is (best first). The home grid follows this order.
  {id:"medle",title:"Stat Word",subtitle:"The five-letter rounds",description:"Find the hidden medical word in six guesses.",icon:"▦",wash:"mint",time:"2 min",category:"Word play",difficulty:2},
  {id:"diagnosis",title:"Differential",subtitle:"Name the diagnosis",description:"Solve a clinical case in six guesses as clues unlock.",icon:"✚",wash:"peach",time:"3 min",category:"Diagnosis game",difficulty:3},
  {id:"trivia",title:"Trivia Rumble",subtitle:"Spin. Answer. Collect badges.",description:"A six-category trivia wheel with solo and pass-and-play modes.",icon:"🎡",wash:"orange",time:"8–12 min",category:"Party quiz",difficulty:1},
  {id:"dive",title:"Deep Scan",subtitle:"Go past the obvious",description:"Seven timed open questions, one typed answer each. Common answers stop at the skin; rare ones reach the marrow.",icon:"🩻",wash:"blue",time:"4 min",category:"Open-answer trivia",difficulty:3},
  {id:"horses",title:"Hoofbeats",subtitle:"Think horses, not zebras",description:"Clinical prompts where every valid answer is weighted by how common it really is. Name the most common one: horses score big, zebras almost nothing.",icon:"🐴",wash:"orange",time:"4 min",category:"Prevalence quiz",difficulty:2},
  {id:"blackout",title:"Blackout Chart",subtitle:"Read the chart, name the diagnosis",description:"A clinical case with its diagnosis or next action blacked out. Reveal matching words throughout the chart, then name the hidden answer.",icon:"🗂️",wash:"peach",time:"4 min",category:"Case detective",difficulty:3},
  {id:"cross",title:"Crossmatch",subtitle:"Fit the row and the column",description:"A 3×3 grid of drug groups and properties. Each cell needs a drug that fits both, and each drug can be used once. Rarer answers score more.",icon:"🧪",wash:"pink",time:"4 min",category:"Pharmacology grid",difficulty:3},
  {id:"branch",title:"Branch Lab",subtitle:"Find the mystery microbe or drug",description:"Each guess grows a family tree and shows how much lineage it shares with a hidden microbe or drug. Narrow it down in eight guesses.",icon:"🌳",wash:"lime",time:"3 min",category:"Taxonomy",difficulty:2},
  {id:"scale",title:"Scale Lab",subtitle:"How big is it, really?",description:"Place organs, cells, doses and lifespans on a ruler where every notch is ten times bigger. The closer you land, the more you score.",icon:"📏",wash:"gold",time:"3 min",category:"Estimation",difficulty:2},
  {id:"connections",title:"Quad Squad",subtitle:"Think in fours",description:"Sort sixteen terms into four hidden medical families.",icon:"⊞",wash:"lilac",time:"4 min",category:"Pattern logic",difficulty:3},
  {id:"bodymap",title:"Body Map Blitz",subtitle:"Tap the structure. Fast.",description:"Tap organs and named muscles on front and back body maps. Land close for partial points, hit it fast for the most.",icon:"🫀",wash:"peach",time:"2 min",category:"Anatomy arcade",difficulty:2,hidden:true},
  {id:"trail",title:"Theme Trail",subtitle:"Follow the winding words",description:"Trace hidden medical terms through a letter board. They bend in any direction, and the longest one stretches from top to bottom.",icon:"🧬",wash:"mint",time:"4 min",category:"Word trail",difficulty:2},
  {id:"crossword",title:"Crossword Clinic",subtitle:"Fill the tiny grid",description:"A fresh mini crossword every time, with clues from anatomy to pharmacology. Check or reveal letters when stuck.",icon:"✏️",wash:"gold",time:"4 min",category:"Crossword",difficulty:1},
  {id:"lettergrid",title:"Letter Lab",subtitle:"Find words in the grid",description:"Connect neighboring letters to uncover as many hidden words as possible before time runs out.",icon:"🔤",wash:"mint",time:"2 min",category:"Word hunt",difficulty:2},
  {id:"hive",title:"Seven Cells",subtitle:"Seven letters, a swarm of terms",description:"Find every accepted medical word in a seven-letter hive. Use the center tile and hunt for the pangram.",icon:"✿",wash:"gold",time:"3 min",category:"Medical wordplay",difficulty:2},
  {id:"riddle",title:"Riddle Lab",subtitle:"Who am I?",description:"Microbes, medicines, organs, diagnoses and clinical decisions reveal themselves through four progressive clues. Guess early for more points.",icon:"🕵️",wash:"lilac",time:"3 min",category:"Guess who",difficulty:1},
  {id:"higher",title:"What Has More?",subtitle:"Ridiculous medical matchups",description:"Pick the bigger number in surprising food, drug, body, and everyday comparisons.",icon:"⚖",wash:"gold",time:"2 min",category:"Wild comparisons",difficulty:1},
  {id:"pairs",title:"Association Blitz",subtitle:"Make the connections",description:"Flip a 24-card board, find twelve clinical pairs, and build a streak before time runs out.",icon:"◇",wash:"lime",time:"3 min",category:"Association",difficulty:2},
  {id:"mime",title:"Mime Time",subtitle:"Act it out. No talking.",description:"Pass the phone and act out medical scenes, symptoms, and instruments while your friends guess. Beat the clock.",icon:"🎭",wash:"pink",time:"5–10 min",category:"Party charades",difficulty:1},
  {id:"casefile",title:"Casefile Logic",subtitle:"Who has what, and why?",description:"A clinical mystery: match three look-alike patients to their causes and clinching findings. Clues describe things by their clinical features, and you get one accusation.",icon:"⌕",wash:"lilac",time:"4 min",category:"Logic puzzle",difficulty:3},
  {id:"splice",title:"Anagram Sprint",subtitle:"Unscramble the specimen",description:"Unscramble five medical terms before the 75-second clock expires.",icon:"↝",wash:"mint",time:"1 min",category:"Word play",difficulty:1},
  {id:"glyph",title:"Cell Sketch",subtitle:"Tiny picture logic",description:"Solve a nonogram with fill, empty, and pencil-mark cells.",icon:"▦",wash:"lilac",time:"2 min",category:"Visual logic",difficulty:2},
  {id:"labline",title:"Labline",subtitle:"Calibrate your eye",description:"Five rapid-fire estimates of classic lab values and clinical thresholds.",icon:"⌁",wash:"pink",time:"2 min",category:"Numbers",difficulty:2},
  {id:"ladder",title:"Letter Rungs",subtitle:"One letter at a time",description:"Build a one-letter-at-a-time path from the start word to the finish.",icon:"⌁",wash:"peach",time:"3 min",category:"Word play",difficulty:2},
];
/** Games shown to players. A game with `hidden: true` stays in the code and still opens by id, but is not listed anywhere. */
const LISTED: GameMeta[] = GAMES.filter(g => !g.hidden && LISTED_GAME_IDS.includes(g.id));
/** Rotating spotlight: the open-answer and trivia games trade the featured slot each UTC day. */
const DIFFICULTY_LABEL = ["", "Easy", "Medium", "Hard"] as const;
/** Three-pip difficulty badge: Easy, Medium, or Hard (rated for a practising clinician, not a beginner). */
function Difficulty({level}:{level:1|2|3}){return <span className={"diff diff-"+level} title={"Difficulty: "+DIFFICULTY_LABEL[level]}><i className="diff-pips" aria-hidden="true"><b/><b/><b/></i><span>{DIFFICULTY_LABEL[level]}</span></span>;}
const FEATURE_ROTATION: GameId[] = ["dive","trivia"];
const featuredToday = (date: string): GameId => FEATURE_ROTATION[hashSeed("feature|"+date)%FEATURE_ROTATION.length];
const SPECIALTIES: { id: Specialty; name: string; short: string; icon: string; blurb: string }[] = [
  {id:"internal",name:"Internal Medicine",short:"IM",icon:"✚",blurb:"The broad medical wards: physiology, diagnosis, and management."},
  {id:"familymed",name:"Family Medicine",short:"Family",icon:"⌂",blurb:"Lifespan care, prevention, primary care, and common presentations."},
  {id:"neurology",name:"Neurology",short:"Neuro",icon:"∿",blurb:"Localization, seizures, stroke, movement, cognition, and neuromuscular disease."},
  {id:"cardiology",name:"Cardiology",short:"Cards",icon:"♡",blurb:"Rhythm, hemodynamics, ischemia, and cardiovascular medicine."},
  {id:"emergency",name:"Emergency Medicine",short:"EM",icon:"✳",blurb:"Time-critical presentations, stabilization, and first decisions."},
  {id:"criticalcare",name:"Critical Care",short:"ICU",icon:"⌖",blurb:"Resuscitation, ventilation, shock, and unstable patients."},
  {id:"anesthesia",name:"Anesthesiology",short:"Anesthesia",icon:"◉",blurb:"Airway, perioperative physiology, analgesia, and anesthetic pharmacology."},
  {id:"surgery",name:"General Surgery",short:"Surgery",icon:"⌁",blurb:"Acute abdomen, trauma, perioperative medicine, and surgical problems."},
  {id:"orthopedics",name:"Orthopedics",short:"Ortho",icon:"⌗",blurb:"Fractures, joints, sports injuries, and musculoskeletal anatomy."},
  {id:"urology",name:"Urology",short:"Urology",icon:"≈",blurb:"Urinary tract, male reproductive health, stones, and urologic emergencies."},
  {id:"otolaryngology",name:"Otolaryngology",short:"ENT",icon:"◖",blurb:"Ear, nose, throat, airway, and head-and-neck disease."},
  {id:"ophthalmology",name:"Ophthalmology",short:"Eye",icon:"◎",blurb:"Vision, ocular anatomy, eye emergencies, and neuro-ophthalmology."},
  {id:"pediatrics",name:"Pediatrics",short:"Peds",icon:"✿",blurb:"Neonates, children, growth, and pediatric emergencies."},
  {id:"obgyn",name:"Obstetrics & Gynecology",short:"OB/GYN",icon:"❀",blurb:"Pregnancy, labor, reproductive health, and gynecologic disease."},
  {id:"psychiatry",name:"Psychiatry",short:"Psych",icon:"◉",blurb:"Mental status, psychopharmacology, behavior, and neuropsychiatry."},
  {id:"infectious",name:"Infectious Disease",short:"ID",icon:"✣",blurb:"Organisms, antimicrobial decisions, and host response."},
  {id:"allergy",name:"Allergy & Immunology",short:"Allergy",icon:"✧",blurb:"Hypersensitivity, immune dysfunction, and immunologic mechanisms."},
  {id:"nephrology",name:"Nephrology",short:"Renal",icon:"≈",blurb:"Electrolytes, acid-base, glomerular disease, and kidney injury."},
  {id:"pulmonology",name:"Pulmonology",short:"Pulm",icon:"⌁",blurb:"Respiratory physiology, imaging patterns, and pulmonary disease."},
  {id:"endocrine",name:"Endocrinology",short:"Endo",icon:"◌",blurb:"Hormones, metabolism, and endocrine emergencies."},
  {id:"dermatology",name:"Dermatology",short:"Derm",icon:"❋",blurb:"Morphology, rashes, and skin manifestations of systemic disease."},
  {id:"rheumatology",name:"Rheumatology",short:"Rheum",icon:"✥",blurb:"Autoantibodies, inflammatory disease, vasculitis, and joints."},
  {id:"hemeonc",name:"Hematology & Oncology",short:"Heme/Onc",icon:"◈",blurb:"Blood disorders, malignancy, transfusion, and hematologic emergencies."},
  {id:"gastro",name:"Gastroenterology",short:"GI",icon:"◎",blurb:"Hepatobiliary disease, GI bleeding, pancreatitis, and IBD."},
  {id:"geriatrics",name:"Geriatrics",short:"Geriatrics",icon:"❖",blurb:"Multimorbidity, function, falls, cognition, and age-related care."},
  {id:"radiology",name:"Radiology & Imaging",short:"Imaging",icon:"▧",blurb:"Recognize patterns in CT, MRI, radiographs, ultrasound, and anatomy."},
  {id:"anatomy",name:"Anatomy",short:"Anatomy",icon:"⌗",blurb:"Structures, relationships, pathways, and spatial reasoning."},
  {id:"pathology",name:"Pathology",short:"Path",icon:"⌕",blurb:"Morphology, histology, mechanisms, and diagnostic patterns."},
  {id:"pharmacology",name:"Pharmacology",short:"Pharm",icon:"💊",blurb:"Mechanisms, adverse effects, antidotes, and therapeutic choices."},
  {id:"biostatistics",name:"Biostatistics & Epidemiology",short:"Biostats",icon:"∑",blurb:"Study design, test characteristics, risk, and quantitative reasoning."}
];

interface InstallPrompt extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted"|"dismissed"; platform: string }> }

export default function App() {
  const [player,setPlayer] = useState<PlayerData>(()=>loadPlayer());
  const [screen,setScreen] = useState<Screen>("home");
  const [mode,setMode] = useState<Mode>("general");
  const [specialty,setSpecialty] = useState<Specialty>("internal");
  const [activeGame,setActiveGame] = useState<GameId|null>(null);
  const [practice,setPractice] = useState(false);
  const [notice,setNotice] = useState("");
  useEffect(()=>{ if(!notice) return; const t=window.setTimeout(()=>setNotice(""), /saved|synced|Syncing|Left|imported|added/i.test(notice)?2200:5000); return ()=>window.clearTimeout(t); },[notice]);
  const [installPrompt,setInstallPrompt] = useState<InstallPrompt|null>(null);
  const [startAt,setStartAt] = useState(0);
  const [gameStartedAt,setGameStartedAt] = useState(0);
  const [roomCode,setRoomCode] = useState("");
  const [room,setRoom] = useState<RoomState|null>(null);
  const [roomName,setRoomName] = useState("");
  const account = useAccount(player, setPlayer);
  const purchases = usePurchases(account);
  // Returning from web checkout: refresh the Pro state and say what happened.
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const pro=params.get("pro");
    if(pro==="success"){ setNotice("Welcome to Roundsy Pro. Your subscription is on."); void account.refreshPro(); }
    else if(pro==="cancelled"){ setNotice("Checkout was cancelled. Nothing was charged."); }
    if(pro){ params.delete("pro"); const q=params.toString(); window.history.replaceState(null,"",window.location.pathname+(q?"?"+q:"")+window.location.hash); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  /** Keep the daily reminders in step with what the player has done: skip days already played, mention the streak. */
  useEffect(()=>{ if(!isNative()) return; void refreshReminders({playedDays:new Set(player.results.map(r=>r.date)),streak:playStreak(player)}).catch(()=>undefined); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[player.results.length]);
  useEffect(()=>{ if(account.displayName) setRoomName(cur=>cur||account.displayName); },[account.displayName]);
  const [joinCode,setJoinCode] = useState("");
  const [roomBusy,setRoomBusy] = useState(false);
  const [lastShare,setLastShare] = useState("");
  const [partyRun,setPartyRun] = useState(false);
  const [wipe,setWipe] = useState<{id:GameId;key:number}|null>(null);
  const [completion,setCompletion] = useState<{title:string;score:number;maxScore:number;perfect:boolean;text:string;party:boolean;stars:number;gain:number;levelUp:string|null;chest:number;archiveDay:string|null}|null>(null);
  const [splash,setSplash] = useState(()=>{try{return sessionStorage.getItem("meddaily:splash")!=="1";}catch{return true;}});
  const [copied,setCopied] = useState(false);

  // The daily key follows the clock: refresh it while the app stays open so a session that crosses midnight UTC never keeps yesterday's date
  const [date,setDate] = useState(()=>dailyDateKey());
  useEffect(()=>{
    const tick=()=>setDate(cur=>{const now=dailyDateKey();return now===cur?cur:now;});
    const id=window.setInterval(tick,30000);
    document.addEventListener("visibilitychange",tick);window.addEventListener("focus",tick);
    return ()=>{window.clearInterval(id);document.removeEventListener("visibilitychange",tick);window.removeEventListener("focus",tick);};
  },[]);
  // Streak freezes (Pro): once the server confirms this account has Pro, cover
  // a one or two day gap with this month freezes before the streak is read.
  useEffect(()=>{
    if(account.pro!==true) return;
    const add = planFreezes(player.results, player.frozenDays ?? [], date, true);
    if(!add.length) return;
    const next={...player,frozenDays:[...(player.frozenDays??[]),...add].sort()};
    savePlayer(next); setPlayer(next);
    setNotice(add.length===1 ? "A streak freeze saved your streak ❄" : "Streak freezes saved your streak ❄");
    account.afterResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[account.pro, player.results, player.frozenDays, date]);
  const [gameDate,setGameDate] = useState(()=>dailyDateKey());
  const [archiveRunDay,setArchiveRunDay] = useState<string|null>(null);
  const scope = mode === "general" ? "general" : "specialty:" + specialty;
  const selectedSpecialty = SPECIALTIES.find(s=>s.id===specialty)!;
  const selectedTitle = mode === "general" ? "Open Arcade" : selectedSpecialty.name + " Dailies";

  useEffect(()=>{
    const sharedRoom = new URLSearchParams(window.location.search).get("room");
    if (sharedRoom) { setJoinCode(normalizeRoomCode(sharedRoom)); setScreen("friends"); }
  },[]);
  useEffect(()=>{
    const handler=(event:Event)=>{event.preventDefault();setInstallPrompt(event as InstallPrompt);};
    window.addEventListener("beforeinstallprompt",handler);
    return ()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);
  useEffect(()=>{
    if(isNative()){void initNative();}else if("serviceWorker" in navigator) navigator.serviceWorker.register(import.meta.env.BASE_URL+"sw.js").catch(()=>setNotice("Offline caching could not be enabled in this browser."));
  },[]);
  useEffect(()=>{
    installAudioUnlock();
    const onDown=(e:PointerEvent)=>{ if((e.target as HTMLElement)?.closest?.("button,a,[role=tab]")) sfx("tap"); };
    document.addEventListener("pointerdown",onDown,{passive:true});
    return ()=>document.removeEventListener("pointerdown",onDown);
  },[]);
  useEffect(()=>{applyTheme(player.theme);},[player.theme]);
  useEffect(()=>{setSfxEnabled(player.sound);},[player.sound]);
  useEffect(()=>{setHapticsEnabled(player.haptics!==false);},[player.haptics]);
  useEffect(()=>{setMusicEnabled(player.music);},[player.music]);
  useEffect(()=>{setScene(activeGame??"menu");},[activeGame]);
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      const t=e.target as HTMLElement|null;
      const typing=!!t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable);
      const q=(sel:string)=>[...document.querySelectorAll<HTMLButtonElement>(sel)].filter(b=>!b.disabled&&b.offsetParent!==null);
      if(document.querySelector(".complete-overlay")){
        if(e.key==="Escape"){document.querySelector<HTMLButtonElement>(".complete-close")?.click();}
        else if(e.key==="Enter"&&!typing){const b=document.querySelector<HTMLButtonElement>(".next-up")??document.querySelector<HTMLButtonElement>(".complete-actions .button-primary");b?.click();e.preventDefault();}
        return;
      }
      if(typing||!document.querySelector(".game-stage"))return;
      if((e.key==="Enter"||e.key===" ")&&t?.tagName!=="BUTTON"){const next=q(".game-layout .full-button")[0];if(next){next.click();e.preventDefault();return;}}
      const options=q(".rumble-options button, .riddle-options button");
      const idx=("1234".indexOf(e.key));const letter=("abcd".indexOf(e.key.toLowerCase()));
      if(options.length&&(idx>=0||(letter>=0&&e.key.length===1&&document.querySelector(".rumble-options")))){const o=options[idx>=0?idx:letter];if(o){o.click();e.preventDefault();return;}}
      const cards=q(".higher-card");
      if(cards.length>=2&&(e.key==="ArrowLeft"||e.key==="ArrowRight")){cards[e.key==="ArrowLeft"?0:1].click();e.preventDefault();}
    };
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[]);
  useEffect(()=>{
    if(!activeGame)return;
    const stage=document.querySelector<HTMLElement>(".game-stage");
    return stage?watchStage(stage):undefined;
  },[activeGame,practice,startAt]);
  useEffect(()=>{document.documentElement.dataset.motion=player.reducedMotion?"reduced":"full";},[player.reducedMotion]);
  useEffect(()=>{
    if(!roomCode||!multiplayerConfigured())return;
    let stop=()=>{};
    try{stop=watchRoom(roomCode,(value)=>{ if(value) setRoom((current)=>current?{...current,...value,players:value.players.length?value.players:current.players}:value); });}catch{/* live scoreboard unavailable; the shared puzzle still works */}
    return ()=>stop();
  },[roomCode]);

  const doneToday=completedToday(player,scope,LISTED.map((game)=>game.id));
  const streak=playStreak(player,scope);
  // Branch Lab uses a sequential UTC-day seed so its alternating organism/drug banks never repeat within a year.
  const seedFor=(game:GameId,day:string=dailyDateKey())=>game==="branch"||game==="blackout"||game==="trail"||game==="diagnosis"||game==="ladder"||game==="crossword"||game==="medle"||game==="connections"||game==="hive"
    ? Math.floor(Date.parse(day+"T00:00:00Z")/86400000)
    : hashSeed(day+"|"+scope+"|"+game);

  const backState = {activeGame:!!activeGame,completion:!!completion,screen};
  const backRef = useRef(backState); backRef.current = backState;
  const goBack = () => {
    const act = backAction(backRef.current);
    if (act==="close-completion") { setCompletion(null); setActiveGame(null); setPartyRun(false); setScreen(completion?.party?"friends":"home"); return true; }
    if (act==="close-game") { setActiveGame(null); setPractice(false); return true; }
    if (act==="go-home") { setScreen("home"); return true; }
    return false;
  };
  const goBackRef = useRef(goBack); goBackRef.current = goBack;
  const deep = !!activeGame || screen!=="home";
  useEffect(()=>{ // browser/PWA back: one history entry while away from the arcade home
    if (!deep) return;
    try { window.history.pushState({roundsy:1},""); } catch { return; }
    const onPop = () => { goBackRef.current(); };
    window.addEventListener("popstate", onPop);
    return ()=>{ window.removeEventListener("popstate", onPop); try { if (window.history.state?.roundsy) window.history.back(); } catch { /* ignore */ } };
  },[deep]);
  useEffect(()=>{ let off=()=>{}; let dead=false; void onBackButton(()=>goBackRef.current()).then(f=>{ if(dead) f(); else off=f; }); return ()=>{dead=true;off();}; },[]);
  const openGame=(id:GameId,isPractice=false,forcedSeed?:number,party=false)=>{
    sfx("start");resetCombo();vibrate(10);
    if(!player.reducedMotion){setWipe({id,key:Date.now()});window.setTimeout(()=>setWipe(null),900);}
    const dayNow=dailyDateKey();setGameDate(dayNow);setDate(dayNow);setArchiveRunDay(null);
    setPartyRun(party);setCompletion(null);setActiveGame(id);setPractice(isPractice);setStartAt(forcedSeed??(isPractice?hashSeed(id+"-free-"+Date.now()):seedFor(id,dayNow)));setGameStartedAt(Date.now());setLastShare("");setScreen("home");setNotice("");
    window.scrollTo({top:0,behavior:player.reducedMotion?"auto":"smooth"});
  };
  /** Starts a past day round from the archive (Pro). The round is the official daily for that day: same seed, recorded once, marked as an archive play. */
  const openArchiveGame=(id:GameId,day:string)=>{
    sfx("start");resetCombo();vibrate(10);
    if(!player.reducedMotion){setWipe({id,key:Date.now()});window.setTimeout(()=>setWipe(null),900);}
    setGameDate(day);setArchiveRunDay(day);
    setPartyRun(false);setCompletion(null);setActiveGame(id);setPractice(false);setStartAt(seedFor(id,day));setGameStartedAt(Date.now());setLastShare("");setScreen("home");setNotice("");
    window.scrollTo({top:0,behavior:player.reducedMotion?"auto":"smooth"});
  };
  const finishGame=(score:number,maxScore:number,perfect:boolean,share?:string)=>{
    const gameTitle=GAMES.find(g=>g.id===activeGame)?.title??"Roundsy game";
    const filled=Math.max(0,Math.min(10,Math.round(score/Math.max(1,maxScore)*10)));
    const fallback="🟩".repeat(filled)+"⬜".repeat(10-filled)+(perfect?"\n✨ Perfect run":"");
    const archiveDay=partyRun||practice?null:archiveRunDay;
    const where=partyRun?" · Room "+roomCode:practice?" · Free Play":archiveDay?" · Archive "+archiveDay:" · "+date;
    const text=share?"Roundsy"+where+"\n"+share:"Roundsy · "+gameTitle+where+"\n"+fallback+"\nhttps://pathomnemonic.github.io/MedDaily/"+(partyRun?"?room="+roomCode:"");
    setLastShare(text);setCopied(false);
    const isNewDaily=!partyRun&&!practice&&!player.results.some(r=>r.date===gameDate&&r.game===activeGame&&r.scope===scope);
    const todayDone=player.results.filter(r=>r.date===gameDate&&r.scope===scope).length;
    const chest=isNewDaily&&!archiveDay&&todayDone+1===3?60:0; // daily goal: finish three games for a bonus chest; archive plays never count toward it
    const gain=xpForResult({score,maxScore,perfect,practice:!partyRun&&!isNewDaily,party:partyRun})+chest;
    const before=levelFor(player.xp??0),after=levelFor((player.xp??0)+gain);
    setCompletion({title:gameTitle,score,maxScore,perfect,text,party:partyRun,stars:starsFor(score,maxScore,perfect),gain,chest,levelUp:after.level>before.level?after.title+" · Level "+after.level:null,archiveDay});
    sfx(perfect?"perfect":"win");
    if(after.level>before.level)window.setTimeout(()=>sfx("badge"),900);
    if(partyRun){
      setRoom(current=>current?{...current,players:current.players.map(p=>p.uid==="me"?{...p,score,maxScore,perfect,finished:true}:p)}:current);
      if(multiplayerConfigured()&&roomCode) void submitRoomScore(roomCode,score,maxScore,perfect).catch((e)=>{setNotice("Your result is saved on this device, but the room scoreboard did not accept it: "+(e instanceof Error?e.message:"Unknown error"));});
      setPlayer(cur=>{const n={...cur,xp:(cur.xp??0)+gain};savePlayer(n);return n;});
      return;
    }
    if(practice){setPlayer(cur=>{const n={...cur,xp:(cur.xp??0)+gain};savePlayer(n);return n;});return;}
    const result={date:gameDate,game:activeGame!,scope,score,maxScore,perfect,durationSeconds:Math.max(0,Math.round((Date.now()-gameStartedAt)/1000)),...(archiveDay?{archive:true}:{})};
    const nextPlayer = {...recordResult(player,result),xp:(player.xp??0)+gain};
    savePlayer(nextPlayer);
    setPlayer(nextPlayer);
    account.afterResult();
    setArchiveRunDay(null);
    setNotice(archiveDay?"Archive result saved on this device.":hasDriveConnection() ? "Result saved. Syncing your private Drive copy…" : "Daily result saved on this device.");
    if (hasDriveConnection()) {
      void syncIfConnected(nextPlayer).then((merged: PlayerData | null)=>{ if (merged) { savePlayer(merged); setPlayer(merged); setNotice("Daily result saved and synced to your private Google Drive data."); } }).catch((error: unknown)=>setNotice("Saved locally; Google Drive needs reconnecting: "+(error instanceof Error ? error.message : "Unknown sync error")));
    }
  };
  const shareResult=async()=>{
    if(!completion)return;
    if(await shareText(completion.text))return;
    try{await navigator.clipboard?.writeText(completion.text);setCopied(true);}catch{setNotice("Copy was blocked by the browser. Select the preview text instead.");}
  };
  const updateTheme=(patch:Partial<ThemeSettings>)=>{
    setPlayer(current=>{const next={...current,theme:normalizeTheme({...(current.theme??DEFAULT_THEME),...patch})};savePlayer(next);return next;});
  };
  const cyclePalette=()=>{
    const cur=normalizeTheme(player.theme);const i=PRESETS.findIndex(p=>p.id===cur.preset);const nxt=PRESETS[(i+1)%PRESETS.length];
    updateTheme({preset:nxt.id,hue:nxt.hue,sat:nxt.sat});sfx("pop");
  };
  const updateSetting=(key:"sound"|"music"|"haptics"|"reducedMotion"|"hideStreaks",value:boolean)=>{
    setPlayer(current=>{const next={...current,[key]:value};savePlayer(next);return next;});
  };
  const install=async()=>{
    if(!installPrompt)return;
    await installPrompt.prompt();const result=await installPrompt.userChoice;setInstallPrompt(null);
    setNotice(result.outcome==="accepted"?"Roundsy added to your home screen.":"Use your browser menu to install Roundsy when ready.");
  };
  const exportData=()=>{
    const blob=new Blob([JSON.stringify(player,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="meddaily-progress-"+date+".json";a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice("Progress exported as meddaily-progress-"+date+".json (check your downloads).");
  };
  const importData=(file:File|undefined)=>{
    if(!file)return;const reader=new FileReader();
    reader.onload=()=>{
      try{
        const parsed=JSON.parse(String(reader.result)) as Partial<PlayerData>;
        if(!Array.isArray(parsed.results)||typeof parsed.bests!=="object")throw new Error("Invalid file");
        const next:PlayerData={results:parsed.results.filter(r=>r&&typeof r.date==="string"&&GAMES.some(g=>g.id===r.game)).map(r=>({...r,scope:r.scope??"general"})),bests:parsed.bests??{},sound:parsed.sound!==false,music:parsed.music!==false,xp:Number(parsed.xp)||0,reducedMotion:Boolean(parsed.reducedMotion),hideStreaks:Boolean(parsed.hideStreaks)};
        savePlayer(next);setPlayer(next);setNotice("Progress imported.");
      }catch{setNotice("That file does not look like a Roundsy progress export.");}
    };reader.readAsText(file);
  };
  const joinFriendsRoom=async(codeOverride?:string)=>{
    const code=normalizeRoomCode(codeOverride??joinCode);
    if(code.length!==6){setNotice("Room codes are six letters or numbers.");return;}
    const game=roomGame(code),seed=roomSeed(code);
    setRoomBusy(true);setNotice("");
    const local:RoomState={code,gameId:game,scope:"party",specialty:"general",date,seed,hostUid:"local",players:[{uid:"me",name:roomName.trim()||"You",score:null,maxScore:null,finished:false,perfect:false}],status:"waiting"};
    setRoomCode(code);setRoom(local);
    if(multiplayerConfigured()){
      try{const joined=await joinOrCreateRoom(code,{gameId:game,scope:"party",specialty:"general",date,seed,name:roomName||"Guest"});setRoom(joined);}
      catch(e){setNotice(e instanceof RoomError?e.message:"Live scoreboard is unavailable right now. You can still play the same puzzle and compare shared results.");}
    }
    setRoomBusy(false);
  };
  /** After a party round: leave the finished room and open a fresh one for the same game, ready to share. */
  const rematch=async()=>{
    if(!activeGame)return;
    const next=withRoomGame(randomRoomCode(),activeGame);
    if(roomCode&&multiplayerConfigured()){try{await leaveRoom(roomCode);}catch{/* no network */}}
    setCompletion(null);setActiveGame(null);setPartyRun(false);setScreen("friends");setJoinCode(next);
    await joinFriendsRoom(next);
  };
  const closeRoom=async()=>{
    if(roomCode&&multiplayerConfigured()){try{await leaveRoom(roomCode);}catch{/* no network */}}
    setRoomCode("");setRoom(null);setActiveGame(null);setPartyRun(false);setScreen("home");setNotice("Left the room.");
  };
  const nextUp=completion?(()=>{const refDay=completion.archiveDay??date;const left=LISTED.filter(g=>g.id!==activeGame&&!player.results.some(r=>r.date===refDay&&r.game===g.id&&r.scope===scope));const pool=left.length?left:LISTED.filter(g=>g.id!==activeGame);if(!pool.length)return null;return practice||completion.party?pool[hashSeed(String(completion.score)+activeGame)%pool.length]:pool[0];})():null;
  const title=activeGame?GAMES.find(g=>g.id===activeGame)?.title??"Game":screen==="stats"?"Your progress":screen==="settings"?"Preferences":screen==="friends"?"Play with friends":selectedTitle;

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={()=>{setActiveGame(null);setScreen("home");}} aria-label="Roundsy home">
        <span className="brand-mark"><i>+</i><b>·</b></span><span className="brand-name">roundsy<span>.</span><small>THE MEDICAL MINI-GAME ARCADE</small></span>
      </button>
      <nav className="top-nav" aria-label="Main navigation">
        <button className={!activeGame&&screen==="home"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("home");}}>Arcade</button>
        <button className={screen==="archive"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("archive");}}>Archive</button>
        <button className={screen==="friends"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("friends");}}>Party</button>
        <button className={screen==="stats"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("stats");}}>Trophies</button>
        <button className={screen==="settings"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("settings");}}>Options</button>
      </nav>
      <div className="top-actions"><button className="level-pill" onClick={()=>{setActiveGame(null);setScreen("stats");}} aria-label={"Level "+levelFor(player.xp??0).level+", "+levelFor(player.xp??0).title+". Open your profile"} title={levelFor(player.xp??0).title+" · "+levelFor(player.xp??0).into+"/"+levelFor(player.xp??0).span+" XP"} style={{"--pct":levelFor(player.xp??0).pct+"%"} as React.CSSProperties}><i/><b>{levelFor(player.xp??0).level}</b></button><button className="sound-toggle" aria-label="Next color palette" title="Change palette" onClick={cyclePalette}><Icon name="palette" size={22}/></button><button className={"sound-toggle"+(player.music?" on":"")} aria-pressed={player.music} aria-label={player.music?"Mute music":"Turn music on"} onClick={()=>updateSetting("music",!player.music)}><Icon name={player.music?"music":"musicOff"} size={22}/></button><button className={"sound-toggle"+(player.sound?" on":"")} aria-pressed={player.sound} aria-label={player.sound?"Mute sound effects":"Turn sound effects on"} onClick={()=>updateSetting("sound",!player.sound)}><Icon name={player.sound?"speaker":"speakerOff"} size={22}/></button>{installPrompt&&<button className="install-button" onClick={install}>＋ Install</button>}<div className="avatar-chip">MD</div></div>
    </header>

    <nav className="mobile-nav" aria-label="Mobile navigation">
      <button className={!activeGame&&screen==="home"?"active":""} onClick={()=>{setActiveGame(null);setScreen("home");}}><span><Icon name="home" size={22}/></span>Arcade</button>
      <button className={screen==="archive"?"active":""} onClick={()=>{setActiveGame(null);setScreen("archive");}}><span><Icon name="calendar" size={22}/></span>Archive</button>
      <button className={screen==="friends"?"active":""} onClick={()=>{setActiveGame(null);setScreen("friends");}}><span><Icon name="party" size={22}/></span>Party</button>
      <button className={screen==="stats"?"active":""} onClick={()=>{setActiveGame(null);setScreen("stats");}}><span><Icon name="trophy" size={22}/></span>Trophies</button>
      <button className={screen==="settings"?"active":""} onClick={()=>{setActiveGame(null);setScreen("settings");}}><span><Icon name="gear" size={22}/></span>Options</button>
    </nav>
    {notice&&<button className="notice" style={{animationDuration:(/saved|synced|Syncing|Left|imported|added/i.test(notice)?2.2:5)+"s"}} onClick={()=>setNotice("")} aria-label="Dismiss message">{notice}<span>×</span></button>}
    {room&&<div className="room-strip"><span className="room-dot" /> <b>ROOM {room.code}</b><span>{room.players.length} players · {room.status==="finished"?"final results":room.players.filter(p=>p.finished).length+" finished"}</span><button onClick={()=>setScreen("friends")}>Room details</button><button onClick={closeRoom}>Leave</button></div>}

    <main>
      {activeGame?<div className={"page-enter play-page tone-"+(GAMES.find(g=>g.id===activeGame)?.wash??"lilac")}>
        <div className="breadcrumb"><button onClick={()=>{setActiveGame(null);setPractice(false);setArchiveRunDay(null);}}>← All games</button><span>/</span><span>{title}</span>{!completion&&<PipCompanion/>}</div>
        <div className="play-heading"><div className="play-badge" aria-hidden="true"><GameArt game={activeGame}/></div><div className="play-heading-text"><span className="eyebrow">{partyRun?"PARTY ROOM · "+roomCode:practice?"FREE PLAY":archiveRunDay?"ARCHIVE · "+archiveRunDay:selectedTitle.toUpperCase()+" · "+date}</span><h1>{title}</h1><p>{GAMES.find(g=>g.id===activeGame)?.description}</p>{(()=>{const g=GAMES.find(x=>x.id===activeGame);return g?<Difficulty level={g.difficulty}/>:null;})()}</div>
          {!partyRun&&!archiveRunDay&&<div className="mode-switch" role="group" aria-label="Game mode"><button className={!practice?"selected":""} onClick={()=>{if(practice)openGame(activeGame,false,room?.seed);}}>Daily</button><button className={practice?"selected":""} onClick={()=>{if(!practice)openGame(activeGame,true,hashSeed(activeGame+"-practice-"+Date.now()));}}>Free Play</button></div>}</div>
        <section className="game-stage" data-game={activeGame}><div className="stage-orbit orbit-one"/><div className="stage-orbit orbit-two"/><StageScene game={activeGame}/><div className="stage-watermark" aria-hidden="true"><GameArt game={activeGame}/></div>
          <ErrorBoundary label={title} resetKey={activeGame+":"+startAt} onBack={()=>{setActiveGame(null);setPractice(false);}}><Suspense fallback={<div className="game-loading" role="status"><span className="game-loading-art"><GameArt game={activeGame}/></span><b>Loading {title}…</b></div>}><GameBoard key={activeGame+"-"+String(practice)+"-"+String(startAt)} game={activeGame} seed={startAt} specialty={(partyRun||mode==="general"?"general":specialty) as never} practice={practice} onExit={()=>{if(!player.reducedMotion&&activeGame){setWipe({id:activeGame,key:Date.now()});window.setTimeout(()=>setWipe(null),900);}setActiveGame(null);setPractice(false);setArchiveRunDay(null);}} onDone={finishGame}/></Suspense></ErrorBoundary>
        </section>
        {room&&<RoomScores room={room}/>}
        {lastShare&&<div className="result-share-row"><span>ROUND COMPLETE</span><button className="button button-soft" onClick={()=>{if(navigator.share)void navigator.share({title:"Roundsy result",text:lastShare}).catch(()=>{});else void navigator.clipboard?.writeText(lastShare);}}>Share result ↗</button></div>}
        <div className="under-game"><span>♡ Take a breath between rounds.</span><span>{practice?"Practice runs are not recorded":roomCode?"Your result is shared with this room":"One daily result per game and mode · new puzzles "+nextDailyLabel().text}</span></div>
      </div>:screen==="stats"?<StatsPage player={player} scope={scope} streak={streak} done={doneToday}/>:screen==="settings"?<SettingsPage mode={mode} specialty={specialty} setMode={setMode} setSpecialty={setSpecialty} updateTheme={updateTheme} player={player} driveConnected={hasDriveConnection()} updateSetting={updateSetting} exportData={exportData} importData={importData} account={account} purchases={purchases} onOpenPaywall={()=>setScreen("pro")} onDriveSync={async()=>{setNotice("Connecting to Google Drive…");try{const merged=await connectAndSync(player);savePlayer(merged);setPlayer(merged);setNotice("Google Drive sync complete. Your progress is backed up privately.");}catch(e){setNotice((e as Error).message);}}}/>:screen==="friends"?<FriendsPage room={room} roomName={roomName} setRoomName={setRoomName} joinCode={joinCode} setJoinCode={setJoinCode} busy={roomBusy} live={multiplayerConfigured()} games={GAMES} onJoin={joinFriendsRoom} onPlay={(r)=>openGame(r.gameId,true,r.seed,true)} onLeave={closeRoom} />:screen==="archive"?<ArchivePage player={player} scope={scope} pro={account.pro} today={date} onPlay={openArchiveGame} onSeePro={()=>setScreen("pro")}/>:screen==="pro"?<PaywallPage account={account} purchases={purchases} onSignIn={()=>setScreen("settings")}/>:<HomePage player={player} scope={scope} today={date} openGame={openGame} onArchive={()=>setScreen("archive")}/>}
    </main>
    {completion&&<div className="complete-overlay" role="dialog" aria-modal="true" aria-label="Round complete" onClick={()=>setCompletion(null)}>
      <div className={"complete-card tone-"+(GAMES.find(g=>g.id===activeGame)?.wash??"lilac")+(completion.perfect?" perfect":"")} onClick={e=>e.stopPropagation()}>
        {!player.reducedMotion&&<div className="confetti" aria-hidden="true">{Array.from({length:26},(_,i)=><i key={i} style={{left:((i*37)%100)+"%",animationDelay:((i%9)*0.12)+"s",background:["#ffd54a","#ff5d9e","#52e3b0","#36bdf5","#a99aff"][i%5]}}/>)}</div>}
        <div className="complete-mascot"><Mascot mood={completion.stars>=3?"cheer":completion.stars===0?"sad":"happy"} size={96}/></div>
        <div className="complete-stars" aria-label={completion.stars+" of 3 stars"}>{[1,2,3].map(n=><span key={n} className={n<=completion.stars?"on":""} style={{animationDelay:(0.25+n*0.22)+"s"}}>★</span>)}</div>
        <span className="complete-stamp">{(()=>{const f=FINALE[activeGame as GameId];return f?(completion.perfect?f[0]:completion.stars>=3?f[1]:completion.stars===0?f[3]:f[2]):(completion.perfect?"PERFECT":completion.stars>=3?"GREAT":completion.stars===0?"TRY AGAIN":"COMPLETE");})()}</span>
        <h2>{completion.title}</h2>
        <p className="complete-sub">{completion.party?"Room "+roomCode+" · send this to your group":practice?"Free Play round finished":completion.archiveDay?"Archive saved · played for "+completion.archiveDay:"Daily saved · next puzzles "+nextDailyLabel().text}</p>
        <div className="complete-xp"><b>+{completion.gain} XP</b>{completion.chest>0&&<span className="chest-pop">🎁 Daily goal reached! +{completion.chest} XP chest</span>}{completion.levelUp&&<span className="level-up">LEVEL UP! {completion.levelUp}</span>}</div>
        <pre className="share-preview">{completion.text.split("\n").filter(l=>!l.startsWith("http")).join("\n")}</pre>
        <div className="complete-actions">
          {nextUp&&<button className="button button-primary next-up" onClick={()=>completion.archiveDay?openArchiveGame(nextUp.id,completion.archiveDay):openGame(nextUp.id,completion.party?false:practice,undefined,false)}><span className="next-up-art"><GameArt game={nextUp.id}/></span><span><small>NEXT UP</small><b>{nextUp.title}</b></span><i>▶</i></button>}
          <button className="button button-soft" onClick={()=>void shareResult()}>{copied?"✓ Copied!":"Share result ↗"}</button>
          {!completion.party&&<button className="button button-soft" onClick={()=>openGame(activeGame!,true,hashSeed(activeGame+"-again-"+Date.now()))}>Play again ∞</button>}
          {completion.party&&<button className="button button-soft" onClick={()=>void rematch()}>Rematch ↻</button>}
          <button className="button button-quiet" onClick={()=>{setCompletion(null);setActiveGame(null);setScreen(completion.party?"friends":completion.archiveDay?"archive":"home");}}>{completion.party?"Back to party":completion.archiveDay?"Back to the archive":"All games"}</button>
          <a className="complete-report" href={reportMailto({game:GAMES.find(g=>g.id===activeGame)?.title??"Roundsy",date,seed:startAt,mode:completion.party?"party":practice?"free play":"daily"})}>Report a problem with this puzzle</a>
        </div>
        <button className="complete-close" aria-label="Close" onClick={()=>setCompletion(null)}>×</button>
      </div>
    </div>}
    {wipe&&<div key={wipe.key} className={"game-wipe tone-"+(GAMES.find(g=>g.id===wipe.id)?.wash??"lilac")} aria-hidden="true"><div className="game-wipe-art"><GameArt game={wipe.id}/></div><b>{GAMES.find(g=>g.id===wipe.id)?.title}</b></div>}
    {splash&&<Splash onStart={()=>{try{sessionStorage.setItem("meddaily:splash","1");}catch{/* ignore */}sfx("start");setSplash(false);}}/>}
    <footer className="site-footer"><div><span className="footer-mark">✳</span><b>roundsy.</b><span>PRESS START · FIND YOUR NEXT FAVORITE</span></div><p>For education only · Not a clinical decision tool · Verify care decisions against current guidance.</p><span className="version">v{APP_VERSION} · Local-first · <a href="https://pathomnemonic.github.io/StudyBible/privacy.html" target="_blank" rel="noopener noreferrer">Privacy policy</a> · <a href={import.meta.env.BASE_URL+"terms.html"} target="_blank" rel="noopener noreferrer">Terms</a> · <a href={import.meta.env.BASE_URL+"help.html"} target="_blank" rel="noopener noreferrer">Help</a></span></footer>
  </div>;
}

function HomePage({player,scope,today,openGame,onArchive}:{player:PlayerData;scope:string;today:string;openGame:(id:GameId,practice?:boolean)=>void;onArchive:()=>void}){
  const featuredId=featuredToday(today);
  const ordered=[...LISTED.filter(g=>g.id===featuredId),...LISTED.filter(g=>g.id!==featuredId)];
  const surprise=()=>{
    const left=LISTED.filter(g=>!player.results.some(r=>r.date===today&&r.game===g.id&&r.scope===scope));
    const pool=left.length?left:LISTED;
    openGame(pool[Math.floor(Math.random()*pool.length)].id,left.length===0);
  };
  return <div className="home-page page-enter">
    <a className="dx-banner" href="https://pathomnemonic.github.io/buzzword-dash-v2/" target="_blank" rel="noreferrer" aria-label="Play Dx Dash, our companion game, in a new tab">
      <span className="dx-rays" aria-hidden="true"/>
      <svg className="dx-pulse" viewBox="0 0 300 60" aria-hidden="true" preserveAspectRatio="none"><path d="M0 34h60l12-24 14 46 14-34 10 12h190" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      <span className="dx-logo" aria-hidden="true">DX<small>DASH</small></span>
      <span className="dx-copy"><b>Name the diagnosis. Beat the clock!</b><small>Our companion game · opens in a new tab</small></span>
      <span className="dx-play">PLAY<i>▶</i></span>
    </a>
    <div className="game-grid" onPointerMove={e=>{if(e.pointerType!=="mouse")return;const card=(e.target as HTMLElement).closest(".game-card") as HTMLElement|null;if(!card)return;const b=card.getBoundingClientRect();card.style.setProperty("--ry",(((e.clientX-b.left)/b.width-.5)*10).toFixed(1)+"deg");card.style.setProperty("--rx",(-((e.clientY-b.top)/b.height-.5)*10).toFixed(1)+"deg");}} onPointerOut={e=>{const card=(e.target as HTMLElement).closest(".game-card") as HTMLElement|null;if(card){card.style.removeProperty("--rx");card.style.removeProperty("--ry");}}}>
      {ordered.map((game,index)=>{
        const spotlight=game.id===featuredId;
        const cleared=player.results.some(r=>r.date===today&&r.game===game.id&&r.scope===scope);
        return <div key={game.id} className="game-card-wrap" style={{animationDelay:(index*40)+"ms"}}>
          <button className={"game-card "+game.wash+(cleared?" card-done":"")+(spotlight?" card-spotlight":"")} onClick={()=>openGame(game.id,false)} aria-label={"Play "+game.title+(cleared?" (cleared today)":"")}>
            <div className="game-cover"><GameArt game={game.id}/><span className={"card-status"+(cleared?" status-done":"")}>{cleared?"★ CLEARED":spotlight?"★ FEATURED":"DAILY"}</span></div>
            <div className="game-card-body"><span className="game-category">{game.category}</span><h3>{game.title}</h3><span className="game-subtitle">{game.subtitle}</span></div>
            <div className="game-card-footer"><span>⏱ {game.time}</span><Difficulty level={game.difficulty}/><span className="card-play">PLAY ▶</span></div>
          </button>
          <button className="card-free" onClick={()=>openGame(game.id,true)} aria-label={"Free Play "+game.title} title="Free Play: unlimited, not recorded">∞</button>
        </div>;
      })}
      <div className="game-card-wrap"><button className="game-card surprise-card" onClick={surprise} aria-label="Surprise me with a random game"><div className="game-cover"><Icon name="dice" size={64}/></div><div className="game-card-body"><span className="game-category">Can't decide?</span><h3>Surprise me</h3><span className="game-subtitle">A random game you haven't cleared</span></div><div className="game-card-footer"><span>🎲 random</span><span className="card-play">GO ▶</span></div></button></div>
    </div>
    <button className="archive-banner" onClick={onArchive} aria-label="Open the round archive">
      <span className="archive-banner-icon"><Icon name="calendar" size={34}/></span>
      <span className="archive-banner-copy"><b>Missed a day?</b><small>Past rounds live in the archive · a Roundsy Pro perk</small></span>
      <span className="dx-play">OPEN<i>▶</i></span>
    </button>
  </div>;
}

function ArchivePage({player,scope,pro,today,onPlay,onSeePro}:{player:PlayerData;scope:string;pro:boolean|null;today:string;onPlay:(id:GameId,day:string)=>void;onSeePro:()=>void}){
  const days=archiveDays(today);
  const [selected,setSelected]=useState<string|null>(null);
  const dayLabel=(d:string)=>new Date(d+"T00:00:00Z").toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric",timeZone:"UTC"});
  const openDay=selected&&days.includes(selected)?selected:days[0];
  return <div className="archive-page page-enter">
    <div className="friends-hero"><span className="eyebrow">ROUND ARCHIVE</span><h1>Every day, still playable.</h1><p>Each past daily round since launch, exactly as it ran. Archive plays are recorded and marked as archive plays: they count toward your history, best scores and trophies, and they never change your streak or your daily goal.</p></div>
    {pro!==true&&<section className="settings-card archive-lock">
      <span className="eyebrow">ROUNDSY PRO</span>
      <h2>The archive is a Pro perk</h2>
      <p>{pro===null?"Sign in with a Pro account to open past rounds.":"Your account does not have Pro yet. Join Pro to open the archive, and to keep your streak safe with monthly streak freezes."}</p>
      <button className="button button-primary" onClick={onSeePro}>See Roundsy Pro</button>
    </section>}
    {days.length===0?<p className="privacy-note">The archive opens the day after launch: today is the first daily, and it joins the archive tomorrow.</p>:
    <div className="archive-layout">
      <div className="archive-days" role="list" aria-label="Archive days">
        {days.map(d=>{const done=resultsForDay(player.results,d,scope).length;return <button key={d} role="listitem" className={"archive-day"+(d===openDay?" on":"")} onClick={()=>setSelected(d)} aria-pressed={d===openDay}><b>{dayLabel(d)}</b><small>{done>0?done+" of "+LISTED.length+" played":"not played"}</small>{pro!==true&&<span className="archive-lock-badge">PRO</span>}</button>;})}
      </div>
      {openDay&&<section className="settings-card archive-day-detail">
        <span className="eyebrow">PLAYING FOR</span>
        <h2>{dayLabel(openDay)}</h2>
        <div className="archive-games">
          {LISTED.map(g=>{const played=resultsForDay(player.results,openDay,scope).find(r=>r.game===g.id);return <div key={g.id} className="archive-game-row"><span className="archive-game-art"><GameArt game={g.id}/></span><span className="archive-game-copy"><b>{g.title}</b><small>{played?pointsText(played.score)+(played.perfect?" · perfect":"")+(played.archive?" · archive play":" · played on the day"):"not played yet"}</small></span>{!played&&(pro===true?<button className="button button-primary" onClick={()=>onPlay(g.id,openDay)}>Play ▶</button>:<button className="button button-soft" onClick={onSeePro}>Pro 🔒</button>)}</div>;})}
        </div>
      </section>}
    </div>}
  </div>;
}

function FriendsPage({room,roomName,setRoomName,joinCode,setJoinCode,busy,live,games,onJoin,onPlay,onLeave}:{
  room:RoomState|null;roomName:string;setRoomName:(s:string)=>void;joinCode:string;setJoinCode:(s:string)=>void;busy:boolean;live:boolean;games:GameMeta[];
  onJoin:(code?:string)=>void;onPlay:(r:RoomState)=>void;onLeave:()=>void;
}){
  const [copied,setCopied]=useState(false);
  const meta=room?games.find(g=>g.id===room.gameId):undefined;
  const invite=room?location.origin+location.pathname+"?room="+room.code:"";
  return <div className="friends-page"><div className="friends-hero"><span className="eyebrow">PARTY ROOMS</span><h1>Same code, same game.</h1><p>Everyone who types the same code plays the same game and the same puzzle. No sign-up, no host. Pick any six letters or numbers, tell your friends, and compare results.</p></div>
    {room&&meta?<div className="room-card"><div className="room-code-head"><div><span className="eyebrow">ROOM CODE</span><strong>{room.code}</strong></div><div className="share-actions"><button className="button button-soft" onClick={()=>{void navigator.clipboard?.writeText(invite);setCopied(true);}}>{copied?"✓ Link copied":"Copy invite link"}</button></div></div>
      <div className="room-game"><div className="room-game-art"><GameArt game={meta.id}/></div><div><span className="eyebrow">THIS ROOM PLAYS</span><h2>{meta.title}</h2><p>{meta.description}</p><Difficulty level={meta.difficulty}/></div></div>
      <div className="room-players">{room.players.map((p,i)=><div key={p.uid} className="room-player"><span className="player-number">{i+1}</span><b>{p.name}</b><span>{p.finished?"Finished":"Waiting to play"}</span>{p.perfect&&<i>✦</i>}</div>)}</div>
      <div className="room-actions"><button className="button button-primary" onClick={()=>onPlay(room)}>▶ Play this puzzle</button><button className="button button-quiet" onClick={onLeave}>Leave room</button></div>
      <small>{live?"Live scores appear above as friends finish. You can also share your result from the finish screen.":"When you finish, tap Share result and paste it into your group chat to compare."}</small>
    </div>:<div className="friends-grid single-room-entry">
      <section className="friends-card"><span className="eyebrow">ENTER A CODE</span><h2>Join a room</h2>
        <label>Nickname (optional)<input maxLength={20} value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="What should we call you?"/></label>
        <div className="room-picker"><span className="eyebrow">STARTING A NEW ROOM? PICK THE GAME</span><div className="room-game-chips" role="radiogroup" aria-label="Room game">{PARTY_GAMES.map(id=>{const g=games.find(x=>x.id===id);if(!g)return null;const on=joinCode.length===6&&roomGame(joinCode)===id;return <button key={id} role="radio" aria-checked={on} className={on?"on":""} onClick={()=>setJoinCode(withRoomGame(joinCode||randomRoomCode(),id))}><span className="chip-art"><GameArt game={id}/></span>{g.title}</button>;})}</div></div>
        <label>Six-character code<input className="room-code-input" maxLength={6} value={joinCode} onChange={e=>setJoinCode(normalizeRoomCode(e.target.value))} placeholder="ABC123" autoCapitalize="characters" autoComplete="off"/></label>
        {joinCode.length===6&&<p className="room-preview">This code plays <b>{games.find(g=>g.id===roomGame(joinCode))?.title}</b>.</p>}
        <div className="room-entry-actions"><button className="button button-primary" onClick={()=>onJoin()} disabled={busy||joinCode.length!==6}>{busy?"Joining…":"Join room ↗"}</button><button className="button button-soft" onClick={()=>setJoinCode(randomRoomCode(Math.random,joinCode.length===6?roomGame(joinCode):undefined))}>🎲 Random code</button></div>
        <p className="room-hint">Pick a game above to make a code for it, then share the code or the invite link. Anyone who joins with that code plays the same game and puzzle. Joining a friend's room? Just type their code.</p>
      </section>
    </div>}
    <div className="privacy-note"><b>Private by default.</b> No account needed. Nothing is sent anywhere unless live scoreboards are enabled, and then only a nickname, the room code, and scores. Never enter patient information.</div>
  </div>;
}

function RoomScores({room}:{room:RoomState}){
  const ranked=rankRoomPlayers(room.players);
  return <section className="room-score-inline"><div className="eyebrow">{room.status==="finished"?"FINAL RESULTS":"FRIENDS ROOM LEADERBOARD"} · {room.code}</div>{ranked.map((p,index)=><span key={p.uid}><b>#{index+1}</b> {p.name}: {p.finished?pointsText(p.score??0)+(p.perfect?" · perfect":""):"playing"}</span>)}</section>;
}

function StatsDepth({results,streak,hide,frozenDays=[]}:{results:PlayerData["results"];streak:number;hide:boolean;frozenDays?:readonly string[]}){
  const today=dailyDateKey();
  const grid=streakCalendar(results,today,12,frozenDays);
  const best=bestStreak(results,frozenDays);
  const dist=scoreDistribution(results);
  const top=Math.max(1,...dist);
  const families=averageByGroup(results,g=>GAMES.find(x=>x.id===g)?.category);
  const level=(n:number)=>n===0?0:n===1?1:n<=3?2:n<=6?3:4;
  return <section className="stats-depth" aria-label="Your history">
    <h2>Streak calendar</h2>
    <p className="stats-sub">{hide?"Streaks are hidden in your settings.":"Current streak "+streak+" days · best "+best+" days. Each square is a day; darker means more games."}</p>
    <div className="cal" role="img" aria-label="Calendar of the last twelve weeks">{grid.map((week,i)=><div className="cal-week" key={i}>{week.map(d=><i key={d.date} title={d.date+": "+(d.frozen&&d.plays===0?"streak freeze":d.plays+" played")} className={"cal-day lv"+level(d.plays)+(d.future?" future":"")+(d.today?" today":"")+(d.frozen&&d.plays===0?" frozen":"")}>{d.frozen&&d.plays===0?"❄":""}</i>)}</div>)}</div>
    <div className="cal-legend"><span>Less</span>{[0,1,2,3,4].map(n=><i key={n} className={"cal-day lv"+n}/>)}<span>More</span><i className="cal-day frozen">❄</i><span>streak freeze</span></div>
    <h2>Score distribution</h2>
    <p className="stats-sub">How your finished rounds spread across the score range.</p>
    <div className="dist" role="img" aria-label="Histogram of round scores">{dist.map((n,i)=><div key={i} className="dist-col"><b style={{height:Math.round(n/top*100)+"%"}}/><small>{i*10}</small><span>{n}</span></div>)}</div>
    {families.length>1&&<><h2>By game family</h2><div className="fam">{families.map(f=><div key={f.group}><span>{f.group}</span><i><b style={{width:f.average+"%"}}/></i><em>{f.average}% · {f.rounds}</em></div>)}</div></>}
  </section>;
}

function StatsPage({player,scope,streak,done}:{player:PlayerData;scope:string;streak:number;done:number}){
  const lvl=levelFor(player.xp??0);
  const trophies=computeTrophies(player,LISTED.map((game) => game.id));
  const results=player.results.filter(r=>r.scope===scope);
  const perfect=results.filter(r=>r.perfect).length;
  return <div className="stats-page"><section className="profile-card"><Mascot mood="happy" size={84}/><div className="profile-main"><span className="eyebrow">YOUR PROFILE</span><h1>Lv {lvl.level} · {lvl.title}</h1><i className="profile-bar" role="progressbar" aria-valuenow={lvl.pct} aria-valuemin={0} aria-valuemax={100}><span style={{width:lvl.pct+"%"}}/></i><small>{lvl.into} / {lvl.span} XP to the next level</small>
        <div className="profile-chips"><span><Icon name="flame" size={22}/> {player.hideStreaks?"—":streak}-day streak</span><span><Icon name="star" size={22}/> {done}/{LISTED.length} cleared today</span><span className="profile-goal" title="Finish three daily games for a bonus chest">{[0,1,2].map(i=><i key={i} className={i<Math.min(done,3)?"on":""}/>)} {done>=3?"🎁 chest claimed":"daily goal"}</span></div></div></section>
    <span className="eyebrow">YOUR LITTLE LAB BOOK</span><h1>Progress, not pressure.</h1><div className="stats-grid"><div><b>{results.length}</b><span>rounds played</span></div><div><b>{player.hideStreaks?"—":streak}</b><span>day streak</span></div><div><b>{perfect}</b><span>perfect rounds</span></div></div>
    {results.length>0&&<StatsDepth results={player.results.filter(r=>r.scope===scope)} streak={streak} hide={!!player.hideStreaks} frozenDays={player.frozenDays??[]}/>}
    <section className="trophy-cabinet"><h2>Trophy cabinet <small>{trophies.filter(t=>t.earned).length} / {trophies.length}</small></h2><div className="trophy-grid">{trophies.map(t=><div key={t.id} className={"trophy"+(t.earned?" earned":"")}><span className="trophy-icon">{t.earned?t.icon:"🔒"}</span><b>{t.name}</b><small>{t.hint}</small></div>)}</div></section>
    <section className="stats-table"><h2>Game shelf</h2>{LISTED.map(g=>{const played=results.filter(r=>r.game===g.id);return <div key={g.id}><span>{g.title}</span><span>{played.length} played</span><b>Best run {Math.max(0,...played.map(r=>r.score))}</b></div>;})}</section>
    <p className="privacy-note">Progress and achievements are calculated from this device's saved results for the current arcade mode. Records stay local unless you choose Google Drive sync in Settings. Room leaderboards are private to the six-character room code.</p>
  </div>;
}

/** Signs out (so the account cannot quietly return and recreate a profile), clears every stored key, then reloads. */
function MonitoringSwitch(){
  const [on,setOn]=useState(()=>monitoringPreference());
  if(!monitoringAvailable())return null;
  return <Setting label="Crash reports and anonymous analytics" detail="Web version only. Sends crash reports and anonymous page-view counts so we can fix problems. On by default; turn it off any time. The iPhone and Android apps never send them." checked={on} onChange={v=>{setOn(v);setMonitoringPreference(v);}}/>;
}
function EraseData(){
  const [ask,setAsk]=useState(false);const [busy,setBusy]=useState(false);
  if(!ask)return <button className="button button-quiet" onClick={()=>setAsk(true)}>Erase data on this device</button>;
  return <div className="erase-confirm" role="alertdialog" aria-label="Confirm erase"><p><b>Erase everything Roundsy stored on this device?</b> Progress, settings and preferences go, and you are signed out here. This cannot be undone. Export a backup first if you want to keep it.</p>
    <div className="account-row"><button className="button account-delete" disabled={busy} onClick={()=>{setBusy(true);void eraseEverythingHere();}}>{busy?"Erasing…":"Yes, erase and sign out"}</button><button className="button button-soft" disabled={busy} onClick={()=>setAsk(false)}>Cancel</button></div></div>;
}
async function eraseEverythingHere(){
  try{
    if(accountsEnabled&&hasStoredSupabaseSession()){
      const client=await Promise.race([getSupabase(),new Promise<null>(r=>window.setTimeout(()=>r(null),3000))]);
      if(client)await client.auth.signOut({scope:"local"}).catch(()=>undefined);
    }
  }catch{/* offline or unavailable: the keys are removed below regardless */}
  eraseStoredData([localStorage,sessionStorage]);
  window.location.reload();
}

function SettingsPage({mode,specialty,setMode,setSpecialty,updateTheme,player,driveConnected,updateSetting,exportData,importData,account,onDriveSync,purchases,onOpenPaywall}:{
  account:AccountController;
  purchases:PurchasesController;onOpenPaywall:()=>void;
  mode:Mode;specialty:Specialty;setMode:(m:Mode)=>void;setSpecialty:(s:Specialty)=>void;updateTheme:(p:Partial<ThemeSettings>)=>void;player:PlayerData;driveConnected:boolean;updateSetting:(k:"sound"|"music"|"haptics"|"reducedMotion"|"hideStreaks",v:boolean)=>void;exportData:()=>void;importData:(file:File|undefined)=>void;onDriveSync:()=>Promise<void>;
}){
  const [syncing,setSyncing]=useState(false);
  const sync=async()=>{setSyncing(true);try{await onDriveSync();}finally{setSyncing(false);}};
  return <div className="settings-page"><span className="eyebrow">MAKE IT YOURS</span><h1>Preferences & backup</h1>
    <AccountCard account={account}/>
    <ProCard account={account} purchases={purchases} onOpenPaywall={onOpenPaywall}/>
    <ReminderCard context={{playedDays:new Set(player.results.map(r=>r.date)),streak:playStreak(player)}}/>
    {SPECIALTY_TRACKS_VISIBLE&&<section className="settings-card"><h2>Daily track</h2><p>Everyone on the same track gets the same daily puzzles. Open Arcade is the broad mix; pick a specialty to play your own field's dailies.</p>
      <div className="mode-tabs"><button className={mode==="general"?"active":""} onClick={()=>setMode("general")}>Open Arcade</button><button className={mode==="specialty"?"active":""} onClick={()=>setMode("specialty")}>Specialties</button></div>
      {mode==="specialty"&&<div className="specialty-picker"><div className="specialty-chips">{SPECIALTIES.map(sp=><button key={sp.id} onClick={()=>setSpecialty(sp.id)} className={specialty===sp.id?"selected":""}><span>{sp.icon}</span>{sp.short}</button>)}</div><div className="specialty-selected"><b>{SPECIALTIES.find(sp=>sp.id===specialty)?.name}</b><span>{SPECIALTIES.find(sp=>sp.id===specialty)?.blurb}</span></div></div>}
    </section>}
    <section className="settings-card look-card"><h2>Look &amp; feel</h2>{(()=>{const t=normalizeTheme(player.theme);return <>
      <p>Pick a palette, or tune your own. Changes apply instantly.</p>
      <div className="preset-grid" role="radiogroup" aria-label="Color palette">{PRESETS.map(p=><button key={p.id} role="radio" aria-checked={t.preset===p.id} className={"preset"+(t.preset===p.id?" on":"")} onClick={()=>updateTheme({preset:p.id,hue:p.hue,sat:p.sat})}><span className="preset-swatch" style={{background:swatch(p.hue,p.sat)}}><i/><i/><i/></span><b>{p.name}</b></button>)}</div>
      <label className="slider-row"><span>Base color <small>{Math.round(t.hue)}°</small></span><input className="hue-slider" type="range" min={0} max={360} value={t.hue} onChange={e=>updateTheme({preset:"custom",hue:Number(e.target.value)})}/></label>
      <label className="slider-row"><span>Vibrancy <small>{Math.round(t.sat*100)}%</small></span><input type="range" min={15} max={140} value={Math.round(t.sat*100)} onChange={e=>updateTheme({preset:"custom",sat:Number(e.target.value)/100})}/></label>
      <div className="choice-row"><span>Depth</span><div role="radiogroup" aria-label="Depth">{(["chunky","soft"] as const).map(v=><button key={v} role="radio" aria-checked={t.depth===v} className={t.depth===v?"on":""} onClick={()=>updateTheme({depth:v})}>{v==="chunky"?"Chunky 3D":"Soft"}</button>)}</div></div>
      <div className="choice-row"><span>Corners</span><div role="radiogroup" aria-label="Corners">{(["round","sharp"] as const).map(v=><button key={v} role="radio" aria-checked={t.corners===v} className={t.corners===v?"on":""} onClick={()=>updateTheme({corners:v})}>{v==="round"?"Round":"Sharp"}</button>)}</div></div>
      <div className="choice-row"><span>Interface size</span><div role="radiogroup" aria-label="Interface size">{([[0.9,"Compact"],[1,"Normal"],[1.12,"Large"]] as const).map(([v,l])=><button key={v} role="radio" aria-checked={t.scale===v} className={t.scale===v?"on":""} onClick={()=>updateTheme({scale:v})}>{l}</button>)}</div></div>
      <Setting label="Floating medical icons" detail="Drifting pills, cells, and organs in the background." checked={t.particles} onChange={v=>updateTheme({particles:v})}/>
      <Setting label="Twinkling stars" detail="Tiny sparkles in the background." checked={t.stars} onChange={v=>updateTheme({stars:v})}/>
      <Setting label="Show Pip the mascot" detail="Pip on the title screen, level bar, and results." checked={t.mascot} onChange={v=>updateTheme({mascot:v})}/>
      <button className="button button-quiet" onClick={()=>updateTheme({...DEFAULT_THEME})}>Reset look &amp; feel</button></>;})()}</section>
    <section className="settings-card"><h2>Arcade feel</h2><Setting label="Sound effects" detail="Taps, rights and wrongs, fanfares, and wheel spins." checked={player.sound} onChange={v=>updateSetting("sound",v)}/><Setting label="Haptics" detail="Tiny vibrations on phones when you answer." checked={player.haptics!==false} onChange={v=>updateSetting("haptics",v)}/><Setting label="Music" detail="A different looping tune for the arcade and every game." checked={player.music} onChange={v=>updateSetting("music",v)}/><Setting label="Reduced motion" detail="Use quieter transitions and fewer animations." checked={player.reducedMotion} onChange={v=>updateSetting("reducedMotion",v)}/><Setting label="Hide streaks" detail="Keep the focus on playing, not maintaining a streak." checked={player.hideStreaks} onChange={v=>updateSetting("hideStreaks",v)}/></section>
    {googleDriveConfigured()&&<section className="settings-card"><h2>Google Drive backup</h2><p>Sign in only when you want your progress backed up to your private Google Drive app-data folder. Roundsy cannot read your other Drive files. You can keep playing without Google login.</p>
      <button className="button button-primary" onClick={sync} disabled={syncing||!googleDriveConfigured()}>{syncing?"Syncing…":driveConnected?"Reconnect & sync Google Drive":"Sign in with Google & sync"}</button>
      {driveConnected&&<p className="setup-hint">Drive is connected for this browser session. New game results sync automatically while the access token remains valid.</p>}
      
    </section>}
    <section className="settings-card"><h2>Local backup</h2><p>Export a portable copy of your results or restore one from another device.</p><div className="export-row"><button className="button button-soft" onClick={exportData}>Export progress</button><label className="button button-quiet file-label">Import progress<input type="file" accept="application/json,.json" onChange={e=>importData(e.target.files?.[0])}/></label></div></section>
    <section className="settings-card"><h2>Help &amp; feedback</h2><p>Found a question that looks wrong, or something that is not working? Tell us. Each puzzle has a "Report a problem" link on its result card that fills in the details for you.</p>
      <div className="account-row"><a className="button button-soft" href={import.meta.env.BASE_URL+"help.html"} target="_blank" rel="noopener noreferrer">Help &amp; FAQ</a><a className="button button-quiet" href={feedbackMailto()}>Send feedback</a></div></section>
    {(()=>{const tip=tipLink(TIP_URL,isNative());return tip?<section className="settings-card"><h2>Support Roundsy</h2><p>Roundsy is free and always will be. If it made your day a little better, you can leave a tip. It is entirely optional, unlocks nothing, and is separate from Pro.</p><div className="account-row"><a className="button button-soft" href={tip} target="_blank" rel="noopener noreferrer">Leave a tip ↗</a></div></section>:null;})()}
    <section className="settings-card"><h2>Your data</h2><p>Roundsy keeps your progress on this device. It never contains patient information. Read how data is handled in the <a href="https://pathomnemonic.github.io/StudyBible/privacy.html" target="_blank" rel="noopener noreferrer">privacy policy</a> and the <a href={import.meta.env.BASE_URL+"terms.html"} target="_blank" rel="noopener noreferrer">terms of service</a>, or erase everything Roundsy stored here.</p>
      <MonitoringSwitch/>
      <EraseData/></section>
    <div className="privacy-note"><b>No account wall.</b> The arcade, daily puzzles, practice mode, and local progress all work without a login. Backup to your account and multiplayer are optional add-ons.</div>
  </div>;
}
function Setting({label,detail,checked,onChange}:{label:string;detail:string;checked:boolean;onChange:(v:boolean)=>void}){
  return <label className="setting-row"><span><b>{label}</b><small>{detail}</small></span><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/></label>;
}
