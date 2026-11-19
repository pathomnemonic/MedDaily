import { useEffect, useState } from "react";
import { GameBoard } from "./Games";
import GameArt, { DxArt } from "./components/GameArt";
import { computeTrophies } from "./achievements";
import Mascot from "./components/Mascot";
import Icon, { type IconName } from "./components/Icon";
import Splash from "./components/Splash";
import StageScene from "./components/StageScene";
import PipCompanion from "./components/PipCompanion";
import { levelFor, starsFor, xpForResult } from "./levels";
import { DEFAULT_THEME, PRESETS, applyTheme, normalizeTheme, swatch, type ThemeSettings } from "./theme";
import { watchStage, resetCombo } from "./juice";
import { setHapticsEnabled, vibrate } from "./haptics";
import { installAudioUnlock, setMusicEnabled, setScene, setSfxEnabled, sfx } from "./audio";
import type { GameId } from "./lib";
import { hashSeed, dailyDateKey, normalizeRoomCode, randomRoomCode, roomGame, roomSeed, PARTY_GAMES } from "./lib";
import { completedToday, loadPlayer, playStreak, recordResult, savePlayer, type PlayerData } from "./storage";
import { joinOrCreateRoom, leaveRoom, multiplayerConfigured, rankRoomPlayers, submitRoomScore, watchRoom, type RoomState } from "./firebase";
import { connectAndSync, googleDriveConfigured, hasDriveConnection, syncIfConnected } from "./googleDrive";

type Mode = "general" | "specialty";
type Specialty = "internal" | "familymed" | "neurology" | "cardiology" | "emergency" | "criticalcare" | "anesthesia" | "surgery" | "orthopedics" | "urology" | "otolaryngology" | "ophthalmology" | "pediatrics" | "obgyn" | "psychiatry" | "infectious" | "allergy" | "nephrology" | "pulmonology" | "endocrine" | "dermatology" | "rheumatology" | "hemeonc" | "gastro" | "geriatrics" | "radiology" | "anatomy" | "pathology" | "pharmacology" | "biostatistics";
type Screen = "home" | "stats" | "settings" | "friends";
interface GameMeta { id: GameId; title: string; subtitle: string; description: string; icon: string; wash: string; time: string; category: string; level: string; }
const GAMES: GameMeta[] = [
// Ordered by how fun, impressive, and replayable each game is (best first). The home grid follows this order.
  {id:"medle",title:"Stat Word",subtitle:"The five-letter rounds",description:"Find the hidden medical word in six guesses.",icon:"▦",wash:"mint",time:"2 min",category:"Word play",level:"Easy → tricky"},
  {id:"diagnosis",title:"Differential",subtitle:"Name the diagnosis",description:"Solve a clinical case in six guesses as clues unlock.",icon:"✚",wash:"peach",time:"3 min",category:"Diagnosis game",level:"Deduction"},
  {id:"trivia",title:"Trivia Rumble",subtitle:"Spin. Answer. Collect badges.",description:"A six-category trivia wheel with solo and pass-and-play modes.",icon:"🎡",wash:"orange",time:"8–12 min",category:"Party quiz",level:"All levels"},
  {id:"dive",title:"Deep Scan",subtitle:"Go past the obvious",description:"Seven timed open questions, one typed answer each. Common answers stop at the skin; rare ones reach the marrow.",icon:"🩻",wash:"blue",time:"4 min",category:"Open-answer trivia",level:"Think sideways"},
  {id:"connections",title:"Quad Squad",subtitle:"Think in fours",description:"Sort sixteen terms into four hidden medical families.",icon:"⊞",wash:"lilac",time:"4 min",category:"Pattern logic",level:"Moderate"},
  {id:"bodymap",title:"Body Map Blitz",subtitle:"Tap the organ. Fast.",description:"Race to tap the right organ on the body diagram. Faster taps score more.",icon:"🫀",wash:"peach",time:"2 min",category:"Anatomy arcade",level:"Quick-fire"},
  {id:"trail",title:"Theme Trail",subtitle:"Follow the winding words",description:"Trace hidden medical terms through a letter board. They bend in any direction, and the longest one stretches from top to bottom.",icon:"🧬",wash:"mint",time:"4 min",category:"Word trail",level:"Moderate"},
  {id:"crossword",title:"Crossword Clinic",subtitle:"Fill the tiny grid",description:"A fresh mini crossword every time, with clues from anatomy to pharmacology. Check or reveal letters when stuck.",icon:"✏️",wash:"gold",time:"4 min",category:"Crossword",level:"Moderate"},
  {id:"lettergrid",title:"Letter Lab",subtitle:"Find words in the grid",description:"Connect neighboring letters to uncover as many hidden words as possible before time runs out.",icon:"🔤",wash:"mint",time:"2 min",category:"Word hunt",level:"Fast & fun"},
  {id:"hive",title:"Seven Cells",subtitle:"Seven letters, a swarm of terms",description:"Find every accepted medical word in a seven-letter hive. Use the center tile and hunt for the pangram.",icon:"✿",wash:"gold",time:"3 min",category:"Medical wordplay",level:"Easy → tricky"},
  {id:"riddle",title:"Riddle Lab",subtitle:"Who am I?",description:"A germ, a drug, an organ, or a syndrome speaks in riddles. Guess early for more points.",icon:"🕵️",wash:"lilac",time:"3 min",category:"Guess who",level:"Easy → tricky"},
  {id:"higher",title:"What Has More?",subtitle:"Ridiculous medical matchups",description:"Pick the bigger number in surprising food, drug, body, and everyday comparisons.",icon:"⚖",wash:"gold",time:"2 min",category:"Wild comparisons",level:"Quick-fire"},
  {id:"pairs",title:"Association Blitz",subtitle:"Make the connections",description:"Flip a 24-card board, find twelve clinical pairs, and build a streak before time runs out.",icon:"◇",wash:"lime",time:"3 min",category:"Association",level:"Moderate"},
  {id:"mime",title:"Mime Time",subtitle:"Act it out. No talking.",description:"Pass the phone and act out medical scenes, symptoms, and instruments while your friends guess. Beat the clock.",icon:"🎭",wash:"pink",time:"5–10 min",category:"Party charades",level:"Silly"},
  {id:"casefile",title:"Casefile Logic",subtitle:"The clues don't lie",description:"Solve a fictional three-person deduction grid using rooms, objects, and clues.",icon:"⌕",wash:"lilac",time:"4 min",category:"Logic puzzle",level:"Moderate"},
  {id:"splice",title:"Anagram Sprint",subtitle:"Unscramble the specimen",description:"Unscramble five medical terms before the 75-second clock expires.",icon:"↝",wash:"mint",time:"1 min",category:"Word play",level:"Easy"},
  {id:"glyph",title:"Cell Sketch",subtitle:"Tiny picture logic",description:"Solve a nonogram with fill, empty, and pencil-mark cells.",icon:"▦",wash:"lilac",time:"2 min",category:"Visual logic",level:"Easy → tricky"},
  {id:"labline",title:"Labline",subtitle:"Calibrate your eye",description:"Five rapid-fire estimates of classic lab values and clinical thresholds.",icon:"⌁",wash:"pink",time:"2 min",category:"Numbers",level:"Foundational"},
  {id:"ladder",title:"Letter Rungs",subtitle:"One letter at a time",description:"Build a one-letter-at-a-time path from the start word to the finish.",icon:"⌁",wash:"peach",time:"3 min",category:"Word play",level:"Moderate"},
];
type Shelf = "all" | "quick" | "brain" | "word" | "clinical" | "party";
const SHELVES: { id: Shelf; label: string; icon: IconName }[] = [
  {id:"all",label:"All",icon:"all"},{id:"quick",label:"Quick",icon:"bolt"},{id:"brain",label:"Brain",icon:"brain"},{id:"word",label:"Words",icon:"letters"},{id:"clinical",label:"Clinical",icon:"steth"},{id:"party",label:"Party",icon:"party"}
];
const SHELF_OF: Record<Shelf, GameId[]> = {
  all:[],
  quick:["splice","labline","higher","medle","dive","glyph","mime","bodymap","riddle"],
  brain:["connections","glyph","casefile","ladder","pairs","hive","riddle","crossword","trail"],
  word:["medle","splice","ladder","hive","lettergrid","diagnosis","crossword","trail"],
  clinical:["diagnosis","labline","dive","riddle","bodymap"],
  party:[...PARTY_GAMES,"trivia","mime"]
};
/** Rotating spotlight: the open-answer and trivia games trade the featured slot each UTC day. */
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
  const [homeFreePlay,setHomeFreePlay] = useState(false);
  const [notice,setNotice] = useState("");
  const [installPrompt,setInstallPrompt] = useState<InstallPrompt|null>(null);
  const [startAt,setStartAt] = useState(0);
  const [gameStartedAt,setGameStartedAt] = useState(0);
  const [roomCode,setRoomCode] = useState("");
  const [room,setRoom] = useState<RoomState|null>(null);
  const [roomName,setRoomName] = useState("");
  const [joinCode,setJoinCode] = useState("");
  const [roomBusy,setRoomBusy] = useState(false);
  const [lastShare,setLastShare] = useState("");
  const [partyRun,setPartyRun] = useState(false);
  const [wipe,setWipe] = useState<{id:GameId;key:number}|null>(null);
  const [completion,setCompletion] = useState<{title:string;score:number;maxScore:number;perfect:boolean;text:string;party:boolean;stars:number;gain:number;levelUp:string|null;chest:number}|null>(null);
  const [splash,setSplash] = useState(()=>{try{return sessionStorage.getItem("meddaily:splash")!=="1";}catch{return true;}});
  const [copied,setCopied] = useState(false);

  const date = dailyDateKey();
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
    if("serviceWorker" in navigator) navigator.serviceWorker.register(import.meta.env.BASE_URL+"sw.js").catch(()=>setNotice("Offline caching could not be enabled in this browser."));
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

  const doneToday=completedToday(player,scope);
  const streak=playStreak(player,scope);
  const seedFor=(game:GameId)=>hashSeed(date+"|"+scope+"|"+game);

  const openGame=(id:GameId,isPractice=false,forcedSeed?:number,party=false)=>{
    sfx("start");resetCombo();vibrate(10);
    if(!player.reducedMotion){setWipe({id,key:Date.now()});window.setTimeout(()=>setWipe(null),900);}
    setPartyRun(party);setCompletion(null);setActiveGame(id);setPractice(isPractice);setStartAt(forcedSeed??(isPractice?hashSeed(id+"-free-"+Date.now()):seedFor(id)));setGameStartedAt(Date.now());setLastShare("");setScreen("home");setNotice("");
    window.scrollTo({top:0,behavior:player.reducedMotion?"auto":"smooth"});
  };
  const finishGame=(score:number,maxScore:number,perfect:boolean,share?:string)=>{
    const gameTitle=GAMES.find(g=>g.id===activeGame)?.title??"MedDaily game";
    const filled=Math.max(0,Math.min(10,Math.round(score/Math.max(1,maxScore)*10)));
    const fallback="🟩".repeat(filled)+"⬜".repeat(10-filled)+(perfect?"\n✨ Perfect run":"");
    const where=partyRun?" · Room "+roomCode:practice?" · Free Play":" · "+date;
    const text=share?"MedDaily"+where+"\n"+share:"MedDaily · "+gameTitle+where+"\n"+fallback+"\nhttps://pathomnemonic.github.io/MedDaily/"+(partyRun?"?room="+roomCode:"");
    setLastShare(text);setCopied(false);
    const isNewDaily=!partyRun&&!practice&&!player.results.some(r=>r.date===date&&r.game===activeGame&&r.scope===scope);
    const todayDone=player.results.filter(r=>r.date===date&&r.scope===scope).length;
    const chest=isNewDaily&&todayDone+1===3?60:0; // daily goal: finish three games for a bonus chest
    const gain=xpForResult({score,maxScore,perfect,practice:!partyRun&&!isNewDaily,party:partyRun})+chest;
    const before=levelFor(player.xp??0),after=levelFor((player.xp??0)+gain);
    setCompletion({title:gameTitle,score,maxScore,perfect,text,party:partyRun,stars:starsFor(score,maxScore,perfect),gain,chest,levelUp:after.level>before.level?after.title+" · Level "+after.level:null});
    sfx(perfect?"perfect":"win");
    if(after.level>before.level)window.setTimeout(()=>sfx("badge"),900);
    if(partyRun){
      setRoom(current=>current?{...current,players:current.players.map(p=>p.uid==="me"?{...p,score,maxScore,perfect,finished:true}:p)}:current);
      if(multiplayerConfigured()&&roomCode) void submitRoomScore(roomCode,score,maxScore,perfect).catch(()=>{/* local result still shown */});
      setPlayer(cur=>{const n={...cur,xp:(cur.xp??0)+gain};savePlayer(n);return n;});
      return;
    }
    if(practice){setPlayer(cur=>{const n={...cur,xp:(cur.xp??0)+gain};savePlayer(n);return n;});return;}
    const result={date,game:activeGame!,scope,score,maxScore,perfect,durationSeconds:Math.max(0,Math.round((Date.now()-gameStartedAt)/1000))};
    const nextPlayer = {...recordResult(player,result),xp:(player.xp??0)+gain};
    savePlayer(nextPlayer);
    setPlayer(nextPlayer);
    setNotice(hasDriveConnection() ? "Result saved. Syncing your private Drive copy…" : "Daily result saved on this device.");
    if (hasDriveConnection()) {
      void syncIfConnected(nextPlayer).then((merged: PlayerData | null)=>{ if (merged) { savePlayer(merged); setPlayer(merged); setNotice("Daily result saved and synced to your private Google Drive data."); } }).catch((error: unknown)=>setNotice("Saved locally; Google Drive needs reconnecting: "+(error instanceof Error ? error.message : "Unknown sync error")));
    }
  };
  const shareResult=async()=>{
    if(!completion)return;
    if(navigator.share){try{await navigator.share({text:completion.text});return;}catch{/* fall through to copy */}}
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
    setNotice(result.outcome==="accepted"?"MedDaily added to your home screen.":"Use your browser menu to install MedDaily when ready.");
  };
  const exportData=()=>{
    const blob=new Blob([JSON.stringify(player,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="meddaily-progress-"+date+".json";a.click();URL.revokeObjectURL(url);
  };
  const importData=(file:File|undefined)=>{
    if(!file)return;const reader=new FileReader();
    reader.onload=()=>{
      try{
        const parsed=JSON.parse(String(reader.result)) as Partial<PlayerData>;
        if(!Array.isArray(parsed.results)||typeof parsed.bests!=="object")throw new Error("Invalid file");
        const next:PlayerData={results:parsed.results.filter(r=>r&&typeof r.date==="string"&&GAMES.some(g=>g.id===r.game)).map(r=>({...r,scope:r.scope??"general"})),bests:parsed.bests??{},sound:parsed.sound!==false,music:parsed.music!==false,xp:Number(parsed.xp)||0,reducedMotion:Boolean(parsed.reducedMotion),hideStreaks:Boolean(parsed.hideStreaks)};
        savePlayer(next);setPlayer(next);setNotice("Progress imported.");
      }catch{setNotice("That file does not look like a MedDaily progress export.");}
    };reader.readAsText(file);
  };
  const joinFriendsRoom=async()=>{
    const code=normalizeRoomCode(joinCode);
    if(code.length!==6){setNotice("Room codes are six letters or numbers.");return;}
    const game=roomGame(code),seed=roomSeed(code);
    setRoomBusy(true);setNotice("");
    const local:RoomState={code,gameId:game,scope:"party",specialty:"general",date,seed,hostUid:"local",players:[{uid:"me",name:roomName.trim()||"You",score:null,maxScore:null,finished:false,perfect:false}],status:"waiting"};
    setRoomCode(code);setRoom(local);
    if(multiplayerConfigured()){
      try{const joined=await joinOrCreateRoom(code,{gameId:game,scope:"party",specialty:"general",date,seed,name:roomName||"Guest"});setRoom(joined);}
      catch{setNotice("Live scoreboard is unavailable right now. You can still play the same puzzle and compare shared results.");}
    }
    setRoomBusy(false);
  };
  const closeRoom=async()=>{
    if(roomCode&&multiplayerConfigured()){try{await leaveRoom(roomCode);}catch{/* no network */}}
    setRoomCode("");setRoom(null);setActiveGame(null);setPartyRun(false);setScreen("home");setNotice("Left the room.");
  };
  const nextUp=completion?(()=>{const left=GAMES.filter(g=>g.id!==activeGame&&!player.results.some(r=>r.date===date&&r.game===g.id&&r.scope===scope));const pool=left.length?left:GAMES.filter(g=>g.id!==activeGame);if(!pool.length)return null;return practice||completion.party?pool[hashSeed(String(completion.score)+activeGame)%pool.length]:pool[0];})():null;
  const title=activeGame?GAMES.find(g=>g.id===activeGame)?.title??"Game":screen==="stats"?"Your progress":screen==="settings"?"Preferences":screen==="friends"?"Play with friends":selectedTitle;

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={()=>{setActiveGame(null);setScreen("home");}} aria-label="MedDaily home">
        <span className="brand-mark"><i>+</i><b>·</b></span><span className="brand-name">meddaily<span>.</span><small>THE MEDICAL MINI-GAME ARCADE</small></span>
      </button>
      <nav className="top-nav" aria-label="Main navigation">
        <button className={!activeGame&&screen==="home"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("home");}}>Arcade</button>
        <button className={screen==="friends"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("friends");}}>Party</button>
        <button className={screen==="stats"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("stats");}}>Trophies</button>
        <button className={screen==="settings"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("settings");}}>Options</button>
      </nav>
      <div className="top-actions"><button className="sound-toggle" aria-label="Next color palette" title="Change palette" onClick={cyclePalette}><Icon name="palette" size={22}/></button><button className={"sound-toggle"+(player.music?" on":"")} aria-pressed={player.music} aria-label={player.music?"Mute music":"Turn music on"} onClick={()=>updateSetting("music",!player.music)}><Icon name={player.music?"music":"musicOff"} size={22}/></button><button className={"sound-toggle"+(player.sound?" on":"")} aria-pressed={player.sound} aria-label={player.sound?"Mute sound effects":"Turn sound effects on"} onClick={()=>updateSetting("sound",!player.sound)}><Icon name={player.sound?"speaker":"speakerOff"} size={22}/></button>{installPrompt&&<button className="install-button" onClick={install}>＋ Install</button>}<div className="avatar-chip">MD</div></div>
    </header>

    <nav className="mobile-nav" aria-label="Mobile navigation">
      <button className={!activeGame&&screen==="home"?"active":""} onClick={()=>{setActiveGame(null);setScreen("home");}}><span><Icon name="home" size={22}/></span>Arcade</button>
      <button className={screen==="friends"?"active":""} onClick={()=>{setActiveGame(null);setScreen("friends");}}><span><Icon name="party" size={22}/></span>Party</button>
      <button className={screen==="stats"?"active":""} onClick={()=>{setActiveGame(null);setScreen("stats");}}><span><Icon name="trophy" size={22}/></span>Trophies</button>
      <button className={screen==="settings"?"active":""} onClick={()=>{setActiveGame(null);setScreen("settings");}}><span><Icon name="gear" size={22}/></span>Options</button>
    </nav>
    {notice&&<button className="notice" onClick={()=>setNotice("")} aria-label="Dismiss message">{notice}<span>×</span></button>}
    {room&&<div className="room-strip"><span className="room-dot" /> <b>ROOM {room.code}</b><span>{room.players.length} players · {room.players.filter(p=>p.finished).length} finished</span><button onClick={()=>setScreen("friends")}>Room details</button><button onClick={closeRoom}>Leave</button></div>}

    <main>
      {activeGame?<div className={"page-enter play-page tone-"+(GAMES.find(g=>g.id===activeGame)?.wash??"lilac")}>
        <div className="breadcrumb"><button onClick={()=>{setActiveGame(null);setPractice(false);}}>← All games</button><span>/</span><span>{title}</span>{!completion&&<PipCompanion/>}</div>
        <div className="play-heading"><div className="play-badge" aria-hidden="true"><GameArt game={activeGame}/></div><div className="play-heading-text"><span className="eyebrow">{partyRun?"PARTY ROOM · "+roomCode:practice?"FREE PLAY":selectedTitle.toUpperCase()+" · "+date}</span><h1>{title}</h1><p>{GAMES.find(g=>g.id===activeGame)?.description}</p></div>
          {!partyRun&&<div className="mode-switch" role="group" aria-label="Game mode"><button className={!practice?"selected":""} onClick={()=>{if(practice)openGame(activeGame,false,room?.seed);}}>Daily</button><button className={practice?"selected":""} onClick={()=>{if(!practice)openGame(activeGame,true,hashSeed(activeGame+"-practice-"+Date.now()));}}>Free Play</button></div>}</div>
        <section className="game-stage"><div className="stage-orbit orbit-one"/><div className="stage-orbit orbit-two"/><StageScene game={activeGame}/><div className="stage-watermark" aria-hidden="true"><GameArt game={activeGame}/></div>
          <GameBoard key={activeGame+"-"+String(practice)+"-"+String(startAt)} game={activeGame} seed={startAt} specialty={(partyRun||mode==="general"?"general":specialty) as never} practice={practice} onDone={finishGame}/>
        </section>
        {room&&<RoomScores room={room}/>}
        {lastShare&&<div className="result-share-row"><span>ROUND COMPLETE</span><button className="button button-soft" onClick={()=>{if(navigator.share)void navigator.share({title:"MedDaily result",text:lastShare}).catch(()=>{});else void navigator.clipboard?.writeText(lastShare);}}>Share result ↗</button></div>}
        <div className="under-game"><span>♡ Take a breath between rounds.</span><span>{practice?"Practice runs are not recorded":roomCode?"Your result is shared with this room":"One daily result per game and mode"}</span></div>
      </div>:screen==="stats"?<StatsPage player={player} scope={scope} streak={streak}/>:screen==="settings"?<SettingsPage updateTheme={updateTheme} player={player} driveConnected={hasDriveConnection()} updateSetting={updateSetting} exportData={exportData} importData={importData} onDriveSync={async()=>{setNotice("Connecting to Google Drive…");try{const merged=await connectAndSync(player);savePlayer(merged);setPlayer(merged);setNotice("Google Drive sync complete. Your progress is backed up privately.");}catch(e){setNotice((e as Error).message);}}}/>:screen==="friends"?<FriendsPage room={room} roomName={roomName} setRoomName={setRoomName} joinCode={joinCode} setJoinCode={setJoinCode} busy={roomBusy} live={multiplayerConfigured()} games={GAMES} onJoin={joinFriendsRoom} onPlay={(r)=>openGame(r.gameId,true,r.seed,true)} onLeave={closeRoom} />:<HomePage player={player} scope={scope} mode={mode} specialty={specialty} setMode={setMode} setSpecialty={setSpecialty} today={date} doneToday={doneToday} openGame={openGame} freePlay={homeFreePlay} setFreePlay={setHomeFreePlay}/>}
    </main>
    {completion&&<div className="complete-overlay" role="dialog" aria-modal="true" aria-label="Round complete" onClick={()=>setCompletion(null)}>
      <div className={"complete-card"+(completion.perfect?" perfect":"")} onClick={e=>e.stopPropagation()}>
        {!player.reducedMotion&&<div className="confetti" aria-hidden="true">{Array.from({length:26},(_,i)=><i key={i} style={{left:((i*37)%100)+"%",animationDelay:((i%9)*0.12)+"s",background:["#ffd54a","#ff5d9e","#52e3b0","#36bdf5","#a99aff"][i%5]}}/>)}</div>}
        <div className="complete-mascot"><Mascot mood={completion.stars>=3?"cheer":completion.stars===0?"sad":"happy"} size={96}/></div>
        <div className="complete-stars" aria-label={completion.stars+" of 3 stars"}>{[1,2,3].map(n=><span key={n} className={n<=completion.stars?"on":""} style={{animationDelay:(0.25+n*0.22)+"s"}}>★</span>)}</div>
        <span className="complete-stamp">{completion.perfect?"PERFECT":completion.stars>=3?"GREAT":completion.stars===0?"TRY AGAIN":"COMPLETE"}</span>
        <h2>{completion.title}</h2>
        <p className="complete-sub">{completion.party?"Room "+roomCode+" · send this to your group":practice?"Free Play round finished":"Daily saved · come back tomorrow"}</p>
        <div className="complete-xp"><b>+{completion.gain} XP</b>{completion.chest>0&&<span className="chest-pop">🎁 Daily goal reached! +{completion.chest} XP chest</span>}{completion.levelUp&&<span className="level-up">LEVEL UP! {completion.levelUp}</span>}</div>
        <pre className="share-preview">{completion.text.split("\n").filter(l=>!l.startsWith("http")).join("\n")}</pre>
        <div className="complete-actions">
          {nextUp&&<button className="button button-primary next-up" onClick={()=>openGame(nextUp.id,completion.party?false:practice,undefined,false)}><span className="next-up-art"><GameArt game={nextUp.id}/></span><span><small>NEXT UP</small><b>{nextUp.title}</b></span><i>▶</i></button>}
          <button className="button button-soft" onClick={()=>void shareResult()}>{copied?"✓ Copied!":"Share result ↗"}</button>
          {!completion.party&&<button className="button button-soft" onClick={()=>openGame(activeGame!,true,hashSeed(activeGame+"-again-"+Date.now()))}>Play again ∞</button>}
          <button className="button button-quiet" onClick={()=>{setCompletion(null);setActiveGame(null);setScreen(completion.party?"friends":"home");}}>{completion.party?"Back to party":"All games"}</button>
        </div>
        <button className="complete-close" aria-label="Close" onClick={()=>setCompletion(null)}>×</button>
      </div>
    </div>}
    {wipe&&<div key={wipe.key} className={"game-wipe tone-"+(GAMES.find(g=>g.id===wipe.id)?.wash??"lilac")} aria-hidden="true"><div className="game-wipe-art"><GameArt game={wipe.id}/></div><b>{GAMES.find(g=>g.id===wipe.id)?.title}</b></div>}
    {splash&&<Splash onStart={()=>{try{sessionStorage.setItem("meddaily:splash","1");}catch{/* ignore */}sfx("start");setSplash(false);}}/>}
    <footer className="site-footer"><div><span className="footer-mark">✳</span><b>meddaily.</b><span>PRESS START · FIND YOUR NEXT FAVORITE</span></div><p>For education only · Not a clinical decision tool · Verify care decisions against current guidance.</p><span className="version">v1.1 · Local-first · Optional Drive sync</span></footer>
  </div>;
}

function HomePage({player,scope,mode,specialty,setMode,setSpecialty,today,doneToday,openGame,freePlay,setFreePlay}:{
  player:PlayerData;scope:string;mode:Mode;specialty:Specialty;setMode:(m:Mode)=>void;setSpecialty:(s:Specialty)=>void;today:string;doneToday:number;openGame:(id:GameId,practice?:boolean)=>void;freePlay:boolean;setFreePlay:(value:boolean)=>void;
}){
  const done=doneToday;
  const [shelf,setShelf]=useState<Shelf>("all");
  
  const streakNow=playStreak(player,scope);
  const featuredId=featuredToday(today);
  const visible=shelf==="all"?GAMES:GAMES.filter(g=>SHELF_OF[shelf].includes(g.id));
  const ordered=[...visible.filter(g=>g.id===featuredId),...visible.filter(g=>g.id!==featuredId)];
  const specialtyName=SPECIALTIES.find(s=>s.id===specialty)?.name;
  const lvl=levelFor(player.xp??0);
  return <div className="home-page page-enter">
    <section className="arcade-hud">
      <div className="hud-level"><Mascot mood="happy" size={44}/><div><b>Lv {lvl.level} · {lvl.title}</b><i role="progressbar" aria-valuenow={lvl.pct} aria-valuemin={0} aria-valuemax={100}><span style={{width:lvl.pct+"%"}}/></i><small>{lvl.into} / {lvl.span} XP to next level</small></div></div>
      {!freePlay&&<div className="hud-goal" aria-label={"Daily goal "+Math.min(done,3)+" of 3"}><div className="goal-dots">{[0,1,2].map(i=><i key={i} className={i<Math.min(done,3)?"on":""}/>)}<span className="goal-chest">{done>=3?"🎁":"🔒"}</span></div><small>{done>=3?"Daily chest claimed":"Daily goal "+Math.min(done,3)+"/3 · +60 XP chest"}</small></div>}
      <div className="hud-controls">
        <div className="home-play-mode" role="group" aria-label="Choose daily or free play"><button className={!freePlay?"selected":""} onClick={()=>setFreePlay(false)}>Daily</button><button className={freePlay?"selected":""} onClick={()=>setFreePlay(true)}>Free Play ∞</button></div>
        <div className="mode-tabs"><button className={mode==="general"?"active":""} onClick={()=>setMode("general")}>Open Arcade</button><button className={mode==="specialty"?"active":""} onClick={()=>setMode("specialty")}>Specialties</button></div>
      </div>
      <button className="button button-soft surprise-btn" onClick={()=>{const left=GAMES.filter(g=>!player.results.some(r=>r.date===today&&r.game===g.id&&r.scope===scope));const pool=(freePlay||left.length===0)?GAMES:left;openGame(pool[Math.floor(Math.random()*pool.length)].id,freePlay);}}><Icon name="dice" size={20}/> Surprise me</button>
      <div className="hud-stats">
        <div className="hud-chip"><span><Icon name="flame" size={24}/></span><b>{streakNow}</b></div>
        <div className="hud-chip"><span><Icon name="star" size={24}/></span><b>{freePlay?"∞":done+"/"+GAMES.length}</b></div>
      </div>
      {mode==="specialty"&&<div className="specialty-picker"><div className="specialty-chips">{SPECIALTIES.map(s=><button key={s.id} onClick={()=>setSpecialty(s.id)} className={specialty===s.id?"selected":""}><span>{s.icon}</span>{s.short}</button>)}</div><div className="specialty-selected"><b>{specialtyName}</b><span>{SPECIALTIES.find(s=>s.id===specialty)?.blurb}</span></div></div>}
    </section>

        <div className="shelf-chips" role="tablist" aria-label="Filter games">{SHELVES.map(sh=><button key={sh.id} role="tab" aria-selected={shelf===sh.id} className={shelf===sh.id?"selected":""} onClick={()=>setShelf(sh.id)}><Icon name={sh.icon} size={20}/>{sh.label}</button>)}</div>
    <div className="game-grid" onPointerMove={e=>{if(e.pointerType!=="mouse")return;const card=(e.target as HTMLElement).closest(".game-card") as HTMLElement|null;if(!card)return;const b=card.getBoundingClientRect();card.style.setProperty("--ry",(((e.clientX-b.left)/b.width-.5)*10).toFixed(1)+"deg");card.style.setProperty("--rx",(-((e.clientY-b.top)/b.height-.5)*10).toFixed(1)+"deg");}} onPointerOut={e=>{const card=(e.target as HTMLElement).closest(".game-card") as HTMLElement|null;if(card){card.style.removeProperty("--rx");card.style.removeProperty("--ry");}}}>
      {(shelf==="all"||shelf==="clinical")&&<a className="game-card dx-card" href="https://pathomnemonic.github.io/buzzword-dash-v2/" target="_blank" rel="noreferrer"><div className="game-cover"><DxArt/><span className="card-status">★ FEATURED</span></div><div className="game-card-body"><span className="game-category">Companion game</span><h3>Dx Dash</h3><span className="game-subtitle">Run the list. Learn the diagnosis.</span></div><div className="game-card-footer"><span>↗ opens Dx Dash</span><span className="card-play">PLAY ▶</span></div></a>}
      {ordered.map((game,index)=>{
      const spotlight=game.id===featuredId;
      const result=player.results.find(r=>r.date===today&&r.game===game.id&&r.scope===scope);
      const cleared=!!result&&!freePlay;
      return <button key={game.id} className={"game-card "+game.wash+(cleared?" card-done":"")+(spotlight?" card-spotlight":"")} onClick={()=>openGame(game.id,freePlay)} style={{animationDelay:(index*40)+"ms"}}>
        <div className="game-cover"><GameArt game={game.id}/><span className={"card-status"+(cleared?" status-done":"")}>{cleared?"★ CLEARED":spotlight?"★ FEATURED TODAY":freePlay?"∞":"DAILY"}</span></div>
        <div className="game-card-body"><span className="game-category">{game.category}</span><h3>{game.title}</h3><span className="game-subtitle">{game.subtitle}</span></div>
        <div className="game-card-footer"><span>⏱ {game.time}</span><span className="card-play">PLAY ▶</span></div>
      </button>;
    })}</div>

  </div>;
}

function FriendsPage({room,roomName,setRoomName,joinCode,setJoinCode,busy,live,games,onJoin,onPlay,onLeave}:{
  room:RoomState|null;roomName:string;setRoomName:(s:string)=>void;joinCode:string;setJoinCode:(s:string)=>void;busy:boolean;live:boolean;games:GameMeta[];
  onJoin:()=>void;onPlay:(r:RoomState)=>void;onLeave:()=>void;
}){
  const [copied,setCopied]=useState(false);
  const meta=room?games.find(g=>g.id===room.gameId):undefined;
  const invite=room?location.origin+location.pathname+"?room="+room.code:"";
  return <div className="friends-page"><div className="friends-hero"><span className="eyebrow">PARTY ROOMS</span><h1>Same code, same game.</h1><p>Everyone who types the same code plays the same game and the same puzzle. No sign-up, no host. Pick any six letters or numbers, tell your friends, and compare results.</p></div>
    {room&&meta?<div className="room-card"><div className="room-code-head"><div><span className="eyebrow">ROOM CODE</span><strong>{room.code}</strong></div><div className="share-actions"><button className="button button-soft" onClick={()=>{void navigator.clipboard?.writeText(invite);setCopied(true);}}>{copied?"✓ Link copied":"Copy invite link"}</button></div></div>
      <div className="room-game"><div className="room-game-art"><GameArt game={meta.id}/></div><div><span className="eyebrow">THIS ROOM PLAYS</span><h2>{meta.title}</h2><p>{meta.description}</p></div></div>
      <div className="room-players">{room.players.map((p,i)=><div key={p.uid} className="room-player"><span className="player-number">{i+1}</span><b>{p.name}</b><span>{p.finished?"Finished":"Ready"}</span>{p.perfect&&<i>✦</i>}</div>)}</div>
      <div className="room-actions"><button className="button button-primary" onClick={()=>onPlay(room)}>▶ Play this puzzle</button><button className="button button-quiet" onClick={onLeave}>Leave room</button></div>
      <small>{live?"Live scores appear above as friends finish. You can also share your result from the finish screen.":"When you finish, tap Share result and paste it into your group chat to compare."}</small>
    </div>:<div className="friends-grid single-room-entry">
      <section className="friends-card"><span className="eyebrow">ENTER A CODE</span><h2>Join a room</h2>
        <label>Nickname (optional)<input maxLength={20} value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="What should we call you?"/></label>
        <label>Six-character code<input className="room-code-input" maxLength={6} value={joinCode} onChange={e=>setJoinCode(normalizeRoomCode(e.target.value))} placeholder="ABC123" autoCapitalize="characters" autoComplete="off"/></label>
        <div className="room-entry-actions"><button className="button button-primary" onClick={onJoin} disabled={busy||joinCode.length!==6}>{busy?"Joining…":"Join room ↗"}</button><button className="button button-soft" onClick={()=>setJoinCode(randomRoomCode())}>🎲 Random code</button></div>
        <p className="room-hint">Group rooms use games where racing the same puzzle makes sense: {PARTY_GAMES.map(id=>games.find(g=>g.id===id)?.title).filter(Boolean).join(", ")}. Trivia Rumble has its own pass-and-play mode.</p>
      </section>
    </div>}
    <div className="privacy-note"><b>Private by default.</b> No account needed. Nothing is sent anywhere unless live scoreboards are enabled, and then only a nickname, the room code, and scores. Never enter patient information.</div>
  </div>;
}

function RoomScores({room}:{room:RoomState}){
  const ranked=rankRoomPlayers(room.players);
  return <section className="room-score-inline"><div className="eyebrow">FRIENDS ROOM LEADERBOARD · {room.code}</div>{ranked.map((p,index)=><span key={p.uid}><b>#{index+1}</b> {p.name}: {p.finished?(p.score??0)+" points"+(p.perfect?" · perfect":""):"playing"}</span>)}</section>;
}

function StatsPage({player,scope,streak}:{player:PlayerData;scope:string;streak:number}){
  const trophies=computeTrophies(player,GAMES.length);
  const results=player.results.filter(r=>r.scope===scope);
  const perfect=results.filter(r=>r.perfect).length;
  return <div className="stats-page"><span className="eyebrow">YOUR LITTLE LAB BOOK</span><h1>Progress, not pressure.</h1><div className="stats-grid"><div><b>{results.length}</b><span>rounds played</span></div><div><b>{player.hideStreaks?"—":streak}</b><span>day streak</span></div><div><b>{perfect}</b><span>perfect rounds</span></div></div>
    <section className="trophy-cabinet"><h2>Trophy cabinet <small>{trophies.filter(t=>t.earned).length} / {trophies.length}</small></h2><div className="trophy-grid">{trophies.map(t=><div key={t.id} className={"trophy"+(t.earned?" earned":"")}><span className="trophy-icon">{t.earned?t.icon:"🔒"}</span><b>{t.name}</b><small>{t.hint}</small></div>)}</div></section>
    <section className="stats-table"><h2>Game shelf</h2>{GAMES.map(g=>{const played=results.filter(r=>r.game===g.id);return <div key={g.id}><span>{g.title}</span><span>{played.length} played</span><b>Best run {Math.max(0,...played.map(r=>r.score))}</b></div>;})}</section>
    <p className="privacy-note">Progress and achievements are calculated from this device's saved results for the current arcade mode. Records stay local unless you choose Google Drive sync in Settings. Room leaderboards are private to the six-character room code.</p>
  </div>;
}

function SettingsPage({updateTheme,player,driveConnected,updateSetting,exportData,importData,onDriveSync}:{
  updateTheme:(p:Partial<ThemeSettings>)=>void;player:PlayerData;driveConnected:boolean;updateSetting:(k:"sound"|"music"|"haptics"|"reducedMotion"|"hideStreaks",v:boolean)=>void;exportData:()=>void;importData:(file:File|undefined)=>void;onDriveSync:()=>Promise<void>;
}){
  const [syncing,setSyncing]=useState(false);
  const sync=async()=>{setSyncing(true);try{await onDriveSync();}finally{setSyncing(false);}};
  return <div className="settings-page"><span className="eyebrow">MAKE IT YOURS</span><h1>Preferences & backup</h1>
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
    <section className="settings-card"><h2>Google Drive backup</h2><p>Sign in only when you want your progress backed up to your private Google Drive app-data folder. MedDaily cannot read your other Drive files. You can keep playing without Google login.</p>
      <button className="button button-primary" onClick={sync} disabled={syncing||!googleDriveConfigured()}>{syncing?"Syncing…":driveConnected?"Reconnect & sync Google Drive":"Sign in with Google & sync"}</button>
      {driveConnected&&<p className="setup-hint">Drive is connected for this browser session. New game results sync automatically while the access token remains valid.</p>}
      {!googleDriveConfigured()&&<p className="setup-hint">Set <code>VITE_GOOGLE_CLIENT_ID</code> in your deployment environment to enable this button. See <code>docs/SETUP.md</code>.</p>}
    </section>
    <section className="settings-card"><h2>Local backup</h2><p>Export a portable copy of your results or restore one from another device.</p><div className="export-row"><button className="button button-soft" onClick={exportData}>Export progress</button><label className="button button-quiet file-label">Import progress<input type="file" accept="application/json,.json" onChange={e=>importData(e.target.files?.[0])}/></label></div></section>
    <div className="privacy-note"><b>No account wall.</b> The arcade, daily puzzles, practice mode, and local progress all work without a login. Google Drive sync and multiplayer are optional add-ons.</div>
  </div>;
}
function Setting({label,detail,checked,onChange}:{label:string;detail:string;checked:boolean;onChange:(v:boolean)=>void}){
  return <label className="setting-row"><span><b>{label}</b><small>{detail}</small></span><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/></label>;
}
