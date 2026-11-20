/**
 * Casefile Logic content. Each theme is a set of look-alike conditions. A case picks three of them and asks the player to
 * match every patient (presentation) to its cause and to the finding that clinches it. Clues describe items by clinical
 * features, so medical knowledge makes the deduction easier and the post-case notes teach the link.
 */
export interface ClinicalCondition {
  /** Presentation, written to follow "the patient with ...". */
  patient: string;
  /** Cause label, written to follow "an illness caused by ...". */
  cause: string;
  /** A harder way to refer to the cause that needs clinical knowledge to decode. */
  alt: string;
  /** Key test or finding, written to follow "had ...". */
  finding: string;
  /** One-line teaching point shown after the case. */
  why: string;
}
export interface ClinicalTheme {
  id: string; title: string; intro: string;
  causeName: string; findingName: string;
  conditions: ClinicalCondition[];
}

const c = (patient: string, cause: string, alt: string, finding: string, why: string): ClinicalCondition => ({ patient, cause, alt, finding, why });

export const clinicalThemes: ClinicalTheme[] = [
  {
    id: "cough", title: "The Cough Cluster", causeName: "Organism", findingName: "Key test",
    intro: "Three patients on the pulmonary ward share a cough and an abnormal chest film. Match each patient to the organism and the test result that clinches it.",
    conditions: [
      c("night sweats and an upper-lobe cavity", "Mycobacterium tuberculosis", "the slow-growing bacillus with a waxy, lipid-rich wall", "a positive acid-fast smear", "Upper-lobe cavitation with night sweats and weight loss suggests tuberculosis, shown by acid-fast bacilli on smear."),
      c("thick 'currant-jelly' sputum in an alcoholic man", "Klebsiella pneumoniae", "the encapsulated gram-negative rod with a polysaccharide coat", "stringy, mucoid colonies that ferment lactose on MacConkey agar", "Klebsiella causes necrotizing pneumonia in alcoholic patients, with a mucoid capsule and red currant-jelly sputum."),
      c("necrotizing pneumonia just after influenza", "Staphylococcus aureus", "the catalase- and coagulase-positive coccus", "gram-positive cocci in clusters on the sputum Gram stain", "Post-influenza pneumonia classically involves S. aureus, seen as grape-like clusters on Gram stain."),
      c("leukemia, neutropenia and a halo sign on chest CT", "Aspergillus fumigatus", "the mold with acute-angle branching septate hyphae", "a raised serum galactomannan", "Angioinvasive aspergillosis in neutropenic patients shows a CT halo sign and galactomannan antigenemia."),
      c("pneumonia with low sodium, diarrhea and a recent hotel stay", "Legionella pneumophila", "the fastidious gram-negative rod that needs charcoal yeast agar", "a positive urinary antigen", "Water-system exposure plus GI symptoms and hyponatremia point to Legionella, diagnosed by urinary antigen."),
      c("advanced HIV, a dry cough and a high LDH", "Pneumocystis jirovecii", "the fungus once classified as a protozoan", "cysts on methenamine silver stain", "Diffuse ground-glass opacities in advanced HIV suggest Pneumocystis, treated with trimethoprim-sulfamethoxazole."),
      c("lobar consolidation with rusty sputum", "Streptococcus pneumoniae", "the optochin-sensitive, bile-soluble coccus", "lancet-shaped gram-positive diplococci on Gram stain", "Rusty sputum and lobar consolidation are classic for pneumococcus, shown as lancet-shaped diplococci."),
    ],
  },
  {
    id: "meningitis", title: "The Stiff Neck Files", causeName: "Organism", findingName: "Key test",
    intro: "Three patients arrive with fever, headache and a stiff neck. Match each one to the pathogen and the result that gives it away.",
    conditions: [
      c("fever and a bulging fontanelle in a newborn", "Streptococcus agalactiae", "the bacitracin-resistant, hippurate-positive coccus", "a positive CAMP test on the isolate", "Group B streptococcus is the leading cause of early neonatal meningitis and is CAMP-positive and hippurate-positive."),
      c("fever and a petechial rash in a college student", "Neisseria meningitidis", "the maltose-fermenting capsulated coccus that colonizes the nasopharynx", "gram-negative diplococci in the spinal fluid", "Meningococcus causes petechial rash and can cause adrenal hemorrhage; close contacts need prophylaxis."),
      c("meningitis in a pregnant woman who ate deli meat", "Listeria monocytogenes", "the intracellular organism that spreads between cells on actin tails", "a gram-positive rod showing tumbling motility at room temperature", "Listeria affects pregnancy, newborns and the elderly, and is covered by ampicillin."),
      c("a subacute headache in advanced HIV", "Cryptococcus neoformans", "the encapsulated yeast", "a positive India ink preparation of the spinal fluid", "Cryptococcal meningitis shows capsules with India ink and needs amphotericin B."),
      c("fever, confusion and temporal-lobe changes on MRI", "Herpes simplex virus 1", "the neurotropic enveloped virus that hides in the trigeminal ganglion", "a positive spinal fluid PCR", "HSV encephalitis favors the temporal lobes and is treated early with acyclovir."),
      c("weeks of headache, weight loss and cranial neuropathies", "Mycobacterium tuberculosis", "the acid-fast bacillus", "low spinal fluid glucose with lymphocytes and basal enhancement", "Tuberculous meningitis is subacute, with a basal exudate and low CSF glucose."),
    ],
  },
  {
    id: "potluck", title: "The Potluck Outbreak", causeName: "Cause", findingName: "Key test",
    intro: "Several guests developed diarrhea after a gathering. Link each patient to the cause and the laboratory finding that confirms it.",
    conditions: [
      c("vomiting within three hours of eating potato salad", "a preformed Staphylococcus aureus enterotoxin", "a toxin that withstands cooking", "coagulase-positive cocci cultured from a leftover dish", "Short incubation with vomiting and no fever suggests a preformed toxin."),
      c("cramps and watery diarrhea 12 hours after reheated meat and gravy", "Clostridium perfringens", "the organism whose alpha toxin is a lecithinase", "large numbers of rods cultured from the implicated dish", "Spores survive cooking and germinate when food is held warm."),
      c("profuse rice-water diarrhea after travel", "Vibrio cholerae", "the comma-shaped organism whose toxin locks adenylate cyclase on", "yellow colonies on TCBS agar", "Cholera toxin locks adenylate cyclase on, causing massive watery diarrhea."),
      c("bloody diarrhea and hemolytic uremic syndrome after a hamburger", "Escherichia coli O157:H7", "the Shiga-toxin-producing strain", "sorbitol-negative colonies on MacConkey-sorbitol agar", "This strain does not ferment sorbitol; avoid antibiotics because they can raise HUS risk."),
      c("bloody diarrhea after undercooked chicken, then ascending weakness", "Campylobacter jejuni", "the organism whose lipooligosaccharide mimics gangliosides", "growth on selective agar incubated at 42 degrees", "Campylobacter is the classic trigger of Guillain-Barre syndrome."),
      c("greasy, foul-smelling diarrhea after camping", "Giardia lamblia", "the binucleate flagellate", "pear-shaped trophozoites in the stool", "Giardia is treated with metronidazole and is common in campers and daycares."),
      c("watery diarrhea in advanced HIV", "Cryptosporidium parvum", "the chlorine-resistant protozoan", "acid-fast oocysts in the stool", "Cryptosporidium causes prolonged watery diarrhea when CD4 counts are low."),
      c("severe watery diarrhea after a course of antibiotics", "Clostridioides difficile", "the spore-forming anaerobe treated with oral vancomycin or fidaxomicin", "a positive stool toxin A and B assay", "Antibiotics disrupt flora; treat with oral vancomycin or fidaxomicin."),
    ],
  },
  {
    id: "rash", title: "The Spotted Wards", causeName: "Organism", findingName: "Key test",
    intro: "Fever with a rash is a classic diagnostic puzzle. Match each patient to the organism and the result that supports it.",
    conditions: [
      c("fever and a rash starting on the wrists and ankles after a tick bite", "Rickettsia rickettsii", "the obligate intracellular organism that infects endothelium", "a positive immunohistochemical stain of a skin biopsy", "Treat suspected Rocky Mountain spotted fever with doxycycline before confirmation."),
      c("an expanding bullseye rash after a hike", "Borrelia burgdorferi", "the tick-borne spirochete", "positive two-tier serology", "Erythema migrans is diagnostic on its own in an endemic area; later disease causes facial palsy and arthritis."),
      c("a painless genital ulcer followed by a rash on the palms and soles", "Treponema pallidum", "the spirochete too thin to see on Gram stain", "a reactive RPR with a positive FTA-ABS", "Secondary syphilis involves the palms and soles and responds to benzathine penicillin."),
      c("fever, sore throat and a sandpaper rash with a strawberry tongue", "Streptococcus pyogenes", "the group A organism that is sensitive to bacitracin", "a positive rapid antigen test on a swab", "Scarlet fever follows pharyngitis with an erythrogenic toxin."),
      c("cough, conjunctivitis and a rash that moves from the head downward", "Measles virus", "the paramyxovirus", "Koplik spots and a positive specific IgM", "Koplik spots precede the rash; vitamin A reduces complications in children."),
      c("fever, headache and red eyes after wading through floodwater", "Leptospira interrogans", "the spirochete shed in rat urine", "a positive microscopic agglutination test", "Severe leptospirosis causes jaundice and renal failure (Weil disease)."),
    ],
  },
  {
    id: "anemia", title: "The Pale Patients", causeName: "Mechanism", findingName: "Lab finding",
    intro: "Three patients are anemic for different reasons. Match each presentation to its mechanism and the laboratory clue.",
    conditions: [
      c("fatigue, pallor and spoon-shaped nails", "chronic occult gastrointestinal blood loss", "slow bleeding from the gut", "a low serum ferritin", "Iron deficiency in an older adult needs a search for a bleeding source."),
      c("fatigue, a sore tongue and numb feet with a wide-based gait", "loss of intrinsic factor from autoimmune gastritis", "antibodies against gastric parietal cells", "hypersegmented neutrophils with a high methylmalonic acid", "Vitamin B12 deficiency causes macrocytic anemia and subacute combined degeneration."),
      c("microcytic anemia with target cells and a normal ferritin", "reduced beta-globin chain production", "a quantitative defect in gene output", "a raised hemoglobin A2 on electrophoresis", "Beta-thalassemia trait shows a high HbA2 and a low MCV out of proportion to the anemia."),
      c("jaundice, splenomegaly and spherical red cells in a child", "spectrin or ankyrin deficiency", "a defect of the membrane skeleton", "abnormal eosin-5-maleimide binding", "Hereditary spherocytosis causes extravascular hemolysis and a high MCHC."),
      c("sudden dark urine after fava beans or a sulfa drug", "oxidant stress in G6PD deficiency", "an X-linked enzyme defect of the pentose phosphate pathway", "Heinz bodies and bite cells", "G6PD deficiency causes episodic hemolysis after oxidant exposure."),
      c("jaundice and a rapidly falling hemoglobin in a patient with chronic lymphocytic leukemia", "IgG autoantibodies against red-cell antigens", "warm-reacting autoantibodies", "a positive direct Coombs test", "Warm autoimmune hemolytic anemia is often associated with lupus or lymphoma."),
    ],
  },
  {
    id: "endo", title: "The Hormone Hunt", causeName: "Mechanism", findingName: "Test result",
    intro: "Three endocrine puzzles walk in together. Match each presentation to the underlying mechanism and the test that confirms it.",
    conditions: [
      c("central obesity, purple striae and hypertension", "an ACTH-secreting pituitary adenoma", "a corticotroph tumor", "cortisol suppression on high-dose dexamethasone", "Cushing disease suppresses with high-dose dexamethasone, unlike ectopic ACTH."),
      c("resistant hypertension with low potassium", "an aldosterone-producing adrenal adenoma", "a unilateral cortical tumor", "a failure of the saline suppression test", "Primary aldosteronism causes hypertension, hypokalemia and suppressed renin."),
      c("episodic headaches, sweating and palpitations with hypertension", "a catecholamine-secreting tumor of the adrenal medulla", "a chromaffin-cell tumor", "elevated plasma metanephrines", "Start an alpha-blocker before a beta-blocker in pheochromocytoma."),
      c("fatigue, hyperpigmentation and salt craving", "autoimmune destruction of the adrenal cortex", "21-hydroxylase autoimmunity", "failure of cortisol to rise after cosyntropin", "Primary adrenal insufficiency raises ACTH, causing hyperpigmentation."),
      c("weight loss, heat intolerance and a smooth, symmetric goiter with eye changes", "stimulating antibodies against the TSH receptor", "an IgG that mimics TSH", "diffusely increased radioiodine uptake on a thyroid scan", "Graves disease also causes ophthalmopathy and pretibial myxedema."),
      c("kidney stones, bone pain and constipation", "a single parathyroid adenoma", "an autonomous gland that ignores negative feedback", "a high calcium with an inappropriately high PTH", "Primary hyperparathyroidism: stones, bones, groans and psychiatric overtones."),
    ],
  },
  {
    id: "tox", title: "The Overdose Ward", causeName: "Toxin", findingName: "Key finding",
    intro: "Three poisoned patients arrive at once. Match each presentation to the toxin and the finding that proves it.",
    conditions: [
      c("right-upper-quadrant pain and rising liver enzymes two days after an intentional overdose", "acetaminophen", "the drug whose NAPQI metabolite depletes glutathione", "a toxic level on the Rumack-Matthew nomogram", "Treat with N-acetylcysteine, which replenishes glutathione."),
      c("ringing in the ears, fast breathing and fever after taking pills for pain", "salicylate", "the drug that uncouples oxidative phosphorylation", "a mixed respiratory alkalosis and anion-gap metabolic acidosis", "Alkalinize the urine and consider dialysis in severe toxicity."),
      c("drooling, tearing, small pupils, wheeze and muscle twitching hours into a work shift", "an organophosphate pesticide", "an irreversible acetylcholinesterase inhibitor", "low red-cell cholinesterase activity", "Give atropine for secretions and pralidoxime to reactivate the enzyme."),
      c("headache and confusion in a winter household", "carbon monoxide", "the odorless gas with a very high hemoglobin affinity", "an elevated carboxyhemoglobin with a normal pulse oximeter", "Give 100% oxygen; standard pulse oximetry misreads carboxyhemoglobin."),
      c("blurred vision after drinking windshield fluid", "methanol", "the alcohol metabolized to formic acid", "a large osmolar gap with an anion-gap acidosis", "Treat with fomepizole and consider dialysis."),
      c("flank pain and acute kidney injury after drinking antifreeze", "ethylene glycol", "the sweet-tasting diol cleared by alcohol dehydrogenase", "envelope-shaped calcium oxalate crystals in the urine", "Fomepizole blocks alcohol dehydrogenase."),
      c("dilated pupils, dry skin, tachycardia and seizures after an intentional overdose", "a tricyclic antidepressant", "the drug with a three-ring structure and a narrow safety margin", "QRS prolongation that improves with sodium bicarbonate", "Widening QRS predicts seizures and arrhythmias in tricyclic overdose."),
      c("pinpoint pupils and slow breathing", "an opioid", "a mu-receptor agonist", "reversal with naloxone", "Titrate naloxone to breathing, not to full wakefulness."),
    ],
  },
  {
    id: "stroke", title: "The Brain Attack Board", causeName: "Vessel or lesion", findingName: "Key sign",
    intro: "Three patients present with sudden neurologic deficits. Match each presentation to the culprit vessel or lesion and the sign that localizes it.",
    conditions: [
      c("aphasia with weakness of the right face and arm", "occlusion of the left middle cerebral artery", "the large trunk that supplies the lateral convexity", "a hyperdense vessel sign on noncontrast CT", "MCA strokes spare the leg relatively and cause aphasia when the dominant hemisphere is involved."),
      c("leg weakness and abulia", "occlusion of the anterior cerebral artery", "the branch that runs along the corpus callosum", "a medial frontal infarct on diffusion MRI", "ACA infarcts affect the medial motor and frontal areas."),
      c("trouble reading and recognizing faces after a sudden headache", "occlusion of the posterior cerebral artery", "the vessel that feeds the occipital pole", "a homonymous hemianopia with macular sparing", "Macular sparing reflects dual blood supply to the occipital pole."),
      c("vertigo, hoarseness and trouble swallowing with numb skin on the opposite side", "a lateral medullary infarct from vertebral or PICA occlusion", "Wallenberg syndrome", "ipsilateral Horner syndrome with contralateral loss of pain and temperature sensation", "Crossed findings localize the lesion to the lateral medulla."),
      c("pure right-sided weakness of the face, arm and leg without cortical signs", "a lacunar infarct of the internal capsule", "a penetrating-arteriole occlusion in a hypertensive patient", "a deep subcortical lesion on diffusion-weighted MRI", "Lipohyalinosis from hypertension causes lacunar strokes."),
      c("quadriplegia with preserved blinking and vertical eye movements", "occlusion of the basilar artery", "the midline vessel formed by the two vertebral arteries", "bilateral ventral pontine infarcts on MRI", "Patients are conscious but can only move their eyes."),
      c("a thunderclap headache and a blown pupil", "a ruptured posterior communicating artery aneurysm", "an aneurysm compressing the oculomotor nerve", "blood in the basal cisterns on non-contrast CT", "A painful third-nerve palsy suggests a posterior communicating aneurysm."),
    ],
  },
  {
    id: "chest", title: "The Chest Pain Triage", causeName: "Mechanism", findingName: "Key finding",
    intro: "Three patients arrive with chest pain. Sort each presentation by mechanism and by the finding that clinches it.",
    conditions: [
      c("crushing chest pain radiating to the jaw with sweating", "plaque rupture with coronary occlusion", "acute thrombosis of an atherosclerotic coronary artery", "ST elevation with a rising troponin", "STEMI needs immediate reperfusion."),
      c("sudden pleuritic pain and shortness of breath after a long flight", "a thrombus lodged in a pulmonary artery", "an embolus from the deep leg veins", "a filling defect on CT angiography of the chest", "Deep vein thrombosis is the usual source of pulmonary emboli."),
      c("tearing chest pain radiating to the back with unequal arm pressures", "a split in the aortic wall", "blood tracking between its layers", "a widened mediastinum and a flap on CT angiography", "Control heart rate and pressure with a beta-blocker first."),
      c("sharp pain that eases when leaning forward after a viral illness", "inflammation of the pericardium", "serositis of the heart sac", "diffuse ST elevation with PR depression", "A friction rub is classic; treat with NSAIDs and colchicine."),
      c("sudden pain, absent breath sounds and a deviated trachea after trauma", "air trapped under pressure in the pleural space", "a one-way valve leak in the lung", "hyperresonance with hypotension and distended neck veins", "Tension pneumothorax is a clinical diagnosis needing immediate decompression."),
      c("severe pain and subcutaneous emphysema after forceful vomiting", "a full-thickness tear of the esophagus", "Boerhaave syndrome", "pleural fluid with a low pH and a high amylase", "Mackler triad is vomiting, chest pain and subcutaneous emphysema."),
    ],
  },
  {
    id: "liver", title: "The Liver Panel", causeName: "Cause", findingName: "Lab finding",
    intro: "Three patients have abnormal liver tests. Match each presentation to its cause and the laboratory clue.",
    conditions: [
      c("fever and jaundice in an unvaccinated healthcare worker after a needlestick", "hepatitis B virus", "the partially double-stranded DNA virus with reverse transcriptase", "a positive surface antigen", "Surface antigen means current infection; surface antibody means immunity."),
      c("jaundice after a church picnic with shellfish", "hepatitis A virus", "the fecal-oral picornavirus", "positive anti-HAV IgM", "Hepatitis A never becomes chronic."),
      c("chronic fatigue in a patient who once shared needles", "hepatitis C virus", "the flavivirus linked to mixed cryoglobulinemia", "a positive HCV RNA", "Direct-acting antivirals cure most infections."),
      c("tremor, psychiatric symptoms and golden-brown rings in the eyes in a young adult", "defective biliary copper excretion", "an ATP7B mutation", "a low serum ceruloplasmin", "Wilson disease shows Kayser-Fleischer rings."),
      c("bronze skin, diabetes and arthritis in a middle-aged man", "iron overload from an HFE mutation", "a defect in hepcidin regulation", "a high transferrin saturation", "Treat with phlebotomy; screen for hepatocellular carcinoma."),
      c("itching and fatigue in a middle-aged woman with a high alkaline phosphatase", "autoimmune destruction of small bile ducts", "T-cell attack on interlobular ducts", "positive antimitochondrial antibodies", "Primary biliary cholangitis responds to ursodeoxycholic acid."),
      c("cholestasis and ulcerative colitis in a young man", "fibrosing inflammation of large bile ducts", "an idiopathic fibro-obliterative duct disease", "a beaded string-of-pearls pattern on MRCP", "Primary sclerosing cholangitis raises cholangiocarcinoma risk."),
      c("early emphysema and liver disease in a young nonsmoker", "misfolded alpha-1 antitrypsin retained in hepatocytes", "a Z-allele protease inhibitor defect", "PAS-positive, diastase-resistant globules on biopsy", "The same defect causes panacinar emphysema in the lungs."),
    ],
  },
  {
    id: "kidney", title: "The Kidney Biopsy Board", causeName: "Mechanism", findingName: "Biopsy finding",
    intro: "Three patients with kidney disease need a biopsy. Match each presentation to its mechanism and the pathology finding.",
    conditions: [
      c("nephrotic syndrome in a child after a recent illness", "podocyte injury", "T-cell cytokine damage to the glomerular filter", "effaced foot processes on electron microscopy with normal light microscopy", "Minimal change disease responds to corticosteroids."),
      c("heavy proteinuria in an adult with a possible hepatitis B or cancer link", "in situ immune complex formation on a podocyte antigen", "antibodies against the phospholipase A2 receptor", "a spike-and-dome pattern on silver stain", "Membranous nephropathy is the leading cause of nephrotic syndrome in adults."),
      c("blood in the urine one day after a sore throat", "galactose-deficient immunoglobulin glycosylation", "a mucosal-immunity glycosylation defect", "mesangial IgA deposits on immunofluorescence", "Synpharyngitic hematuria separates IgA nephropathy from post-infectious disease."),
      c("cola-colored urine two weeks after a skin infection", "immune complexes from a nephritogenic bacterial strain", "a delayed antibody response to a bacterial antigen", "subepithelial humps with low C3", "Post-streptococcal glomerulonephritis usually resolves in children."),
      c("coughing blood and rapidly progressive kidney failure in a young smoker", "autoantibodies against type IV collagen", "anti-GBM disease", "linear IgG staining along the basement membrane", "Plasmapheresis, steroids and cyclophosphamide are used."),
      c("a malar rash, arthritis and proteinuria in a young woman", "immune-complex deposition from systemic lupus", "full-house immune-complex deposition", "wire-loop capillaries on light microscopy", "Lupus nephritis is staged by biopsy class."),
      c("heavy proteinuria in a patient with HIV or heroin use", "focal scarring of the filtering units", "a podocyte-injury pattern with a permeability factor", "segmental sclerosis on light microscopy", "Focal segmental glomerulosclerosis often resists steroids."),
    ],
  },
];
