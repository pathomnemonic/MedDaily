import { useEffect, useState } from "react";
import { GameBoard } from "./Games";
import type { GameId } from "./lib";
import { hashSeed, dailyDateKey } from "./lib";
import { completedToday, loadPlayer, playStreak, recordResult, savePlayer, totalPlays, type PlayerData } from "./storage";
import { createRoom, joinRoom, leaveRoom, multiplayerConfigured, submitRoomScore, watchRoom, type RoomState } from "./firebase";
import { connectAndSync, googleDriveConfigured, hasDriveConnection, syncIfConnected } from "./googleDrive";

type Mode = "general" | "specialty";
type Specialty = "internal" | "familymed" | "neurology" | "cardiology" | "emergency" | "criticalcare" | "anesthesia" | "surgery" | "orthopedics" | "urology" | "otolaryngology" | "ophthalmology" | "pediatrics" | "obgyn" | "psychiatry" | "infectious" | "allergy" | "nephrology" | "pulmonology" | "endocrine" | "dermatology" | "rheumatology" | "hemeonc" | "gastro" | "geriatrics" | "radiology" | "anatomy" | "pathology" | "pharmacology" | "biostatistics";
type Screen = "home" | "stats" | "settings" | "friends";
interface GameMeta { id: GameId; title: string; subtitle: string; description: string; icon: string; wash: string; time: string; category: string; level: string; }
const GAMES: GameMeta[] = [
  {id:"medle",title:"Medle",subtitle:"The five-letter rounds",description:"Find the hidden medical word in six guesses.",icon:"▦",wash:"mint",time:"2 min",category:"Word play",level:"Easy → tricky"},
  {id:"connections",title:"Connections",subtitle:"Think in fours",description:"Sort sixteen terms into four hidden medical families.",icon:"⊞",wash:"lilac",time:"4 min",category:"Pattern logic",level:"Moderate"},
  {id:"diagnosis",title:"Mystery Case",subtitle:"A clue at a time",description:"Crack a clinical presentation before the clues run out.",icon:"⌕",wash:"peach",time:"3 min",category:"Clinical reasoning",level:"Step 2"},
  {id:"nextstep",title:"Next Best Step",subtitle:"Make the call",description:"Choose the next move in a focused clinical vignette.",icon:"➜",wash:"gold",time:"3 min",category:"Clinical reasoning",level:"Step 2"},
  {id:"microbe",title:"Microbe Hunt",subtitle:"The microscopic maze",description:"Trace hidden organism names through a letter grid.",icon:"✣",wash:"blue",time:"4 min",category:"Word search",level:"Moderate"},
  {id:"labline",title:"Labline",subtitle:"Calibrate your eye",description:"Estimate classic lab values and clinical thresholds.",icon:"⌁",wash:"pink",time:"2 min",category:"Numbers",level:"Foundational"},
  {id:"pairs",title:"Memory Match",subtitle:"Link the associations",description:"Pair medications, findings, mechanisms, and diagnoses.",icon:"◇",wash:"lime",time:"3 min",category:"Memory",level:"Moderate"},
  {id:"triage",title:"Triage Order",subtitle:"What comes first?",description:"Put the priorities of an emergency response in order.",icon:"⇅",wash:"orange",time:"3 min",category:"Clinical reasoning",level:"Step 2"},
  {id:"splice",title:"Anagram Sprint",subtitle:"Unscramble the specimen",description:"Rebuild a medical word from its shuffled letters.",icon:"↝",wash:"mint",time:"1 min",category:"Word play",level:"Easy"},
  {id:"glyph",title:"Cell Sketch",subtitle:"Tiny picture logic",description:"Solve a tiny nonogram to reveal a scientific shape.",icon:"▦",wash:"lilac",time:"2 min",category:"Visual logic",level:"Easy → tricky"},
  {id:"higher",title:"Higher or Lower",subtitle:"Trust your intuition",description:"Make quick comparisons: quantities, anatomy, and the occasional tie.",icon:"↕",wash:"gold",time:"2 min",category:"Estimation",level:"Easy"},
  {id:"ladder",title:"Word Ladder",subtitle:"One letter at a time",description:"Climb from one word to another with tiny changes.",icon:"⌁",wash:"peach",time:"3 min",category:"Word play",level:"Moderate"}
];
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
  const [installPrompt,setInstallPrompt] = useState<InstallPrompt|null>(null);
  const [startAt,setStartAt] = useState(0);
  const [gameStartedAt,setGameStartedAt] = useState(0);
  const [roomCode,setRoomCode] = useState("");
  const [room,setRoom] = useState<RoomState|null>(null);
  const [roomName,setRoomName] = useState("");
  const [joinCode,setJoinCode] = useState("");
  const [roomBusy,setRoomBusy] = useState(false);

  const date = dailyDateKey();
  const scope = mode === "general" ? "general" : "specialty:" + specialty;
  const selectedSpecialty = SPECIALTIES.find(s=>s.id===specialty)!;
  const selectedTitle = mode === "general" ? "Open Arcade" : selectedSpecialty.name + " Dailies";

  useEffect(()=>{
    const sharedRoom = new URLSearchParams(window.location.search).get("room");
    if (sharedRoom) { setJoinCode(sharedRoom.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6)); setScreen("friends"); }
  },[]);
  useEffect(()=>{
    const handler=(event:Event)=>{event.preventDefault();setInstallPrompt(event as InstallPrompt);};
    window.addEventListener("beforeinstallprompt",handler);
    return ()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);
  useEffect(()=>{
    if("serviceWorker" in navigator) navigator.serviceWorker.register(import.meta.env.BASE_URL+"sw.js").catch(()=>setNotice("Offline caching could not be enabled in this browser."));
  },[]);
  useEffect(()=>{document.documentElement.dataset.motion=player.reducedMotion?"reduced":"full";},[player.reducedMotion]);
  useEffect(()=>{
    if(!roomCode)return;
    const stop=watchRoom(roomCode,(value)=>{
      setRoom(value);
      if(value){setMode(value.scope==="general"?"general":"specialty");if(value.specialty&&value.specialty!=="general")setSpecialty(value.specialty as Specialty);}
    });
    return ()=>stop();
  },[roomCode]);

  const doneToday=completedToday(player,scope);
  const streak=playStreak(player,scope);
  const firstTodo=GAMES.find(g=>!player.results.some(r=>r.date===date&&r.game===g.id&&r.scope===scope))?.id??"medle";
  const seedFor=(game:GameId)=>hashSeed(date+"|"+scope+"|"+game);

  const openGame=(id:GameId,isPractice=false,forcedSeed?:number)=>{
    setActiveGame(id);setPractice(isPractice);setStartAt(forcedSeed??seedFor(id));setGameStartedAt(Date.now());setScreen("home");setNotice("");
    window.scrollTo({top:0,behavior:player.reducedMotion?"auto":"smooth"});
  };
  const finishGame=(score:number,maxScore:number,perfect:boolean)=>{
    if(practice){setNotice("Practice round complete. It did not affect your daily record.");return;}
    const result={date,game:activeGame!,scope,score,maxScore,perfect,durationSeconds:Math.max(0,Math.round((Date.now()-gameStartedAt)/1000))};
    const nextPlayer = recordResult(player,result);
    setPlayer(nextPlayer);
    setNotice(hasDriveConnection() ? "Result saved. Syncing your private Drive copy…" : "Daily result saved on this device.");
    if (hasDriveConnection()) {
      void syncIfConnected(nextPlayer).then((merged)=>{ if (merged) { savePlayer(merged); setPlayer(merged); setNotice("Daily result saved and synced to your private Google Drive data."); } }).catch((error)=>setNotice("Saved locally; Google Drive needs reconnecting: "+(error as Error).message));
    }
    if(player.sound)playChime();
    if(roomCode) void submitRoomScore(roomCode,score,maxScore,perfect).catch(e=>setNotice((e as Error).message));
  };
  const updateSetting=(key:"sound"|"reducedMotion"|"hideStreaks",value:boolean)=>{
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
        const next:PlayerData={results:parsed.results.filter(r=>r&&typeof r.date==="string"&&GAMES.some(g=>g.id===r.game)).map(r=>({...r,scope:r.scope??"general"})),bests:parsed.bests??{},sound:Boolean(parsed.sound),reducedMotion:Boolean(parsed.reducedMotion),hideStreaks:Boolean(parsed.hideStreaks)};
        savePlayer(next);setPlayer(next);setNotice("Progress imported.");
      }catch{setNotice("That file does not look like a MedDaily progress export.");}
    };reader.readAsText(file);
  };
  const createFriendsRoom=async(game:GameId)=>{
    setRoomBusy(true);setNotice("");
    try{
      const code=await createRoom({gameId:game,scope,specialty:mode==="specialty"?specialty:"general",date,seed:seedFor(game),name:roomName||"Guest"});
      setRoomCode(code);setJoinCode(code);setNotice("Room created. Share the code with your group.");
    }catch(e){setNotice((e as Error).message);}
    finally{setRoomBusy(false);}
  };
  const joinFriendsRoom=async()=>{
    setRoomBusy(true);setNotice("");
    try{
      const joined=await joinRoom(joinCode,roomName||"Guest");
      setRoomCode(joined.code);setRoom(joined);setMode(joined.scope==="general"?"general":"specialty");
      if(joined.specialty&&joined.specialty!=="general")setSpecialty(joined.specialty as Specialty);
      setNotice("Joined room "+joined.code+". Everyone has the same daily puzzle.");
    }catch(e){setNotice((e as Error).message);}
    finally{setRoomBusy(false);}
  };
  const closeRoom=async()=>{
    if(roomCode){try{await leaveRoom(roomCode);}catch{/* no network */}}
    setRoomCode("");setRoom(null);setActiveGame(null);setScreen("home");setNotice("Left the room.");
  };
  const title=activeGame?GAMES.find(g=>g.id===activeGame)?.title??"Game":screen==="stats"?"Your progress":screen==="settings"?"Preferences":screen==="friends"?"Play with friends":selectedTitle;

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={()=>{setActiveGame(null);setScreen("home");}} aria-label="MedDaily home">
        <span className="brand-mark"><i>+</i><b>·</b></span><span className="brand-name">meddaily<span>.</span><small>THE MEDICAL MINI-GAME ARCADE</small></span>
      </button>
      <nav className="top-nav" aria-label="Main navigation">
        <button className={!activeGame&&screen==="home"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("home");}}>Arcade</button>
        <button className={screen==="friends"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("friends");}}>Play with friends</button>
        <button className={screen==="stats"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("stats");}}>Progress</button>
        <button className={screen==="settings"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("settings");}}>Settings</button>
      </nav>
      <div className="top-actions">{installPrompt&&<button className="install-button" onClick={install}>＋ Install</button>}<div className="avatar-chip">MD</div></div>
    </header>

    {notice&&<button className="notice" onClick={()=>setNotice("")} aria-label="Dismiss message">{notice}<span>×</span></button>}
    {room&&<div className="room-strip"><span className="room-dot" /> <b>ROOM {room.code}</b><span>{room.players.length} players · {room.players.filter(p=>p.finished).length} finished</span><button onClick={()=>setScreen("friends")}>Room details</button><button onClick={closeRoom}>Leave</button></div>}

    <main>
      {activeGame?<div className="play-page">
        <div className="breadcrumb"><button onClick={()=>{setActiveGame(null);setPractice(false);}}>← All games</button><span>/</span><span>{title}</span></div>
        <div className="play-heading"><div><span className="eyebrow">{practice?"PRACTICE LAB":selectedTitle.toUpperCase()+" · "+date}</span><h1>{title}</h1><p>{GAMES.find(g=>g.id===activeGame)?.description}</p></div>
          <div className="mode-switch" role="group" aria-label="Game mode"><button className={!practice?"selected":""} onClick={()=>{if(practice)openGame(activeGame,false,room?.seed);}}>Today</button><button className={practice?"selected":""} onClick={()=>{if(!practice)openGame(activeGame,true,hashSeed(activeGame+"-practice-"+Date.now()));}}>Practice</button></div></div>
        <section className="game-stage"><div className="stage-orbit orbit-one"/><div className="stage-orbit orbit-two"/>
          <GameBoard key={activeGame+"-"+String(practice)+"-"+String(startAt)} game={activeGame} seed={startAt} specialty={(mode==="general"?"general":specialty) as never} onDone={finishGame}/>
        </section>
        {room&&<RoomScores room={room}/>}
        <div className="under-game"><span>♡ Take a breath between rounds.</span><span>{practice?"Practice runs are not recorded":roomCode?"Your result is shared with this room":"One daily result per game and mode"}</span></div>
      </div>:screen==="stats"?<StatsPage player={player} scope={scope} streak={streak}/>:screen==="settings"?<SettingsPage player={player} driveConnected={hasDriveConnection()} updateSetting={updateSetting} exportData={exportData} importData={importData} onDriveSync={async()=>{setNotice("Connecting to Google Drive…");try{const merged=await connectAndSync(player);savePlayer(merged);setPlayer(merged);setNotice("Google Drive sync complete. Your progress is backed up privately.");}catch(e){setNotice((e as Error).message);}}}/>:screen==="friends"?<FriendsPage room={room} roomName={roomName} setRoomName={setRoomName} joinCode={joinCode} setJoinCode={setJoinCode} busy={roomBusy} configured={multiplayerConfigured()} game={firstTodo} games={GAMES} onCreate={createFriendsRoom} onJoin={joinFriendsRoom} onPlay={(r)=>openGame(r.gameId,false,r.seed)} onLeave={closeRoom} />:<HomePage player={player} scope={scope} mode={mode} specialty={specialty} setMode={setMode} setSpecialty={setSpecialty} today={date} doneToday={doneToday} streak={streak} openGame={openGame} firstTodo={firstTodo}/>}
    </main>
    <footer className="site-footer"><div><span className="footer-mark">✳</span><b>meddaily.</b><span>Little puzzles. Big pattern recognition.</span></div><p>For education only · Not a clinical decision tool · Verify care decisions against current guidance.</p><span className="version">v1.1 · Local-first · Optional Drive sync</span></footer>
  </div>;
}

function HomePage({player,scope,mode,specialty,setMode,setSpecialty,today,doneToday,streak,openGame,firstTodo}:{
  player:PlayerData;scope:string;mode:Mode;specialty:Specialty;setMode:(m:Mode)=>void;setSpecialty:(s:Specialty)=>void;today:string;doneToday:number;streak:number;openGame:(id:GameId,practice?:boolean)=>void;firstTodo:GameId;
}){
  const done=doneToday;
  const perfect=player.results.filter(r=>r.scope===scope&&r.perfect).length;
  const average=player.results.filter(r=>r.scope===scope).length?Math.round(player.results.filter(r=>r.scope===scope).reduce((n,r)=>n+r.score,0)/player.results.filter(r=>r.scope===scope).length):0;
  return <div className="home-page">
    <section className="hero"><div className="hero-copy">
      <div className="hero-kicker"><span className="pulse-dot"/> YOUR DAILY DOSE OF PLAY</div>
      <h1>A little curiosity.<br/><em>A lot of medicine.</em></h1>
      <p>A rotating collection of medical puzzles, word games, visual challenges, and estimation rounds. Learn something, spot a pattern, or simply play for the fun of it.</p>
      <div className="hero-buttons"><button className="button button-primary hero-cta" onClick={()=>openGame(firstTodo)}>Start today's rounds <span>↗</span></button><span className="no-account-note">No account needed</span></div>
      <div className="hero-stats"><span><b>12</b> games</span><i/><span><b>{done}</b> played today</span><i/><span><b>{player.hideStreaks?"—":streak}</b> day streak</span></div>
    </div>
    <div className="hero-art" aria-hidden="true"><div className="hero-orbit hero-orbit-a"/><div className="hero-orbit hero-orbit-b"/><div className="hero-cross">+</div>
      <div className="float-card float-card-one"><span>ECG</span><svg viewBox="0 0 120 42"><path d="M2 23h20l9-15 12 29 13-23 8 9h54"/></svg></div>
      <div className="float-card float-card-two"><span className="cell-dot">●</span><b>98.6°</b><small>LOOKING GOOD</small></div>
      <div className="hero-organ">✺</div><div className="hero-spark spark-a">✦</div><div className="hero-spark spark-b">✳</div><div className="hero-spark spark-c">·</div><div className="hero-tag">THINK<br/>LIKE A<br/>DETECTIVE</div>
    </div></section>

    <section className="mode-panel"><div className="mode-panel-head"><div><span className="eyebrow">CHOOSE YOUR PLAYGROUND</span><h2>One arcade. Your kind of daily.</h2></div><div className="mode-tabs"><button className={mode==="general"?"active":""} onClick={()=>setMode("general")}>Open Arcade</button><button className={mode==="specialty"?"active":""} onClick={()=>setMode("specialty")}>Specialty Dailies <span>NEW</span></button></div></div>
      {mode==="specialty"?<div className="specialty-picker"><div className="specialty-intro"><b>Play with your people.</b><p>Choose a specialty or subject. Everyone in the same track gets the same daily set. Subspecialty topics live inside their parent specialty, so the arcade stays balanced across fields.</p></div><div className="specialty-chips">{SPECIALTIES.map(s=><button key={s.id} onClick={()=>setSpecialty(s.id)} className={specialty===s.id?"selected":""}><span>{s.icon}</span>{s.short}</button>)}</div><div className="specialty-selected"><b>{SPECIALTIES.find(s=>s.id===specialty)?.name}</b><span>{SPECIALTIES.find(s=>s.id===specialty)?.blurb}</span></div></div>:<p className="mode-description">The same broad daily set for everyone: medicine, wordplay, estimation, and pure puzzle fun.</p>}
    </section>

    <section className="daily-strip"><div className="daily-strip-main"><div className="daily-icon">☀</div><div><span className="eyebrow">{mode==="general"?"THE DAILY ROUNDS":"SPECIALTY DAILY ROUNDS"}</span><h2>{done===12?"Your rounds are complete.":done===0?"Twelve games. One fresh day.":"You're on your way."}</h2><p>{mode==="general"?"Same puzzles for everyone today. Play in any order, or jump straight into a favorite.":"A shared specialty-specific daily set. Invite friends from your field to compare how you did."}</p></div></div>
      <div className="progress-box"><div className="progress-numbers"><b>{done}<small>/12</small></b><span>completed</span></div><div className="progress-track"><i style={{width:(done/12*100)+"%"}}/></div><div className="progress-caption">{Math.round(done/12*100)}% of today's arcade</div></div></section>

    <section className="section-head"><div><span className="eyebrow">PICK YOUR PRESCRIPTION</span><h2>Step into the arcade</h2><p>Different puzzles, different parts of your brain.</p></div><span className="section-aside">TODAY · {today}</span></section>
    <div className="game-grid">{GAMES.map((game,index)=>{
      const result=player.results.find(r=>r.date===today&&r.game===game.id&&r.scope===scope);
      return <button key={game.id} className={"game-card "+game.wash+(result?" card-done":"")} onClick={()=>openGame(game.id)} style={{animationDelay:(index*40)+"ms"}}>
        <div className="card-topline"><span className="game-category">{game.category}</span><span className={"card-status"+(result?" status-done":"")}>{result?"✓ Done":"Daily"}</span></div>
        <div className="game-icon-wrap"><span className="game-icon">{game.icon}</span><span className="icon-halo"/></div>
        <div className="game-card-body"><h3>{game.title}</h3><span className="game-subtitle">{game.subtitle}</span><p>{game.description}</p></div>
        <div className="game-card-footer"><span>{game.time} <i>·</i> {game.level}</span><span className="card-arrow">↗</span></div>
      </button>;
    })}</div>
    <section className="bottom-feature"><div className="feature-copy"><span className="eyebrow">A SMALL HABIT, A SHARP MIND</span><h2>Good medicine starts<br/>with noticing.</h2><p>Play for the pattern, for the challenge, or simply because you have three minutes.</p></div><div className="feature-metrics"><div><b>{totalPlays(player,scope)}</b><span>rounds played</span></div><div><b>{average}%</b><span>average score</span></div><div><b>{perfect}</b><span>perfect rounds</span></div></div></section>
  </div>;
}

function FriendsPage({room,roomName,setRoomName,joinCode,setJoinCode,busy,configured,game,games,onCreate,onJoin,onPlay,onLeave}:{
  room:RoomState|null;roomName:string;setRoomName:(s:string)=>void;joinCode:string;setJoinCode:(s:string)=>void;busy:boolean;configured:boolean;game:GameId;games:GameMeta[];
  onCreate:(g:GameId)=>void;onJoin:()=>void;onPlay:(r:RoomState)=>void;onLeave:()=>void;
}){
  const [selected,setSelected]=useState<GameId>(game);
  return <div className="friends-page"><div className="friends-hero"><span className="eyebrow">THE SHARED WARD</span><h1>Good games travel.</h1><p>Make a room, send the code, and everyone plays the same daily puzzle. Each person keeps their own progress; the room shows the group's results.</p></div>
    {!configured&&<div className="setup-warning"><b>Room play needs a one-time connection.</b><p>Solo and practice games work without setup or sign-in. To enable real-time rooms, configure Firebase using the included <code>.env.example</code> and <code>firestore.rules</code>. Multiplayer uses anonymous guest sessions; no Google account is required.</p></div>}
    {room?<div className="room-card"><div className="room-code-head"><div><span className="eyebrow">YOUR ROOM CODE</span><strong>{room.code}</strong></div><button className="button button-soft" onClick={()=>void navigator.clipboard?.writeText(location.href+"?room="+room.code)}>Copy page link</button></div>
      <p className="room-message">{room.specialty==="general"?"Open Arcade":"Specialty daily"} · {games.find(g=>g.id===room.gameId)?.title} · {room.date}</p>
      <div className="room-players">{room.players.map((p,i)=><div key={p.uid} className="room-player"><span className="player-number">{i+1}</span><b>{p.name}</b><span>{p.finished?(p.score??0)+" pts":"Ready to play"}</span>{p.perfect&&<i>✦</i>}</div>)}</div>
      <div className="room-actions"><button className="button button-primary" onClick={()=>onPlay(room)}>Play this daily <span>↗</span></button><button className="button button-quiet" onClick={onLeave}>Leave room</button></div>
      <small>Rooms allow up to eight players. Players can start the same puzzle independently; scores appear here when submitted.</small>
    </div>:<div className="friends-grid">
      <section className="friends-card"><div className="friends-card-icon">✳</div><span className="eyebrow">START A TABLE</span><h2>Create a room</h2><p>Choose a game. A six-character code will be created for your group.</p>
        <label>Your nickname<input maxLength={20} value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="What should we call you?"/></label>
        <label>Game<select value={selected} onChange={e=>setSelected(e.target.value as GameId)}>{games.map(g=><option value={g.id} key={g.id}>{g.title}</option>)}</select></label>
        <button className="button button-primary full-button" onClick={()=>onCreate(selected)} disabled={busy||!configured}>{busy?"Opening room…":"Create room"}</button>
      </section>
      <section className="friends-card"><div className="friends-card-icon">⌁</div><span className="eyebrow">JOIN YOUR CREW</span><h2>Have a code?</h2><p>Enter the code shared by your friend. You'll join their exact daily and specialty.</p>
        <label>Your nickname<input maxLength={20} value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="What should we call you?"/></label>
        <label>Room code<input className="room-code-input" maxLength={6} value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""))} placeholder="ABC123"/></label>
        <button className="button button-primary full-button" onClick={onJoin} disabled={busy||!configured||joinCode.length!==6}>{busy?"Joining…":"Join room"}</button>
      </section>
    </div>}
    <div className="privacy-note"><b>Private by default.</b> Solo play never requires an account. Friends rooms use temporary anonymous guest identities and contain only nicknames, game metadata, and scores. Do not enter patient information or other sensitive data.</div>
  </div>;
}

function RoomScores({room}:{room:RoomState}){
  return <section className="room-score-inline"><div className="eyebrow">FRIENDS ROOM · {room.code}</div>{room.players.map(p=><span key={p.uid}>{p.name}: {p.finished?(p.score??0)+" points":"playing"}</span>)}</section>;
}

function StatsPage({player,scope,streak}:{player:PlayerData;scope:string;streak:number}){
  const results=player.results.filter(r=>r.scope===scope);
  const perfect=results.filter(r=>r.perfect).length;
  return <div className="stats-page"><span className="eyebrow">YOUR LITTLE LAB BOOK</span><h1>Progress, not pressure.</h1><div className="stats-grid"><div><b>{results.length}</b><span>rounds played</span></div><div><b>{player.hideStreaks?"—":streak}</b><span>day streak</span></div><div><b>{perfect}</b><span>perfect rounds</span></div><div><b>{results.length?Math.round(results.reduce((n,r)=>n+r.score,0)/results.length):0}%</b><span>average score</span></div></div>
    <section className="stats-table"><h2>Game shelf</h2>{GAMES.map(g=>{const played=results.filter(r=>r.game===g.id);return <div key={g.id}><span>{g.title}</span><span>{played.length} played</span><b>Best {Math.max(0,...played.map(r=>r.score))}%</b></div>;})}</section>
    <p className="privacy-note">Progress shown here is for the current arcade mode. Your records are stored locally unless you choose Google Drive sync in Settings.</p>
  </div>;
}

function SettingsPage({player,driveConnected,updateSetting,exportData,importData,onDriveSync}:{
  player:PlayerData;driveConnected:boolean;updateSetting:(k:"sound"|"reducedMotion"|"hideStreaks",v:boolean)=>void;exportData:()=>void;importData:(file:File|undefined)=>void;onDriveSync:()=>Promise<void>;
}){
  const [syncing,setSyncing]=useState(false);
  const sync=async()=>{setSyncing(true);try{await onDriveSync();}finally{setSyncing(false);}};
  return <div className="settings-page"><span className="eyebrow">MAKE IT YOURS</span><h1>Preferences & backup</h1>
    <section className="settings-card"><h2>Arcade feel</h2><Setting label="Sound effects" detail="Soft sounds when you finish a round." checked={player.sound} onChange={v=>updateSetting("sound",v)}/><Setting label="Reduced motion" detail="Use quieter transitions and fewer animations." checked={player.reducedMotion} onChange={v=>updateSetting("reducedMotion",v)}/><Setting label="Hide streaks" detail="Keep the focus on playing, not maintaining a streak." checked={player.hideStreaks} onChange={v=>updateSetting("hideStreaks",v)}/></section>
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
function playChime(){try{const ctx=new AudioContext(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.value=660;gain.gain.setValueAtTime(0.035,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.22);osc.start();osc.stop(ctx.currentTime+0.22);}catch{/* Audio may be unavailable. */}}
