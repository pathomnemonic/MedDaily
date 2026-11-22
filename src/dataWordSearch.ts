export interface WordSearchTheme {
  id: string;
  name: string;
  hint: string;
  words: string[];
}

export const wordSearchThemes: WordSearchTheme[] = [
  { id: "cardiology", name: "Heart of the Matter", hint: "Trace the structures, findings, and conditions that keep circulation moving.", words: ["HEART","AORTA","VALVE","PULSE","MURMUR","STENT","SHOCK","EDEMA","THROMBUS","ISCHEMIA","ARRHYTHMIA","CARDIAC"] },
  { id: "pulmonology", name: "Breathless", hint: "Find the structures and disorders involved in breathing and gas exchange.", words: ["LUNG","AIRWAY","ASTHMA","COPD","PLEURA","EFFUSION","HYPOXIA","APNEA","BRONCHUS","PNEUMONIA","OXYGEN","VENTILATION"] },
  { id: "neurology", name: "Neural Pathways", hint: "Search for the cells, structures, and syndromes of the nervous system.", words: ["BRAIN","CORTEX","AXON","MYELIN","SEIZURE","STROKE","ATAXIA","APHASIA","NEURON","DEMENTIA","MENINGES","SYNAPSE"] },
  { id: "endocrine", name: "Hormone Signals", hint: "Locate the glands, hormones, and metabolic conditions.", words: ["THYROID","INSULIN","CORTISOL","PITUITARY","ADRENAL","GLUCAGON","DIABETES","KETONES","GOITER","HYPERGLYCEMIA","HYPOGLYCEMIA","HORMONE"] },
  { id: "infectious", name: "Microbe Hunt", hint: "Find organisms, immune defenses, and antimicrobial concepts.", words: ["BACTERIA","VIRUS","FUNGUS","PARASITE","SEPSIS","CULTURE","ANTIBODY","VACCINE","ANTIBIOTIC","RESISTANCE","FEVER","ISOLATION"] },
  { id: "gastro", name: "Digestive Tract", hint: "Follow the organs and processes of digestion.", words: ["STOMACH","LIVER","PANCREAS","COLON","ESOPHAGUS","GALLBLADDER","ASCITES","JAUNDICE","PERISTALSIS","HERNIA","ULCER","VARICES"] },
  { id: "nephrology", name: "Renal Reserve", hint: "Search the nephron, renal tests, and common kidney findings.", words: ["KIDNEY","NEPHRON","GLOMERULUS","CREATININE","DIALYSIS","PROTEINURIA","HEMATURIA","URETER","OSMOLALITY","POTASSIUM","SODIUM","CASTS"] },
  { id: "obgyn", name: "Maternal Health", hint: "Find reproductive anatomy, pregnancy, and obstetric complications.", words: ["OVARY","UTERUS","CERVIX","PLACENTA","FETUS","LABOR","ECTOPIC","PREECLAMPSIA","POSTPARTUM","ENDOMETRIOSIS","MENOPAUSE","AMNIOTIC"] },
  { id: "pediatrics", name: "Growing Up", hint: "Look for neonatal findings, milestones, and pediatric conditions.", words: ["INFANT","NEONATE","VACCINE","FONTANELLE","MILESTONE","GROWTH","JAUNDICE","CROUP","KAWASAKI","BRONCHIOLITIS","RASH","APGAR"] },
  { id: "dermatology", name: "Under the Surface", hint: "Find skin layers, lesions, and dermatologic diagnoses.", words: ["DERMIS","EPIDERMIS","MELANOMA","PSORIASIS","ECZEMA","URTICARIA","CELLULITIS","VESICLE","PLAQUE","PETECHIAE","PRURITUS","KERATOSIS"] },
  { id: "pharmacology", name: "Drug Mechanisms", hint: "Search for the language of drug action, metabolism, and safety.", words: ["AGONIST","ANTAGONIST","RECEPTOR","TOXICITY","HALFLIFE","METABOLISM","CYTOCHROME","DOSE","ANTIDOTE","TOLERANCE","POTENCY","CLEARANCE"] },
  { id: "hematology", name: "Blood and Marrow", hint: "Find the cells, proteins, and processes involved in blood disorders.", words: ["PLATELET","HEMOGLOBIN","RETICULOCYTE","NEUTROPHIL","LYMPHOCYTE","ANEMIA","HEMOLYSIS","COAGULATION","THROMBOSIS","FERRITIN","MARROW","TRANSFUSION"] },
  { id: "emergency", name: "First Response", hint: "Locate the threats and interventions encountered in acute care.", words: ["TRAUMA","SHOCK","SEIZURE","ANAPHYLAXIS","TAMPONADE","TENSION","FRACTURE","HEMORRHAGE","AIRWAY","DEFIBRILLATION","BURNS","TRIAGE"] },
  { id: "rheumatology", name: "Inflammatory Signals", hint: "Find autoimmune, inflammatory, and crystal-associated conditions.", words: ["LUPUS","ARTHRITIS","VASCULITIS","GOUT","MYOSITIS","SCLERODERMA","SYNOVITIS","TOPHUS","RAYNAUD","ANKYLOSIS","ENTHESITIS","POLYMYALGIA"] },
  { id: "ophthalmology", name: "Sight Lines", hint: "Search the structures and disorders of vision.", words: ["RETINA","CORNEA","PUPIL","LENS","GLAUCOMA","CATARACT","UVEITIS","MACULA","OPTIC","DIPLOPIA","SCLERA","VITREOUS"] },
  { id: "otolaryngology", name: "Head and Neck", hint: "Find the structures and conditions of hearing, balance, and the upper airway.", words: ["COCHLEA","LARYNX","PHARYNX","TONSIL","OTITIS","SINUS","VERTIGO","TYMPANUM","MASTOID","EPIGLOTTIS","RHINITIS","TINNITUS"] },
  { id: "anatomy", name: "Anatomy Atlas", hint: "Locate bones, connective tissues, and structural landmarks.", words: ["FEMUR","HUMERUS","TIBIA","ULNA","SCAPULA","CLAVICLE","PATELLA","VERTEBRA","TENDON","LIGAMENT","MENISCUS","CARTILAGE"] },
  { id: "laboratory", name: "The Lab Bench", hint: "Search common analytes and measurements used in clinical medicine.", words: ["SODIUM","POTASSIUM","CREATININE","ALBUMIN","BILIRUBIN","LACTATE","TROPONIN","FERRITIN","GLUCOSE","OSMOLALITY","AMMONIA","MAGNESIUM"] },
  { id: "biostatistics", name: "Evidence Search", hint: "Find the terms used to interpret clinical studies and diagnostic tests.", words: ["COHORT","RANDOMIZE","BLINDING","SENSITIVITY","SPECIFICITY","PREVALENCE","INCIDENCE","CONFIDENCE","HAZARD","PVALUE","ODDSRATIO","RISKFACTOR"] },
  { id: "psychiatry", name: "Mind and Behavior", hint: "Search symptoms, syndromes, and neurochemical concepts.", words: ["DELIRIUM","DEPRESSION","ANXIETY","MANIA","PSYCHOSIS","HALLUCINATION","COMPULSION","TRAUMA","INSOMNIA","SEROTONIN","AGITATION","COGNITION"] },
  { id: "surgery", name: "In the Operating Room", hint: "Find the procedures, instruments, and principles of operative care.", words: ["INCISION","SUTURE","HEMOSTASIS","ANASTOMOSIS","DEBRIDEMENT","LAPAROSCOPY","DRAINAGE","GRAFT","STERILE","NECROSIS","RETRACTOR","HERNIA"] },
  { id: "criticalcare", name: "Critical Signals", hint: "Locate the tools and physiology of intensive care.", words: ["VENTILATOR","PRESSOR","LACTATE","ARDS","SEDATION","INTUBATION","ECMO","PERFUSION","SHOCK","CAPNOGRAPHY","PRONE","VASOPRESSOR"] },
  { id: "geriatrics", name: "Healthy Aging", hint: "Find common geriatric syndromes and functional measures.", words: ["DELIRIUM","DEMENTIA","FALLS","FRAILTY","POLYPHARMACY","OSTEOPOROSIS","SARCOPENIA","INCONTINENCE","MOBILITY","COGNITION","HEARING","VISION"] },
  { id: "radiology", name: "Imaging Suite", hint: "Search imaging modalities, findings, and radiologic descriptors.", words: ["XRAY","CTSCAN","MRI","ULTRASOUND","CONTRAST","DENSITY","SIGNAL","FRACTURE","OPACITY","EFFUSION","LESION","ATTENUATION"] },
  { id: "allergy", name: "Allergic Reactions", hint: "Find immune mediators, allergic patterns, and hypersensitivity terms.", words: ["ANAPHYLAXIS","URTICARIA","ANGIOEDEMA","ALLERGEN","HISTAMINE","MASTCELL","ATOPY","ALLERGY","RHINITIS","WHEAL","PRURITUS","IMMUNITY"] },
  { id: "pathology", name: "Tissue Evidence", hint: "Search the cellular changes and diagnoses seen in pathology.", words: ["BIOPSY","NECROSIS","FIBROSIS","GRANULOMA","METAPLASIA","DYSPLASIA","CARCINOMA","SARCOMA","AMYLOID","APOPTOSIS","MITOSIS","STAINING"] },
  { id: "urology", name: "Urinary Tract", hint: "Find the organs, symptoms, and disorders of the urinary system.", words: ["PROSTATE","BLADDER","URETER","URETHRA","TESTICLE","TORSION","HYDRONEPHROSIS","HEMATURIA","CYSTITIS","NEPHROLITH","RETENTION","VARICOCELE"] },
  { id: "orthopedics", name: "Bones and Joints", hint: "Search injuries, connective tissues, and musculoskeletal conditions.", words: ["FRACTURE","DISLOCATION","SPRAIN","STRAIN","COMPARTMENT","MENISCUS","ROTATORCUFF","TENDON","LIGAMENT","OSTEOMYELITIS","CARTILAGE","CAST"] },
  { id: "anesthesia", name: "Airway and Anesthesia", hint: "Find airway, sedation, and perioperative concepts.", words: ["INTUBATION","SEDATION","ANALGESIA","PARALYSIS","NEUROMUSCULAR","INDUCTION","EXTUBATION","CAPNOGRAPHY","AIRWAY","LIDOCAINE","PROPOFOL","KETAMINE"] },
  { id: "primarycare", name: "Prevention Clinic", hint: "Locate the tools and topics of longitudinal primary care.", words: ["SCREENING","VACCINE","PREVENTION","COUNSELING","WELLNESS","DIABETES","HYPERTENSION","DEPRESSION","SMOKING","OBESITY","NUTRITION","EXERCISE"] },
  { id: "internalmedicine", name: "Clinical Reasoning", hint: "Search the language of diagnosis, treatment, and longitudinal care.", words: ["DIAGNOSIS","SYMPTOM","CLINICAL","HISTORY","EXAMINATION","DIFFERENTIAL","PROGNOSIS","PREVENTION","SCREENING","TREATMENT","COMORBIDITY","MANAGEMENT"] },
  { id: "general", name: "Clinical Word Hunt", hint: "Find the everyday language of patient care.", words: ["PATIENT","DOCTOR","CLINIC","HOSPITAL","TREATMENT","DIAGNOSIS","HISTORY","EXAM","SYMPTOM","THERAPY","OUTCOME","RECOVERY"] }
];

const SPECIALTY_THEMES: Record<string, string[]> = {
  cardiology: ["cardiology", "emergency", "laboratory"],
  pulmonology: ["pulmonology", "criticalcare", "emergency"],
  neurology: ["neurology", "anatomy", "psychiatry"],
  endocrine: ["endocrine", "laboratory", "internalmedicine"],
  infectious: ["infectious", "allergy", "pathology"],
  gastro: ["gastro", "pathology", "internalmedicine"],
  nephrology: ["nephrology", "laboratory", "internalmedicine"],
  obgyn: ["obgyn", "emergency", "primarycare"],
  pediatrics: ["pediatrics", "infectious", "emergency"],
  dermatology: ["dermatology", "allergy", "pathology"],
  pharmacology: ["pharmacology", "criticalcare", "laboratory"],
  hemeonc: ["hematology", "pathology", "laboratory"],
  rheumatology: ["rheumatology", "pathology", "anatomy"],
  ophthalmology: ["ophthalmology", "anatomy", "emergency"],
  otolaryngology: ["otolaryngology", "anatomy", "emergency"],
  anatomy: ["anatomy", "orthopedics", "neurology"],
  biostatistics: ["biostatistics", "internalmedicine", "primarycare"],
  psychiatry: ["psychiatry", "geriatrics", "primarycare"],
  surgery: ["surgery", "anesthesia", "emergency"],
  criticalcare: ["criticalcare", "pulmonology", "emergency"],
  geriatrics: ["geriatrics", "psychiatry", "primarycare"],
  radiology: ["radiology", "anatomy", "emergency"],
  allergy: ["allergy", "infectious", "dermatology"],
  pathology: ["pathology", "hematology", "infectious"],
  urology: ["urology", "nephrology", "anatomy"],
  orthopedics: ["orthopedics", "anatomy", "emergency"],
  anesthesia: ["anesthesia", "criticalcare", "surgery"],
  familymed: ["primarycare", "general", "internalmedicine"],
  familymedicine: ["primarycare", "general", "internalmedicine"],
  internal: ["internalmedicine", "laboratory", "general"],
  internalmedicine: ["internalmedicine", "laboratory", "general"],
  emergency: ["emergency", "criticalcare", "radiology"]
};

export function getWordSearchTheme(seed: number, specialty = "general"): WordSearchTheme {
  const candidates = SPECIALTY_THEMES[specialty] ?? (specialty === "general" ? wordSearchThemes.map((theme) => theme.id) : ["general"]);
  const hash = Math.abs(Math.trunc(seed)) + specialty.length * 31;
  const id = candidates[hash % candidates.length];
  return wordSearchThemes.find((theme) => theme.id === id) ?? wordSearchThemes[wordSearchThemes.length - 1];
}
