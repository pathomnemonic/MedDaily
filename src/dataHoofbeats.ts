/**
 * Hoofbeats content: clinical prompts where every valid answer has an approximate real-world share (percent) of its
 * category, and an answer scores ten points per percent. Common answers ("horses") score a lot; rare ones ("zebras") almost
 * nothing. Shares are editorial teaching estimates from typical epidemiology, not a poll, and cover most but not all causes.
 */
export interface HoofAnswer { name: string; pct: number; aliases: string[] }
export interface HoofPrompt { id: string; scope: string; prompt: string; answers: HoofAnswer[]; note: string }

let counter = 0;
const p = (scope: string, prompt: string, rows: string, note: string): HoofPrompt => ({
  id: "h" + String(++counter).padStart(2, "0"), scope, prompt, note,
  answers: rows.trim().split("\n").map((line) => {
    const [name, pct, aliases] = line.split("|");
    return { name: name.trim(), pct: Number(pct), aliases: aliases ? aliases.split(";").map((a) => a.trim()).filter(Boolean) : [] };
  }),
});

export const hoofPrompts: HoofPrompt[] = [
  p("Gastroenterology", "Name a cause of acute pancreatitis.", `
Gallstones|40|biliary;gallstone pancreatitis;choledocholithiasis
Alcohol|30|ethanol;alcohol use
Idiopathic|10|unknown;cryptogenic
Hypertriglyceridemia|7|high triglycerides;triglycerides
Post-ERCP|4|ercp;post-procedural;procedure
Medications|3|drugs;valproate;azathioprine;drug-induced
Hypercalcemia|1|high calcium
Trauma|1|blunt abdominal trauma
Autoimmune|0.7|igg4;autoimmune pancreatitis
Scorpion sting|0.1|tityus trinitatis;scorpion venom`, "Gallstones and alcohol together cause most cases; check triglycerides and calcium when neither fits."),
  p("Infectious disease", "Name a first-line empiric antibiotic for uncomplicated cystitis.", `
Nitrofurantoin|40|macrobid;macrodantin
Trimethoprim-sulfamethoxazole|35|tmp-smx;bactrim;septra;co-trimoxazole
Fosfomycin|15|monurol
Pivmecillinam|4
Cephalexin|4|keflex
Amoxicillin-clavulanate|2|augmentin`, "Nitrofurantoin, trimethoprim-sulfamethoxazole and fosfomycin are the usual first choices; fluoroquinolones are reserved for other situations."),
  p("Cardiology", "Name a classic physical exam finding in infective endocarditis.", `
New murmur|35|heart murmur;changing murmur;regurgitant murmur
Splinter hemorrhages|15|splinter haemorrhages
Petechiae|7
Janeway lesions|9|janeway lesion
Osler nodes|9|osler node
Roth spots|5|roth spot
Fever|10
Splenomegaly|4|enlarged spleen
Clubbing|1|finger clubbing
Conjunctival hemorrhage|1|subconjunctival hemorrhage`, "A new regurgitant murmur is the most common sign; the vascular and immunologic stigmata are classic but less frequent."),
  p("Nephrology", "Name a cause of a high anion gap metabolic acidosis.", `
Lactic acidosis|30|lactate;sepsis;shock
Diabetic ketoacidosis|22|dka;ketoacidosis
Uremia|20|renal failure;kidney failure;chronic kidney disease;ckd
Alcoholic ketoacidosis|7|aka
Methanol|5|methyl alcohol;wood alcohol
Ethylene glycol|4|antifreeze
Salicylate toxicity|4|aspirin overdose;salicylates;aspirin
Propylene glycol|2|lorazepam infusion
Isoniazid|1|inh
Paraldehyde|0.2`, "MUDPILES: Methanol, Uremia, DKA, Propylene glycol, Isoniazid or iron, Lactic acidosis, Ethylene glycol, Salicylates."),
  p("Pulmonology", "Name a cause of community-acquired pneumonia.", `
Streptococcus pneumoniae|30|pneumococcus;s pneumoniae;strep pneumoniae
Mycoplasma pneumoniae|10|mycoplasma
Haemophilus influenzae|8|h influenzae
Influenza virus|8|influenza;flu
Rhinovirus|8|respiratory virus;viral
Legionella pneumophila|5|legionella;legionnaires
Chlamydia pneumoniae|5|chlamydophila pneumoniae
Staphylococcus aureus|4|staph aureus;mrsa
Moraxella catarrhalis|3|moraxella
Klebsiella pneumoniae|2|klebsiella
Coxiella burnetii|0.5|q fever
Chlamydia psittaci|0.2|psittacosis;parrot`, "Pneumococcus remains the leading bacterial cause; many cases never get a pathogen identified."),
  p("Nephrology", "Name a cause of hyponatremia.", `
Thiazide diuretics|20|thiazides;hydrochlorothiazide;hctz
SIADH|15|inappropriate adh
Heart failure|12|cardiac failure
Gastrointestinal losses|12|vomiting;diarrhea;gi losses
Cirrhosis|8|liver disease
Primary polydipsia|6|water intoxication;psychogenic polydipsia
Hypothyroidism|3
Adrenal insufficiency|3|addison disease
Beer potomania|2|low solute intake
Exercise-associated hyponatremia|2|marathon running
Reset osmostat|0.3
Tea and toast diet|0.3`, "Thiazides, SIADH and states of reduced effective circulating volume account for most cases."),
  p("Gastroenterology", "Name a cause of upper gastrointestinal bleeding.", `
Peptic ulcer|40|duodenal ulcer;gastric ulcer;ulcer;peptic ulcer disease
Erosive gastritis|12|gastritis
Esophageal varices|10|varices;oesophageal varices
Erosive esophagitis|9|esophagitis
Mallory-Weiss tear|6|mallory weiss
Angiodysplasia|3|arteriovenous malformation
Gastric cancer|2|stomach cancer
Dieulafoy lesion|1.5|dieulafoy
Aortoenteric fistula|0.2
Hemobilia|0.2`, "Peptic ulcer disease is the leading cause; ask about NSAIDs, alcohol and liver disease."),
  p("Emergency medicine", "Name a cause of chest pain in the emergency department.", `
Musculoskeletal pain|30|costochondritis;chest wall pain;muscle strain
Acute coronary syndrome|12|myocardial infarction;angina;mi;nstemi;stemi
Gastroesophageal reflux|10|gerd;reflux;heartburn
Anxiety|8|panic attack;panic
Pneumonia|5
Pulmonary embolism|2|pe
Pleurisy|2|pleuritis
Pericarditis|1.5
Pneumothorax|1
Herpes zoster|1|shingles
Esophageal spasm|1
Aortic dissection|0.5
Boerhaave syndrome|0.05|esophageal rupture`, "Most chest pain is not cardiac, but the dangerous causes still have to be excluded."),
  p("Cardiology", "Name a cause of syncope.", `
Vasovagal|35|neurocardiogenic;reflex syncope;fainting
Orthostatic hypotension|15|postural hypotension
Cardiac arrhythmia|10|arrhythmia;bradycardia;tachycardia;heart block
Situational|5|micturition;cough syncope;defecation
Medications|5|drugs;antihypertensives
Seizure|2
Aortic stenosis|3
Carotid sinus hypersensitivity|2|carotid sinus
Pulmonary embolism|1
Hypoglycemia|1
Subclavian steal|0.1`, "Reflex and orthostatic causes dominate; cardiac syncope is less common but carries the worst prognosis."),
  p("Hematology", "Name a cause of macrocytic anemia.", `
Vitamin B12 deficiency|25|b12 deficiency;cobalamin deficiency;pernicious anemia
Folate deficiency|20|folic acid deficiency
Alcohol use|20|alcohol;alcoholism
Liver disease|8|cirrhosis
Medications|8|methotrexate;hydroxyurea;zidovudine;azathioprine
Hypothyroidism|6
Myelodysplastic syndrome|6|mds
Reticulocytosis|4|hemolysis
Orotic aciduria|0.1`, "Always check B12 and folate; alcohol and drugs are common reversible causes."),
  p("Endocrinology", "Name a cause of hypercalcemia.", `
Primary hyperparathyroidism|45|hyperparathyroidism;parathyroid adenoma
Malignancy|30|cancer;humoral hypercalcemia of malignancy;pthrp;bone metastases
Sarcoidosis|4|granulomatous disease
Thiazide diuretics|4|thiazides
Vitamin D toxicity|3|vitamin d intoxication
Milk-alkali syndrome|2
Hyperthyroidism|1
Familial hypocalciuric hypercalcemia|1|fhh
Lithium|1
Immobilization|1
Adrenal insufficiency|0.5
Vitamin A toxicity|0.2`, "Primary hyperparathyroidism usually causes outpatient disease; malignancy is the leading cause in hospital."),
  p("Nephrology", "Name a cause of hypokalemia.", `
Diuretics|30|loop diuretics;furosemide;thiazides
Gastrointestinal losses|25|vomiting;diarrhea
Insulin|4
Beta-agonists|2|albuterol
Poor intake|4|starvation
Hyperaldosteronism|4|conn syndrome;primary aldosteronism
Hypomagnesemia|3|low magnesium
Renal tubular acidosis|2
Amphotericin B|1
Bartter syndrome|0.5|gitelman syndrome
Licorice|1|liquorice
Liddle syndrome|0.1
Barium poisoning|0.05`, "Diuretics and gastrointestinal losses explain most cases; check magnesium if it does not correct."),
  p("Hematology", "Name a risk factor for venous thromboembolism.", `
Immobility|20|hospitalization;bed rest
Recent surgery|15|surgery
Malignancy|12|cancer
Prior venous thromboembolism|10|previous dvt;history of dvt;prior dvt;prior pe
Oral contraceptives|8|estrogen;hormone therapy;birth control pill
Pregnancy|6|postpartum
Inherited thrombophilia|5|factor v leiden;thrombophilia
Obesity|4
Trauma|4|fracture
Long-distance travel|3|long flights;prolonged travel
Heart failure|3
Antiphospholipid syndrome|2
Nephrotic syndrome|1
Paroxysmal nocturnal hemoglobinuria|0.2|pnh
Behcet disease|0.1`, "Virchow triad: stasis, endothelial injury and hypercoagulability."),
  p("Pharmacology", "Name a side effect of ACE inhibitors.", `
Cough|45|dry cough
Hyperkalemia|15|high potassium
Hypotension|8|low blood pressure
Angioedema|8
Acute kidney injury|6|renal impairment;creatinine rise;aki
Teratogenicity|5|fetal harm;birth defects
Taste disturbance|3|dysgeusia
Rash|2
Neutropenia|0.3`, "Cough from bradykinin is by far the most common; angioedema is rare but dangerous."),
  p("Pharmacology", "Name a side effect of amiodarone.", `
Thyroid dysfunction|20|hypothyroidism;hyperthyroidism;thyroid disease
Pulmonary fibrosis|18|lung toxicity;pneumonitis
Skin discoloration|12|blue-gray skin;photosensitivity
Corneal deposits|12|corneal microdeposits
Hepatotoxicity|10|liver toxicity;elevated liver enzymes
Bradycardia|8
QT prolongation|5|torsades
Tremor|4|neuropathy
Optic neuropathy|3
Hepatic steatosis|0.5`, "Monitor thyroid, liver and lung function; the drug is rich in iodine and lipophilic."),
  p("Internal medicine", "Name a first-line drug class for chronic hypertension.", `
Calcium channel blockers|25|amlodipine;dihydropyridines
ACE inhibitors|25|lisinopril;ace inhibitor
Angiotensin receptor blockers|20|arbs;losartan;arb
Thiazide diuretics|25|hydrochlorothiazide;chlorthalidone;thiazides
Beta-blockers|3|metoprolol
Spironolactone|1`, "Current guidelines favor thiazides, calcium channel blockers and ACE inhibitors or ARBs first."),
  p("Neurology", "Name a cause of dementia.", `
Alzheimer disease|60|alzheimer's;alzheimers
Vascular dementia|17|multi-infarct dementia;vascular cognitive impairment
Lewy body dementia|4|dementia with lewy bodies
Frontotemporal dementia|3|pick disease
Parkinson disease dementia|3
Normal pressure hydrocephalus|1|nph
Vitamin B12 deficiency|1
Hypothyroidism|0.5
Subdural hematoma|0.5
Neurosyphilis|0.2
Creutzfeldt-Jakob disease|0.1|cjd|prion disease`, "Alzheimer disease causes the majority of dementia; screen for treatable causes in everyone."),
  p("Neurology", "Name a cause of a new seizure in an adult.", `
Idiopathic epilepsy|20|epilepsy;unknown
Alcohol withdrawal|12|alcohol
Stroke|10|cerebrovascular disease
Head trauma|10|traumatic brain injury
Drug toxicity or withdrawal|6|medications;benzodiazepine withdrawal;cocaine
Brain tumor|5|tumor;brain mass
Central nervous system infection|5|meningitis;encephalitis
Hypoglycemia|4
Hyponatremia|3
Eclampsia|1
Hypocalcemia|1
Cysticercosis|0.5|neurocysticercosis
Hypomagnesemia|0.5
Isoniazid overdose|0.1`, "Always check glucose, sodium and calcium and ask about alcohol and drugs."),
  p("Pulmonology", "Name a cause of pleural effusion.", `
Heart failure|35|congestive heart failure;chf
Pneumonia|20|parapneumonic effusion;empyema
Malignancy|15|cancer;lung cancer
Pulmonary embolism|5
Cirrhosis|5|hepatic hydrothorax
Tuberculosis|3|tb
Nephrotic syndrome|1
Rheumatoid arthritis|1
Pancreatitis|1
Mesothelioma|1
Chylothorax|0.5
Dressler syndrome|0.2
Meigs syndrome|0.1`, "Heart failure is the most common cause overall; use Light criteria to separate transudates from exudates."),
  p("Infectious disease", "Name a bacterial cause of meningitis in adults.", `
Streptococcus pneumoniae|55|pneumococcus
Neisseria meningitidis|25|meningococcus
Listeria monocytogenes|5|listeria
Haemophilus influenzae|4
Group B streptococcus|3|streptococcus agalactiae
Staphylococcus aureus|3
Gram-negative rods|3|escherichia coli;klebsiella;pseudomonas
Mycobacterium tuberculosis|2|tb
Nocardia|0.1
Brucella|0.1`, "Pneumococcus and meningococcus dominate; add ampicillin for Listeria in older or immunocompromised patients."),
  p("Infectious disease", "Name a cause of traveler's diarrhea.", `
Enterotoxigenic Escherichia coli|40|etec;e coli
Campylobacter|10|campylobacter jejuni
Norovirus|8
Shigella|8
Salmonella|6
Giardia|4|giardia lamblia
Rotavirus|3
Aeromonas|1
Cryptosporidium|1
Entamoeba histolytica|1|amoeba
Cyclospora|0.5
Vibrio cholerae|0.5|cholera
Plesiomonas|0.2`, "ETEC is the leading cause; fluoroquinolone resistance in Campylobacter has changed treatment."),
  p("Gastroenterology", "Name a cause of jaundice in an adult.", `
Viral hepatitis|20|hepatitis a;hepatitis b;hepatitis c
Alcoholic liver disease|15|alcohol
Common bile duct stone|15|choledocholithiasis;gallstones
Cirrhosis|8
Drug-induced liver injury|8|medications;acetaminophen
Pancreatic head cancer|6|pancreatic cancer
Hemolysis|5|hemolytic anemia
Gilbert syndrome|4
Cholangiocarcinoma|2|bile duct cancer
Sepsis|2
Primary sclerosing cholangitis|1|psc
Primary biliary cholangitis|1|pbc
Hepatic congestion|1|heart failure
Crigler-Najjar syndrome|0.1
Dubin-Johnson syndrome|0.1`, "Split jaundice into prehepatic, hepatic and posthepatic causes and start with the fractionated bilirubin."),
  p("Urology", "Name a cause of hematuria.", `
Urinary tract infection|25|uti;cystitis
Kidney stones|15|nephrolithiasis;urolithiasis;renal calculi
Benign prostatic hyperplasia|12|bph
Bladder cancer|8
Menstrual contamination|4|menstruation
IgA nephropathy|5|glomerulonephritis
Trauma|3
Renal cell carcinoma|2|kidney cancer
Exercise|2|exercise-induced
Anticoagulants|2|anticoagulation;warfarin
Polycystic kidney disease|1|adpkd
Sickle cell trait|0.5
Schistosomiasis|0.5
Nutcracker syndrome|0.1`, "Always consider cancer in older smokers with painless hematuria."),
  p("Hematology", "Name a cause of splenomegaly.", `
Cirrhosis with portal hypertension|20|portal hypertension;cirrhosis
Hematologic malignancy|12|leukemia;lymphoma
Infectious mononucleosis|8|mono;ebv
Hemolytic anemia|6
Myelofibrosis|5|myeloproliferative neoplasm
Malaria|4
Endocarditis|3
Hereditary spherocytosis|3
Sarcoidosis|2
Splenic vein thrombosis|1
Gaucher disease|1
Felty syndrome|1
Visceral leishmaniasis|1|kala-azar
Tropical splenomegaly|0.3`, "Portal hypertension and hematologic disease account for most massive and mild enlargement."),
  p("Pulmonology", "Name a cause of a solitary pulmonary nodule.", `
Infectious granuloma|35|granuloma;histoplasmosis;tuberculosis
Lung adenocarcinoma|20|lung cancer;adenocarcinoma;primary lung cancer
Hamartoma|8
Metastasis|7|metastatic disease
Round pneumonia|2
Carcinoid tumor|2|carcinoid
Arteriovenous malformation|1|avm
Rheumatoid nodule|1
Pulmonary infarct|1
Granulomatosis with polyangiitis|1|gpa;wegener
Amyloidoma|0.1`, "Most nodules are benign granulomas; risk calculators and growth over time sort the rest."),
  p("Psychiatry", "Name a first-line medication for generalized anxiety disorder.", `
Sertraline|25
Escitalopram|25
Venlafaxine|10
Duloxetine|10
Paroxetine|8
Buspirone|6
Fluoxetine|5
Citalopram|4
Pregabalin|3
Hydroxyzine|2`, "SSRIs and SNRIs are first line; benzodiazepines are reserved for short-term use."),
  p("Neurology", "Name a drug used to treat status epilepticus.", `
Lorazepam|45
Diazepam|15
Midazolam|12
Phenytoin|10|fosphenytoin
Levetiracetam|8|keppra
Valproate|5|valproic acid
Phenobarbital|4
Propofol|0.5
Ketamine|0.3`, "Benzodiazepines are the first step; follow with a second-line antiseizure drug."),
  p("Cardiology", "Name a medication that can prolong the QT interval.", `
Azithromycin|12
Haloperidol|12
Ondansetron|10|zofran
Amiodarone|10
Levofloxacin|6
Ciprofloxacin|4
Methadone|8
Citalopram|6|escitalopram
Sotalol|5
Quetiapine|4
Hydroxychloroquine|3
Fluconazole|3
Clarithromycin|3
Erythromycin|2`, "Check the ECG and electrolytes when combining QT-prolonging drugs."),
  p("Nephrology", "Name an indication for emergent dialysis.", `
Refractory hyperkalemia|25|hyperkalemia;high potassium
Volume overload|20|pulmonary edema;fluid overload
Refractory metabolic acidosis|18|acidosis
Uremic encephalopathy|8|uremic confusion
Uremic pericarditis|7|pericarditis
Toxic ingestion|8|lithium;methanol;ethylene glycol;salicylates
Uremic bleeding|2|uremic platelet dysfunction
Hypercalcemia|0.3`, "AEIOU: Acidosis, Electrolytes, Intoxication, Overload, Uremia."),
  p("Nephrology", "Name a cause of acute kidney injury.", `
Volume depletion|35|prerenal;dehydration;prerenal azotemia
Acute tubular necrosis|30|atn
Urinary obstruction|10|postrenal;obstruction;bph
NSAIDs|5
Contrast nephropathy|3|contrast
Cardiorenal syndrome|3
Acute interstitial nephritis|3|ain
Glomerulonephritis|3
Rhabdomyolysis|2
Hepatorenal syndrome|2
Renal artery stenosis with ACE inhibitor|1
Thrombotic microangiopathy|1|hus;ttp
Cholesterol emboli|0.5
Tumor lysis syndrome|0.3`, "Prerenal azotemia and acute tubular necrosis cause most hospital cases."),
  p("Neurology", "Name a cause of peripheral neuropathy.", `
Diabetes|35|diabetes mellitus
Idiopathic|12|unknown
Alcohol|10
Vitamin B12 deficiency|6|b12 deficiency
Chemotherapy|6
Charcot-Marie-Tooth disease|4|hereditary neuropathy
Chronic kidney disease|3|uremia
HIV|2
Hypothyroidism|2
Guillain-Barre syndrome|1
Amyloidosis|1
Vasculitis|1
Leprosy|0.5
Isoniazid|0.5
Lead poisoning|0.3
Arsenic poisoning|0.2`, "Diabetes is the commonest cause worldwide; check B12 and glucose first."),
  p("Pulmonology", "Name a cause of upper-lobe predominant lung fibrosis.", `
Tuberculosis|35|tb
Sarcoidosis|20
Silicosis|12
Cystic fibrosis|8
Coal workers pneumoconiosis|6|black lung
Hypersensitivity pneumonitis|6
Ankylosing spondylitis|3
Langerhans cell histiocytosis|3
Allergic bronchopulmonary aspergillosis|2|abpa
Radiation|2
Berylliosis|1`, "Remember CASTS: coal, ankylosing spondylitis, silicosis, tuberculosis and sarcoidosis."),
  p("Neurology", "Name a sign or symptom of raised intracranial pressure.", `
Headache|25
Papilledema|20
Vomiting|15
Altered level of consciousness|15|drowsiness;confusion
Sixth nerve palsy|4|abducens palsy
Bradycardia|5
Hypertension|5
Pupillary dilation|3|blown pupil
Irregular breathing|3
Seizures|2
Sunsetting eyes|0.3`, "Cushing triad is hypertension, bradycardia and irregular respiration, a late sign."),
  p("Endocrinology", "Name a long-term complication of diabetes.", `
Neuropathy|20|peripheral neuropathy
Nephropathy|18|diabetic kidney disease;kidney disease
Retinopathy|15
Coronary artery disease|15|heart disease
Stroke|8
Peripheral artery disease|6|pad
Foot ulcers|6|amputation
Gastroparesis|3
Erectile dysfunction|3
Recurrent infections|2
Charcot foot|1
Necrobiosis lipoidica|0.5
Frozen shoulder|0.3`, "Microvascular disease (eye, kidney, nerve) and macrovascular disease are both common."),
  p("Endocrinology", "Name a cause of hypoglycemia in a person without diabetes.", `
Alcohol|20
Sepsis|12
Liver failure|10
Starvation|8
Adrenal insufficiency|6
Medications|6|quinolones;pentamidine;quinine
Reactive hypoglycemia|5
Post-bariatric surgery|5|dumping syndrome
Renal failure|4
Insulinoma|3
Factitious insulin use|3|surreptitious insulin
Insulin autoimmune hypoglycemia|0.3
Non-islet cell tumor|0.3`, "Whipple triad: low glucose, symptoms, and relief when glucose is restored."),
  p("Cardiology", "Name a cause of a pericardial effusion.", `
Idiopathic|20
Viral infection|15|viral pericarditis
Malignancy|15|cancer
Uremia|10|kidney failure
Hypothyroidism|5
Post-cardiac surgery|5
Dressler syndrome|5|post-mi
Lupus|4
Tuberculosis|4|tb
Aortic dissection|2
Radiation|1
Chylopericardium|0.1`, "Tamponade physiology matters more than the amount of fluid."),
  p("Gastroenterology", "Name a cause of cirrhosis.", `
Alcohol|30
Hepatitis C|25
Non-alcoholic fatty liver disease|20|nafld;masld;fatty liver;nash
Hepatitis B|10
Cryptogenic|4
Autoimmune hepatitis|3
Primary biliary cholangitis|2
Hemochromatosis|2
Primary sclerosing cholangitis|1
Wilson disease|0.5
Alpha-1 antitrypsin deficiency|0.5
Cardiac cirrhosis|0.5|congestive hepatopathy
Budd-Chiari syndrome|0.3`, "Alcohol, hepatitis C and fatty liver disease account for most cirrhosis in developed countries."),
  p("Cardiology", "Name a cause of bradycardia.", `
Beta-blockers|20
Sick sinus syndrome|15
Atrioventricular block|12|heart block;av block
Increased vagal tone|8
Athletic conditioning|8|athletes
Calcium channel blockers|6|diltiazem;verapamil
Hypothyroidism|5
Digoxin|4
Inferior myocardial infarction|4|inferior mi
Hyperkalemia|3
Hypothermia|2
Sleep apnea|2
Increased intracranial pressure|2|cushing reflex
Lyme carditis|0.3
Organophosphate poisoning|0.3`, "Look for reversible causes: drugs, thyroid, potassium and ischemia."),
  p("Rheumatology", "Name an extrapulmonary manifestation of sarcoidosis.", `
Erythema nodosum|20
Uveitis|15|eye disease
Lofgren syndrome|10
Hypercalcemia|8
Cardiac sarcoidosis|5|arrhythmia;heart block
Lupus pernio|5
Facial nerve palsy|3|bell palsy
Hepatic granulomas|3|liver involvement
Splenomegaly|3
Neurosarcoidosis|2
Parotid enlargement|1|heerfordt syndrome`, "Lofgren syndrome combines erythema nodosum, hilar adenopathy and arthritis and has a good prognosis."),
  p("Infectious disease", "Name a category of cause of fever of unknown origin.", `
Infection|30|infections;tuberculosis;abscess;endocarditis
Autoimmune or inflammatory disease|25|autoimmune;rheumatologic;vasculitis;inflammatory;giant cell arteritis;adult-onset still disease
Malignancy|15|cancer;lymphoma
Drug fever|6|medications;drugs
Thromboembolic disease|3|pulmonary embolism;deep vein thrombosis
Granulomatous disease|3|sarcoidosis
Endocrine disease|1|thyroiditis
Familial Mediterranean fever|0.5|fmf;hereditary periodic fever
Factitious fever|0.5`, "Infection, inflammatory disease and cancer account for most fevers of unknown origin that get a diagnosis."),
  p("Emergency medicine", "Name a treatment used in anaphylaxis.", `
Epinephrine|75|adrenaline;intramuscular epinephrine;epipen
Intravenous fluids|6|fluids;saline
Albuterol|4|salbutamol;bronchodilator
Oxygen|4
Diphenhydramine|4|antihistamine
Corticosteroids|3|steroids;methylprednisolone;prednisone
H2 blocker|2|famotidine;ranitidine
Glucagon|1`, "Epinephrine is the first-line treatment; antihistamines and steroids are adjuncts, not substitutes."),
  p("Neurology", "Name a vitamin deficiency that causes neurologic symptoms.", `
Vitamin B12|40|cobalamin;b12
Thiamine|20|vitamin b1;b1
Folate|6|folic acid
Vitamin B6|5|pyridoxine
Vitamin E|4
Niacin|3|vitamin b3;pellagra
Vitamin D|1
Biotin|0.3`, "B12 deficiency can cause neuropathy and subacute combined degeneration even without anemia."),
  p("Endocrinology", "Name a cause of secondary osteoporosis.", `
Glucocorticoids|30|steroids;prednisone
Hypogonadism|8|low testosterone
Hyperthyroidism|6
Hyperparathyroidism|6
Celiac disease|6|malabsorption
Alcohol|6
Rheumatoid arthritis|4
Anticonvulsants|4
Smoking|4
Anorexia nervosa|3
Proton pump inhibitors|3|ppis
Multiple myeloma|2
Cushing syndrome|2
Long-term heparin|1
Idiopathic juvenile osteoporosis|0.1`, "Glucocorticoids are the commonest drug cause of bone loss."),
  p("Critical care", "Name a type of shock.", `
Septic shock|35|sepsis;distributive
Hypovolemic shock|25|hemorrhagic;hemorrhage
Cardiogenic shock|20
Obstructive shock|8|tamponade;pulmonary embolism;tension pneumothorax
Anaphylactic shock|5|anaphylaxis
Neurogenic shock|5
Adrenal crisis|1|endocrine shock
Toxic shock syndrome|0.5`, "Classify shock as distributive, hypovolemic, cardiogenic or obstructive to guide resuscitation."),
  p("Pediatrics", "Name a cause of acute abdominal pain in a child.", `
Gastroenteritis|25
Constipation|15
Functional abdominal pain|12
Appendicitis|10
Urinary tract infection|6|uti
Mesenteric adenitis|5
Streptococcal pharyngitis|3|strep throat
Intussusception|2
Lower lobe pneumonia|2|pneumonia
Diabetic ketoacidosis|1|dka
Henoch-Schonlein purpura|1|iga vasculitis
Malrotation with volvulus|0.5|volvulus
Testicular torsion|0.5|torsion
Ovarian torsion|0.5
Meckel diverticulum|0.3
Hirschsprung disease|0.1`, "Most abdominal pain in children is benign, but appendicitis and torsion cannot be missed."),
  p("Endocrinology", "Name a classic finding of hyperthyroidism.", `
Tremor|15
Weight loss|15
Tachycardia|15
Heat intolerance|12
Goiter|10
Palpitations|8|atrial fibrillation
Exophthalmos|8|proptosis
Anxiety|4
Hyperreflexia|3
Lid lag|3
Diarrhea|2
Pretibial myxedema|2
Onycholysis|0.3|plummer nails
Thyroid acropachy|0.2`, "Eye and skin changes (exophthalmos, pretibial myxedema) point specifically to Graves disease."),
  p("Cardiology", "Name a risk factor for coronary artery disease.", `
Smoking|15
Hypertension|15
Hyperlipidemia|15|high cholesterol;dyslipidemia
Diabetes|15
Family history|8
Obesity|6
Age|5
Sedentary lifestyle|4|physical inactivity
Male sex|3
Chronic kidney disease|2
Lipoprotein(a)|1|lp(a)
Chronic inflammatory disease|1|lupus;rheumatoid arthritis
HIV|1
Cocaine use|1
Hyperhomocysteinemia|0.5
Kawasaki disease|0.1`, "The big four are smoking, hypertension, lipids and diabetes."),
  p("Gastroenterology", "Name a cause of acute liver failure.", `
Acetaminophen|45|paracetamol
Idiosyncratic drug reaction|12|drug-induced liver injury;medications
Viral hepatitis|10|hepatitis a;hepatitis b
Autoimmune hepatitis|4
Ischemic hepatitis|4|shock liver
Amanita mushroom poisoning|2|mushroom
Wilson disease|1
Acute fatty liver of pregnancy|1
HELLP syndrome|0.5
Budd-Chiari syndrome|0.5
Herpes simplex hepatitis|0.5
Reye syndrome|0.1`, "Acetaminophen overdose is the leading cause in the West; start N-acetylcysteine early."),
  p("Pulmonology", "Name a cause of hemoptysis.", `
Bronchitis|25|acute bronchitis;chronic bronchitis
Bronchiectasis|15
Lung cancer|12|bronchogenic carcinoma
Pneumonia|10
Tuberculosis|8|tb
Pulmonary embolism|4
Anticoagulant use|3|anticoagulants
Cystic fibrosis|3
Aspergilloma|2|fungus ball
Goodpasture syndrome|0.5|anti-gbm disease
Granulomatosis with polyangiitis|0.5|gpa
Arteriovenous malformation|0.3|hereditary hemorrhagic telangiectasia
Catamenial hemoptysis|0.1|thoracic endometriosis`, "Bronchitis is the commonest cause; always consider cancer, tuberculosis and bronchiectasis."),
  p("Cardiology", "Name a cause of heart failure with reduced ejection fraction.", `
Ischemic cardiomyopathy|50|coronary artery disease;myocardial infarction
Hypertension|10|hypertensive heart disease
Idiopathic dilated cardiomyopathy|10|dilated cardiomyopathy
Valvular heart disease|8|aortic stenosis;mitral regurgitation
Alcohol|4|alcoholic cardiomyopathy
Tachycardia-induced cardiomyopathy|3|atrial fibrillation
Myocarditis|3|viral myocarditis
Chemotherapy|2|doxorubicin;anthracyclines
Peripartum cardiomyopathy|1
Takotsubo cardiomyopathy|1|stress cardiomyopathy
Hemochromatosis|0.3
Chagas disease|0.3`, "Coronary artery disease causes about half of systolic heart failure."),
  p("Hematology", "Name a cause of thrombocytopenia.", `
Immune thrombocytopenia|15|itp
Medications|12|heparin;drugs;drug-induced
Sepsis|10
Liver disease|10|cirrhosis;hypersplenism
Gestational thrombocytopenia|8
Disseminated intravascular coagulation|5|dic
Alcohol|5
Pseudothrombocytopenia|4|edta clumping
Chemotherapy|4
Viral infection|4|hiv;hepatitis c
Thrombotic thrombocytopenic purpura|1|ttp
Hemolytic uremic syndrome|1|hus
Heparin-induced thrombocytopenia|1|hit
Wiskott-Aldrich syndrome|0.1`, "Always check the smear to exclude clumping before working up a low platelet count."),
  p("Infectious disease", "Name a cause of a sexually transmitted urethritis.", `
Chlamydia trachomatis|40|chlamydia
Neisseria gonorrhoeae|25|gonorrhea;gonococcus
Mycoplasma genitalium|10
Trichomonas vaginalis|5|trichomonas
Ureaplasma urealyticum|5|ureaplasma
Herpes simplex virus|3|hsv
Adenovirus|2
Haemophilus species|1
Neisseria meningitidis|0.2|meningococcal urethritis`, "Treat for chlamydia whenever gonorrhea is treated; test for other infections."),
  p("Pharmacology", "Name a drug that needs serum level monitoring.", `
Vancomycin|20
Lithium|15
Digoxin|15
Phenytoin|10
Gentamicin|10
Tacrolimus|8
Valproate|6|valproic acid
Carbamazepine|6
Theophylline|3
Cyclosporine|3
Methotrexate|2
Amikacin|1
Busulfan|0.2`, "Narrow therapeutic index drugs need levels to balance benefit against toxicity."),
];
