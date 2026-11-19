import { diagnosisCasesExpansion5, nextStepCasesExpansion5, connectionPuzzlesExpansion5 } from "./dataClinical5";
import { diagnosisCasesExpansion4, nextStepCasesExpansion4, connectionPuzzlesExpansion4 } from "./dataClinical4";
import { diagnosisCasesExpansion3, nextStepCasesExpansion3, connectionPuzzlesExpansion3 } from "./dataClinical3";
import { diagnosisCasesExpansion2, nextStepCasesExpansion2, connectionPuzzlesExpansion2, labPromptsExpansion2, pairsBankExpansion2 } from "./dataClinical2";
import { connectionPuzzlesExpansion, diagnosisCasesExpansion, nextStepCasesExpansion, labPromptsExpansion, pairsBankExpansion, microbePacksExpansion, medleWordsExpansion, triageCasesExpansion, microbePacksExpansion2 } from "./dataExpansion";

export interface ConnectionGroup {
  category: string;
  words: [string, string, string, string];
  hint: string;
}

export interface DiagnosisCase {
  id: string;
  title: string;
  clues: string[];
  options: string[];
  answer: string;
  explanation: string;
  source: string;
}

export interface NextStepCase {
  id: string;
  specialty: string;
  vignette: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  source: string;
}

export interface LabPrompt {
  id: string;
  prompt: string;
  value: number;
  tolerance: number;
  unit: string;
  context: string;
  source: string;
}

export const medleWords = [
  "ACUTE","AORTA","APNEA","ANION","BRAIN","CROUP","CYSTS","COMAS","COLON","EDEMA",
  "FETAL","FETOR","GRAFT","GOUTY","ILEAL","ILEUS","LIVER","LYMPH","MOLAR","MOTOR",
  "NERVE","NEVUS","OPTIC","OVARY","PENIS","PRION","RALES","RENAL","SINUS","SPASM",
  "SPINE","STAPH","STREP","SHOCK","SERUM","TIBIA","ULCER","ULNAR","VAGUS","VIRAL",
  "YEAST","WHEAL","Cocci".toUpperCase(),"TITER","PLATE","NODES","FIBER","FIBRO","TONIC",
  "VENOM","URATE","URETH","SUTUR","SCALE","SEPSI","SPORE","THROM","VALVE","VIRUS"
];

export const connectionPuzzles: ConnectionGroup[][] = [
  [
    { category: "Loop diuretics", words: ["Furosemide","Bumetanide","Torsemide","Ethacrynic acid"], hint: "Potent diuretics acting in the thick ascending limb." },
    { category: "ACE inhibitors", words: ["Lisinopril","Enalapril","Captopril","Ramipril"], hint: "Names commonly end in -pril." },
    { category: "Beta blockers", words: ["Metoprolol","Propranolol","Carvedilol","Labetalol"], hint: "Adrenergic antagonists with varied receptor selectivity." },
    { category: "Calcium-channel blockers", words: ["Amlodipine","Nifedipine","Diltiazem","Verapamil"], hint: "Two are dihydropyridines; two are non-dihydropyridines." }
  ],
  [
    { category: "Nephrotic syndrome causes", words: ["Minimal change","FSGS","Membranous nephropathy","Diabetic nephropathy"], hint: "Conditions associated with heavy proteinuria." },
    { category: "Nephritic syndrome causes", words: ["Post-streptococcal GN","IgA nephropathy","Lupus nephritis","Rapidly progressive GN"], hint: "Glomerular inflammation with hematuria." },
    { category: "Thiazide diuretics", words: ["Hydrochlorothiazide","Chlorthalidone","Indapamide","Metolazone"], hint: "Distal convoluted tubule diuretics." },
    { category: "Potassium-sparing diuretics", words: ["Spironolactone","Eplerenone","Amiloride","Triamterene"], hint: "Reduce potassium loss." }
  ],
  [
    { category: "Posterior pituitary hormones/effects", words: ["ADH","Water retention","Vasopressin","V2 receptor"], hint: "Think collecting duct and water balance." },
    { category: "Anterior pituitary hormones", words: ["ACTH","TSH","Prolactin","Growth hormone"], hint: "Hormones released by the adenohypophysis." },
    { category: "Thyroid hormone synthesis", words: ["Iodide trapping","Organification","Coupling","Thyroglobulin"], hint: "Steps or substrate in making thyroid hormone." },
    { category: "Adrenal gland hormone products", words: ["Aldosterone","Cortisol","Adrenal androgens","Catecholamines"], hint: "The cortex makes the first three; the medulla makes catecholamines." }
  ],
  [
    { category: "Cranial nerves with parasympathetic output", words: ["CN III","CN VII","CN IX","CN X"], hint: "Four cranial nerves carry preganglionic parasympathetic fibers." },
    { category: "Cranial nerves with major sensory roles", words: ["CN I","CN II","CN V","CN VIII"], hint: "Smell, vision, facial sensation, hearing/balance." },
    { category: "Predominantly motor cranial nerves", words: ["CN IV","CN VI","CN XI","CN XII"], hint: "Trochlear, abducens, accessory, and hypoglossal." },
    { category: "Upper motor neuron signs", words: ["Spasticity","Hyperreflexia","Clonus","Babinski sign"], hint: "Findings suggesting corticospinal tract dysfunction." }
  ],
  [
    { category: "Common causes of microcytic anemia", words: ["Iron deficiency","Thalassemia","Anemia of chronic disease","Sideroblastic anemia"], hint: "Think low MCV differential." },
    { category: "Hemolysis clues", words: ["High LDH","Low haptoglobin","Indirect bilirubin","Reticulocytosis"], hint: "Laboratory pattern of increased red-cell destruction." },
    { category: "Vitamin deficiencies", words: ["B12","Folate","Thiamine","Vitamin C"], hint: "Four vitamins with classic deficiency syndromes." },
    { category: "Coagulation tests/measurements", words: ["PT","aPTT","INR","Bleeding time"], hint: "Tests historically used to assess hemostasis." }
  ],
  [
    { category: "Typical organisms: atypical pneumonia", words: ["Mycoplasma","Chlamydophila","Legionella","Coxiella"], hint: "Organisms associated with atypical pneumonia presentations." },
    { category: "Encapsulated bacteria", words: ["Streptococcus pneumoniae","Haemophilus influenzae","Neisseria meningitidis","Klebsiella pneumoniae"], hint: "Think impaired splenic function and polysaccharide capsules." },
    { category: "Spore-forming gram-positive rods", words: ["Bacillus anthracis","Bacillus cereus","Clostridium tetani","Clostridium botulinum"], hint: "Two genera; all are gram-positive rods." },
    { category: "Acid-fast organisms", words: ["Mycobacterium tuberculosis","Mycobacterium leprae","Mycobacterium avium","Nocardia"], hint: "One is only partially acid-fast." }
  ],
  [
    { category: "Anticoagulant reversal", words: ["Vitamin K","Protamine","Idarucizumab","Andexanet alfa"], hint: "Match an agent to a major anticoagulant target." },
    { category: "Antidotes", words: ["N-acetylcysteine","Fomepizole","Atropine","Pralidoxime"], hint: "Toxicology shelf: acetaminophen, toxic alcohols, cholinergic toxicity." },
    { category: "Opioid-related concepts", words: ["Miosis","Naloxone","Hypoventilation","Methadone"], hint: "Classic toxidrome and treatment/maintenance medication." },
    { category: "Serotonergic medications", words: ["Fluoxetine","Sertraline","Venlafaxine","Escitalopram"], hint: "Common antidepressants; two are SSRIs and one is an SNRI." }
  ],
  [
    { category: "Placental disorders", words: ["Placenta previa","Placental abruption","Placenta accreta","Vasa previa"], hint: "Obstetric causes of bleeding or abnormal placental attachment." },
    { category: "Hypertensive disorders of pregnancy", words: ["Gestational hypertension","Preeclampsia","Eclampsia","HELLP syndrome"], hint: "Pregnancy-specific hypertensive spectrum." },
    { category: "Stages/periods of labor", words: ["Cervical dilation","Fetal delivery","Placental delivery","Fourth stage"], hint: "Sequence from labor onset through immediate recovery." },
    { category: "Common causes of postpartum hemorrhage", words: ["Uterine atony","Retained tissue","Genital tract trauma","Coagulopathy"], hint: "The four Ts." }
  ],
  [
    { category: "Restrictive lung diseases", words: ["Idiopathic pulmonary fibrosis","Sarcoidosis","Pneumoconiosis","Neuromuscular weakness"], hint: "Causes of reduced lung volumes." },
    { category: "Obstructive lung diseases", words: ["Asthma","COPD","Bronchiectasis","Cystic fibrosis"], hint: "Conditions associated with airflow obstruction." },
    { category: "Pulmonary embolism risk factors", words: ["Recent surgery","Immobilization","Estrogen therapy","Active malignancy"], hint: "Elements of venous thromboembolism risk." },
    { category: "Pleural effusion findings", words: ["Dullness to percussion","Decreased fremitus","Decreased breath sounds","Meniscus sign"], hint: "Physical exam and imaging clues." }
  ],
  [
    { category: "Parkinson disease features", words: ["Bradykinesia","Resting tremor","Rigidity","Postural instability"], hint: "Core motor manifestations." },
    { category: "Cerebellar findings", words: ["Dysmetria","Dysdiadochokinesia","Intention tremor","Ataxia"], hint: "Impaired coordination." },
    { category: "Meningeal signs", words: ["Nuchal rigidity","Kernig sign","Brudzinski sign","Photophobia"], hint: "Findings that can accompany meningeal irritation." },
    { category: "Myasthenia gravis associations", words: ["Ptosis","Fatigability","Thymoma","Anti-AChR antibody"], hint: "Neuromuscular junction disorder." }
  ],
  [
    { category: "Tumor lysis syndrome labs", words: ["Hyperkalemia","Hyperphosphatemia","Hypocalcemia","Hyperuricemia"], hint: "Electrolyte pattern after rapid tumor-cell breakdown." },
    { category: "SIADH pattern", words: ["Low serum osmolality","High urine osmolality","High urine sodium","Euvolemia"], hint: "Hypotonic hyponatremia with inappropriately concentrated urine." },
    { category: "Diabetes diagnostic tests", words: ["Fasting glucose","HbA1c","Oral glucose tolerance","Random glucose with symptoms"], hint: "Accepted diagnostic pathways for diabetes mellitus." },
    { category: "DKA characteristics", words: ["Ketones","Anion-gap acidosis","Hyperglycemia","Kussmaul respirations"], hint: "Classic diabetic ketoacidosis pattern." }
  ],
  [
    { category: "Common causes of acute pancreatitis", words: ["Gallstones","Alcohol","Hypertriglyceridemia","ERCP"], hint: "Four common etiologies." },
    { category: "Cholestatic laboratory pattern", words: ["Elevated alkaline phosphatase","Elevated GGT","Direct hyperbilirubinemia","Pruritus"], hint: "Biliary obstruction or impaired bile flow." },
    { category: "Inflammatory bowel disease associations", words: ["PSC","Erythema nodosum","Uveitis","Pyoderma gangrenosum"], hint: "Extraintestinal manifestations or linked disease." },
    { category: "Peptic ulcer risk factors", words: ["H. pylori","NSAIDs","Smoking","Prior ulcer"], hint: "Factors that increase ulcer risk." }
  ]
];

export const diagnosisCases: DiagnosisCase[] = [
  { id:"d01", title:"The sudden pelvic pain", clues:["A 27-year-old with 7 weeks of amenorrhea develops unilateral pelvic pain and scant vaginal bleeding.","Pregnancy test is positive; transvaginal ultrasound shows no intrauterine pregnancy and an adnexal mass.","She becomes hypotensive with shoulder-tip pain."], options:["Ectopic pregnancy","Ovarian torsion","Pelvic inflammatory disease","Threatened abortion"], answer:"Ectopic pregnancy", explanation:"Pregnancy plus unilateral pain, bleeding, and an adnexal mass without an intrauterine gestation is ectopic pregnancy until proven otherwise. Hemodynamic instability suggests rupture and requires emergency operative management.", source:"ACOG Practice Bulletin: Tubal Ectopic Pregnancy; standard obstetric emergency teaching." },
  { id:"d02", title:"Ascending weakness", clues:["A previously healthy adult develops tingling in the feet after a diarrheal illness.","Weakness progresses symmetrically from the legs toward the arms; deep tendon reflexes are absent.","CSF shows elevated protein with a normal white-cell count."], options:["Guillain-Barré syndrome","Myasthenia gravis","Multiple sclerosis","Amyotrophic lateral sclerosis"], answer:"Guillain-Barré syndrome", explanation:"Acute ascending symmetric weakness with areflexia after infection and albuminocytologic dissociation is the classic pattern. Monitor respiratory function and autonomic stability.", source:"AAN practice guidance and standard neurology references on Guillain-Barré syndrome." },
  { id:"d03", title:"The fading eyelids", clues:["A young adult reports intermittent diplopia and difficulty chewing late in the day.","Ptosis worsens with sustained upgaze and improves after rest.","Sensation and reflexes are preserved; acetylcholine-receptor antibodies are detected."], options:["Myasthenia gravis","Lambert-Eaton syndrome","Botulism","Oculopharyngeal muscular dystrophy"], answer:"Myasthenia gravis", explanation:"Fluctuating, fatigable ocular and bulbar weakness with preserved sensation is characteristic of postsynaptic neuromuscular-junction dysfunction.", source:"International Consensus Guidance for Management of Myasthenia Gravis." },
  { id:"d04", title:"The jaw that tires", clues:["A 72-year-old develops a new temporal headache and scalp tenderness.","Jaw pain appears after chewing for several minutes; ESR and CRP are elevated.","Transient monocular vision loss occurred this morning."], options:["Giant cell arteritis","Cluster headache","Trigeminal neuralgia","Migraine with aura"], answer:"Giant cell arteritis", explanation:"Age over 50, new headache, jaw claudication, inflammatory markers, and visual symptoms strongly indicate giant cell arteritis. Start glucocorticoids immediately when suspected; do not wait for biopsy.", source:"American College of Rheumatology/Vasculitis Foundation guideline for giant cell arteritis." },
  { id:"d05", title:"A headache like thunder", clues:["A 44-year-old describes a sudden severe headache that reached maximal intensity in seconds.","Neck stiffness and vomiting are present; neurologic examination is initially nonfocal.","Noncontrast head CT performed several hours after onset is unrevealing; lumbar puncture shows xanthochromia."], options:["Subarachnoid hemorrhage","Meningitis","Migraine","Cerebral venous sinus thrombosis"], answer:"Subarachnoid hemorrhage", explanation:"Thunderclap headache with xanthochromia in CSF is classic for subarachnoid hemorrhage, often from a ruptured aneurysm.", source:"AHA/ASA Guideline for the Management of Patients With Aneurysmal Subarachnoid Hemorrhage." },
  { id:"d06", title:"The lucid interval", clues:["A young adult sustains a blow to the temporal region.","There is brief loss of consciousness, a lucid interval, then rapid neurologic decline.","CT shows a biconvex, lens-shaped hyperdensity that does not cross suture lines."], options:["Epidural hematoma","Subdural hematoma","Subarachnoid hemorrhage","Intraparenchymal hemorrhage"], answer:"Epidural hematoma", explanation:"A middle meningeal artery injury classically produces an epidural hematoma with a lucid interval and a lens-shaped collection.", source:"Standard emergency medicine and neurotrauma references." },
  { id:"d07", title:"The crescent after a fall", clues:["An older adult taking anticoagulation becomes progressively confused after a minor fall.","Headache and fluctuating alertness develop over several days.","CT shows a crescent-shaped extra-axial collection that crosses suture lines."], options:["Subdural hematoma","Epidural hematoma","Acute ischemic stroke","Brain abscess"], answer:"Subdural hematoma", explanation:"Bridging-vein injury causes a crescent-shaped subdural collection; presentation may be delayed, especially in older adults or those taking anticoagulants.", source:"Standard emergency medicine and neurotrauma references." },
  { id:"d08", title:"The spells of sweating", clues:["A 36-year-old has episodic pounding headaches, palpitations, and diaphoresis.","During an episode, blood pressure is 220/120 mm Hg; between episodes it is near normal.","Plasma free metanephrines are markedly elevated."], options:["Pheochromocytoma","Primary hyperaldosteronism","Cushing syndrome","Hyperthyroidism"], answer:"Pheochromocytoma", explanation:"Paroxysmal headache, sweating, palpitations, and hypertension with elevated metanephrines indicate a catecholamine-secreting tumor.", source:"Endocrine Society Clinical Practice Guideline: Pheochromocytoma and Paraganglioma." },
  { id:"d09", title:"The child with dark urine", clues:["A school-aged child develops edema and cola-colored urine two weeks after impetigo.","Blood pressure is elevated and complement C3 is low.","Urinalysis shows dysmorphic red cells and red-cell casts."], options:["Poststreptococcal glomerulonephritis","Minimal change disease","IgA nephropathy","Hemolytic uremic syndrome"], answer:"Poststreptococcal glomerulonephritis", explanation:"A latent period after group A streptococcal infection, nephritic urine, hypertension, and low C3 are classic for poststreptococcal glomerulonephritis.", source:"KDIGO Clinical Practice Guideline for Glomerular Diseases." },
  { id:"d10", title:"The preschooler's edema", clues:["A 4-year-old develops periorbital edema after a mild upper respiratory infection.","Urinalysis shows heavy proteinuria; serum albumin is low and cholesterol is elevated.","Renal function is usually preserved; the child responds to corticosteroids."], options:["Minimal change disease","Focal segmental glomerulosclerosis","Membranous nephropathy","Poststreptococcal glomerulonephritis"], answer:"Minimal change disease", explanation:"Minimal change disease is the most common cause of nephrotic syndrome in young children and is typically steroid responsive.", source:"KDIGO Clinical Practice Guideline for Glomerular Diseases." },
  { id:"d11", title:"The fever and bruising", clues:["A 31-year-old develops confusion, fever, and petechiae.","Hemoglobin and platelets are low; the smear shows schistocytes and LDH is elevated.","Creatinine is mildly elevated and coagulation studies are near normal."], options:["Thrombotic thrombocytopenic purpura","Disseminated intravascular coagulation","Immune thrombocytopenia","Aplastic anemia"], answer:"Thrombotic thrombocytopenic purpura", explanation:"Microangiopathic hemolytic anemia plus thrombocytopenia and neurologic symptoms should trigger urgent consideration of TTP. Do not delay plasma exchange while awaiting ADAMTS13 testing when suspicion is high.", source:"ISTH Guidelines for the Diagnosis and Treatment of Thrombotic Thrombocytopenic Purpura." },
  { id:"d12", title:"The diarrhea that turned dangerous", clues:["A child develops bloody diarrhea after eating undercooked ground beef.","Several days later, pallor, bruising, and reduced urine output develop.","Labs show microangiopathic hemolytic anemia, thrombocytopenia, and acute kidney injury."], options:["Hemolytic uremic syndrome","Thrombotic thrombocytopenic purpura","IgA vasculitis","Acute postinfectious glomerulonephritis"], answer:"Hemolytic uremic syndrome", explanation:"The triad of microangiopathic hemolytic anemia, thrombocytopenia, and acute kidney injury after Shiga-toxin diarrhea is classic for typical HUS.", source:"CDC clinical guidance on Shiga toxin-producing E. coli and standard pediatric nephrology references." },
  { id:"d13", title:"The episodes separated in time", clues:["A 29-year-old has painful monocular vision loss that improves over weeks.","Months later, she develops limb paresthesias and internuclear ophthalmoplegia.","MRI shows periventricular ovoid lesions and lesions in multiple CNS regions."], options:["Multiple sclerosis","Neuromyelitis optica","Myasthenia gravis","CNS vasculitis"], answer:"Multiple sclerosis", explanation:"Neurologic episodes separated in time and space, optic neuritis, internuclear ophthalmoplegia, and characteristic MRI lesions support multiple sclerosis.", source:"McDonald criteria and contemporary MS diagnostic references." },
  { id:"d14", title:"The weakness that improves", clues:["A 66-year-old smoker has proximal leg weakness and difficulty rising from a chair.","Strength briefly improves after repeated muscle contraction; reflexes are reduced.","Chest imaging reveals a hilar mass."], options:["Lambert-Eaton myasthenic syndrome","Myasthenia gravis","Guillain-Barré syndrome","Polymyositis"], answer:"Lambert-Eaton myasthenic syndrome", explanation:"Presynaptic calcium-channel antibodies cause proximal weakness that improves with use; the syndrome is strongly associated with small-cell lung carcinoma.", source:"Standard neurology references on paraneoplastic neuromuscular disorders." },
  { id:"d15", title:"The fever with a strawberry tongue", clues:["A 3-year-old has fever for six days despite supportive care.","Bilateral nonpurulent conjunctival injection, cracked red lips, a polymorphous rash, and swollen hands are present.","A unilateral cervical lymph node is enlarged."], options:["Kawasaki disease","Scarlet fever","Measles","Systemic juvenile idiopathic arthritis"], answer:"Kawasaki disease", explanation:"Prolonged fever with mucocutaneous findings and extremity changes is classic for Kawasaki disease. Timely IVIG and aspirin reduce coronary artery complications.", source:"American Heart Association scientific statement on Kawasaki disease." },
  { id:"d16", title:"The hot, swollen knee", clues:["A 59-year-old develops abrupt severe pain and swelling in the first metatarsophalangeal joint.","Synovial fluid contains needle-shaped crystals with strong negative birefringence.","The patient has hyperuricemia, although serum urate alone is not diagnostic."], options:["Gout","Calcium pyrophosphate deposition disease","Septic arthritis","Rheumatoid arthritis"], answer:"Gout", explanation:"Needle-shaped, negatively birefringent monosodium urate crystals are the classic diagnostic finding. Always consider and evaluate for septic arthritis when clinically indicated.", source:"American College of Rheumatology Guideline for the Management of Gout." },
  { id:"d17", title:"The wheeze after a new medication", clues:["Minutes after receiving an antibiotic, a patient develops diffuse urticaria and lip swelling.","Wheezing, hypotension, and gastrointestinal cramping follow.","Symptoms began rapidly after exposure to a likely allergen."], options:["Anaphylaxis","Vasovagal syncope","Acute asthma exacerbation","Serum sickness"], answer:"Anaphylaxis", explanation:"Rapid multisystem involvement with skin/mucosal findings, respiratory compromise, and hypotension after exposure is anaphylaxis.", source:"World Allergy Organization guidance on anaphylaxis." },
  { id:"d18", title:"The painless jaundice", clues:["A 68-year-old has progressive painless jaundice, pruritus, and weight loss.","Direct bilirubin and alkaline phosphatase are elevated.","Imaging shows a mass in the pancreatic head and dilation of the common bile duct."], options:["Pancreatic adenocarcinoma","Acute viral hepatitis","Choledocholithiasis","Autoimmune pancreatitis"], answer:"Pancreatic adenocarcinoma", explanation:"Painless progressive obstructive jaundice, weight loss, and a pancreatic-head mass are highly concerning for pancreatic adenocarcinoma.", source:"NCCN Clinical Practice Guidelines in Oncology: Pancreatic Adenocarcinoma." },
  { id:"d19", title:"The child who will not swallow", clues:["A 5-year-old has fever, drooling, muffled voice, and sits leaning forward.","The child appears toxic and has inspiratory stridor.","A lateral neck radiograph, if safely obtained, may show a swollen epiglottis."], options:["Epiglottitis","Viral croup","Retropharyngeal abscess","Bacterial tracheitis"], answer:"Epiglottitis", explanation:"Drooling, tripod positioning, toxic appearance, and muffled voice suggest epiglottitis. Avoid upsetting the child or attempting an unprotected pharyngeal examination; prioritize controlled airway management.", source:"AAP Red Book and standard pediatric emergency references." },
  { id:"d20", title:"The ascending paralysis after a tick bite", clues:["A child develops progressive symmetric weakness during tick season.","A tick is found attached to the scalp; sensation is preserved.","Weakness improves rapidly after tick removal."], options:["Tick paralysis","Guillain-Barré syndrome","Botulism","Poliomyelitis"], answer:"Tick paralysis", explanation:"Tick salivary neurotoxin can produce acute ascending flaccid paralysis, typically improving after prompt tick removal.", source:"CDC clinical overview of tickborne diseases." }
];

export const nextStepCases: NextStepCase[] = [
  { id:"n01", specialty:"Emergency", vignette:"A 24-year-old with type 1 diabetes has vomiting, abdominal pain, Kussmaul respirations, glucose 520 mg/dL, pH 7.12, and potassium 2.8 mEq/L.", question:"What is the next step before starting insulin?", options:["Replace potassium","Give IV insulin bolus","Give sodium bicarbonate","Start dextrose infusion"], answer:0, explanation:"In DKA with potassium below 3.5 mEq/L, replace potassium before insulin because insulin shifts potassium intracellularly and can precipitate life-threatening arrhythmia. Follow a current institutional DKA protocol.", source:"2024 international consensus report on hyperglycemic crises in adults; ADA." },
  { id:"n02", specialty:"Emergency", vignette:"A 61-year-old develops sudden right-sided weakness and aphasia 50 minutes ago. Glucose is normal and there is no seizure activity.", question:"Which study is the immediate first imaging step?", options:["Noncontrast CT head","MRI brain with contrast","Carotid duplex ultrasound","CT angiography of the chest"], answer:0, explanation:"Obtain noncontrast head CT urgently to exclude intracranial hemorrhage before thrombolytic treatment decisions. Additional vascular imaging may follow without delaying reperfusion assessment.", source:"AHA/ASA Guideline for the Early Management of Acute Ischemic Stroke." },
  { id:"n03", specialty:"Emergency", vignette:"A 19-year-old is actively convulsing for 7 minutes without regaining consciousness. IV access is established and glucose is 102 mg/dL.", question:"What is the best immediate medication?", options:["IV lorazepam","Oral levetiracetam","IV phenytoin as the first medication","IM haloperidol"], answer:0, explanation:"A benzodiazepine is first-line for ongoing convulsive status epilepticus; IV lorazepam is appropriate when IV access is available.", source:"American Epilepsy Society guideline for convulsive status epilepticus." },
  { id:"n04", specialty:"Cardiology", vignette:"A 58-year-old has 90 minutes of crushing chest pain. ECG shows ST elevations in II, III, and aVF. A PCI-capable hospital is immediately available.", question:"What is the preferred reperfusion strategy?", options:["Immediate primary PCI","Exercise stress testing","Wait for serial troponins","Outpatient coronary CT"], answer:0, explanation:"STEMI with timely access to a PCI-capable center warrants immediate reperfusion with primary PCI. Do not wait for troponin results when the ECG and presentation establish the diagnosis.", source:"2025 ACC/AHA Guideline for Acute Coronary Syndromes; verify current local pathways." },
  { id:"n05", specialty:"Allergy", vignette:"A patient develops hives, wheezing, throat tightness, and hypotension minutes after a bee sting.", question:"What is the first-line treatment?", options:["Intramuscular epinephrine in the lateral thigh","IV diphenhydramine alone","Inhaled albuterol alone","Oral prednisone"], answer:0, explanation:"IM epinephrine is first-line for anaphylaxis. Antihistamines and glucocorticoids are adjuncts and must not delay epinephrine.", source:"World Allergy Organization anaphylaxis guidance." },
  { id:"n06", specialty:"Obstetrics", vignette:"A 34-week pregnant patient has blood pressure 172/114 mm Hg, severe headache, visual scotomata, and proteinuria.", question:"Which immediate treatment is indicated while arranging definitive obstetric management?", options:["Magnesium sulfate and urgent treatment of severe hypertension","Discharge with outpatient blood-pressure checks","ACE inhibitor therapy","Delay treatment until a 24-hour urine collection is complete"], answer:0, explanation:"Preeclampsia with severe features requires seizure prophylaxis with magnesium sulfate, urgent control of severe-range blood pressure using pregnancy-appropriate agents, and delivery planning after stabilization.", source:"ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia." },
  { id:"n07", specialty:"Rheumatology", vignette:"A 76-year-old has new temporal headache, jaw claudication, elevated ESR, and transient visual loss.", question:"What should be done next?", options:["Start high-dose glucocorticoids immediately","Wait for temporal artery biopsy before treatment","Give a triptan","Obtain a lumbar puncture first"], answer:0, explanation:"Suspected giant cell arteritis with visual symptoms is an emergency. Start glucocorticoids immediately to prevent irreversible vision loss; arrange confirmatory testing promptly.", source:"ACR/Vasculitis Foundation guideline for giant cell arteritis." },
  { id:"n08", specialty:"Toxicology", vignette:"A patient taking warfarin presents with intracranial hemorrhage and an INR of 5.8.", question:"Which reversal strategy is preferred for life-threatening bleeding?", options:["Four-factor prothrombin complex concentrate plus IV vitamin K","Oral vitamin K only","Protamine sulfate","Idarucizumab"], answer:0, explanation:"For life-threatening warfarin-associated bleeding, rapidly replace vitamin-K-dependent clotting factors with four-factor PCC and give IV vitamin K for sustained reversal.", source:"ACC Expert Consensus Decision Pathway on Management of Bleeding in Patients on Oral Anticoagulants." },
  { id:"n09", specialty:"Surgery", vignette:"A 22-year-old has abrupt severe unilateral testicular pain, a high-riding testis, and absent cremasteric reflex. Clinical suspicion for torsion is high.", question:"What is the next step?", options:["Immediate urologic exploration and detorsion","Wait for urine culture","Treat empirically for epididymitis","Schedule outpatient ultrasound next week"], answer:0, explanation:"High clinical suspicion for testicular torsion requires immediate surgical evaluation. Imaging should not delay exploration when the presentation is classic.", source:"AUA educational materials and standard emergency surgery references." },
  { id:"n10", specialty:"Obstetrics", vignette:"Immediately after vaginal delivery, a patient has heavy bleeding. The uterus is enlarged and boggy; the placenta appears complete.", question:"What is the immediate first response?", options:["Uterine massage and oxytocin","Immediate hysterectomy","Methotrexate","Observation for 30 minutes"], answer:0, explanation:"Uterine atony is the most common cause of postpartum hemorrhage. Begin uterine massage and uterotonic treatment while simultaneously activating the hemorrhage response and assessing the patient.", source:"ACOG Practice Bulletin: Postpartum Hemorrhage." },
  { id:"n11", specialty:"Emergency", vignette:"A patient with suspected bacterial meningitis has fever, neck stiffness, altered mental status, and a new focal neurologic deficit.", question:"What is the safest next sequence?", options:["Blood cultures, immediate empiric antibiotics, then head CT before lumbar puncture","Lumbar puncture immediately before any treatment","Wait for MRI before antibiotics","Give corticosteroids only and reassess tomorrow"], answer:0, explanation:"A focal neurologic deficit is an indication for neuroimaging before LP. Obtain blood cultures and start empiric antibiotics promptly; do not delay treatment while waiting for imaging.", source:"IDSA practice guideline for healthcare-associated ventriculitis/meningitis and standard community-acquired meningitis guidance." },
  { id:"n12", specialty:"Emergency", vignette:"A patient with pneumonia has persistent hypotension after initial assessment, lactate 5.1 mmol/L, and signs of poor perfusion.", question:"Which intervention is a key immediate priority?", options:["Prompt IV crystalloid resuscitation with repeated reassessment","Restrict all fluids","Wait for blood cultures to result","Begin oral antibiotics and discharge"], answer:0, explanation:"Septic shock requires prompt resuscitation, early antimicrobials, and repeated assessment of perfusion and fluid responsiveness. The precise fluid strategy should follow current sepsis guidance and patient context.", source:"Surviving Sepsis Campaign International Guidelines." },
  { id:"n13", specialty:"Pulmonology", vignette:"A 23-year-old with asthma has severe wheezing, accessory muscle use, and oxygen saturation of 90% on room air. He can speak only in short phrases.", question:"Which initial treatment is appropriate?", options:["Inhaled short-acting beta agonist plus ipratropium and systemic glucocorticoid","Long-acting beta agonist alone","Antibiotics alone","Routine sedative therapy"], answer:0, explanation:"A severe acute asthma exacerbation is treated with repeated inhaled SABA, addition of ipratropium for severe disease, oxygen as needed, and early systemic glucocorticoids.", source:"GINA Global Strategy for Asthma Management and Prevention." },
  { id:"n14", specialty:"Cardiology", vignette:"A 64-year-old with possible acute coronary syndrome arrives in the emergency department with ongoing chest pressure.", question:"What should be obtained promptly, ideally within 10 minutes?", options:["12-lead ECG","Exercise stress test","Coronary calcium score","Outpatient echocardiogram"], answer:0, explanation:"A 12-lead ECG should be obtained rapidly in suspected ACS to identify STEMI and guide immediate management.", source:"ACC/AHA acute coronary syndrome guidance." },
  { id:"n15", specialty:"Endocrinology", vignette:"A patient with symptomatic hypercalcemia has confusion, dehydration, constipation, and a serum calcium of 14.2 mg/dL.", question:"What is the initial management priority?", options:["IV isotonic saline hydration","Fluid restriction","Oral calcium supplementation","Immediate thyroid hormone"], answer:0, explanation:"Volume depletion is common in severe hypercalcemia. Begin IV isotonic fluid repletion while evaluating the cause and considering additional calcium-lowering treatment.", source:"Endocrine Society guidance and standard inpatient endocrinology references." },
  { id:"n16", specialty:"Obstetrics", vignette:"During delivery, the fetal head delivers but retracts against the perineum. The shoulders do not deliver with gentle traction.", question:"What is the initial maneuver?", options:["McRoberts maneuver with suprapubic pressure as appropriate","Fundal pressure","Forceful downward traction on the fetal head","Immediate cesarean after full delivery of the head"], answer:0, explanation:"Shoulder dystocia is an obstetric emergency. Call for help and use McRoberts positioning with suprapubic pressure as an initial maneuver; avoid fundal pressure and excessive traction.", source:"ACOG Practice Bulletin: Shoulder Dystocia." },
  { id:"n17", specialty:"Neurology", vignette:"A patient with a suspected aneurysmal subarachnoid hemorrhage is diagnosed on CT. Blood pressure is being controlled and neurosurgery is involved.", question:"Which medication is commonly used to reduce delayed cerebral ischemia risk?", options:["Nimodipine","Alteplase","Warfarin","Sumatriptan"], answer:0, explanation:"Enteral nimodipine is recommended in aneurysmal subarachnoid hemorrhage to improve neurologic outcomes by reducing delayed cerebral ischemia risk.", source:"AHA/ASA Guideline for Aneurysmal Subarachnoid Hemorrhage." },
  { id:"n18", specialty:"Nephrology", vignette:"A patient with DKA has potassium 5.4 mEq/L, normal renal output, and no ECG changes. Insulin infusion is being initiated.", question:"What should be anticipated during treatment?", options:["Frequent potassium monitoring and replacement as levels fall","No potassium monitoring is needed","Potassium will continue to rise with insulin","Routine potassium restriction for the entire admission"], answer:0, explanation:"Total-body potassium is depleted in DKA even when serum potassium is initially normal or high. Insulin and correction of acidosis lower serum potassium; monitor frequently and replace according to protocol.", source:"International consensus report on hyperglycemic crises in adults." },
  { id:"n19", specialty:"Pediatrics", vignette:"A newborn remains apneic after initial warming, positioning, drying, and stimulation. Heart rate is 80/min.", question:"What is the next step in neonatal resuscitation?", options:["Positive-pressure ventilation","Chest compressions immediately","Routine naloxone","Wait another 5 minutes"], answer:0, explanation:"Apnea or gasping, or a heart rate below 100/min after initial steps, indicates prompt positive-pressure ventilation. Effective ventilation is the key intervention in neonatal resuscitation.", source:"AAP Neonatal Resuscitation Program." },
  { id:"n20", specialty:"Emergency", vignette:"A patient has a painful red eye, blurred vision with halos, a fixed mid-dilated pupil, and markedly elevated intraocular pressure.", question:"What is the best next action?", options:["Urgent ophthalmology consultation and immediate pressure-lowering therapy","Routine outpatient follow-up in one month","Topical anesthetic alone","Patch the eye and discharge"], answer:0, explanation:"Acute angle-closure glaucoma threatens vision and requires immediate pressure reduction and urgent ophthalmology management, followed by definitive treatment.", source:"American Academy of Ophthalmology Preferred Practice Pattern: Primary Angle Closure." }
];

export const labPrompts: LabPrompt[] = [
  {id:"l01",prompt:"Normal arterial blood pH midpoint",value:7.40,tolerance:0.04,unit:"",context:"Typical reference interval is approximately 7.35–7.45.",source:"Standard arterial blood gas reference intervals."},
  {id:"l02",prompt:"Normal PaCO₂ midpoint",value:40,tolerance:4,unit:"mmHg",context:"Typical reference interval is approximately 35–45 mmHg.",source:"Standard arterial blood gas reference intervals."},
  {id:"l03",prompt:"Normal serum bicarbonate midpoint",value:24,tolerance:3,unit:"mEq/L",context:"Typical reference interval is approximately 22–26 mEq/L.",source:"Standard metabolic panel reference intervals."},
  {id:"l04",prompt:"Normal serum sodium midpoint",value:140,tolerance:3,unit:"mEq/L",context:"Typical adult reference interval is approximately 135–145 mEq/L.",source:"Standard metabolic panel reference intervals."},
  {id:"l05",prompt:"Normal serum potassium midpoint",value:4.0,tolerance:0.5,unit:"mEq/L",context:"Typical adult reference interval is approximately 3.5–5.0 mEq/L.",source:"Standard metabolic panel reference intervals."},
  {id:"l06",prompt:"Normal total serum calcium midpoint",value:9.5,tolerance:0.7,unit:"mg/dL",context:"Typical adult reference interval is approximately 8.5–10.5 mg/dL; albumin affects total calcium.",source:"Standard metabolic panel reference intervals."},
  {id:"l07",prompt:"Normal serum magnesium midpoint",value:2.0,tolerance:0.3,unit:"mg/dL",context:"Typical adult reference interval is approximately 1.7–2.2 mg/dL.",source:"Standard clinical chemistry reference intervals."},
  {id:"l08",prompt:"Normal chloride midpoint",value:102,tolerance:4,unit:"mEq/L",context:"Typical adult reference interval is approximately 98–106 mEq/L.",source:"Standard metabolic panel reference intervals."},
  {id:"l09",prompt:"Normal fasting plasma glucose midpoint",value:90,tolerance:10,unit:"mg/dL",context:"Normal fasting glucose is below 100 mg/dL.",source:"American Diabetes Association Standards of Care."},
  {id:"l10",prompt:"Diagnostic fasting glucose threshold for diabetes",value:126,tolerance:0,unit:"mg/dL",context:"A fasting plasma glucose of at least 126 mg/dL meets a diagnostic criterion; confirm in the absence of unequivocal hyperglycemia.",source:"American Diabetes Association Standards of Care."},
  {id:"l11",prompt:"HbA1c threshold for diabetes",value:6.5,tolerance:0,unit:"%",context:"An HbA1c of at least 6.5% is a diagnostic criterion using an NGSP-certified method.",source:"American Diabetes Association Standards of Care."},
  {id:"l12",prompt:"Normal anion gap: a commonly taught midpoint",value:12,tolerance:3,unit:"mEq/L",context:"Often taught as about 8–12 mEq/L without potassium; laboratory ranges vary.",source:"Standard acid-base interpretation references."},
  {id:"l13",prompt:"Normal serum creatinine: approximate adult midpoint",value:0.9,tolerance:0.3,unit:"mg/dL",context:"Reference intervals vary by muscle mass, age, sex, and laboratory.",source:"Standard clinical chemistry reference intervals."},
  {id:"l14",prompt:"Normal BUN: approximate midpoint",value:15,tolerance:5,unit:"mg/dL",context:"Typical adult reference interval is approximately 7–20 mg/dL.",source:"Standard clinical chemistry reference intervals."},
  {id:"l15",prompt:"Normal platelet count: approximate midpoint",value:250,tolerance:40,unit:"×10³/µL",context:"Typical adult reference interval is approximately 150–400 ×10³/µL.",source:"Standard CBC reference intervals."},
  {id:"l16",prompt:"Normal WBC count: approximate midpoint",value:7.5,tolerance:1.5,unit:"×10³/µL",context:"Typical adult reference interval is approximately 4.0–11.0 ×10³/µL.",source:"Standard CBC reference intervals."},
  {id:"l17",prompt:"Normal adult hemoglobin: approximate teaching value",value:14,tolerance:1.5,unit:"g/dL",context:"Normal ranges vary by sex, age, pregnancy, altitude, and laboratory.",source:"Standard CBC reference intervals."},
  {id:"l18",prompt:"Normal lactate: upper limit commonly used",value:2,tolerance:0,unit:"mmol/L",context:"A lactate above 2 mmol/L is often considered elevated; interpret with clinical context.",source:"Surviving Sepsis Campaign and standard laboratory references."},
  {id:"l19",prompt:"CSF opening pressure: approximate normal adult midpoint",value:17,tolerance:4,unit:"cm H₂O",context:"Commonly cited normal adult range is about 6–25 cm H₂O, depending on technique and patient factors.",source:"Standard neurology references."},
  {id:"l20",prompt:"Normal CSF protein: approximate upper reference value",value:45,tolerance:10,unit:"mg/dL",context:"Typical adult CSF protein is roughly 15–45 mg/dL; age and lab matter.",source:"Standard CSF laboratory references."},
  {id:"l21",prompt:"Normal CSF glucose: approximate midpoint",value:60,tolerance:10,unit:"mg/dL",context:"CSF glucose is often about 60% of serum glucose; compare with paired serum.",source:"Standard CSF laboratory references."},
  {id:"l22",prompt:"Normal serum osmolality: approximate midpoint",value:290,tolerance:5,unit:"mOsm/kg",context:"Typical reference interval is about 275–295 mOsm/kg.",source:"Standard clinical chemistry references."},
  {id:"l23",prompt:"PaO₂ at sea level on room air: approximate healthy adult value",value:95,tolerance:10,unit:"mmHg",context:"Varies with age, altitude, and inspired oxygen concentration.",source:"Standard arterial blood gas references."},
  {id:"l24",prompt:"Normal TSH: approximate midpoint",value:2.5,tolerance:1,unit:"mIU/L",context:"Typical reference interval is around 0.4–4.0 mIU/L, with assay and population variation.",source:"American Thyroid Association and standard laboratory references."},
  {id:"l25",prompt:"Normal total bilirubin: approximate midpoint",value:0.8,tolerance:0.4,unit:"mg/dL",context:"Common adult reference range is roughly 0.2–1.2 mg/dL.",source:"Standard liver chemistry reference intervals."},
  {id:"l26",prompt:"Normal INR in a person not taking anticoagulants",value:1.0,tolerance:0.15,unit:"",context:"Usually approximately 0.8–1.2, depending on laboratory.",source:"Standard coagulation reference intervals."},
  {id:"l27",prompt:"Normal resting adult heart rate: midpoint",value:75,tolerance:15,unit:"beats/min",context:"Commonly cited adult resting range is 60–100 beats/min.",source:"Standard vital-sign reference ranges."},
  {id:"l28",prompt:"Normal adult respiratory rate: midpoint",value:16,tolerance:4,unit:"breaths/min",context:"Commonly cited adult resting range is 12–20 breaths/min.",source:"Standard vital-sign reference ranges."},
  {id:"l29",prompt:"Normal body temperature in Celsius: approximate oral value",value:37,tolerance:0.5,unit:"°C",context:"Normal temperature varies by time of day, measurement site, and person.",source:"Standard vital-sign references."},
  {id:"l30",prompt:"Classic threshold for severe hypertension in pregnancy",value:160,tolerance:0,unit:"mmHg systolic",context:"Systolic BP ≥160 mmHg or diastolic BP ≥110 mmHg is severe range and requires urgent assessment/treatment.",source:"ACOG guidance on hypertensive disorders of pregnancy."}
];

export const microbePacks = [
  { name:"Gram-positive cocci", words:["STAPH","STREP","ENTERO","PNEUMO","AUREUS","PYOGENES"] },
  { name:"Respiratory pathogens", words:["INFLUENZA","LEGIONELLA","MYCOPLASMA","PERTUSSIS","PNEUMOCOCCUS","RSV"] },
  { name:"Fungi and opportunists", words:["CANDIDA","ASPERGILLUS","CRYPTOCOCCUS","HISTOPLASMA","PNEUMOCYSTIS","MUCOR"] },
  { name:"Enteric pathogens", words:["SALMONELLA","SHIGELLA","CAMPYLOBACTER","YERSINIA","VIBRIO","GIARDIA"] },
  { name:"Classic organisms", words:["BORRELIA","RICKETTSIA","TREponema","CHLAMYDIA","GONOCOCCUS","BRUCELLA"] },
  { name:"Hospital-associated", words:["PSEUDOMONAS","ACINETOBACTER","ENTEROCOCCUS","CLOSTRIDIUM","KLEBSIELLA","SERRATIA"] },
  { name:"Viruses", words:["ADENOVIRUS","NOROVIRUS","ROTAVIRUS","RABIES","VARICELLA","PARVOVIRUS"] },
  { name:"Parasites", words:["TOXOPLASMA","TRYPANOSOMA","LEISHMANIA","SCHISTOSOMA","ENTAMOEBA","ECHINOCOCCUS"] }
];

export const pairsBank = [
  ["Naloxone","Opioid receptor antagonist"],["Flumazenil","Benzodiazepine receptor antagonist"],["Fomepizole","Alcohol dehydrogenase inhibitor"],["N-acetylcysteine","Acetaminophen toxicity antidote"],["Protamine","Heparin reversal"],["Idarucizumab","Dabigatran reversal"],
  ["Warfarin","Vitamin K antagonist"],["Apixaban","Factor Xa inhibitor"],["Clopidogrel","P2Y12 receptor inhibitor"],["Aspirin","Irreversible COX inhibitor"],["Hydroxyurea","Increases HbF production"],["Desmopressin","Raises vWF and factor VIII release"],
  ["CN III","Oculomotor"],["CN IV","Trochlear"],["CN VI","Abducens"],["CN VIII","Vestibulocochlear"],["CN X","Vagus"],["CN XII","Hypoglossal"],
  ["Broca area","Nonfluent expressive aphasia"],["Wernicke area","Fluent receptive aphasia"],["Substantia nigra","Dopamine-producing neurons"],["Hippocampus","Memory consolidation"],["Cerebellum","Coordination and balance"],["Amygdala","Fear and emotional processing"],
  ["Cushing syndrome","Excess cortisol"],["Addison disease","Primary adrenal insufficiency"],["Conn syndrome","Primary hyperaldosteronism"],["Graves disease","TSH-receptor stimulating antibodies"],["Hashimoto thyroiditis","Autoimmune hypothyroidism"],["Pheochromocytoma","Catecholamine-secreting tumor"],
  ["Roth spots","Retinal hemorrhages with pale centers"],["Janeway lesions","Painless palm/sole lesions in endocarditis"],["Osler nodes","Tender digital nodules in endocarditis"],["Koplik spots","Measles enanthem"],["Café-au-lait macules","Neurofibromatosis type 1 association"],["Kayser-Fleischer rings","Copper deposition in Wilson disease"],
  ["Anti-CCP","Rheumatoid arthritis"],["Anti-dsDNA","Systemic lupus erythematosus"],["Anti-centromere","Limited cutaneous systemic sclerosis"],["Anti-Scl-70","Diffuse systemic sclerosis"],["Anti-Jo-1","Antisynthetase syndrome"],["Anti-mitochondrial","Primary biliary cholangitis"],
  ["Ethylene glycol","Calcium oxalate crystals"],["Methanol","Visual toxicity"],["Carbon monoxide","Carboxyhemoglobin"],["Organophosphate","Cholinergic excess"],["Cyanide","Cytochrome c oxidase inhibition"],["Lead","Basophilic stippling"],
  ["Auer rods","Acute myeloid leukemia"],["Smudge cells","Chronic lymphocytic leukemia"],["Philadelphia chromosome","BCR-ABL fusion"],["Reed-Sternberg cells","Classical Hodgkin lymphoma"]
];

export const triageCases = [
  { id:"t01", title:"Unresponsive patient", scenario:"An adult is found unresponsive. You are first at the bedside.", steps:["Check scene safety and responsiveness; call for help.","Assess airway and breathing; provide basic airway support.","Check pulse and begin CPR if pulseless.","Attach monitor/AED and follow rhythm-directed resuscitation."] },
  { id:"t02", title:"Suspected anaphylaxis", scenario:"A patient becomes wheezy and hypotensive minutes after a medication.", steps:["Recognize anaphylaxis and summon help.","Give intramuscular epinephrine promptly.","Position safely, provide oxygen, and establish IV access with fluids as indicated.","Reassess airway, breathing, circulation, and response; arrange observation."] },
  { id:"t03", title:"Acute stroke", scenario:"A patient develops sudden aphasia and unilateral arm weakness.", steps:["Establish last-known-well time and activate stroke pathway.","Check bedside glucose and stabilize airway/breathing/circulation.","Obtain urgent noncontrast head CT.","Determine reperfusion eligibility and proceed without avoidable delay."] },
  { id:"t04", title:"Postpartum hemorrhage", scenario:"Following delivery, the uterus is boggy and bleeding is heavy.", steps:["Call for help and activate the postpartum hemorrhage response.","Begin uterine massage and administer oxytocin.","Assess cause and resuscitate with access, labs, and blood products as indicated.","Escalate to additional uterotonics or procedural management when needed."] },
  { id:"t05", title:"Convulsive status", scenario:"A patient has ongoing generalized convulsions for more than five minutes.", steps:["Protect from injury and call for resuscitation support.","Assess airway, breathing, circulation, and check glucose.","Administer an appropriate benzodiazepine promptly.","Give a longer-acting antiseizure medication if seizures persist; investigate cause."] },
  { id:"t06", title:"DKA with low potassium", scenario:"A patient has DKA and serum potassium is 2.8 mEq/L.", steps:["Begin IV fluid resuscitation and cardiac monitoring as appropriate.","Replace potassium until it is safe to start insulin.","Start insulin infusion once potassium is above the protocol threshold.","Monitor glucose, potassium, acid-base status, and transition when resolved."] },
  { id:"t07", title:"Septic shock", scenario:"A patient with suspected infection is hypotensive with poor perfusion.", steps:["Recognize shock and begin immediate assessment/resuscitation.","Obtain cultures promptly if this does not delay therapy.","Administer appropriate broad-spectrum antimicrobials early.","Give IV crystalloid with repeated reassessment; add vasopressor if hypotension persists."] },
  { id:"t08", title:"Suspected meningitis", scenario:"A febrile patient has neck stiffness, confusion, and a focal neurologic deficit.", steps:["Stabilize and obtain blood cultures promptly.","Start empiric antimicrobial therapy without waiting for imaging.","Obtain head CT because a focal deficit is present before lumbar puncture.","Perform lumbar puncture when safe and tailor therapy to results."] },
  { id:"t09", title:"Shoulder dystocia", scenario:"The fetal head has delivered but retracts and the shoulders are impacted.", steps:["Announce shoulder dystocia and call for additional help.","Ask the patient to stop pushing and position with McRoberts maneuver.","Apply suprapubic pressure; avoid fundal pressure and excessive traction.","Proceed through additional trained maneuvers if unresolved; document and assess newborn/mother."] },
  { id:"t10", title:"Major trauma", scenario:"A patient arrives after a high-speed collision with external bleeding.", steps:["Ensure scene/team safety and use appropriate protection.","Control catastrophic external hemorrhage.","Assess airway with cervical spine protection and assess breathing.","Assess circulation/disability/exposure and treat immediately life-threatening injuries."] },
  { id:"t11", title:"Acute coronary syndrome", scenario:"A patient has ongoing chest pressure and diaphoresis.", steps:["Assess stability and obtain a 12-lead ECG promptly.","Give aspirin if no contraindication and initiate ACS pathway.","Identify STEMI or high-risk findings and arrange urgent reperfusion/consultation.","Continue monitoring, serial assessment, and definitive risk-directed care."] },
  { id:"t12", title:"Neonatal resuscitation", scenario:"A newborn remains apneic after initial warming, positioning, drying, and stimulation.", steps:["Complete initial steps and assess breathing and heart rate.","Begin positive-pressure ventilation for apnea/gasping or heart rate below 100/min.","Check chest movement and heart-rate response; correct ventilation technique if needed.","Begin coordinated compressions and advanced steps only if heart rate remains below 60/min after effective ventilation."] }
];

medleWords.push(...medleWordsExpansion.filter((word) => !medleWords.includes(word)));






labPrompts.push(...labPromptsExpansion2);
pairsBank.push(...pairsBankExpansion2);
triageCases.push(...triageCasesExpansion);
connectionPuzzles.push(...connectionPuzzlesExpansion, ...connectionPuzzlesExpansion2, ...connectionPuzzlesExpansion3, ...connectionPuzzlesExpansion4, ...connectionPuzzlesExpansion5);
diagnosisCases.push(...diagnosisCasesExpansion);
nextStepCases.push(...nextStepCasesExpansion, ...nextStepCasesExpansion2, ...nextStepCasesExpansion3, ...nextStepCasesExpansion4, ...nextStepCasesExpansion5);
labPrompts.push(...labPromptsExpansion);
pairsBank.push(...pairsBankExpansion);
microbePacks.push(...microbePacksExpansion, ...microbePacksExpansion2);

export const gameContentCounts = {
  medleAnswers: medleWords.length,
  connectionsBoards: connectionPuzzles.length,
  connectionCategories: connectionPuzzles.reduce((n, board) => n + board.length, 0),
  diagnosisCases: diagnosisCases.length,
  nextStepCases: nextStepCases.length,
  labPrompts: labPrompts.length,
  memoryPairs: pairsBank.length,
  microbeTopics: microbePacks.length,
  triageScenarios: triageCases.length
};
