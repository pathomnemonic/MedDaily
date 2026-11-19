export const glyphPatterns: { name: string; pattern: number[][]; hint: string }[] = [
  { name:"Neuron", hint:"A cell that carries signals", pattern:[[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,0,1,0,0],[0,1,0,1,0]] },
  { name:"Heart", hint:"A very hardworking muscle", pattern:[[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]] },
  { name:"Bacterium", hint:"A tiny single-celled organism", pattern:[[0,1,1,1,0],[1,1,1,1,1],[1,0,1,0,1],[1,1,1,1,1],[0,1,1,1,0]] },
  { name:"Cross", hint:"A familiar first-aid symbol", pattern:[[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0]] },
  { name:"Pill", hint:"A common medication shape", pattern:[[0,1,1,1,0],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0]] },
  { name:"Lungs", hint:"Paired organs of gas exchange", pattern:[[0,1,1,0,0],[1,1,1,0,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]] }
];

export const scrambleWords = [
  ["NEURON","A cell that sends electrical signals"],["PLASMA","The liquid component of blood"],["FEMUR","The longest bone in the body"],["INSULIN","A hormone that lowers blood glucose"],["RETINA","The light-sensitive layer of the eye"],["TENDON","Connects muscle to bone"],["CORTEX","The outer layer of an organ"],["SUTURE","A stitch used to close a wound"],["SPLEEN","An organ involved in blood filtration and immunity"],["MUCOSA","A moist membrane lining body cavities"],["GANGLIA","Collections of neuronal cell bodies"],["OXYGEN","A gas required for aerobic metabolism"],["PLATELET","A cell fragment involved in hemostasis"],["NEPHRON","The functional unit of the kidney"],["CILIUM","A hair-like cellular projection"],["AXON","The long projection of a neuron"],["ALVEOLI","Tiny air sacs in the lungs"],["LIGAMENT","Connects bone to bone"],["TIBIA","The larger medial bone of the lower leg"],["GLUCOSE","A major circulating monosaccharide"],["MYELIN","Insulating sheath around many axons"],["ARTERY","A vessel carrying blood away from the heart"],["URETER","Carries urine from kidney to bladder"],["CORNEA","Transparent anterior part of the eye"],["MITOSIS","Division of a cell nucleus"],["CYTOKINE","A signaling protein in immunity"],["HEMOGLOBIN","Oxygen-carrying protein in red cells"],["CEREBELLUM","A brain region important for coordination"],["PANCREAS","An organ with endocrine and exocrine functions"],["OSTEON","A structural unit of compact bone"]
] as const;

export const higherLowerPairs = [
  {a:"Red blood cells per µL (approximate)",av:4500,b:"Platelets per µL (approximate)",bv:250,unit:"thousands/µL",explanation:"RBCs are generally present in the millions per microliter; platelets in the hundreds of thousands.",source:"Standard CBC reference intervals."},
  {a:"Typical adult total body water",av:60,b:"Illustrative adult body fat percentage",bv:25,unit:"percent",explanation:"Body composition varies substantially. Total body water is often around 50–60% in adults.",source:"Standard physiology references; illustrative comparison only."},
  {a:"Bones in a typical adult",av:206,b:"Permanent teeth in a full adult dentition",bv:32,unit:"count",explanation:"The adult skeleton is commonly described as having 206 bones; a full permanent dentition has 32 teeth.",source:"Standard anatomy references."},
  {a:"Cranial nerve pairs",av:12,b:"Thoracic spinal nerve pairs",bv:12,unit:"count",explanation:"There are 12 pairs of cranial nerves and 12 pairs of thoracic spinal nerves. This one is a tie.",source:"Standard neuroanatomy references."},
  {a:"Vertebrae before fusion (typical)",av:33,b:"Adult vertebral bones (typical count)",bv:26,unit:"count",explanation:"There are usually 33 vertebrae before fusion; the adult vertebral column is often counted as 26 bones.",source:"Standard anatomy references."},
  {a:"Chambers in the human heart",av:4,b:"Lobes in the right lung",bv:3,unit:"count",explanation:"The heart has four chambers; the right lung has three lobes.",source:"Standard anatomy references."},
  {a:"Normal serum sodium midpoint",av:140,b:"Normal serum potassium midpoint",bv:4,unit:"mEq/L",explanation:"Sodium is present at a much higher extracellular concentration than potassium.",source:"Standard metabolic panel reference intervals."},
  {a:"Normal adult CSF glucose (approximate midpoint)",av:60,b:"Normal adult CSF protein (approximate upper reference)",bv:45,unit:"mg/dL",explanation:"These are approximate values; CSF glucose should be interpreted relative to paired serum glucose.",source:"Standard CSF laboratory references."},
  {a:"Chromosomes in a typical human somatic cell",av:46,b:"Chromosomes in a human gamete",bv:23,unit:"count",explanation:"Somatic cells are diploid; gametes are haploid.",source:"Standard genetics references."},
  {a:"Normal adult platelet count lower boundary",av:150,b:"Normal adult WBC count lower boundary",bv:4,unit:"thousands/µL",explanation:"Common reference lower bounds are about 150,000 platelets/µL and 4,000 WBCs/µL.",source:"Standard CBC reference intervals."},
  {a:"Lobes in the left lung",av:2,b:"Lobes in the right lung",bv:3,unit:"count",explanation:"The left lung has two lobes; the right has three.",source:"Standard anatomy references."},
  {a:"Typical adult resting heart-rate upper bound",av:100,b:"Typical adult resting respiratory-rate upper bound",bv:20,unit:"per minute",explanation:"Commonly cited upper resting limits are about 100 beats/min and 20 breaths/min.",source:"Standard adult vital-sign reference ranges."},
  {a:"Typical adult blood volume",av:5,b:"Typical adult CSF volume expressed in liters",bv:0.15,unit:"liters",explanation:"Approximate values are around 5 L of blood and 0.15 L of CSF.",source:"Standard physiology references."},
  {a:"Normal adult arterial pH upper bound × 100",av:745,b:"Normal adult serum sodium midpoint × 5",bv:700,unit:"scaled teaching values",explanation:"Typical arterial pH is 7.35–7.45; serum sodium midpoint is near 140 mEq/L. These are scaled for the comparison.",source:"Standard arterial blood gas and metabolic panel reference intervals."},
  {a:"Normal adult serum potassium midpoint",av:4,b:"Number of heart chambers",bv:4,unit:"count (different kinds)",explanation:"Both quantities are four in their respective units. The game includes occasional ties.",source:"Standard anatomy and chemistry reference values."},
  {a:"Typical red blood cell lifespan",av:120,b:"Typical platelet lifespan",bv:8,unit:"days",explanation:"Red cells circulate for about 120 days; platelets circulate roughly 7–10 days.",source:"Standard hematology references."}
];

export const wordLadders = [
  { start:"COLD", end:"WARM", path:["COLD","CORD","CARD","WARD","WARM"], note:"One letter changes at each step." },
  { start:"HEAL", end:"SEEK", path:["HEAL","HEAR","SEAR","SEER","SEEK"], note:"One letter changes at each step." },
  { start:"PAIN", end:"GAIN", path:["PAIN","GAIN"], note:"A one-letter change." },
  { start:"CARE", end:"CURE", path:["CARE","CURE"], note:"One vowel changes." },
  { start:"VEIN", end:"PAIN", path:["VEIN","VEIL","VAIL","PAIL","PAIN"], note:"Change one letter at a time." },
  { start:"MIND", end:"MILD", path:["MIND","MILD"], note:"One letter changes." }
];

export const gameFormatResearch = {
  sources: [
    { name:"Daily Game Central", url:"https://daily-games.app/games", checked:"2026-11-19", listing:"705 games, with word, logic, trivia, number, visual, geography, estimation, music, shapes, and science categories" },
    { name:"PlayDailyGames", url:"https://playdailygames.com/", checked:"2026-11-19", listing:"782 games across 19 categories including word, trivia, sports, movies, music, video games, geography, math/logic, estimation, and shapes" },
    { name:"DLES.gg", url:"https://dles.gg/games/most-popular", checked:"2026-11-19", listing:"1,204 daily logic exercises; popular formats include Wordle, Connections, Framed, Globle, More/Less, Krillion, TimeGuessr, and Bandle" },
    { name:"Dailydles", url:"https://dailydles.com/", checked:"2026-11-19", listing:"159 manually checked daily games; highlights Connections, Wordle, Strands, Worldle, Contexto, Krillion, Fermi, and Framed" },
    { name:"dailydle categories", url:"https://www.dailydle.org/Categories", checked:"2026-11-19", listing:"1,000+ listed category entries across word, logic, trivia, geography, estimation, shapes, colors, and other mechanics" },
    { name:"Brisk daily puzzle formats", url:"https://briskpuzzles.com/best-daily-puzzle-games", checked:"2026-11-19", listing:"Editorial overview of Wordle, Connections, Spelling Bee, Quordle, Waffle, Nerdle, Sumplete, Sudoku, Strands, and mini crosswords" },
    { name:"Today's Dailies", url:"https://todaysdailies.com/", checked:"2026-11-19", listing:"A broad current dock including GeoDrop, Wordle, Connections, Rank It, Strands, Framed, Echomost, Bandle, Contexto, Murdle, Waffle, Nerdle, TimeGuessr, and more" }
  ],
  selected: [
    { format:"Wordle / Quordle / attribute-dle", decision:"Medle is live; multi-board and attribute-clue variants are future extensions.", fit:"high" },
    { format:"Connections / category grouping", decision:"Connections is live; additional board packs can support every specialty.", fit:"high" },
    { format:"Strands / themed word search", decision:"Microbe Hunt is live; a spangram-style specialty word trail is a strong next game.", fit:"high" },
    { format:"18 Words / 23 Words / 7 Little Words", decision:"Anagram Sprint is live.", fit:"high" },
    { format:"Waffle / crossword / word ladder", decision:"Word Ladder is live; Waffle and mini-crossword are planned.", fit:"high" },
    { format:"Nonogram / Picross", decision:"Cell Sketch is live.", fit:"high" },
    { format:"Fermi / More-Less / estimation", decision:"Higher or Lower and Labline are live; playful nonclinical estimation is encouraged.", fit:"high" },
    { format:"Framed / image reveal / visual recognition", decision:"Strong fit for ECG, radiology, gross pathology, histology, anatomy, and color-memory rounds; image rights and curation required.", fit:"high" },
    { format:"Worldle / Globle / GeoDrop / MapTap", decision:"Possible anatomy maps, dermatomes, vascular territories, and organ-location maps; needs original diagrams.", fit:"medium" },
    { format:"Murdle / logic grids / code-breaking", decision:"Strong medical mystery mechanic with fictional exposures, timelines, and clues; not a diagnostic tool.", fit:"high" },
    { format:"Sudoku / Queens / Pips / Tango / Sumplete", decision:"Abstract logic mechanics can be reskinned with cells, organs, and lab trays; no medical claims required.", fit:"high" },
    { format:"Contexto / Semantle / association", decision:"Possible semantic-distance term search; requires a reliable synonym or embedding dataset.", fit:"medium" },
    { format:"Bandle / Heardle / audio guessing", decision:"Potential heart/lung sound and instrument sound rounds; only original or appropriately licensed recordings.", fit:"medium" },
    { format:"Krillion / rare-answer recall / Echomost", decision:"Excellent long-tail party mode. Accept multiple valid answers and use transparent rarity tiers, not one hidden answer.", fit:"high" },
    { format:"Jigsaw / spatial / path puzzles", decision:"Anatomy assembly, nerve-path tracing, instrument-path puzzles; excellent touchscreen potential.", fit:"high" }
  ]
};