/** First-person riddles for Riddle Lab: four clues from cryptic to obvious. Distractors come from the same kind. */
export type RiddleKind = "Microbe" | "Drug" | "Organ" | "Molecule" | "Syndrome";
export interface Riddle { id: string; kind: RiddleKind; answer: string; clues: [string, string, string, string] }
const r = (kind: RiddleKind, answer: string, clues: [string, string, string, string]): Riddle => ({ id: (kind[0] + answer).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24), kind, answer, clues });

export const riddles: Riddle[] = [
  r("Microbe", "Pseudomonas aeruginosa", ["I smell like grapes and I'm famous for blue-green pus.", "I love moist places: hot tubs, burn wounds, and ventilator tubing.", "I'm an oxidase-positive gram-negative rod that makes pyocyanin.", "In cystic fibrosis lungs, my mucoid form takes over."]),
  r("Microbe", "Staphylococcus aureus", ["I form grape-like clusters of golden colonies.", "I make coagulase, so I clot plasma.", "Toxic shock and scalded skin are two of my tricks.", "Some of my family resist methicillin."]),
  r("Microbe", "Clostridioides difficile", ["Antibiotics are my best friend because they clear out my competition.", "I make toxins A and B and leave a pseudomembranous gut.", "My spores shrug off hand sanitizer, so soap and water wins.", "A fecal transplant can put me in my place."]),
  r("Microbe", "Helicobacter pylori", ["I live in stomach acid like it's a spa.", "I make urease and wrap myself in ammonia.", "I'm linked to ulcers and gastric lymphoma.", "A urea breath test can catch me."]),
  r("Microbe", "Treponema pallidum", ["I'm too thin for ordinary microscopy; darkfield catches me.", "I start with a painless chancre and later rash the palms and soles.", "Pregnant patients are screened for me.", "One shot of long-acting penicillin treats early me."]),
  r("Microbe", "Mycobacterium tuberculosis", ["I'm slow-growing, acid-fast, and I love oxygen-rich upper lobes.", "My cord factor makes me grow in ropes.", "I hide inside granulomas with caseous centers.", "Rifampin, isoniazid, pyrazinamide, and ethambutol take me on."]),
  r("Microbe", "Plasmodium falciparum", ["A female mosquito delivers me.", "I hijack red blood cells and burst them on a schedule.", "Banana-shaped gametocytes are my signature.", "Travelers take atovaquone-proguanil or doxycycline to stay safe from me."]),
  r("Microbe", "Streptococcus pyogenes", ["I'm a beta-hemolytic chain of cocci, sensitive to bacitracin.", "Strep throat is my classic act.", "Untreated, I can leave behind rheumatic fever.", "Necrotizing fasciitis is my darkest trick."]),
  r("Microbe", "Candida albicans", ["I make germ tubes at body temperature.", "Thrush and diaper rash are my minor hobbies.", "Antibiotics and diabetes give me room to grow.", "Fluconazole and echinocandins are my usual adversaries."]),
  r("Microbe", "Vibrio cholerae", ["I'm a comma-shaped, fast-moving rod.", "I cause rice-water diarrhea.", "My toxin locks Gs on and floods the gut with chloride and water.", "Oral rehydration is the hero treatment against me."]),
  r("Microbe", "Neisseria meningitidis", ["I'm a gram-negative diplococcus with a capsule.", "College dorm outbreaks are my specialty.", "Petechial rash and adrenal hemorrhage can follow me.", "Close contacts get rifampin or ciprofloxacin."]),
  r("Microbe", "Toxoplasma gondii", ["Cat litter boxes are my vacation home.", "I can cross the placenta.", "In AIDS I cause ring-enhancing brain lesions.", "Pyrimethamine and sulfadiazine are my treatment."]),
  r("Drug", "Warfarin", ["I'm older than most of your attendings.", "I block vitamin K epoxide reductase.", "Leafy greens and many antibiotics change how I act.", "Start me without heparin cover and skin necrosis can happen."]),
  r("Drug", "Metformin", ["I'm the first-line pill for type 2 diabetes.", "I activate AMPK and cut hepatic gluconeogenesis.", "I rarely cause hypoglycemia on my own.", "Hold me around contrast in kidney trouble; lactic acidosis lurks."]),
  r("Drug", "Lithium", ["My therapeutic window is narrow.", "Thirst and urination from nephrogenic diabetes insipidus follow me.", "Tremor and thyroid trouble are my signature side effects.", "Dehydration and NSAIDs push my level up."]),
  r("Drug", "Amiodarone", ["I'm an antiarrhythmic with a half-life of weeks.", "I'm loaded with iodine, so thyroid problems follow.", "Blue-gray skin and pulmonary fibrosis are my calling cards.", "I block potassium channels but also hit sodium, calcium, and beta receptors."]),
  r("Drug", "Naloxone", ["I show up in nasal sprays at overdoses.", "I'm a competitive antagonist at one receptor family.", "I can wear off before the opioid does, so watch for renarcotization.", "I'm famous for waking people up."]),
  r("Drug", "Digoxin", ["I come from foxglove.", "I inhibit the sodium-potassium pump.", "Yellow-green vision plus nausea means my level is too high.", "Low potassium makes me more toxic."]),
  r("Drug", "Furosemide", ["I'm a loop of trouble for your sodium.", "I block the Na-K-2Cl cotransporter.", "Hearing loss and hypokalemia are my catches.", "I'm a sulfa drug, but ethacrynic acid isn't."]),
  r("Drug", "Heparin", ["I'm a big sulfated polysaccharide.", "I activate antithrombin.", "HIT is my dangerous side effect.", "Protamine reverses me."]),
  r("Drug", "Propranolol", ["I'm a nonselective beta blocker.", "I calm performance anxiety and hyperthyroid tremor.", "Avoid me in asthma.", "Infants with hemangiomas may get me."]),
  r("Drug", "Atropine", ["I come from deadly nightshade.", "I'm a muscarinic antagonist.", "Dry as a bone, red as a beet, mad as a hatter.", "I treat symptomatic bradycardia and organophosphate poisoning."]),
  r("Drug", "Acetaminophen", ["I reduce fever but not inflammation.", "In overdose my toxic metabolite is NAPQI.", "I drain glutathione.", "N-acetylcysteine is my antidote."]),
  r("Drug", "Penicillin", ["I'm a beta-lactam from a famous mold.", "I block cell-wall transpeptidases.", "Rash and anaphylaxis are my risks.", "I'm still the drug of choice for syphilis."]),
  r("Organ", "Pancreas", ["I'm retroperitoneal, tucked behind the stomach.", "Islets are my endocrine side.", "I make lipase, amylase, and trypsinogen.", "Beta cells inside me make insulin."]),
  r("Organ", "Spleen", ["I'm the largest lymphoid organ.", "I live in the left upper quadrant.", "I clear old red cells and encapsulated bacteria.", "Without me, you need pneumococcal, meningococcal, and Hib vaccines."]),
  r("Organ", "Thyroid", ["I'm shaped like a butterfly in the neck.", "I take up iodine.", "I make T3 and T4; my C cells make calcitonin.", "I rise when you swallow."]),
  r("Organ", "Hippocampus", ["My name means seahorse.", "I live in the medial temporal lobe.", "I turn short-term memories into long-term ones.", "Alzheimer disease hits me early."]),
  r("Organ", "Adrenal gland", ["I sit on top of the kidney.", "My cortex has three layers: salt, sugar, sex.", "My medulla makes epinephrine.", "Pheochromocytoma comes from my medulla."]),
  r("Organ", "Liver", ["I'm the largest internal organ.", "I make albumin and clotting factors.", "My cells metabolize drugs with cytochrome P450.", "Cirrhosis scars me."]),
  r("Organ", "Cerebellum", ["I'm the 'little brain' under the occipital lobes.", "I coordinate movement and balance.", "Damage makes you fall toward the side of my lesion.", "Intention tremor and ataxia are my signs."]),
  r("Organ", "Appendix", ["I'm a blind pouch hanging off the cecum.", "McBurney point is where I hurt.", "A fecalith can block me.", "Surgeons remove me when I'm inflamed."]),
  r("Organ", "Gallbladder", ["I store and concentrate bile.", "I sit under the liver.", "CCK makes me squeeze.", "Stones in me cause biliary colic."]),
  r("Organ", "Aortic valve", ["I have three cusps.", "I sit between the left ventricle and the aorta.", "Calcification and a crescendo-decrescendo murmur mean I'm narrowed.", "Syncope, angina, and dyspnea are the classic triad when I'm tight."]),
  r("Molecule", "Insulin", ["I'm two chains joined by disulfide bonds.", "Beta cells release me after meals.", "I move GLUT4 to the cell surface.", "I lower blood sugar and push potassium into cells."]),
  r("Molecule", "Cortisol", ["I peak in the morning.", "I come from the zona fasciculata.", "Too much of me causes striae and moon facies.", "Prednisone mimics me."]),
  r("Molecule", "Oxytocin", ["The posterior pituitary releases me.", "I'm made in the hypothalamus.", "I drive contractions and milk letdown.", "Pitocin is my drug form."]),
  r("Molecule", "Hemoglobin", ["I carry oxygen in red cells.", "I'm a tetramer with heme groups.", "2,3-BPG shifts my curve to the right.", "Sickle cell disease changes one of my chains."]),
  r("Molecule", "Dopamine", ["I'm made from tyrosine.", "I'm lost in the substantia nigra in Parkinson disease.", "Antipsychotics block my D2 receptors.", "I inhibit prolactin release."]),
  r("Molecule", "Aldosterone", ["I'm a mineralocorticoid.", "Angiotensin II tells me to rise.", "I make the kidney hold sodium and dump potassium.", "Spironolactone blocks me."]),
  r("Molecule", "Glucagon", ["Alpha cells release me.", "I rise in fasting states.", "I turn on glycogenolysis and gluconeogenesis.", "I'm the rescue injection for severe hypoglycemia."]),
  r("Molecule", "Erythropoietin", ["Kidney cells make me.", "Hypoxia turns on my gene.", "I tell bone marrow to make red cells.", "Athletes who abuse me risk thick blood."]),
  r("Syndrome", "Marfan syndrome", ["I'm tall with long fingers.", "My fibrillin-1 is faulty.", "Upward lens dislocation and aortic root dilation are my risks.", "I'm autosomal dominant."]),
  r("Syndrome", "Down syndrome", ["I come from an extra chromosome 21.", "A single palmar crease and a flat facial profile are classic.", "I'm linked with AV canal defects and early Alzheimer disease.", "Advanced maternal age raises my odds."]),
  r("Syndrome", "Turner syndrome", ["I'm 45,X.", "Short stature and a webbed neck go with me.", "Bicuspid aortic valve and coarctation are common.", "Streak ovaries leave me with primary amenorrhea."]),
  r("Syndrome", "Cushing syndrome", ["Moon facies and a buffalo hump belong to me.", "Purple striae mark my skin.", "Dexamethasone suppression separates my causes.", "Cortisol excess is my definition."]),
  r("Syndrome", "Guillain-Barré syndrome", ["I often follow an infection like Campylobacter.", "I climb from the legs upward.", "Reflexes vanish, and the CSF shows albuminocytologic dissociation.", "IVIG or plasmapheresis treats me."]),
  r("Syndrome", "Horner syndrome", ["Ptosis, miosis, and anhidrosis are my triad.", "A sympathetic pathway interruption causes me.", "Pancoast tumors are a classic culprit.", "Carotid dissection can cause me."]),
  r("Syndrome", "Wernicke encephalopathy", ["Confusion, ataxia, and ophthalmoplegia are my triad.", "Alcohol use disorder is my usual backdrop.", "Glucose before thiamine can make me worse.", "Left untreated, I can progress to Korsakoff syndrome."]),
  r("Syndrome", "Kawasaki disease", ["I'm a vasculitis of young children.", "Five days of fever, a strawberry tongue, and conjunctivitis are on my menu.", "Coronary artery aneurysms are my danger.", "IVIG and aspirin treat me."]),
  r("Syndrome", "Sjögren syndrome", ["Dry eyes and dry mouth define me.", "Anti-Ro and anti-La antibodies point to me.", "I raise the risk of lymphoma.", "Parotid enlargement can occur."]),
  r("Syndrome", "Tetralogy of Fallot", ["I'm the most common cyanotic congenital heart defect after infancy.", "Squatting relieves my spells.", "I include pulmonary stenosis and a ventricular septal defect.", "An overriding aorta and right ventricular hypertrophy complete my four parts."])
];

/** Four options: the answer plus three same-kind distractors, in a seeded order. */
export function riddleOptions(riddle: Riddle, rand: () => number): string[] {
  const pool = riddles.filter((x) => x.kind === riddle.kind && x.answer !== riddle.answer).map((x) => x.answer);
  const picks: string[] = [];
  const bag = [...pool];
  while (picks.length < 3 && bag.length) picks.push(bag.splice(Math.floor(rand() * bag.length), 1)[0]);
  const all = [riddle.answer, ...picks];
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return all;
}
