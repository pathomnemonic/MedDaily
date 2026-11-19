export const spellingHiveExpansion = [
{title:"Clarity Round",letters:["C","L","A","R","I","T","Y"],center:"A",words:["CLARITY","TRIAL","TRAIL","TAIL","TALC","CART","TRAY","CLAY","RACY","TARRY","RIAL","LACY","RAY","LAY","ART","RAT","TAR"],pangram:"CLARITY",hint:"The pangram is essential when communicating a clinical plan."},
{title:"Capture the Clue",letters:["C","A","P","T","U","R","E"],center:"A",words:["CAPTURE","CAPER","CATER","CRATE","TRACE","REACT","CARP","CART","CARE","PEAR","PARE","RACE","TAPE","TAPER","PART","TRAP","PACT","ACRE"],pangram:"CAPTURE",hint:"The pangram describes what a good detective does."},
{title:"Plaster Cast",letters:["P","L","A","S","T","E","R"],center:"A",words:["PLASTER","PASTEL","STAPLE","PLATE","ALERT","ALTER","LATER","TAPER","SPARE","SPEAR","STARE","TEARS","PEARS","PEARL","PAST","PALE","SALE","SEAL","STAR","TARS","RATE","TARE","REAL","EARL","RATS","PART","TRAP","TARP","RAPT","PEAT"],pangram:"PLASTER",hint:"The pangram is a material used to immobilize an injured limb."},
{title:"Sterile Cluster",letters:["C","L","U","S","T","E","R"],center:"U",words:["CLUSTER","CULTURE","CRUEL","CURE","CURL","RULE","TRUE","RUSE","USER","LUST","LUTE","RULER","CLUE","CLUES","CRUST","CURLS","LURES","SURE","RUST","LURE","CUES","CULT","ULCER","ULCERS"],pangram:"CLUSTER",hint:"The pangram is a group of things gathered together."},
{title:"Thermal Control",letters:["T","H","E","R","M","A","L"],center:"E",words:["THERMAL","HEART","EARTH","HEAR","HEAT","HEAL","HARE","THEME","THERE","METER","MERE","MELT","REAL","LATE","RATE","TARE","LATER","ALERT","ALTER","EARL","HELM","LAME","MALE","MEAL","MARE","MATE","TEAM","MEAT","TAME","HEARTH","MALLET"],pangram:"THERMAL",hint:"The pangram relates to temperature."},
{title:"Hematic Signals",letters:["H","E","M","A","T","I","C"],center:"A",words:["HEMATIC","MATCH","MATE","MEAT","TAME","TEAM","MATH","HEAT","HATE","TEACH","CHEAT","ACHE","CAME","MICA","CACHE","CATCH","HATCH","MACH","CHAI","TACH","MACH?","CHAT","HAT","CAT","ACT"],pangram:"HEMATIC",hint:"The pangram means relating to blood."},
{title:"Stapler Station",letters:["S","T","A","P","L","E","R"],center:"A",words:["STAPLER","PLASTER","PASTEL","STAPLE","PLATE","ALERT","ALTER","LATER","TAPER","PEARL","SPARE","SPEAR","STARE","TEARS","PEARS","PAST","PALE","SALE","SEAL","STAR","TARS","RATE","TARE","REAL","EARL","RATS","PART","TRAP","TARP","RAPT","PEAT"],pangram:"STAPLER",hint:"The pangram is a common item on a clinic desk."},
{title:"Gastric Garden",letters:["G","A","S","T","R","I","C"],center:"A",words:["GASTRIC","TRAGIC","CIGAR","CART","CAST","CATS","RATS","STAR","TARS","SCAR","RAGS","TAGS","ARCS","RICA","SARI","TAR","RAG","TAG","AIR","ART","CIGARS"],pangram:"GASTRIC",hint:"The pangram refers to the stomach."},
{title:"Neutral Balance",letters:["N","E","U","T","R","A","L"],center:"A",words:["NEUTRAL","ULTRA","LEARN","LATER","ALTER","ALERT","LUNAR","NEAR","EARN","REAL","TALE","TEAL","TUNA","ULNA","AUNT","ANTE","TARE","RATE","TARN","RENAL","LEANT","LUTE","TRUE","RUNE"],pangram:"NEUTRAL",hint:"The pangram describes a state without a strong charge or bias."},
{title:"Clinical Circuit",letters:["C","I","R","U","T","E","L"],center:"I",words:["CIRCUIT","CULTURE","CURE","CURL","RULE","RICE","RITE","TIRE","TIER","TILE","TILT","TRUE","TRULY","LICE","LIRE","LITE","LILT","RILE","CITE","CITER","CUTIE","ICIER"],pangram:"CIRCUIT",hint:"The pangram is a closed path for current."}
];

export const wordLaddersExpansion = [
{start:"BONE",end:"MATH",path:["BONE","BANE","LANE","LATE","MATE","MATH"],note:"Move from skeletal anatomy to a core science."},
{start:"BILE",end:"WILT",path:["BILE","MILE","MILD","WILD","WILT"],note:"One letter changes at every rung."},
{start:"LUNG",end:"MOAT",path:["LUNG","LONG","LOAN","MOAN","MOAT"],note:"Follow the vowel and consonant changes."},
{start:"CURE",end:"CARE",path:["CURE","PURE","PARE","CARE"],note:"A short ladder with a clinical starting word."},
{start:"RASH",end:"TALK",path:["RASH","CASH","CASK","TASK","TALK"],note:"Change exactly one letter at each step."},
{start:"LATE",end:"NODE",path:["LATE","DATE","DOTE","NOTE","NODE"],note:"A sequence of common four-letter words."},
{start:"SORE",end:"WORD",path:["SORE","CORE","CORK","WORK","WORD"],note:"A short word ladder."},
{start:"RING",end:"SICK",path:["RING","SING","SINK","SILK","SICK"],note:"Change one letter at a time."},
{start:"TEND",end:"BEAT",path:["TEND","TENT","TEST","BEST","BEAT"],note:"A sequence of one-letter changes."},
{start:"FEAR",end:"MEET",path:["FEAR","BEAR","BEER","BEET","MEET"],note:"A ladder that changes one letter per move."}
];

export const deductionCasesExpansion = [
{
title:"The Simulation Cart",
briefing:"Three clinicians used different rooms and each checked out one simulation tool. Match every clinician to a room and tool.",
suspects:["Dr. Ames","Dr. Bello","Dr. Cruz"],locations:["Skills Lab","Mock ICU","Lecture Room"],objects:["Monitor","Clipboard","Stethoscope"],
clues:["Dr. Ames was in neither the Mock ICU nor the Lecture Room.","The Monitor was in the Skills Lab.","Dr. Bello was not in the Lecture Room.","The Stethoscope was not in the Skills Lab.","Dr. Cruz did not take the Stethoscope."],
solution:[{suspect:"Dr. Ames",location:"Skills Lab",object:"Monitor"},{suspect:"Dr. Bello",location:"Mock ICU",object:"Stethoscope"},{suspect:"Dr. Cruz",location:"Lecture Room",object:"Clipboard"}]
},
{
title:"The Specimen Room",
briefing:"Three fictional laboratory teams stored one specimen in each of three rooms. Reconstruct the storage assignments.",
suspects:["Team Alder","Team Birch","Team Cedar"],locations:["Accession","Histology","Cold Storage"],objects:["Tissue block","Culture plate","Blood tube"],
clues:["Team Alder used neither Histology nor Cold Storage.","The Tissue block was in Accession.","Team Birch did not use Accession.","Team Cedar did not use Cold Storage.","Team Birch did not store the Blood tube."],
solution:[{suspect:"Team Alder",location:"Accession",object:"Tissue block"},{suspect:"Team Birch",location:"Cold Storage",object:"Culture plate"},{suspect:"Team Cedar",location:"Histology",object:"Blood tube"}]
},
{
title:"The Pager Exchange",
briefing:"Three residents attended different teaching stations and each carried a different item. Match all three assignments.",
suspects:["Resident Fox","Resident Gray","Resident Hale"],locations:["Auditorium","Pharmacy Lab","Ward Office"],objects:["Keycard","Pager","Notebook"],
clues:["Resident Fox was in neither the Pharmacy Lab nor the Ward Office.","The Keycard was in the Auditorium.","Resident Gray was not in the Auditorium.","Resident Gray was not in the Ward Office.","Resident Hale did not carry the Notebook."],
solution:[{suspect:"Resident Fox",location:"Auditorium",object:"Keycard"},{suspect:"Resident Gray",location:"Pharmacy Lab",object:"Notebook"},{suspect:"Resident Hale",location:"Ward Office",object:"Pager"}]
},
{
title:"The Missing Atlas",
briefing:"Three students left one reference item in each campus study space. Match the student, location, and item.",
suspects:["Nora","Omar","Priya"],locations:["Reading Room","Anatomy Lab","Computer Suite"],objects:["Atlas","Flashcards","Laptop"],
clues:["Nora used neither the Anatomy Lab nor the Computer Suite.","The Atlas was in the Reading Room.","Omar did not use the Reading Room.","Omar did not use the Computer Suite.","Priya did not have the Laptop."],
solution:[{suspect:"Nora",location:"Reading Room",object:"Atlas"},{suspect:"Omar",location:"Anatomy Lab",object:"Flashcards"},{suspect:"Priya",location:"Computer Suite",object:"Laptop"}]
},
{
title:"The Night Simulation",
briefing:"Three instructors used different simulation rooms and each brought a different teaching aid.",
suspects:["Dr. Ives","Dr. Jones","Dr. Kaur"],locations:["Control Booth","Mock Ward","Debrief Suite"],objects:["Timer","Checklist","Anatomy Model"],
clues:["Dr. Ives was in neither the Mock Ward nor the Debrief Suite.","The Timer was in the Control Booth.","Dr. Jones was not in the Control Booth.","Dr. Jones was not in the Debrief Suite.","Dr. Kaur did not bring the Anatomy Model."],
solution:[{suspect:"Dr. Ives",location:"Control Booth",object:"Timer"},{suspect:"Dr. Jones",location:"Mock Ward",object:"Anatomy Model"},{suspect:"Dr. Kaur",location:"Debrief Suite",object:"Checklist"}]
},
{
title:"The Conference Files",
briefing:"Three faculty members each presented in a different room using a different teaching file. Match the assignments.",
suspects:["Dr. Lane","Dr. Malik","Dr. Novak"],locations:["Grand Rounds","Seminar Room","Library"],objects:["Case Notes","Slide Deck","Anatomy Atlas"],
clues:["Dr. Lane was in neither the Seminar Room nor the Library.","The Case Notes were in Grand Rounds.","Dr. Malik was not in Grand Rounds.","Dr. Malik was not in the Library.","Dr. Novak did not use the Anatomy Atlas."],
solution:[{suspect:"Dr. Lane",location:"Grand Rounds",object:"Case Notes"},{suspect:"Dr. Malik",location:"Seminar Room",object:"Anatomy Atlas"},{suspect:"Dr. Novak",location:"Library",object:"Slide Deck"}]
}
];
