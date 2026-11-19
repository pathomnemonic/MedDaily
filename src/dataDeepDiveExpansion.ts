import type { DeepPrompt } from "./dataArcade";

const LONG_DIVE_ALIASES: Record<string, string[]> = {
  "Amoxicillin-clavulanate": ["Augmentin"],
  "Ampicillin-sulbactam": ["Unasyn"],
  "Piperacillin-tazobactam": ["Zosyn"],
  "Trimethoprim-sulfamethoxazole": ["TMP-SMX", "Bactrim", "Septra"],
  "Ceftolozane-tazobactam": ["Zerbaxa"],
  "Ceftazidime-avibactam": ["Avycaz"],
  "Cytomegalovirus": ["CMV"],
  "Epstein-Barr virus": ["EBV"],
  "Respiratory syncytial virus": ["RSV"],
  "Human immunodeficiency virus": ["HIV"],
  "Staphylococcus aureus": ["S aureus", "Staph aureus"],
  "Idiopathic intracranial hypertension": ["Pseudotumor cerebri"],
  "Streptococcus pneumoniae": ["S pneumoniae", "Pneumococcus"],
  "Escherichia coli": ["E coli"],
  "Neisseria meningitidis": ["Meningococcus"],
  "Atorvastatin": ["Lipitor"],
  "Apixaban": ["Eliquis"],
  "Rivaroxaban": ["Xarelto"],
  "Warfarin": ["Coumadin"],
  "Clopidogrel": ["Plavix"],
  "Ticagrelor": ["Brilinta"],
  "Amlodipine": ["Norvasc"],
  "Lisinopril": ["Zestril", "Prinivil"],
  "Losartan": ["Cozaar"],
  "Metoprolol": ["Lopressor", "Toprol XL"],
  "Furosemide": ["Lasix"],
  "Spironolactone": ["Aldactone"],
  "Sacubitril-valsartan": ["Entresto"],
  "Empagliflozin": ["Jardiance"],
  "Dapagliflozin": ["Farxiga"],
  "Nitroglycerin": ["NTG"]
};

const longDive = (
  id: string,
  prompt: string,
  scope: string,
  explanation: string,
  tiers: [string[], string[], string[], string[], string[], string[]]
): DeepPrompt => ({
  id, prompt, scope, explanation, longTail: true,
  answers: tiers.flatMap((answers, index) => answers.map((answer) => ({
    answer, tier: (index + 1) as 1|2|3|4|5|6, aliases: LONG_DIVE_ALIASES[answer]
  })))
});

export const deepDiveLongTailExpansion: DeepPrompt[] = [
  longDive("long-antimicrobials","Name an antibacterial medication.","Pharmacology","The accepted set spans common first-line agents, resistant-organism therapies, and selected antimycobacterial drugs. Rarity tiers are editorial game weights, not prescribing guidance.",[
    ["Amoxicillin","Ampicillin","Penicillin G","Penicillin V","Cephalexin","Ceftriaxone","Azithromycin","Doxycycline","Ciprofloxacin","Trimethoprim-sulfamethoxazole"],
    ["Amoxicillin-clavulanate","Ampicillin-sulbactam","Piperacillin-tazobactam","Cefazolin","Cefuroxime","Cefdinir","Cefepime","Ceftazidime","Meropenem","Vancomycin"],
    ["Nafcillin","Oxacillin","Dicloxacillin","Cefpodoxime","Cefotaxime","Ceftaroline","Ertapenem","Imipenem-cilastatin","Aztreonam","Clindamycin"],
    ["Linezolid","Daptomycin","Tigecycline","Minocycline","Levofloxacin","Moxifloxacin","Gentamicin","Tobramycin","Amikacin","Metronidazole"],
    ["Rifampin","Rifabutin","Isoniazid","Pyrazinamide","Ethambutol","Nitrofurantoin","Fosfomycin","Fidaxomicin","Rifaximin","Colistin"],
    ["Tedizolid","Omadacycline","Eravacycline","Ceftolozane-tazobactam","Ceftazidime-avibactam","Cefiderocol","Dalbavancin","Oritavancin","Telavancin","Delafloxacin"]
  ]),
  longDive("long-pathogens","Name a microorganism that can cause human disease.","Microbiology","The accepted set spans bacteria, viruses, fungi, and parasites. Rarity tiers are editorial game weights and do not represent prevalence or clinical importance.",[
    ["Staphylococcus aureus","Streptococcus pyogenes","Streptococcus pneumoniae","Escherichia coli","Klebsiella pneumoniae","Pseudomonas aeruginosa","Neisseria meningitidis","Haemophilus influenzae","Mycobacterium tuberculosis","Candida albicans"],
    ["Enterococcus faecalis","Listeria monocytogenes","Salmonella enterica","Shigella sonnei","Campylobacter jejuni","Legionella pneumophila","Clostridioides difficile","Bacteroides fragilis","Enterobacter cloacae","Proteus mirabilis"],
    ["Bordetella pertussis","Corynebacterium diphtheriae","Bacillus anthracis","Vibrio cholerae","Yersinia pestis","Treponema pallidum","Borrelia burgdorferi","Rickettsia rickettsii","Chlamydia trachomatis","Mycoplasma pneumoniae"],
    ["Epstein-Barr virus","Cytomegalovirus","Varicella-zoster virus","Respiratory syncytial virus","Adenovirus","Norovirus","Rotavirus","Hepatitis B virus","Hepatitis C virus","Human immunodeficiency virus"],
    ["Aspergillus fumigatus","Cryptococcus neoformans","Histoplasma capsulatum","Coccidioides immitis","Pneumocystis jirovecii","Toxoplasma gondii","Plasmodium falciparum","Giardia duodenalis","Entamoeba histolytica","Strongyloides stercoralis"],
    ["Burkholderia pseudomallei","Elizabethkingia anophelis","Tropheryma whipplei","Kingella kingae","Capnocytophaga canimorsus","Pasteurella multocida","Aeromonas hydrophila","Scedosporium apiospermum","Balamuthia mandrillaris","Naegleria fowleri"]
  ]),
  longDive("long-cardiovascular-drugs","Name a medication used in cardiovascular care.","Cardiology","The accepted set includes antihypertensives, antiarrhythmics, antithrombotics, lipid-lowering agents, heart-failure therapies, and vasoactive drugs. Rarity tiers are editorial game weights.",[
    ["Amlodipine","Lisinopril","Losartan","Metoprolol","Carvedilol","Furosemide","Aspirin","Atorvastatin","Apixaban","Warfarin"],
    ["Valsartan","Sacubitril-valsartan","Spironolactone","Eplerenone","Empagliflozin","Dapagliflozin","Clopidogrel","Ticagrelor","Rivaroxaban","Diltiazem"],
    ["Verapamil","Hydralazine","Isosorbide mononitrate","Nitroglycerin","Chlorthalidone","Indapamide","Amiodarone","Sotalol","Flecainide","Propafenone"],
    ["Digoxin","Ivabradine","Milrinone","Dobutamine","Norepinephrine","Phenylephrine","Nitroprusside","Nicardipine","Clevidipine","Labetalol"],
    ["Dronedarone","Dofetilide","Procainamide","Adenosine","Eptifibatide","Tirofiban","Prasugrel","Bivalirudin","Argatroban","Evolocumab"],
    ["Alirocumab","Inclisiran","Bempedoic acid","Ezetimibe","Icosapent ethyl","Cangrelor","Cilostazol","Ranolazine","Pimobendan","Vericiguat"]
  ]),
  longDive("long-anesthesia","Name a medication used in anesthesia or perioperative care.","Anesthesiology","The set spans induction agents, inhaled anesthetics, local anesthetics, analgesics, neuromuscular blockers, reversal agents, and perioperative adjuncts. Rarity tiers are editorial.",[
    ["Propofol","Etomidate","Ketamine","Sevoflurane","Desflurane","Isoflurane","Nitrous oxide","Lidocaine","Bupivacaine","Fentanyl"],
    ["Rocuronium","Succinylcholine","Midazolam","Dexmedetomidine","Remifentanil","Morphine","Ondansetron","Dexamethasone","Neostigmine","Sugammadex"],
    ["Thiopental","Methohexital","Ropivacaine","Mepivacaine","Chloroprocaine","Tetracaine","Prilocaine","Articaine","Diazepam","Lorazepam"],
    ["Vecuronium","Cisatracurium","Atracurium","Pancuronium","Mivacurium","Sufentanil","Alfentanil","Glycopyrrolate","Droperidol","Metoclopramide"],
    ["Clonidine","Epinephrine","Phenylephrine","Ephedrine","Vasopressin","Ketorolac","Acetaminophen","Tranexamic acid","Aprepitant","Scopolamine"],
    ["Dantrolene","Flumazenil","Naloxone","Physostigmine","Methylene blue","Calcium chloride","Intralipid","Pyridostigmine","Caffeine citrate","Benzocaine"]
  ]),
  longDive("long-diagnostics","Name a laboratory test or diagnostic study.","Diagnostics","This prompt includes common laboratory panels, microbiology, cardiac testing, pulmonary studies, and imaging modalities. Rarity tiers are editorial rather than measures of clinical value.",[
    ["Complete blood count","Basic metabolic panel","Comprehensive metabolic panel","Urinalysis","Urine culture","Blood culture","Hemoglobin A1c","Lipid panel","Troponin","Electrocardiogram"],
    ["Prothrombin time","INR","aPTT","D-dimer","Fibrinogen","TSH","Free T4","BNP","NT-proBNP","Chest radiograph"],
    ["Liver function tests","Iron studies","Ferritin","Reticulocyte count","Peripheral blood smear","ESR","CRP","Arterial blood gas","Venous blood gas","Lactate"],
    ["Cerebrospinal fluid analysis","Lumbar puncture","Echocardiogram","Stress echocardiogram","Exercise treadmill test","Holter monitor","Pulmonary function tests","Spirometry","Bronchoscopy","Colonoscopy"],
    ["Upper endoscopy","Abdominal ultrasound","Renal ultrasound","Carotid duplex","CT angiography","CT pulmonary angiography","MRI brain","MR angiography","EEG","EMG"],
    ["Nerve conduction study","Polysomnography","DEXA scan","HIDA scan","Ventilation-perfusion scan","PET-CT","SPECT scan","Cystoscopy","Arthrocentesis","Bone marrow biopsy"]
  ]),
  longDive("long-endocrine-signals","Name a human hormone or endocrine signaling molecule.","Endocrinology","The accepted set includes pituitary, thyroid, adrenal, pancreatic, gonadal, renal, gastrointestinal, and calcium-regulating signals. Rarity tiers are editorial.",[
    ["Insulin","Glucagon","Cortisol","Aldosterone","Thyroxine","Triiodothyronine","Estrogen","Testosterone","Progesterone","Growth hormone"],
    ["Prolactin","Oxytocin","Vasopressin","TSH","ACTH","FSH","LH","Melatonin","Parathyroid hormone","Calcitonin"],
    ["Renin","Erythropoietin","Atrial natriuretic peptide","BNP","Leptin","Ghrelin","Adiponectin","Gastrin","Secretin","Cholecystokinin"],
    ["Somatostatin","GIP","GLP-1","Motilin","Peptide YY","Amylin","Thymosin","Thymopoietin","Inhibin","Activin"],
    ["DHEA","DHEA-S","Androstenedione","17-hydroxyprogesterone","Calcitriol","FGF23","Klotho","Prostaglandin E2","Endothelin","Angiotensin II"],
    ["Thyrotropin-releasing hormone","Corticotropin-releasing hormone","Gonadotropin-releasing hormone","Kisspeptin","Adrenomedullin","Osteocalcin","Irisin","Resistin","Orexin","Urocortin"]
  ]),
  longDive("long-anatomy","Name a named anatomical structure in the human body.","Anatomy","Accepted answers span organ systems, named bones, vessels, nerves, muscles, and brain structures. Rarity tiers are editorial game weights.",[
    ["Aorta","Femur","Humerus","Patella","Scapula","Clavicle","Sternum","Trachea","Esophagus","Diaphragm"],
    ["Hippocampus","Amygdala","Thalamus","Hypothalamus","Cerebellum","Pons","Medulla oblongata","Corpus callosum","Caudate nucleus","Putamen"],
    ["Circle of Willis","Internal carotid artery","Basilar artery","Middle cerebral artery","Anterior cerebral artery","Posterior cerebral artery","Portal vein","Hepatic artery","Renal artery","Inferior vena cava"],
    ["Brachial plexus","Sciatic nerve","Femoral nerve","Vagus nerve","Phrenic nerve","Median nerve","Ulnar nerve","Radial nerve","Optic chiasm","Lateral geniculate nucleus"],
    ["Glomerulus","Loop of Henle","Collecting duct","Adrenal cortex","Zona glomerulosa","Zona fasciculata","Zona reticularis","Islets of Langerhans","Sinoatrial node","Atrioventricular node"],
    ["Cavernous sinus","Foramen ovale","Internal capsule","Subthalamic nucleus","Substantia nigra","Red nucleus","Dentate nucleus","Locus coeruleus","Pineal gland","Organ of Corti"]
  ]),
  longDive("long-neurology","Name a neurologic disorder.","Neurology","The accepted set spans vascular, epileptic, movement, demyelinating, neuromuscular, infectious, headache, and neurodegenerative disorders. Rarity tiers are editorial.",[
    ["Ischemic stroke","Hemorrhagic stroke","Epilepsy","Migraine","Parkinson disease","Multiple sclerosis","Alzheimer disease","Myasthenia gravis","Guillain-Barré syndrome","Bell palsy"],
    ["Cluster headache","Tension-type headache","Trigeminal neuralgia","Essential tremor","Huntington disease","Amyotrophic lateral sclerosis","Dementia with Lewy bodies","Frontotemporal dementia","Normal pressure hydrocephalus","Idiopathic intracranial hypertension"],
    ["Cerebral venous sinus thrombosis","Subarachnoid hemorrhage","Subdural hematoma","Epidural hematoma","Transient ischemic attack","Status epilepticus","Absence epilepsy","Juvenile myoclonic epilepsy","Temporal lobe epilepsy","Infantile spasms"],
    ["Neuromyelitis optica","MOG antibody-associated disease","Chronic inflammatory demyelinating polyneuropathy","Charcot-Marie-Tooth disease","Spinal muscular atrophy","Duchenne muscular dystrophy","Facioscapulohumeral muscular dystrophy","Lambert-Eaton syndrome","Botulism","Tetanus"],
    ["Creutzfeldt-Jakob disease","Progressive supranuclear palsy","Multiple system atrophy","Corticobasal degeneration","Wilson disease","Friedreich ataxia","Spinocerebellar ataxia","Adrenoleukodystrophy","Subacute combined degeneration","Wernicke encephalopathy"],
    ["CADASIL","MELAS","Sturge-Weber syndrome","Tuberous sclerosis","Neurofibromatosis type 1","Neurofibromatosis type 2","Posterior reversible encephalopathy syndrome","Tolosa-Hunt syndrome","Susac syndrome","Rasmussen encephalitis"]
  ]),
  longDive("long-procedures","Name a surgical or invasive medical procedure.","Surgery","Accepted answers include common operations, endoscopic procedures, vascular interventions, and bedside procedures. Rarity tiers are editorial.",[
    ["Appendectomy","Cholecystectomy","Cesarean delivery","Hernia repair","Cataract surgery","Coronary artery bypass grafting","Percutaneous coronary intervention","Colonoscopy","Upper endoscopy","Lumbar puncture"],
    ["Thoracentesis","Paracentesis","Arthrocentesis","Central venous catheterization","Endotracheal intubation","Tracheostomy","Chest tube insertion","Dialysis catheter placement","Hemodialysis","Peritoneal dialysis"],
    ["Craniotomy","Laminectomy","Thyroidectomy","Mastectomy","Colectomy","Gastrectomy","Nephrectomy","Splenectomy","Hysterectomy","Prostatectomy"],
    ["Bronchoscopy","ERCP","Endoscopic ultrasound","Esophageal dilation","Endometrial biopsy","Hysteroscopy","Cystoscopy","Ureteroscopy","Lithotripsy","Arthroscopy"],
    ["Carotid endarterectomy","Surgical embolectomy","Mechanical thrombectomy","Aortic valve replacement","Transcatheter aortic valve replacement","Mitral valve repair","Pacemaker implantation","Implantable cardioverter-defibrillator placement","Radiofrequency ablation","Electrophysiology study"],
    ["Transsphenoidal surgery","Nissen fundoplication","Roux-en-Y gastric bypass","Sleeve gastrectomy","Bariatric revision","Pancreaticoduodenectomy","Lobectomy","Pneumonectomy","VATS","Extracorporeal membrane oxygenation cannulation"]
  ])

];
