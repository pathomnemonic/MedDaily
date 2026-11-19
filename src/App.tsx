import { useEffect, useState } from "react";
import { GameBoard } from "./Games";
import type { GameId } from "./lib";
import { hashSeed, dailyDateKey } from "./lib";
import { achievementsFor, completedToday, loadPlayer, playStreak, recordResult, savePlayer, type PlayerData } from "./storage";
import { joinOrCreateRoom, leaveRoom, multiplayerConfigured, rankRoomPlayers, submitRoomScore, watchRoom, type RoomState } from "./firebase";
import { connectAndSync, googleDriveConfigured, hasDriveConnection, syncIfConnected } from "./googleDrive";

type Mode = "general" | "specialty";
type Specialty = "internal" | "familymed" | "neurology" | "cardiology" | "emergency" | "criticalcare" | "anesthesia" | "surgery" | "orthopedics" | "urology" | "otolaryngology" | "ophthalmology" | "pediatrics" | "obgyn" | "psychiatry" | "infectious" | "allergy" | "nephrology" | "pulmonology" | "endocrine" | "dermatology" | "rheumatology" | "hemeonc" | "gastro" | "geriatrics" | "radiology" | "anatomy" | "pathology" | "pharmacology" | "biostatistics";
type Screen = "home" | "stats" | "settings" | "friends";
interface GameMeta { id: GameId; title: string; subtitle: string; description: string; icon: string; wash: string; time: string; category: string; level: string; }
const GAMES: GameMeta[] = [
  {id:"medle",title:"Medle",subtitle:"The five-letter rounds",description:"Find the hidden medical word in six guesses.",icon:"▦",wash:"mint",time:"2 min",category:"Word play",level:"Easy → tricky"},
  {id:"connections",title:"Connections",subtitle:"Think in fours",description:"Sort sixteen terms into four hidden medical families.",icon:"⊞",wash:"lilac",time:"4 min",category:"Pattern logic",level:"Moderate"},
  {id:"diagnosis",title:"DoctorDle",subtitle:"Name the diagnosis",description:"Solve a clinical case in six guesses as clues unlock.",icon:"✚",wash:"peach",time:"3 min",category:"Diagnosis game",level:"Deduction"},
  {id:"microbe",title:"Word Hunt",subtitle:"Find the hidden terms",description:"Trace adjacent letters through a themed grid, find the hidden words, and connect the spangram.",icon:"✣",wash:"blue",time:"4 min",category:"Word search",level:"Moderate"},
  {id:"labline",title:"Labline",subtitle:"Calibrate your eye",description:"Five rapid-fire estimates of classic lab values and clinical thresholds.",icon:"⌁",wash:"pink",time:"2 min",category:"Numbers",level:"Foundational"},
  {id:"pairs",title:"Association Blitz",subtitle:"Make the connections",description:"Match 12 or 15 clinical pairs under a clock; expert mode adds five pairs and tightens the timer.",icon:"◇",wash:"lime",time:"3 min",category:"Association",level:"Moderate"},
  {id:"triage",title:"Triage Order",subtitle:"What comes first?",description:"Put the priorities of an emergency response in order.",icon:"⇅",wash:"orange",time:"3 min",category:"Clinical reasoning",level:"Step 2"},
  {id:"splice",title:"Anagram Sprint",subtitle:"Unscramble the specimen",description:"Unscramble five medical terms before the 75-second clock expires.",icon:"↝",wash:"mint",time:"1 min",category:"Word play",level:"Easy"},
  {id:"glyph",title:"Cell Sketch",subtitle:"Tiny picture logic",description:"Solve a nonogram with fill, empty, and pencil-mark cells.",icon:"▦",wash:"lilac",time:"2 min",category:"Visual logic",level:"Easy → tricky"},
  {id:"higher",title:"What Has More?",subtitle:"Ridiculous medical matchups",description:"Pick the bigger number in surprising food, drug, body, and everyday comparisons.",icon:"⚖",wash:"gold",time:"2 min",category:"Wild comparisons",level:"Quick-fire"},
  {id:"ladder",title:"Word Ladder",subtitle:"One letter at a time",description:"Build a one-letter-at-a-time path from the start word to the finish.",icon:"⌁",wash:"peach",time:"3 min",category:"Word play",level:"Moderate"},
  {id:"hive",title:"Medical Spelling Hive",subtitle:"Seven letters, a swarm of terms",description:"Find every accepted medical word in a seven-letter hive. Use the center tile and hunt for the pangram.",icon:"✿",wash:"gold",time:"3 min",category:"Medical wordplay",level:"Easy → tricky"},
  {id:"casefile",title:"Casefile Logic",subtitle:"The clues don't lie",description:"Solve a fictional three-person deduction grid using rooms, objects, and clues.",icon:"⌕",wash:"lilac",time:"4 min",category:"Logic puzzle",level:"Moderate"},
  {id:"dive",title:"Deep Dive",subtitle:"Rare finds go deeper",description:"List as many valid answers as possible across seven timed prompts; rarer accepted answers earn more.",icon:"🌊",wash:"blue",time:"4 min",category:"Open-answer trivia",level:"Think sideways"},
  {id:"trivia",title:"Trivia Rumble",subtitle:"Spin. Answer. Collect badges.",description:"A six-category trivia wheel with solo and pass-and-play modes.",icon:"🎡",wash:"orange",time:"8–12 min",category:"Party quiz",level:"All levels"},
  {id:"lettergrid",title:"Letter Lab",subtitle:"Find words in the grid",description:"Connect neighboring letters to uncover as many hidden words as possible before time runs out.",icon:"🔤",wash:"mint",time:"2 min",category:"Word hunt",level:"Fast & fun"},
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
    setActiveGame(id);setPractice(isPractice);setStartAt(forcedSeed??(isPractice?hashSeed(id+"-free-"+Date.now()):seedFor(id)));setGameStartedAt(Date.now());setLastShare("");setScreen("home");setNotice("");
    window.scrollTo({top:0,behavior:player.reducedMotion?"auto":"smooth"});
  };
  const finishGame=(score:number,maxScore:number,perfect:boolean,shareText?:string)=>{
    const gameTitle=GAMES.find(g=>g.id===activeGame)?.title??"MedDaily game";
    setLastShare((shareText??("MedDaily · "+gameTitle+"\n"+(perfect?"Perfect run":"Round complete")))+"\nPlay: https://pathomnemonic.github.io/MedDaily/");
    if(practice){setNotice("Free-play round complete. It did not affect your daily record.");return;}
    const result={date,game:activeGame!,scope,score,maxScore,perfect,durationSeconds:Math.max(0,Math.round((Date.now()-gameStartedAt)/1000))};
    const nextPlayer = recordResult(player,result);
    setPlayer(nextPlayer);
    setNotice(hasDriveConnection() ? "Result saved. Syncing your private Drive copy…" : "Daily result saved on this device.");
    if (hasDriveConnection()) {
      void syncIfConnected(nextPlayer).then((merged: PlayerData | null)=>{ if (merged) { savePlayer(merged); setPlayer(merged); setNotice("Daily result saved and synced to your private Google Drive data."); } }).catch((error: unknown)=>setNotice("Saved locally; Google Drive needs reconnecting: "+(error instanceof Error ? error.message : "Unknown sync error")));
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
  const joinFriendsRoom=async(game:GameId)=>{
    setRoomBusy(true);setNotice("");
    try{
      const joined=await joinOrCreateRoom(joinCode,{gameId:game,scope,specialty:mode==="specialty"?specialty:"general",date,seed:seedFor(game),name:roomName||"Guest"});
      setRoomCode(joined.code);setRoom(joined);setMode(joined.scope==="general"?"general":"specialty");
      if(joined.specialty&&joined.specialty!=="general")setSpecialty(joined.specialty as Specialty);
      const actualTitle=GAMES.find(g=>g.id===joined.gameId)?.title??"shared game";
      setNotice(joined.gameId===game?"Connected to room "+joined.code+" for "+actualTitle+". Everyone entering this code gets the same game.":"That code already hosts "+actualTitle+". You joined the existing game rather than starting a different one.");
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
        <button className={screen==="friends"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("friends");}}>Party</button>
        <button className={screen==="stats"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("stats");}}>Trophies</button>
        <button className={screen==="settings"?"nav-active":""} onClick={()=>{setActiveGame(null);setScreen("settings");}}>Options</button>
      </nav>
      <div className="top-actions">{installPrompt&&<button className="install-button" onClick={install}>＋ Install</button>}<div className="avatar-chip">MD</div></div>
    </header>

    <nav className="mobile-nav" aria-label="Mobile navigation">
      <button className={!activeGame&&screen==="home"?"active":""} onClick={()=>{setActiveGame(null);setScreen("home");}}><span>⌂</span>Arcade</button>
      <button className={screen==="friends"?"active":""} onClick={()=>{setActiveGame(null);setScreen("friends");}}><span>✳</span>Party</button>
      <button className={screen==="stats"?"active":""} onClick={()=>{setActiveGame(null);setScreen("stats");}}><span>▤</span>Trophies</button>
      <button className={screen==="settings"?"active":""} onClick={()=>{setActiveGame(null);setScreen("settings");}}><span>⚙</span>Options</button>
    </nav>
    {notice&&<button className="notice" onClick={()=>setNotice("")} aria-label="Dismiss message">{notice}<span>×</span></button>}
    {room&&<div className="room-strip"><span className="room-dot" /> <b>ROOM {room.code}</b><span>{room.players.length} players · {room.players.filter(p=>p.finished).length} finished</span><button onClick={()=>setScreen("friends")}>Room details</button><button onClick={closeRoom}>Leave</button></div>}

    <main>
      {activeGame?<div className="play-page">
        <div className="breadcrumb"><button onClick={()=>{setActiveGame(null);setPractice(false);}}>← All games</button><span>/</span><span>{title}</span></div>
        <div className="play-heading"><div><span className="eyebrow">{practice?"FREE PLAY":selectedTitle.toUpperCase()+" · "+date}</span><h1>{title}</h1><p>{GAMES.find(g=>g.id===activeGame)?.description}</p></div>
          <div className="mode-switch" role="group" aria-label="Game mode"><button className={!practice?"selected":""} onClick={()=>{if(practice)openGame(activeGame,false,room?.seed);}}>Daily</button><button className={practice?"selected":""} onClick={()=>{if(!practice)openGame(activeGame,true,hashSeed(activeGame+"-practice-"+Date.now()));}}>Free Play</button></div></div>
        <section className="game-stage"><div className="stage-orbit orbit-one"/><div className="stage-orbit orbit-two"/>
          <GameBoard key={activeGame+"-"+String(practice)+"-"+String(startAt)} game={activeGame} seed={startAt} specialty={(mode==="general"?"general":specialty) as never} practice={practice} onDone={finishGame}/>
        </section>
        {room&&<RoomScores room={room}/>}
        {lastShare&&<div className="result-share-row"><span>ROUND COMPLETE</span><div><button className="button button-soft" onClick={()=>void navigator.clipboard?.writeText(lastShare)}>Copy result</button><button className="button button-primary" onClick={()=>{if(navigator.share)void navigator.share({title:"MedDaily result",text:lastShare}).catch(()=>{});else void navigator.clipboard?.writeText(lastShare);}}>Share ↗</button></div></div>}
        <div className="under-game"><span>♡ Take a breath between rounds.</span><span>{practice?"Practice runs are not recorded":roomCode?"Your result is shared with this room":"One daily result per game and mode"}</span></div>
      </div>:screen==="stats"?<StatsPage player={player} scope={scope} streak={streak}/>:screen==="settings"?<SettingsPage player={player} driveConnected={hasDriveConnection()} updateSetting={updateSetting} exportData={exportData} importData={importData} onDriveSync={async()=>{setNotice("Connecting to Google Drive…");try{const merged=await connectAndSync(player);savePlayer(merged);setPlayer(merged);setNotice("Google Drive sync complete. Your progress is backed up privately.");}catch(e){setNotice((e as Error).message);}}}/>:screen==="friends"?<FriendsPage room={room} roomName={roomName} setRoomName={setRoomName} joinCode={joinCode} setJoinCode={setJoinCode} busy={roomBusy} configured={multiplayerConfigured()} game={firstTodo} games={GAMES} onJoin={joinFriendsRoom} onPlay={(r)=>openGame(r.gameId,false,r.seed)} onLeave={closeRoom} />:<HomePage player={player} scope={scope} mode={mode} specialty={specialty} setMode={setMode} setSpecialty={setSpecialty} today={date} doneToday={doneToday} openGame={openGame} freePlay={homeFreePlay} setFreePlay={setHomeFreePlay}/>}
    </main>
    <footer className="site-footer"><div><span className="footer-mark">✳</span><b>meddaily.</b><span>PRESS START · FIND YOUR NEXT FAVORITE</span></div><p>For education only · Not a clinical decision tool · Verify care decisions against current guidance.</p><span className="version">v1.1 · Local-first · Optional Drive sync</span></footer>
  </div>;
}

function HomePage({player,scope,mode,specialty,setMode,setSpecialty,today,doneToday,openGame,freePlay,setFreePlay}:{
  player:PlayerData;scope:string;mode:Mode;specialty:Specialty;setMode:(m:Mode)=>void;setSpecialty:(s:Specialty)=>void;today:string;doneToday:number;openGame:(id:GameId,practice?:boolean)=>void;freePlay:boolean;setFreePlay:(value:boolean)=>void;
}){
  const done=doneToday;
  
  return <div className="home-page">
    <section className="arcade-intro"><div><span className="eyebrow">MEDDAILY ARCADE</span><h1>Pick a game. Play another.</h1><p>Medical puzzles, word hunts, wild comparisons, and quick logic challenges. Daily rounds are optional; practice is unlimited.</p></div><div className="arcade-intro-actions"><span className="arcade-game-count">{GAMES.length} GAMES</span><div className="home-play-mode" role="group" aria-label="Choose daily or free play"><button className={!freePlay?"selected":""} onClick={()=>setFreePlay(false)}>Daily</button><button className={freePlay?"selected":""} onClick={()=>setFreePlay(true)}>Free Play ∞</button></div></div></section>
    <section className="dx-dash-feature"><div className="feature-copy"><span className="eyebrow">PERMANENT FEATURE</span><h2>Dx Dash</h2><p>Run the list. Learn the diagnosis. The companion game stays featured here.</p><a className="button button-primary" href="https://pathomnemonic.github.io/buzzword-dash-v2/" target="_blank" rel="noreferrer">PLAY DX DASH ↗</a></div><div className="dx-dash-mark" aria-hidden="true">DX<span>↗</span></div></section>
    <section className="mode-panel"><div className="mode-panel-head"><div><span className="eyebrow">CHOOSE YOUR PLAYGROUND</span><h2>{freePlay?"One arcade. Unlimited runs.":"One arcade. Your kind of daily."}</h2></div><div className="mode-tabs"><button className={mode==="general"?"active":""} onClick={()=>setMode("general")}>Open Arcade</button><button className={mode==="specialty"?"active":""} onClick={()=>setMode("specialty")}>Specialty Dailies <span>NEW</span></button></div></div>
      {mode==="specialty"?<div className="specialty-picker"><div className="specialty-intro"><b>Play with your people.</b><p>Choose a specialty or subject. Everyone in the same track gets the same daily set. Subspecialty topics live inside their parent specialty, so the arcade stays balanced across fields.</p></div><div className="specialty-chips">{SPECIALTIES.map(s=><button key={s.id} onClick={()=>setSpecialty(s.id)} className={specialty===s.id?"selected":""}><span>{s.icon}</span>{s.short}</button>)}</div><div className="specialty-selected"><b>{SPECIALTIES.find(s=>s.id===specialty)?.name}</b><span>{SPECIALTIES.find(s=>s.id===specialty)?.blurb}</span></div></div>:<p className="mode-description">The same broad daily set for everyone: medicine, wordplay, estimation, and pure puzzle fun.</p>}
    </section>

    <section className="daily-strip"><div className="daily-strip-main"><div className="daily-icon">{freePlay?"∞":"☀"}</div><div><span className="eyebrow">{freePlay?"UNLIMITED FREE PLAY":mode==="general"?"THE DAILY ROUNDS":"SPECIALTY DAILY ROUNDS"}</span><h2>{freePlay?"No daily limit. Choose any game.":done===GAMES.length?"Your rounds are complete.":done===0?GAMES.length+" games. One fresh day.":"You're on your way."}</h2><p>{freePlay?"Every selection starts a fresh run. Practice results do not affect your daily record.":mode==="general"?"Same puzzles for everyone today. Play in any order, or jump straight into a favorite.":"A shared specialty-specific daily set. Invite friends from your field to compare how you did."}</p></div></div>
      {freePlay?<div className="progress-box freeplay-status"><b>UNLIMITED</b><span>Fresh seeded runs</span></div>:<div className="progress-box"><div className="progress-numbers"><b>{done}<small>/{GAMES.length}</small></b><span>completed</span></div><div className="progress-track"><i style={{width:(done/GAMES.length*100)+"%"}}/></div><div className="progress-caption">{Math.round(done/GAMES.length*100)}% of today's arcade</div></div>}</section>

    <section className="section-head"><div><span className="eyebrow">PICK YOUR LOADOUT</span><h2>Choose your next run</h2><p>Every game has its own world, rules, and high score to chase.</p></div><span className="section-aside">{freePlay?"UNLIMITED FREE PLAY":"TODAY · "+today}</span></section>
    <div className="game-grid">{GAMES.map((game,index)=>{
      const result=player.results.find(r=>r.date===today&&r.game===game.id&&r.scope===scope);
      return <button key={game.id} className={"game-card "+game.wash+(result&&!freePlay?" card-done":"")} onClick={()=>openGame(game.id,freePlay)} style={{animationDelay:(index*40)+"ms"}}>
        <div className="card-topline"><span className="game-category">{game.category}</span><span className={"card-status"+(result&&!freePlay?" status-done":"")}>{freePlay?"∞ Free Play":result?"✓ Done":"Daily"}</span></div>
        <div className="game-icon-wrap"><span className="game-icon">{game.icon}</span><span className="icon-halo"/></div>
        <div className="game-card-body"><h3>{game.title}</h3><span className="game-subtitle">{game.subtitle}</span><p>{game.description}</p></div>
        <div className="game-card-footer"><span>{game.time} <i>·</i> {game.level}</span><span className="card-arrow">↗</span></div>
      </button>;
    })}</div>

  </div>;
}

const PARTY_GAME_IDS = new Set<GameId>(["connections","microbe","pairs","triage","splice","labline","higher","casefile","dive","trivia","lettergrid"]);
function FriendsPage({room,roomName,setRoomName,joinCode,setJoinCode,busy,configured,game,games,onJoin,onPlay,onLeave}:{
  room:RoomState|null;roomName:string;setRoomName:(s:string)=>void;joinCode:string;setJoinCode:(s:string)=>void;busy:boolean;configured:boolean;game:GameId;games:GameMeta[];
  onJoin:(g:GameId)=>void;onPlay:(r:RoomState)=>void;onLeave:()=>void;
}){
  const partyGames=games.filter(g=>PARTY_GAME_IDS.has(g.id));
  const [selected,setSelected]=useState<GameId>(PARTY_GAME_IDS.has(game)?game:"connections");
  return <div className="friends-page"><div className="friends-hero"><span className="eyebrow">THE PARTY LOBBY</span><h1>Bring your crew.</h1><p>The first player chooses a game and enters a six-character code to start the room. Everyone else only needs that same code; the existing room supplies the game and puzzle seed, regardless of their local study settings.</p></div>
    {!configured&&<div className="setup-warning"><b>Online rooms need Firebase enabled.</b><p>Solo and free-play modes work without setup. Real-time shared rooms require Firebase repository variables, Anonymous Authentication, and the included Firestore rules. <a href="https://github.com/pathomnemonic/MedDaily/blob/main/docs/MULTIPLAYER_SETUP.md" target="_blank" rel="noreferrer">Open the setup guide ↗</a></p></div>}
    {room?<div className="room-card"><div className="room-code-head"><div><span className="eyebrow">YOUR SHARED GAME CODE</span><strong>{room.code}</strong></div><div className="share-actions"><button className="button button-soft" onClick={()=>void navigator.clipboard?.writeText(room.code)}>Copy code</button><button className="button button-primary" onClick={()=>{const url=location.origin+location.pathname+"?room="+room.code;const text="Join my MedDaily "+(games.find(g=>g.id===room.gameId)?.title??"game")+" room: "+room.code;if(navigator.share)void navigator.share({title:"MedDaily room",text,url}).catch(()=>{});else void navigator.clipboard?.writeText(text+" "+url);}}>Share invite ↗</button></div></div>
      <p className="room-message">{room.specialty==="general"?"Open Arcade":"Specialty daily"} · {games.find(g=>g.id===room.gameId)?.title} · {room.date}</p>
      <div className="room-players">{room.players.map((p,i)=><div key={p.uid} className="room-player"><span className="player-number">{i+1}</span><b>{p.name}</b><span>{p.finished?(p.score??0)+" pts":"Ready to play"}</span>{p.perfect&&<i>✦</i>}</div>)}</div>
      <div className="room-actions"><button className="button button-primary" onClick={()=>onPlay(room)}>Play this game <span>↗</span></button><button className="button button-quiet" onClick={onLeave}>Leave room</button></div>
      <small>Up to eight players. Everyone who enters the same code joins the same game; scores appear here when submitted.</small>
    </div>:<div className="friends-grid single-room-entry">
      <section className="friends-card"><div className="friends-card-icon">⌁</div><span className="eyebrow">SAME CODE · SAME GAME</span><h2>Enter a room code</h2><p>Use a code your group has agreed on. The first person to enter a new code starts the room; everyone else types that exact code to join.</p>
        <label>Your nickname<input maxLength={20} value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="What should we call you?"/></label>
        <label>Game for a new code<select value={selected} onChange={e=>setSelected(e.target.value as GameId)}>{partyGames.map(g=><option value={g.id} key={g.id}>{g.title}</option>)}</select></label>
        <label>Room code · use the same code to join<input className="room-code-input" maxLength={6} value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""))} placeholder="ABC123"/></label>
        <button className="button button-primary full-button" onClick={()=>onJoin(selected)} disabled={busy||!configured||joinCode.length!==6}>{busy?"Connecting…":"Join / start game"}</button>
      </section>
    </div>}
    <div className="privacy-note"><b>Private by default.</b> Solo play never requires an account. Friends rooms use temporary anonymous guest identities and contain only nicknames, game metadata, and scores. Do not enter patient information or other sensitive data.</div>
  </div>;
}

function RoomScores({room}:{room:RoomState}){
  const ranked=rankRoomPlayers(room.players);
  return <section className="room-score-inline"><div className="eyebrow">FRIENDS ROOM LEADERBOARD · {room.code}</div>{ranked.map((p,index)=><span key={p.uid}><b>#{index+1}</b> {p.name}: {p.finished?(p.score??0)+" points"+(p.perfect?" · perfect":""):"playing"}</span>)}</section>;
}

function StatsPage({player,scope,streak}:{player:PlayerData;scope:string;streak:number}){
  const results=player.results.filter(r=>r.scope===scope);
  const perfect=results.filter(r=>r.perfect).length;
  const achievements=achievementsFor(player,scope,streak,GAMES.length).filter(item=>!player.hideStreaks||item.name!=="Seven-Day Signal");
  const unlocked=achievements.filter(item=>item.earned).length;
  return <div className="stats-page"><span className="eyebrow">YOUR LITTLE LAB BOOK</span><h1>Progress, not pressure.</h1><div className="stats-grid"><div><b>{results.length}</b><span>rounds played</span></div><div><b>{player.hideStreaks?"—":streak}</b><span>day streak</span></div><div><b>{perfect}</b><span>perfect rounds</span></div><div><b>{averageScore}%</b><span>average score</span></div></div>
    <section className="achievement-shelf"><div className="achievement-heading"><div><span className="eyebrow">UNLOCKED BY PLAYING</span><h2>Achievements</h2></div><b>{unlocked} / {achievements.length}</b></div><div className="achievement-grid">{achievements.map(item=><article key={item.name} className={"achievement-tile"+(item.earned?" earned":" locked")}><span className="achievement-mark">{item.earned?"✦":"◇"}</span><div><b>{item.name}</b><p>{item.detail}</p><small>{item.earned?"UNLOCKED":"IN PROGRESS"} · {item.progress}</small></div></article>)}</div></section>
    <section className="stats-table"><h2>Game shelf</h2>{GAMES.map(g=>{const played=results.filter(r=>r.game===g.id);return <div key={g.id}><span>{g.title}</span><span>{played.length} played</span><b>Best run {Math.max(0,...played.map(r=>r.score))}</b></div>;})}</section>
    <p className="privacy-note">Progress and achievements are calculated from this device's saved results for the current arcade mode. Records stay local unless you choose Google Drive sync in Settings. Room leaderboards are private to the six-character room code.</p>
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
function playChime(){try{const ctx=new AudioContext(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.value=660;gain.gain.setValueAtTime(0.035,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.22);osc.onended=()=>{void ctx.close();};osc.start();osc.stop(ctx.currentTime+0.22);}catch{/* Audio may be unavailable. */}}
