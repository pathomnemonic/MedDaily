import { higherLowerPairsExpansion } from "./dataExpansion";
import { scrambleWordsExpansion2, higherLowerPairsExpansion2 } from "./dataUtilityExpansion";
import { spellingHiveExpansion, wordLaddersExpansion, deductionCasesExpansion } from "./dataExtraExpansion";
import { glyphPatternsExpansion } from "./dataGlyphExpansion";

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

export const scrambleWordsExpansion = [
["ACIDOSIS","A primary metabolic or respiratory acid-base disturbance"],
["ALKALOSIS","A primary alkalinizing acid-base disturbance"],
["ANEURYSM","A focal dilation of an artery"],
["ANEMIA","Reduced circulating hemoglobin concentration"],
["APLASIA","Failure of an organ or tissue to develop"],
["ARTHRITIS","Inflammation of a joint"],
["ATROPHY","Reduction in the size of a tissue or organ"],
["BIOPSY","Sampling tissue for diagnostic examination"],
["BRADYCARDIA","An abnormally slow heart rate"],
["CARDIAC","Pertaining to the heart"],
["CEREBRAL","Pertaining to the brain"],
["CIRRHOSIS","Advanced hepatic fibrosis with architectural distortion"],
["CYTOSOL","Fluid component of the cell cytoplasm"],
["DYSARTHRIA","Motor speech impairment from impaired articulation"],
["DYSPHAGIA","Difficulty swallowing"],
["DYSPNEA","Subjective sensation of breathing discomfort"],
["EMBOLUS","Material traveling through the bloodstream and causing obstruction"],
["ENCEPHALITIS","Inflammation of brain parenchyma"],
["ENDOSCOPY","Visual examination of an internal organ or cavity"],
["ERYTHEMA","Redness of the skin"],
["FIBROSIS","Excess deposition of connective tissue"],
["HEMATOMA","A localized collection of blood"],
["HEMOLYSIS","Destruction of red blood cells"],
["HYPERKALEMIA","Elevated serum potassium"],
["HYPONATREMIA","Reduced serum sodium"],
["ISCHEMIA","Insufficient blood flow to tissue"],
["JAUNDICE","Yellow discoloration from elevated bilirubin"],
["KETOSIS","Increased ketone production or concentration"],
["LEUKOCYTE","A white blood cell"],
["LYMPHOMA","A malignancy of lymphoid cells"],
["MELANOMA","A malignant tumor of melanocytes"],
["METASTASIS","Spread of malignant cells to a distant site"],
["NECROSIS","Unregulated cell death in tissue"],
["NEPHRITIS","Inflammation of the kidney"],
["NEUROPATHY","Disorder of peripheral nerves"],
["OSTEOPOROSIS","Reduced bone strength from low bone mass and altered microarchitecture"],
["PALPITATION","Awareness of an abnormal or forceful heartbeat"],
["PARESTHESIA","An abnormal sensation such as tingling"],
["PERFUSION","Delivery of blood to tissue"],
["PNEUMONIA","Infection of lung parenchyma"],
["PROGNOSIS","The anticipated course or outcome of a disease"],
["PRURITUS","Itching"],
["SEPSIS","Life-threatening organ dysfunction due to dysregulated response to infection"],
["STENOSIS","Abnormal narrowing of a passage or vessel"],
["SYNCOPE","Transient loss of consciousness from cerebral hypoperfusion"],
["TACHYCARDIA","An abnormally fast heart rate"],
["THROMBOSIS","Formation of a blood clot within a vessel"],
["URTICARIA","Transient pruritic wheals"],
["VASCULITIS","Inflammation of blood vessels"],
["VENTILATION","Movement of air into and out of the lungs"],
["VERTIGO","Illusion of movement, often spinning"]
] as const;
export const scrambleWordsExtended = [...scrambleWords, ...scrambleWordsExpansion, ...scrambleWordsExpansion2] as const;

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
  {a:"Fat delivered by a 24-hour propofol infusion (70 kg adult, 50 mcg/kg/min; approximate)",av:50,b:"Fat in 100 cooked bacon strips (approximate)",bv:300,unit:"grams of fat",explanation:"Propofol 1% is supplied in a 10% lipid emulsion at about 1.1 kcal/mL. At this illustrative infusion rate, the carrier contributes roughly 50 g of lipid over 24 hours. Bacon-strip size and cooking method vary widely; 100 strips can contain several hundred grams of fat.",source:"Propofol 1% product labeling for lipid concentration and caloric density; bacon estimate is a deliberately rough food-comparison estimate." ,fun:true},
  {a:"Caffeine in 10 espresso shots (about 63 mg each)",av:630,b:"Caffeine in 2 standard 16-oz energy drinks (about 160 mg each)",bv:320,unit:"mg caffeine",explanation:"Espresso caffeine varies by bean and shot size; the estimates make this a fun scale comparison, not a dosing recommendation.",source:"Typical published serving estimates; product labels vary." ,fun:true},
  {a:"Approximate length of the adult small intestine",av:600,b:"Approximate length of an adult human",bv:175,unit:"cm",explanation:"The small intestine is several meters long; an adult human is typically under two meters tall.",source:"Standard anatomy references; both values are approximate." ,fun:true},
  {a:"Calories in 1 liter of propofol 1% emulsion",av:1100,b:"Calories in 1 liter of whole milk (approximate)",bv:610,unit:"kcal",explanation:"Propofol's lipid vehicle contributes meaningful calories during prolonged infusions. Milk calories vary with fat content.",source:"Propofol 1% product labeling (1.1 kcal/mL); generic whole-milk nutrition estimate." ,fun:true},
  {a:"Number of bones in a typical adult",av:206,b:"Number of muscles commonly cited in the human body",bv:600,unit:"count (approximate)",explanation:"The muscle count varies by how individual muscles are defined; 600 is a common broad estimate.",source:"Standard anatomy teaching references." ,fun:true},
  {a:"Blood volume in a typical adult",av:5,b:"Volume of a 2-liter soda bottle",bv:2,unit:"liters",explanation:"An average adult has roughly 5 L of circulating blood, with variation by body size and physiology.",source:"Standard physiology references.",fun:true},
  {a:"Surface area of both adult lungs (approximate)",av:70,b:"Surface area of a badminton court (approximate)",bv:81.7,unit:"square meters",explanation:"The lungs' enormous internal surface area supports gas exchange. A tennis court is larger, but not by as much as many people expect.",source:"Standard respiratory physiology estimates and tennis-court dimensions.",fun:true},
  {a:"Bacteria in the human gut (approximate)",av:38,b:"Stars in the Milky Way (approximate)",bv:0.2,unit:"trillions",explanation:"The gut microbiome is often estimated at tens of trillions of microbial cells; the Milky Way contains hundreds of billions of stars.",source:"Common microbiome and astronomy estimates; both are approximate.",fun:true},
  {a:"Fat in 1 tablespoon of olive oil",av:14,b:"Fat in 1 tablespoon of butter",bv:11.5,unit:"grams",explanation:"Both are fat-dense, but olive oil is nearly pure fat by volume while butter contains some water and milk solids.",source:"Typical nutrition-label values; brands vary.",fun:true},
  {a:"Protein in one large egg",av:6.3,b:"Protein in one cup of whole milk",bv:8,unit:"grams",explanation:"A cup of milk usually contains slightly more protein than one large egg.",source:"Typical nutrition-label values.",fun:true},
  {a:"Calories in one medium avocado",av:240,b:"Calories in a standard fast-food hamburger",bv:250,unit:"kcal",explanation:"An avocado can be surprisingly energy-dense because of its fat content. Size and restaurant recipes vary.",source:"Typical food-composition and restaurant nutrition estimates.",fun:true},
  {a:"Sodium in 1 teaspoon of table salt (approximate)",av:2300,b:"Common recommended daily sodium limit for many adults",bv:2300,unit:"mg sodium",explanation:"A teaspoon of salt can contain about an entire day's recommended sodium limit. The recommendation depends on the guideline and individual context.",source:"US dietary guidance and standard table-salt composition.",fun:true},
  {a:"Weight of an adult human brain (approximate)",av:1.4,b:"Weight of 1.5 liters of water",bv:1.5,unit:"kg",explanation:"The brain is surprisingly close to the weight of a large bottle of water.",source:"Standard anatomy estimates; water density is approximately 1 kg/L.",fun:true},
  {a:"Volume of typical adult daily urine output",av:1.5,b:"Volume of a large 1.5-liter water bottle",bv:1.5,unit:"liters",explanation:"A common adult urine output is around 1–2 liters per day, depending on intake and physiology.",source:"Standard renal physiology estimates; individual output varies.",fun:true},
  {a:"Fat in 100 cooked bacon strips (rough estimate)",av:300,b:"Fat in 1 kg of butter",bv:810,unit:"grams",explanation:"One kilogram of butter is mostly fat. Bacon-strip size and cooking method vary substantially.",source:"Typical nutrition-label estimates; bacon strips vary.",fun:true},
  {a:"Approximate number of heartbeats in one day",av:100000,b:"Approximate number of words spoken in one hour by a fast talker",bv:10000,unit:"events or words (rough counts)",explanation:"A resting adult heart beats around 100,000 times per day. Speech rates vary widely, but even a fast hour of talking is far fewer events.",source:"Common physiology and speech-rate estimates.",fun:true},
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

export interface HivePuzzle {
  title: string;
  letters: string[];
  center: string;
  words: string[];
  pangram: string;
  hint: string;
}
export const spellingHivePuzzles: HivePuzzle[] = [
  {
    title:"Triage Garden",
    letters:["T","R","I","A","G","E","S"],center:"A",
    words:["AIRS","ASTER","ARISE","ASTIR","EAST","GAIT","GATE","GATES","GRATE","GREAT","RAGE","RAGES","RAISE","RARE","RAGS","RATES","SAGE","SAGAS","SARI","SEAT","STAG","STAGE","STAGES","STAIR","STAR","STARE","STARS","STATE","STATES","TARES","TARS","TASTE","TEAR","TEARS","TRIAGE","TRIAGES"],
    pangram:"TRIAGES",hint:"A first-response word is hidden among the letters."
  },
  {
    title:"Healing Letters",
    letters:["H","E","A","L","I","N","G"],center:"E",
    words:["ALIEN","ALINE","ANGEL","ANGLE","EAGLE","ELAN","GENE","GLEE","GLEAN","HEAL","HEALING","HEEL","HEELING","HINGE","LANE","LEAN","LIEN","LIEGE","LINE"],
    pangram:"HEALING",hint:"The pangram is something people hope to do after an injury."
  },
  {
    title:"Medical Mix",
    letters:["M","E","D","I","C","A","L"],center:"I",
    words:["DIME","MICE","MILE","LIME","MILD","MAIL","IDEA","IDEAL","MEDIA","ACID","AMID","DIAL","LAID","LIED","CLIME","CLAIM","MICA","DICE","MIDI","EMAIL","MEDIC","MEDICAL","DECIMAL","IMIDE"],
    pangram:"MEDICAL",hint:"Find a word that describes this whole playground."
  },
  {
    title:"Stomach Set",
    letters:["S","T","O","M","A","C","H"],center:"O",
    words:["ATOM","COAST","COAT","COST","COTS","HOST","MACHO","MOAT","MOST","MOTS","OATH","SHOT","SOOT","STOAT","STOMA","STOMACH","TACO","TOMS","TOAST"],
    pangram:"STOMACH",hint:"The pangram is an organ found in the digestive tract."
  },
  {
    title:"Practice Round",
    letters:["P","R","A","C","T","I","E"],center:"R",
    words:["ACRE","CAPER","CARE","CARP","CART","CATER","CIRCA","CRATE","CRATER","CREPT","IRATE","PAIR","PARE","PART","PEAR","PIRATE","PRACTICE","PRATE","PRICE","RACE","RACER","RAPT","REACT","REAP","RECAP","RICE","RIPE","RITE","TIER","TIRE","TRACE","TRACT","TRAP","TRICE","TRIP"],
    pangram:"PRACTICE",hint:"The pangram is a useful habit for any skill."
  }
];

export interface DeductionCase {
  title: string;
  briefing: string;
  suspects: [string,string,string];
  locations: [string,string,string];
  objects: [string,string,string];
  clues: string[];
  solution: { suspect:string; location:string; object:string }[];
}
export const deductionCases: DeductionCase[] = [
  {
    title:"The Vanishing Slide",
    briefing:"A labeled slide, a keycard, and a stethoscope were found in three different rooms after a fictional late-night mix-up. Match each staff member to a room and an item.",
    suspects:["Dr. Chen","Dr. Reyes","Dr. Nair"],
    locations:["Laboratory","Imaging","Pharmacy"],
    objects:["Glass slide","Keycard","Stethoscope"],
    clues:[
      "Dr. Chen was in neither Imaging nor the Pharmacy.",
      "The Keycard was found in Imaging.",
      "Dr. Reyes was not in the Pharmacy.",
      "The Stethoscope was not in the Laboratory.",
      "Dr. Nair did not have the Glass slide."
    ],
    solution:[
      {suspect:"Dr. Chen",location:"Laboratory",object:"Glass slide"},
      {suspect:"Dr. Reyes",location:"Imaging",object:"Keycard"},
      {suspect:"Dr. Nair",location:"Pharmacy",object:"Stethoscope"}
    ]
  },
  {
    title:"The Night-Shift Mix-Up",
    briefing:"Three items were left in different parts of a fictional hospital after a shift change. Determine who was where and what they were carrying.",
    suspects:["Dr. Moss","Dr. Silva","Dr. Park"],
    locations:["Intensive Care","Operating Room","General Ward"],
    objects:["Pager","Scalpel","Clipboard"],
    clues:[
      "Dr. Moss was not in the Operating Room or the General Ward.",
      "The Scalpel was in the Operating Room.",
      "Dr. Silva was not in the General Ward.",
      "The Clipboard was not in Intensive Care.",
      "Dr. Park did not carry the Scalpel."
    ],
    solution:[
      {suspect:"Dr. Moss",location:"Intensive Care",object:"Pager"},
      {suspect:"Dr. Silva",location:"Operating Room",object:"Scalpel"},
      {suspect:"Dr. Park",location:"General Ward",object:"Clipboard"}
    ]
  },
  {
    title:"The Specimen Relay",
    briefing:"A microscope, a thermos, and a notebook were delivered to three different campus locations. Use the clues to reconstruct the fictional handoff.",
    suspects:["Dr. Bell","Dr. Young","Dr. Ali"],
    locations:["Research Lab","Garden","Cafeteria"],
    objects:["Microscope","Thermos","Notebook"],
    clues:[
      "Dr. Bell went to neither the Garden nor the Cafeteria.",
      "The Thermos was delivered to the Garden.",
      "Dr. Young did not go to the Cafeteria.",
      "The Notebook was not left in the Research Lab.",
      "Dr. Ali did not carry the Microscope."
    ],
    solution:[
      {suspect:"Dr. Bell",location:"Research Lab",object:"Microscope"},
      {suspect:"Dr. Young",location:"Garden",object:"Thermos"},
      {suspect:"Dr. Ali",location:"Cafeteria",object:"Notebook"}
    ]
  }
];


// Batch 2: strengthen the smallest word and deduction banks.
spellingHivePuzzles.push(
{title:"Therapy Garden",letters:["T","H","E","R","A","P","Y"],center:"R",words:["THERAPY","HEART","EARTH","HATER","PARTY","PRAY","TRAP","RATE","TARE","PEAR","REAP","HARP","TAPER","RAPT","TARP","RATHER"],pangram:"THERAPY",hint:"The pangram names a broad process of care."},
{title:"Organic Chemistry",letters:["O","R","G","A","N","I","C"],center:"R",words:["ORGANIC","ORGAN","GRAIN","GROAN","CIGAR","RACING","CARGO","RING","RANG","ROAN","RAIN","IRON","CORN","ROAR","CARING"],pangram:"ORGANIC",hint:"The pangram describes a broad class of compounds."},
{title:"Nuclear Medicine",letters:["N","U","C","L","E","A","R"],center:"E",words:["NUCLEAR","UNCLEAR","CLEAN","CLEAR","CRANE","LEARN","LANCE","UNCLE","EARN","NEAR","CARE","CURE","REAL","LACE","RACE","REEL"],pangram:"NUCLEAR",hint:"The pangram relates to the atom's central structure."},
{title:"Stainer's Bench",letters:["S","T","A","I","N","E","R"],center:"R",words:["STAINER","RETAINS","RETAIN","TRAIN","RAISE","TEARS","TARES","RATES","STARE","STARS","RANT","RENT","EARN","NEAR","RAIN","RISE","TIRE","SIRE","TERN"],pangram:"STAINER",hint:"The pangram is someone or something that leaves a mark."},
{title:"Retinal Signals",letters:["R","E","T","I","N","A","L"],center:"A",words:["RETINAL","RELIANT","LINEAR","RETAIN","TRAIN","TRAIL","TRIAL","LATER","ALERT","ALTER","IRATE","REAL","RATE","TARE","RAIL","TAIL","RANT"],pangram:"RETINAL",hint:"The pangram refers to the light-sensing tissue."},
{title:"Glucose Circuit",letters:["G","L","U","C","O","S","E"],center:"O",words:["GLUCOSE","CLOSE","CLOGS","SOLE","SOUL","LOSE","LOOSE","COOLS","COOL","GOES","LOGS","CLOG","COGS","LOGO","COLE"],pangram:"GLUCOSE",hint:"The pangram is a major circulating fuel."},
{title:"Folates and Salts",letters:["F","O","L","A","T","E","S"],center:"A",words:["FOLATES","FETAL","LEAST","STEAL","TALES","TEALS","SEAL","SALE","LATE","TALE","TEAL","LOAF","SOFA","FAST","FEAT","FLAT","FLOAT"],pangram:"FOLATES",hint:"The pangram is a vitamin family important in cell division."},
{title:"Steroid Shelf",letters:["S","T","E","R","O","I","D"],center:"E",words:["STEROID","TIRED","STORE","RISE","SIDE","EDIT","TIRE","DIRE","RODE","TIER","SIRE","REST","DORIES"],pangram:"STEROID",hint:"The pangram is a medication class with many physiologic effects."},
{title:"Garden Rounds",letters:["G","A","R","D","E","N","S"],center:"A",words:["GARDENS","DANGER","RANGED","GANDER","GRADE","GRAND","DARES","DEARS","EARN","NEAR","RANG","SAND","GARDEN","AGED","AGAR","EARS","SAGA"],pangram:"GARDENS",hint:"The pangram is a place where many things grow."}
);

wordLadders.push(
{start:"BOLD",end:"TUNE",path:["BOLD","BOND","BEND","SEND","SAND","SANE","CANE","CONE","BONE","TONE","TUNE"],note:"A long ladder through common words."},
{start:"FINE",end:"MOVE",path:["FINE","FIVE","DIVE","LIVE","LOVE","MOVE"],note:"One letter changes at each step."},
{start:"MILE",end:"LINE",path:["MILE","TILE","TIDE","SIDE","SINE","LINE"],note:"Follow the letter changes carefully."},
{start:"CARE",end:"LAST",path:["CARE","CASE","CASH","WASH","WISH","FISH","FIST","LIST","LAST"],note:"A multi-step path from care to last."},
{start:"COST",end:"FAST",path:["COST","LOST","LAST","PAST","FAST"],note:"A word ladder with several turns."},
{start:"EARS",end:"PAST",path:["EARS","EARN","BARN","BARK","DARK","DART","PART","PARK","MARK","MARS","MASS","PASS","PAST"],note:"Change exactly one letter at every rung."},
{start:"SEAT",end:"SELF",path:["SEAT","MEAT","MELT","BELT","BELL","CELL","SELL","SELF"],note:"The path ends at a household object."},
{start:"GAME",end:"RARE",path:["GAME","NAME","SAME","SAVE","SAFE","SAGE","PAGE","PACE","RACE","RARE"],note:"Each intermediate word differs by one letter."},
{start:"RING",end:"LUNG",path:["RING","SING","SONG","LONG","LUNG"],note:"A short ladder with a changing vowel."},
{start:"DATA",end:"GAME",path:["DATA","DATE","GATE","GAME"],note:"A compact ladder using familiar words."}
);

// Rotations and reflections preserve each original nonogram's unique row/column solution.
const rotateGlyph = (pattern: number[][]) => pattern[0].map((_, c) => pattern.map((row) => row[c]).reverse());
const mirrorGlyph = (pattern: number[][]) => pattern.map((row) => [...row].reverse());
glyphPatterns.push(...glyphPatternsExpansion);
const originalGlyphs = glyphPatterns.slice(0, 6);
glyphPatterns.push(
  ...originalGlyphs.map((item) => ({...item, name:item.name+" · rotated", pattern:rotateGlyph(item.pattern)})),
  ...originalGlyphs.map((item) => ({...item, name:item.name+" · mirrored", pattern:mirrorGlyph(item.pattern)}))
);

deductionCases.push(
{
title:"The Misfiled Scan",briefing:"Three clinicians each reviewed a different study in a different department. Match the clinician, department, and item.",suspects:["Dr. Vale","Dr. Kim","Dr. Shah"],locations:["CT Suite","Ward","Laboratory"],objects:["Film","Pager","Clipboard"],
clues:["Dr. Vale worked in neither the Ward nor the Laboratory.","The Film was in the CT Suite.","Dr. Kim was not in the CT Suite.","Dr. Shah was not in the Ward.","Dr. Shah did not have the Clipboard."],
solution:[{suspect:"Dr. Vale",location:"CT Suite",object:"Film"},{suspect:"Dr. Kim",location:"Ward",object:"Clipboard"},{suspect:"Dr. Shah",location:"Laboratory",object:"Pager"}]
},
{
title:"The Missing Instrument",briefing:"A fictional teaching session ended with three instruments in three rooms. Determine who had each instrument and where.",suspects:["Dr. Brooks","Dr. Imani","Dr. Chen"],locations:["Simulation Lab","Lecture Hall","Skills Room"],objects:["Otoscope","Reflex hammer","Syringe"],
clues:["Dr. Brooks was in neither the Lecture Hall nor the Skills Room.","The Otoscope was in the Simulation Lab.","Dr. Imani was not in the Simulation Lab.","Dr. Imani was not in the Skills Room.","Dr. Chen did not have the Syringe."],
solution:[{suspect:"Dr. Brooks",location:"Simulation Lab",object:"Otoscope"},{suspect:"Dr. Imani",location:"Lecture Hall",object:"Syringe"},{suspect:"Dr. Chen",location:"Skills Room",object:"Reflex hammer"}]
},
{
title:"The Conference Mix-Up",briefing:"Three speakers left a different teaching aid in separate conference spaces. Match all assignments.",suspects:["Dr. Okafor","Dr. Lin","Dr. Patel"],locations:["Auditorium","Library","Seminar Room"],objects:["Anatomy model","Slide deck","Case notes"],
clues:["Dr. Okafor was in neither the Library nor the Seminar Room.","The Anatomy model was in the Auditorium.","Dr. Lin was not in the Auditorium.","Dr. Lin was not in the Seminar Room.","Dr. Patel did not have the Case notes."],
solution:[{suspect:"Dr. Okafor",location:"Auditorium",object:"Anatomy model"},{suspect:"Dr. Lin",location:"Library",object:"Case notes"},{suspect:"Dr. Patel",location:"Seminar Room",object:"Slide deck"}]
},
{
title:"The Specimen Handoff",briefing:"Three research teams each delivered one specimen to a different campus location. Reconstruct the fictional handoff.",suspects:["Team North","Team East","Team West"],locations:["Cold Room","Microscopy Lab","Archive"],objects:["Tissue block","Culture plate","Blood tube"],
clues:["Team North used neither the Microscopy Lab nor the Archive.","The Tissue block was in the Cold Room.","Team East did not use the Cold Room.","Team West was not in the Microscopy Lab.","Team East did not carry the Blood tube."],
solution:[{suspect:"Team North",location:"Cold Room",object:"Tissue block"},{suspect:"Team East",location:"Microscopy Lab",object:"Culture plate"},{suspect:"Team West",location:"Archive",object:"Blood tube"}]
},
{
title:"The Night Call",briefing:"Three residents responded to different nonclinical simulation stations and each carried a different tool.",suspects:["Resident A","Resident B","Resident C"],locations:["Control Room","Mock Ward","Debrief Room"],objects:["Timer","Checklist","Stethoscope"],
clues:["Resident A was in neither the Mock Ward nor the Debrief Room.","The Timer was in the Control Room.","Resident B was not in the Control Room.","Resident B was not in the Debrief Room.","Resident C did not carry the Stethoscope."],
solution:[{suspect:"Resident A",location:"Control Room",object:"Timer"},{suspect:"Resident B",location:"Mock Ward",object:"Stethoscope"},{suspect:"Resident C",location:"Debrief Room",object:"Checklist"}]
},
{
title:"The Library Return",briefing:"Three students returned different study materials to separate library desks. Match each student with the desk and item.",suspects:["Ari","Mina","Jon"],locations:["Reference Desk","East Desk","West Desk"],objects:["Atlas","Flashcards","Textbook"],
clues:["Ari used neither the East Desk nor the West Desk.","The Atlas was at the Reference Desk.","Mina did not use the West Desk.","Mina did not return the Flashcards.","Jon did not return the Textbook."],
solution:[{suspect:"Ari",location:"Reference Desk",object:"Atlas"},{suspect:"Mina",location:"East Desk",object:"Textbook"},{suspect:"Jon",location:"West Desk",object:"Flashcards"}]
}
);


spellingHivePuzzles.push(...spellingHiveExpansion);
wordLadders.push(...wordLaddersExpansion);
deductionCases.push(...deductionCasesExpansion);
higherLowerPairs.push(...higherLowerPairsExpansion, ...higherLowerPairsExpansion2);
higherLowerPairs.push(
  {a:"Estimated length of all blood vessels in an adult",av:100000,b:"Earth's equatorial circumference",bv:40075,unit:"km",explanation:"A frequently cited estimate puts the body's blood vessels at roughly 100,000 km in total. Estimates vary with methodology.",source:"Standard anatomy teaching estimate; Earth circumference is a geodetic reference value.",fun:true},
  {a:"Glucose in the bloodstream of a typical adult (5 L blood at 90 mg/dL)",av:4.5,b:"Sugar in one teaspoon of granulated sugar",bv:4,unit:"grams",explanation:"Despite the body's enormous glucose needs, only a few grams circulate in the blood at a given moment. This is an illustrative estimate, not a target glucose value.",source:"Calculation from an illustrative blood volume and glucose concentration; typical teaspoon sugar mass.",fun:true},
  {a:"Cells in the human body (approximate)",av:30,b:"Microbial cells in the gut (approximate)",bv:38,unit:"trillions",explanation:"The estimated number of gut microbial cells is in the same broad range as the number of human cells. Both estimates vary.",source:"Modern cell-count and microbiome estimates; approximate.",fun:true},
  {a:"Neurons in the adult human brain (approximate)",av:86,b:"Stars in the Milky Way (lower-end estimate)",bv:100,unit:"billions",explanation:"The brain contains roughly 86 billion neurons; the Milky Way is estimated to contain around 100–400 billion stars.",source:"Common neuroscience and astronomy estimates.",fun:true},
  {a:"Fluid filtered by both kidneys in one day (typical GFR)",av:180,b:"Water in a standard 150-liter bathtub",bv:150,unit:"liters",explanation:"At a GFR near 125 mL/min, the kidneys filter about 180 liters of plasma ultrafiltrate per day, then reabsorb most of it.",source:"Standard renal physiology: approximate GFR 125 mL/min.",fun:true},
  {a:"DNA length in one typical diploid human cell if fully uncoiled",av:2,b:"Height of an average adult",bv:1.75,unit:"meters",explanation:"A human cell contains about two meters of DNA when fully extended, packed into a microscopic nucleus.",source:"Standard molecular biology estimate; adult height is illustrative.",fun:true},
  {a:"Total body water in a 70-kg adult at 60% body weight",av:42,b:"Water in twenty 2-liter bottles",bv:40,unit:"liters",explanation:"A 70-kg adult at 60% total body water carries roughly 42 liters of water. Actual proportions vary with age, sex, and body composition.",source:"Standard physiology estimate.",fun:true},
  {a:"Iron in the average adult human body (approximate)",av:4,b:"Mass of four standard 1-gram paper clips",bv:4,unit:"grams",explanation:"The body contains only a few grams of iron, mostly in hemoglobin and storage proteins. This is a tie by the illustrative estimate.",source:"Standard hematology and nutrition reference estimates.",fun:true}
);
