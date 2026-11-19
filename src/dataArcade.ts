import { diagnosisCases, nextStepCases, pairsBank } from "./data";
import { hashSeed, seeded, shuffle } from "./lib";
export type DeepTier = 1 | 2 | 3 | 4 | 5 | 6;
export interface DeepAnswer { answer: string; tier: DeepTier; aliases?: string[] }
export interface DeepPrompt { id: string; prompt: string; scope: string; explanation: string; answers: DeepAnswer[] }
type Buckets = [string[], string[], string[], string[], string[], string[]];
const dive = (id: string, prompt: string, scope: string, explanation: string, buckets: Buckets): DeepPrompt => ({
  id, prompt, scope, explanation,
  answers: buckets.flatMap((answers, index) => answers.map((answer) => ({ answer, tier: (index + 1) as DeepTier })))
});
export const deepDivePrompts: DeepPrompt[] = [
  dive("d01","Name a cause of microcytic anemia.","Hematology","Iron deficiency and thalassemia are common; consider impaired heme synthesis, chronic inflammation, and lead exposure.",[
    ["Iron deficiency anemia"],["Beta-thalassemia","Anemia of chronic inflammation"],["Alpha-thalassemia","Sideroblastic anemia"],["Lead poisoning"],["Copper deficiency"],["Iron-refractory iron deficiency anemia"]
  ]),
  dive("d02","Name a cause of nephrotic syndrome.","Renal","Heavy proteinuria can result from podocyte injury, immune-complex disease, diabetes, or systemic deposition.",[
    ["Minimal change disease"],["Focal segmental glomerulosclerosis","Membranous nephropathy"],["Diabetic kidney disease","Amyloidosis"],["Lupus class V nephritis"],["Hepatitis B–associated membranous nephropathy"],["Congenital nephrotic syndrome"]
  ]),
  dive("d03","Name a cause of nephritic syndrome.","Renal","Glomerular inflammation produces hematuria, dysmorphic RBCs or casts, and variable renal dysfunction.",[
    ["Poststreptococcal glomerulonephritis"],["IgA nephropathy","Lupus nephritis"],["IgA vasculitis nephritis","Membranoproliferative glomerulonephritis"],["Anti-GBM disease","ANCA-associated glomerulonephritis"],["C3 glomerulopathy"],["Fibrillary glomerulonephritis"]
  ]),
  dive("d04","Name an encapsulated bacterial pathogen.","Microbiology","Encapsulation impairs phagocytosis. The classic organisms include pneumococcus, meningococcus, and Haemophilus; other organisms also express important capsules.",[
    ["Streptococcus pneumoniae"],["Neisseria meningitidis","Haemophilus influenzae type b"],["Klebsiella pneumoniae","Escherichia coli K1"],["Group B Streptococcus","Salmonella enterica"],["Cryptococcus neoformans"],["Bacillus anthracis"]
  ]),
  dive("d05","Name an organism associated with urease production.","Microbiology","Urease hydrolyzes urea to ammonia and carbon dioxide. Proteus is the classic urinary pathogen.",[
    ["Proteus mirabilis"],["Helicobacter pylori","Klebsiella species"],["Morganella morganii","Providencia species"],["Ureaplasma urealyticum","Corynebacterium urealyticum"],["Cryptococcus neoformans"],["Staphylococcus saprophyticus"]
  ]),
  dive("d06","Name a cause of high-anion-gap metabolic acidosis.","Physiology","Think lactate, ketoacids, renal retention of acids, and selected toxins or medications.",[
    ["Lactic acidosis"],["Diabetic ketoacidosis","Uremia"],["Alcoholic ketoacidosis","Starvation ketoacidosis"],["Methanol","Ethylene glycol"],["Salicylate toxicity"],["5-oxoproline (pyroglutamic) acidosis"]
  ]),
  dive("d07","Name a cause of normal-anion-gap metabolic acidosis.","Physiology","Bicarbonate loss or impaired renal acid excretion produces a hyperchloremic acidosis.",[
    ["Diarrhea"],["Renal tubular acidosis","Ureteral diversion"],["Pancreatic or intestinal fistula","Cholestyramine"],["Acetazolamide"],["Topiramate"],["Toluene exposure"]
  ]),
  dive("d08","Name a cause of secondary hypertension.","Cardiology","Consider renal parenchymal disease, renovascular disease, endocrine causes, sleep apnea, and medication effects.",[
    ["Renal parenchymal disease"],["Renal artery stenosis","Primary aldosteronism"],["Obstructive sleep apnea","Pheochromocytoma"],["Cushing syndrome","Coarctation of the aorta"],["Thyrotoxicosis","Hyperthyroidism"],["Liddle syndrome"]
  ]),
  dive("d09","Name a cause of hypercalcemia.","Endocrinology","Primary hyperparathyroidism and malignancy are the leading categories; vitamin D and granulomatous disease are other important causes.",[
    ["Primary hyperparathyroidism"],["Malignancy-associated hypercalcemia","Multiple myeloma"],["Vitamin D intoxication","Sarcoidosis"],["Tuberculosis","Milk-alkali syndrome"],["Thiazide use","Immobilization"],["Familial hypocalciuric hypercalcemia"]
  ]),
  dive("d10","Name a cause of hypoglycemia in an adult.","Endocrinology","Medication exposure is common. Other causes include critical illness, hormone deficiency, and endogenous hyperinsulinism.",[
    ["Insulin or sulfonylurea exposure"],["Sepsis","Adrenal insufficiency"],["Insulinoma","Alcohol-associated fasting"],["Liver failure","Renal failure"],["Non-islet-cell tumor hypoglycemia"],["Post-bariatric hyperinsulinemic hypoglycemia"]
  ]),
  dive("d11","Name a pathogen that can cause atypical pneumonia.","Microbiology","Atypical pneumonia is associated with intracellular or cell-wall-deficient organisms and selected zoonotic pathogens.",[
    ["Mycoplasma pneumoniae"],["Chlamydia pneumoniae","Legionella pneumophila"],["Coxiella burnetii","Chlamydia psittaci"],["Francisella tularensis"],["Respiratory syncytial virus"],["Human metapneumovirus"]
  ]),
  dive("d12","Name an organism that can cause neonatal meningitis.","Microbiology","Group B streptococcus, E. coli, and Listeria are key neonatal pathogens; risk and epidemiology vary with age and setting.",[
    ["Group B Streptococcus"],["Escherichia coli","Listeria monocytogenes"],["Klebsiella pneumoniae","Enterobacter species"],["Citrobacter koseri"],["Cronobacter sakazakii"],["Herpes simplex virus"]
  ]),
  dive("d13","Name a congenital heart defect associated with a left-to-right shunt.","Cardiology","Atrial septal defect, ventricular septal defect, and patent ductus arteriosus are classic acyanotic shunts.",[
    ["Ventricular septal defect"],["Atrial septal defect","Patent ductus arteriosus"],["Atrioventricular septal defect","Aortopulmonary window"],["Ruptured sinus of Valsalva"],["Coronary artery fistula"],["Partial anomalous pulmonary venous return"]
  ]),
  dive("d14","Name a cause of restrictive cardiomyopathy.","Cardiology","Restrictive physiology reflects impaired ventricular filling; infiltrative and storage diseases are important causes.",[
    ["Cardiac amyloidosis"],["Sarcoidosis","Hemochromatosis"],["Endomyocardial fibrosis","Radiation-associated fibrosis"],["Fabry disease","Glycogen storage disease"],["Hypereosinophilic syndrome"],["Carcinoid heart disease"]
  ]),
  dive("d15","Name a cause of metabolic alkalosis.","Physiology","Vomiting, diuretics, mineralocorticoid excess, and chloride depletion are common mechanisms.",[
    ["Vomiting"],["Loop or thiazide diuretics","Primary hyperaldosteronism"],["Hypokalemia","Post-hypercapnia"],["Bartter syndrome","Gitelman syndrome"],["Liddle syndrome"],["Milk-alkali syndrome"]
  ]),
  dive("d16","Name a cause of thrombocytopenia.","Hematology","Low platelets result from decreased production, increased destruction, consumption, sequestration, or dilution.",[
    ["Immune thrombocytopenia"],["Heparin-induced thrombocytopenia","Thrombotic thrombocytopenic purpura"],["Disseminated intravascular coagulation","Hypersplenism"],["Aplastic anemia","Myelodysplastic syndrome"],["Drug-induced immune thrombocytopenia"],["Type 2B von Willebrand disease"]
  ]),
  dive("d17","Name a disease associated with an autoantibody.","Immunology","Autoantibodies support diagnosis in the right clinical context; they are not always independently diagnostic.",[
    ["Systemic lupus erythematosus"],["Rheumatoid arthritis","Graves disease"],["Systemic sclerosis","Sjögren syndrome"],["Anti-GBM disease","Pemphigus vulgaris"],["Autoimmune hepatitis","Primary biliary cholangitis"],["Lambert-Eaton myasthenic syndrome"]
  ]),
  dive("d18","Name a cause of hemolytic anemia.","Hematology","Hemolysis can be immune, mechanical, infectious, enzymatic, or due to an abnormal red-cell membrane or hemoglobin.",[
    ["Autoimmune hemolytic anemia"],["Hereditary spherocytosis","Sickle cell disease"],["G6PD deficiency","Thrombotic microangiopathy"],["Malaria","Mechanical heart valve"],["Paroxysmal nocturnal hemoglobinuria"],["Clostridium perfringens sepsis"]
  ]),
  dive("d19","Name a disease that can cause erythema nodosum.","Dermatology","Tender pretibial nodules are associated with infections, inflammatory disease, medications, and pregnancy.",[
    ["Sarcoidosis"],["Streptococcal infection","Inflammatory bowel disease"],["Tuberculosis","Coccidioidomycosis"],["Yersinia infection","Behçet disease"],["Hodgkin lymphoma"],["Sweet syndrome"]
  ]),
  dive("d20","Name a cause of acute pancreatitis.","Gastroenterology","Gallstones and alcohol are common causes; medications, hypertriglyceridemia, and procedures are also important.",[
    ["Gallstones"],["Alcohol","Hypertriglyceridemia"],["Post-ERCP","Hypercalcemia"],["Azathioprine","Valproic acid"],["Scorpion envenomation"],["Autoimmune pancreatitis"]
  ]),
  dive("d21","Name a cause of upper gastrointestinal bleeding.","Gastroenterology","Peptic ulcer disease is common. Other sources include erosions, varices, tears, and vascular lesions.",[
    ["Peptic ulcer disease"],["Esophageal varices","Gastritis or duodenitis"],["Mallory-Weiss tear","Dieulafoy lesion"],["Angiodysplasia","Gastric antral vascular ectasia"],["Cameron lesions"],["Aortoenteric fistula"]
  ]),
  dive("d22","Name a cause of acute kidney injury.","Renal","Classify AKI as prerenal, intrinsic renal, or postrenal before narrowing the differential.",[
    ["Volume depletion"],["Acute tubular necrosis","Urinary obstruction"],["Acute interstitial nephritis","Glomerulonephritis"],["Rhabdomyolysis","Hepatorenal syndrome"],["Thrombotic microangiopathy"],["Atheroembolic renal disease"]
  ]),
  dive("d23","Name a medication class that can cause QT prolongation.","Pharmacology","QT prolongation is associated with multiple medication classes; risk rises with interacting drugs and electrolyte abnormalities.",[
    ["Class IA antiarrhythmics"],["Class III antiarrhythmics","Macrolide antibiotics"],["Fluoroquinolones","Antipsychotics"],["Methadone","Tricyclic antidepressants"],["Ondansetron"],["Arsenic trioxide"]
  ]),
  dive("d24","Name a medication used to reverse an anticoagulant.","Pharmacology","Reversal depends on the agent, urgency, bleeding severity, and availability of specific antidotes or factor replacement.",[
    ["Vitamin K"],["Protamine","Idarucizumab"],["Andexanet alfa","Four-factor PCC"],["Dabigatran-specific idarucizumab","Desmopressin for selected antiplatelet-associated bleeding"],["Activated charcoal after recent ingestion"],["Ciraparantag (investigational)"]
  ]),
  dive("d25","Name a cause of acute red eye with pain or photophobia.","Ophthalmology","Pain, photophobia, reduced vision, or corneal opacity warrants urgent ophthalmic assessment.",[
    ["Anterior uveitis"],["Keratitis","Acute angle-closure glaucoma"],["Scleritis","Corneal abrasion"],["Endophthalmitis","Herpes zoster ophthalmicus"],["Microbial keratitis"],["Acanthamoeba keratitis"]
  ]),
  dive("d26","Name a cause of meningitis in an adult.","Microbiology","The leading organisms vary by age, immune status, exposures, and vaccination history.",[
    ["Streptococcus pneumoniae"],["Neisseria meningitidis","Listeria monocytogenes"],["Haemophilus influenzae","Group B Streptococcus"],["Cryptococcus neoformans","Mycobacterium tuberculosis"],["West Nile virus","Enteroviruses"],["Coccidioides species"]
  ]),
  dive("d27","Name a cause of anion-gap elevation from a toxin or drug.","Toxicology","Toxic alcohols, salicylates, and selected medications can cause high-anion-gap metabolic acidosis.",[
    ["Methanol"],["Ethylene glycol","Salicylates"],["Propylene glycol","Iron toxicity"],["Isoniazid","Metformin-associated lactic acidosis"],["Cyanide"],["5-oxoproline from chronic acetaminophen exposure"]
  ]),
  dive("d28","Name a cause of chronic liver disease.","Gastroenterology","Alcohol-associated disease, metabolic dysfunction-associated steatotic liver disease, and viral hepatitis are common causes.",[
    ["Alcohol-associated liver disease"],["Metabolic dysfunction-associated steatotic liver disease","Chronic hepatitis C"],["Chronic hepatitis B","Autoimmune hepatitis"],["Primary biliary cholangitis","Primary sclerosing cholangitis"],["Hemochromatosis","Wilson disease"],["Alpha-1 antitrypsin deficiency"]
  ]),
  dive("d29","Name a cause of secondary osteoporosis.","Endocrinology","Look for endocrine disease, malabsorption, medications, chronic inflammation, and immobility.",[
    ["Glucocorticoid exposure"],["Hyperthyroidism","Hyperparathyroidism"],["Hypogonadism","Celiac disease"],["Multiple myeloma","Chronic kidney disease"],["Systemic mastocytosis"],["Osteogenesis imperfecta"]
  ]),
  dive("d30","Name an organism associated with foodborne illness or a neurotoxin.","Microbiology","Foodborne illness can involve neurotoxins or organisms with characteristic neurologic complications.",[
    ["Clostridium botulinum"],["Listeria monocytogenes","Campylobacter jejuni"],["Clostridium perfringens","Bacillus cereus"],["Vibrio vulnificus","E. coli producing Shiga toxin"],["Anisakis simplex"],["Staphylococcus aureus"]
  ]),
  dive("d31","Name a cause of acute vision loss.","Ophthalmology","Differentiate monocular from binocular loss and painful from painless loss; retinal and optic nerve disorders are urgent.",[
    ["Central retinal artery occlusion"],["Retinal detachment","Optic neuritis"],["Central retinal vein occlusion","Vitreous hemorrhage"],["Giant cell arteritis","Acute angle-closure glaucoma"],["Nonarteritic anterior ischemic optic neuropathy"],["Endophthalmitis"]
  ]),
  dive("d32","Name a disease associated with a granuloma.","Pathology","Granulomatous inflammation is seen in infections, immune-mediated disease, foreign-body reactions, and selected malignancies.",[
    ["Tuberculosis"],["Sarcoidosis","Crohn disease"],["Histoplasmosis","Berylliosis"],["Granulomatosis with polyangiitis","Cat-scratch disease"],["Leprosy"],["Chronic granulomatous disease"]
  ]),
  dive("d33","Name a cause of acute monoarthritis.","Rheumatology","Septic arthritis must be considered urgently. Crystal disease, trauma, and inflammatory arthritis are common alternatives.",[
    ["Septic arthritis"],["Gout","Calcium pyrophosphate deposition disease"],["Traumatic hemarthrosis","Reactive arthritis"],["Lyme arthritis","Psoriatic arthritis"],["Palindromic rheumatism"],["Pigmented villonodular synovitis"]
  ]),
  dive("d34","Name a cause of painless lower gastrointestinal bleeding.","Gastroenterology","Diverticulosis is a common cause of brisk painless hematochezia in adults; vascular and neoplastic causes are also considered.",[
    ["Diverticulosis"],["Angiodysplasia","Internal hemorrhoids"],["Colonic neoplasm","Meckel diverticulum"],["Radiation proctitis","Ischemic colitis"],["Solitary rectal ulcer syndrome"],["Aortoenteric fistula"]
  ]),
  dive("d35","Name a cause of metabolic alkalosis with low urine chloride.","Physiology","Low urine chloride suggests chloride-responsive alkalosis, often related to gastric losses or remote diuretic exposure.",[
    ["Vomiting"],["Nasogastric suction","Remote diuretic use"],["Chloride-wasting diarrhea","Cystic fibrosis"],["Congenital chloride diarrhea"],["Post-hypercapnic alkalosis"],["Villous adenoma with chloride loss"]
  ]),
  dive("d36","Name a medication or exposure associated with serotonin syndrome.","Pharmacology","Serotonergic toxicity follows combinations or overdose of serotonergic agents; clonus and hyperreflexia are useful clues.",[
    ["SSRI"],["SNRI","MAO inhibitor"],["Tramadol","Linezolid"],["Dextromethorphan","Lithium"],["MDMA","St. John's wort"],["Methylene blue"]
  ])

  ,dive("d37","Name a cause of hypernatremia.","Renal","Hypernatremia reflects water deficit relative to sodium; distinguish water loss from sodium gain.",[
    ["Water deprivation"],["Central diabetes insipidus","Nephrogenic diabetes insipidus"],["Osmotic diuresis","Profuse diarrhea"],["Excess sodium bicarbonate","Hypertonic saline administration"],["Primary hypodipsia","Hypothalamic injury"],["Salt poisoning"]
  ]),
  dive("d38","Name a cause of hyponatremia.","Renal","Hyponatremia requires assessment of tonicity, volume status, medications, and urine studies.",[
    ["SIADH"],["Thiazide diuretics","Heart failure"],["Cirrhosis","Adrenal insufficiency"],["Hypothyroidism","Nephrotic syndrome"],["Primary polydipsia","Low-solute intake (beer potomania)"],["Reset osmostat"]
  ]),
  dive("d39","Name a cause of a widened pulse pressure.","Cardiology","A widened pulse pressure can follow increased stroke volume or reduced arterial compliance.",[
    ["Aortic regurgitation"],["Patent ductus arteriosus","Arteriovenous fistula"],["Hyperthyroidism","Severe anemia"],["Fever","Pregnancy"],["Paget disease of bone"],["Wet beriberi"]
  ]),
  dive("d40","Name a cause of bradycardia.","Cardiology","Bradycardia may be physiologic, medication-related, conduction-system disease, or metabolic.",[
    ["Sinus node dysfunction"],["Atrioventricular block","Hypothermia"],["Beta-blocker toxicity","Calcium-channel blocker toxicity"],["Hypothyroidism","Hyperkalemia"],["Increased intracranial pressure"],["Chagas cardiomyopathy"]
  ]),
  dive("d41","Name a cause of tachycardia.","Cardiology","Sinus tachycardia is a response to many physiologic and pathologic stressors; also consider tachyarrhythmias.",[
    ["Fever"],["Hypovolemia","Anemia"],["Hyperthyroidism","Pain"],["Pulmonary embolism","Sepsis"],["Pheochromocytoma","Atrial fibrillation"],["Inappropriate sinus tachycardia"]
  ]),
  dive("d42","Name a cause of hyperthyroidism.","Endocrinology","Hyperthyroidism can result from gland stimulation, autonomous hormone production, thyroiditis, or exogenous hormone.",[
    ["Graves disease"],["Toxic multinodular goiter","Toxic adenoma"],["Subacute thyroiditis","Iodine-induced hyperthyroidism"],["Amiodarone-induced thyrotoxicosis","Exogenous thyroid hormone"],["Struma ovarii"],["TSH-secreting pituitary adenoma"]
  ]),
  dive("d43","Name a cause of peripheral neuropathy.","Neurology","Peripheral neuropathy has metabolic, toxic, nutritional, immune, infectious, hereditary, and infiltrative causes.",[
    ["Diabetes mellitus"],["Alcohol use","Vitamin B12 deficiency"],["Chemotherapy","Chronic kidney disease"],["Amyloidosis","HIV"],["Charcot-Marie-Tooth disease","Guillain-Barré syndrome"],["Vasculitic neuropathy"]
  ]),
  dive("d44","Name a type or cause of nephrolithiasis.","Renal","Stone composition and urine chemistry help identify metabolic causes and recurrence risks.",[
    ["Calcium oxalate stones"],["Uric acid stones","Struvite stones"],["Cystine stones","Calcium phosphate stones"],["Topiramate-associated stones","Indinavir stones"],["Matrix stones"],["2,8-dihydroxyadenine stones"]
  ]),
  dive("d45","Name an organism that can cause infective endocarditis.","Microbiology","Organisms vary with native versus prosthetic valves, injection exposure, healthcare contact, and culture status.",[
    ["Staphylococcus aureus"],["Viridans group streptococci","Enterococcus faecalis"],["Staphylococcus epidermidis","Streptococcus gallolyticus"],["HACEK organisms","Coxiella burnetii"],["Bartonella species","Brucella species"],["Tropheryma whipplei"]
  ]),
  dive("d46","Name a complication of portal hypertension.","Gastroenterology","Portal hypertension causes collateral formation, splenic congestion, ascites, and complications of advanced liver disease.",[
    ["Esophageal varices"],["Ascites","Splenomegaly"],["Portal hypertensive gastropathy","Spontaneous bacterial peritonitis"],["Hepatic encephalopathy","Hepatorenal syndrome"],["Caput medusae"],["Hepatopulmonary syndrome"]
  ]),
  dive("d47","Name a disease associated with uveitis.","Ophthalmology","Uveitis may be infectious or associated with systemic inflammatory disease; pattern and context guide evaluation.",[
    ["HLA-B27-associated spondyloarthritis"],["Sarcoidosis","Behçet disease"],["Syphilis","Tuberculosis"],["Toxoplasmosis","Herpes zoster"],["Juvenile idiopathic arthritis"],["Vogt-Koyanagi-Harada disease"]
  ]),
  dive("d48","Name an inherited or acquired cause of hypercoagulability.","Hematology","Thrombophilia can be inherited, autoimmune, malignant, medication-associated, or acquired during pregnancy and illness.",[
    ["Factor V Leiden"],["Prothrombin G20210A","Antiphospholipid syndrome"],["Protein C deficiency","Protein S deficiency"],["Antithrombin deficiency","Malignancy-associated thrombosis"],["Pregnancy","Estrogen therapy"],["Paroxysmal nocturnal hemoglobinuria"]
  ]),
  dive("d49","Name a cause of acquired coagulopathy.","Hematology","Coagulation abnormalities may arise from impaired synthesis, consumption, anticoagulants, or acquired inhibitors.",[
    ["Vitamin K deficiency"],["Liver failure","Disseminated intravascular coagulation"],["Warfarin exposure","Heparin exposure"],["Massive transfusion","Dilutional coagulopathy"],["Acquired factor VIII inhibitor"],["Amyloid-associated factor X deficiency"]
  ]),
  dive("d50","Name a medication associated with drug-induced lupus.","Pharmacology","Drug-induced lupus is associated with several medications; antihistone antibodies are common but not universal.",[
    ["Hydralazine"],["Procainamide","Isoniazid"],["Minocycline","Methyldopa"],["Chlorpromazine","Quinidine"],["TNF inhibitor-associated lupus-like syndrome"],["Interferon alfa"]
  ]),
  dive("d51","Name a cause of postpartum hemorrhage.","Obstetrics","The classic framework is tone, trauma, tissue, and thrombin; uterine atony is the most common cause.",[
    ["Uterine atony"],["Retained placental tissue","Genital tract trauma"],["Coagulopathy","Uterine inversion"],["Placenta accreta spectrum","Uterine rupture"],["Amniotic fluid embolism-associated DIC"],["Subinvolution of the placental site"]
  ]),
  dive("d52","Name a cause or risk factor for fetal growth restriction.","Obstetrics","Fetal growth restriction may be placental, maternal, fetal, infectious, or genetic.",[
    ["Placental insufficiency"],["Preeclampsia","Maternal hypertension"],["Tobacco exposure","Alcohol use"],["Cytomegalovirus","Congenital toxoplasmosis"],["Trisomy 18","Trisomy 13"],["Antiphospholipid syndrome"]
  ]),
  dive("d53","Name a cause of neonatal jaundice.","Pediatrics","Neonatal jaundice may be unconjugated from increased bilirubin production or impaired conjugation, or conjugated from hepatobiliary disease.",[
    ["Physiologic jaundice"],["Breastfeeding jaundice","Breast milk jaundice"],["ABO incompatibility","Rh incompatibility"],["G6PD deficiency","Hereditary spherocytosis"],["Biliary atresia","Neonatal hepatitis"],["Crigler-Najjar syndrome"]
  ]),
  dive("d54","Name a cause of pulsus paradoxus.","Cardiology","Pulsus paradoxus is an exaggerated inspiratory fall in systolic blood pressure and is classically associated with tamponade.",[
    ["Cardiac tamponade"],["Severe asthma","COPD exacerbation"],["Constrictive pericarditis","Tension pneumothorax"],["Hypovolemic shock","Pulmonary embolism"],["Large pericardial effusion"],["Severe obstructive sleep apnea"]
  ]),
  dive("d55","Name a cause of acute altered mental status.","Emergency Medicine","Rapidly assess glucose, oxygenation, temperature, medications, infection, trauma, and neurologic emergencies.",[
    ["Hypoglycemia"],["Hypoxia","Hypercapnia"],["Sepsis","Medication toxicity"],["Electrolyte disturbance","Uremia"],["Stroke","Intracranial hemorrhage"],["Wernicke encephalopathy"]
  ]),
  dive("d56","Name a cause of an acute abdomen.","Emergency Medicine","Time-critical diagnoses include vascular, inflammatory, obstructive, perforating, and reproductive emergencies.",[
    ["Appendicitis"],["Acute cholecystitis","Bowel obstruction"],["Pancreatitis","Perforated peptic ulcer"],["Mesenteric ischemia","Diverticulitis"],["Ectopic pregnancy","Ovarian torsion"],["Ruptured abdominal aortic aneurysm"]
  ]),
  dive("d57","Name a cause of hemoptysis.","Pulmonology","Hemoptysis ranges from airway inflammation to infection, malignancy, vascular disease, and pulmonary-renal syndromes.",[
    ["Acute bronchitis"],["Pneumonia","Bronchiectasis"],["Tuberculosis","Lung cancer"],["Pulmonary embolism","Mitral stenosis"],["Goodpasture syndrome","Granulomatosis with polyangiitis"],["Pulmonary arteriovenous malformation"]
  ]),
  dive("d58","Name a cause of a low anion gap.","Laboratory Medicine","Hypoalbuminemia is the most common cause; paraproteins, cations, halides, and analytic error are other possibilities.",[
    ["Hypoalbuminemia"],["Lithium intoxication","Multiple myeloma"],["Hypermagnesemia","Hypercalcemia"],["Bromide intoxication","Iodide intoxication"],["Polyclonal gammopathy"],["Laboratory measurement error"]
  ]),
  dive("d59","Name a cause of elevated alkaline phosphatase.","Laboratory Medicine","Alkaline phosphatase is found in liver and bone; correlate with GGT and the clinical setting.",[
    ["Cholestasis"],["Paget disease of bone","Healing fracture"],["Pregnancy","Normal childhood growth"],["Osteomalacia","Bone metastases"],["Primary biliary cholangitis","Primary sclerosing cholangitis"],["Benign transient hyperphosphatasemia"]
  ]),
  dive("d60","Name a cause of mineralocorticoid excess or a similar phenotype.","Endocrinology","Primary aldosteronism is common, but low-renin hypertension can also arise from inherited or acquired mimics.",[
    ["Adrenal aldosterone-producing adenoma"],["Bilateral adrenal hyperplasia","Familial hyperaldosteronism"],["Renin-secreting tumor","Renovascular hypertension"],["Apparent mineralocorticoid excess","Licorice ingestion"],["Liddle syndrome"],["11β-hydroxylase deficiency"]
  ]),
  dive("d61","Name a cause of hypocalcemia.","Endocrinology","Hypocalcemia results from impaired PTH action, vitamin D deficiency, renal disease, calcium shifts, or binding.",[
    ["Hypoparathyroidism"],["Vitamin D deficiency","Chronic kidney disease"],["Acute pancreatitis","Sepsis"],["Hypomagnesemia","Hungry bone syndrome"],["Massive transfusion citrate load"],["Pseudohypoparathyroidism"]
  ]),
  dive("d62","Name a cause of hyperkalemia.","Renal","Hyperkalemia results from reduced renal excretion, transcellular shift, or release from damaged cells; exclude pseudohyperkalemia.",[
    ["Renal failure"],["ACE inhibitor or ARB therapy","Potassium-sparing diuretics"],["Adrenal insufficiency","Rhabdomyolysis"],["Tumor lysis syndrome","Intravascular hemolysis"],["Type 4 renal tubular acidosis"],["Pseudohyperkalemia from sample hemolysis"]
  ]),
  dive("d63","Name a cause of hypokalemia.","Renal","Hypokalemia is caused by gastrointestinal loss, renal wasting, low intake, or intracellular shift; magnesium matters.",[
    ["Loop or thiazide diuretic use"],["Vomiting","Diarrhea"],["Primary hyperaldosteronism","Cushing syndrome"],["Renal tubular acidosis","Hypomagnesemia"],["Beta-agonist exposure","Insulin therapy"],["Gitelman syndrome"]
  ]),
  dive("d64","Name a cause of respiratory alkalosis.","Pulmonology","Respiratory alkalosis reflects hyperventilation; assess oxygenation, pregnancy, CNS disease, and systemic illness.",[
    ["Anxiety or panic"],["Pulmonary embolism","Sepsis"],["Pregnancy","High altitude"],["Salicylate intoxication","Hepatic disease"],["Mechanical overventilation"],["Early severe asthma"]
  ]),
  dive("d65","Name a cause of restrictive lung disease.","Pulmonology","Restriction can be parenchymal, pleural, chest-wall, neuromuscular, or related to body habitus.",[
    ["Idiopathic pulmonary fibrosis"],["Sarcoidosis","Pneumoconiosis"],["Systemic sclerosis","Rheumatoid arthritis"],["Neuromuscular weakness","Obesity-related restriction"],["Pleural effusion","Kyphoscoliosis"],["Hypersensitivity pneumonitis"]
  ]),
  dive("d66","Name an organism that can cause a brain abscess.","Microbiology","Brain abscess pathogens depend on source, immune status, and geography; contiguous spread and hematogenous seeding are common routes.",[
    ["Streptococcus anginosus group"],["Staphylococcus aureus","Anaerobic oral flora"],["Nocardia species","Toxoplasma gondii"],["Aspergillus species","Cryptococcus neoformans"],["Entamoeba histolytica"],["Balamuthia mandrillaris"]
  ]),
  dive("d67","Name a trigger or cause of acute respiratory distress syndrome.","Pulmonology","ARDS follows direct or indirect lung injury with acute hypoxemia and bilateral opacities not fully explained by cardiac failure.",[
    ["Sepsis"],["Pneumonia","Aspiration"],["Major trauma","Acute pancreatitis"],["Massive transfusion","Near drowning"],["Inhalational injury","Drug overdose"],["Transfusion-related acute lung injury"]
  ]),
  dive("d68","Name a cause of unconjugated hyperbilirubinemia.","Gastroenterology","Unconjugated bilirubin rises with increased production, impaired conjugation, or altered uptake.",[
    ["Hemolysis"],["Gilbert syndrome","Crigler-Najjar syndrome"],["Ineffective erythropoiesis","Hematoma resorption"],["Physiologic neonatal jaundice"],["Drug-mediated UGT1A1 inhibition"],["Breast milk jaundice"]
  ]),
  dive("d69","Name a cause of hematuria.","Renal","Hematuria may be glomerular or nonglomerular; consider infection, stones, malignancy, and vascular causes.",[
    ["Urinary tract infection"],["Urolithiasis","Glomerulonephritis"],["Bladder carcinoma","Renal cell carcinoma"],["Papillary necrosis","Polycystic kidney disease"],["Sickle cell trait"],["Nutcracker syndrome"]
  ]),
  dive("d70","Name a cause of secondary erythrocytosis or polycythemia.","Hematology","Secondary erythrocytosis is driven by increased erythropoietin or chronic hypoxia; distinguish it from polycythemia vera.",[
    ["Chronic hypoxemia"],["Obstructive sleep apnea","Cigarette smoking or carbon monoxide"],["Erythropoietin-producing renal cell carcinoma","High altitude"],["Testosterone therapy","Chronic lung disease"],["Renal artery stenosis"],["Post-transplant erythrocytosis"]
  ]),
  dive("d71","Name a cause of macrocytic anemia.","Hematology","Macrocytosis may reflect impaired DNA synthesis, alcohol or liver disease, marrow disorders, medications, or reticulocytosis.",[
    ["Vitamin B12 deficiency"],["Folate deficiency","Alcohol use"],["Liver disease","Hypothyroidism"],["Reticulocytosis","Myelodysplastic syndrome","Hydroxyurea"],["Methotrexate","Zidovudine","Valproate"],["Nitrous oxide exposure","Phenytoin","Copper deficiency","Diamond-Blackfan anemia"]
  ]),
  dive("d72","Name a mechanism or cause of hypoxemia.","Pulmonology","Hypoxemia results from low inspired oxygen, hypoventilation, diffusion limitation, V/Q mismatch, or right-to-left shunt.",[
    ["Ventilation-perfusion mismatch"],["Right-to-left shunt","Hypoventilation"],["Diffusion impairment","Low inspired oxygen at altitude"],["Pneumonia","Pulmonary edema","Pulmonary embolism"],["Atelectasis","ARDS","COPD exacerbation"],["Pneumothorax","Intracardiac shunt","Obesity hypoventilation","Neuromuscular respiratory weakness"]
  ]),
  dive("d73","Name a cause of chronic diarrhea.","Gastroenterology","Chronic diarrhea can be inflammatory, osmotic, secretory, malabsorptive, infectious, medication-related, or functional.",[
    ["Irritable bowel syndrome"],["Celiac disease","Inflammatory bowel disease"],["Lactose intolerance","Microscopic colitis"],["Chronic pancreatitis","Bile acid diarrhea","Giardiasis"],["Small intestinal bacterial overgrowth","Metformin","Hyperthyroidism"],["Whipple disease","Common variable immunodeficiency","Short bowel syndrome","Colorectal cancer"]
  ]),
  dive("d74","Name an organism that can cause osteomyelitis.","Infectious Disease","Staphylococcus aureus is the leading cause; age, sickle cell disease, puncture wounds, hardware, and immune status shift the organism.",[
    ["Staphylococcus aureus"],["Salmonella species","Group B Streptococcus"],["Pseudomonas aeruginosa","Kingella kingae"],["Escherichia coli","Klebsiella pneumoniae","Staphylococcus epidermidis"],["Mycobacterium tuberculosis","Brucella species","Serratia marcescens"],["Cutibacterium acnes","Candida species","Aspergillus species","Bacteroides species"]
  ]),
  dive("d75","Name a cause or association of pulmonary hypertension.","Cardiology","Pulmonary hypertension may arise from pulmonary arterial disease, left-heart disease, lung disease or hypoxia, chronic thromboembolism, and multifactorial conditions.",[
    ["Left-sided heart disease"],["Chronic lung disease","Chronic thromboembolic disease"],["Systemic sclerosis","Congenital heart disease"],["HIV infection","Portal hypertension","Methamphetamine exposure"],["Obstructive sleep apnea","Interstitial lung disease","Schistosomiasis"],["Heritable BMPR2-associated disease","Sickle cell disease","Sarcoidosis","Chronic hypoxia at altitude"]
  ]),
  dive("d76","Name a cause of acute liver failure.","Gastroenterology","Acute liver failure can follow toxic, viral, autoimmune, ischemic, metabolic, vascular, or pregnancy-related injury.",[
    ["Acetaminophen toxicity"],["Acute hepatitis B","Autoimmune hepatitis"],["Hepatitis A","Hepatitis E","Ischemic hepatitis"],["Wilson disease","Amanita phalloides poisoning","Drug-induced liver injury"],["Herpes simplex hepatitis","Budd-Chiari syndrome","Acute fatty liver of pregnancy"],["HELLP syndrome","Valproate toxicity","Isoniazid toxicity","Severe heatstroke"]
  ]),
  dive("d77","Name a cause of adrenal insufficiency.","Endocrinology","Primary adrenal failure damages the adrenal cortex; secondary or tertiary disease reduces ACTH or hypothalamic stimulation.",[
    ["Autoimmune adrenalitis"],["Abrupt glucocorticoid withdrawal","Bilateral adrenal hemorrhage"],["Tuberculosis","Metastatic disease"],["Pituitary adenoma or surgery","Pituitary apoplexy","Sheehan syndrome"],["Adrenoleukodystrophy","Adrenal histoplasmosis","Immune checkpoint inhibitor toxicity"],["Bilateral adrenalectomy","Congenital adrenal hyperplasia","Lymphocytic hypophysitis","Infiltrative sarcoidosis"]
  ]),
  dive("d78","Name a cause of pleural effusion.","Pulmonology","Pleural fluid may be a transudate from systemic hydrostatic or oncotic forces, or an exudate from local inflammation, infection, malignancy, or vascular disease.",[
    ["Congestive heart failure"],["Pneumonia","Malignancy"],["Pulmonary embolism","Cirrhosis with hepatic hydrothorax"],["Tuberculosis","Nephrotic syndrome","Pancreatitis"],["Rheumatoid pleuritis","Systemic lupus erythematosus","Uremia"],["Esophageal rupture","Chylothorax","Hemothorax","Meigs syndrome"]
  ]),
  dive("d79","Name a cause of hyperammonemia.","Hepatology","Ammonia rises with impaired hepatic clearance, portosystemic shunting, excess nitrogen load, selected medications, or urea-cycle defects.",[
    ["Acute liver failure"],["Cirrhosis","Urea-cycle disorder"],["Portosystemic shunt","Gastrointestinal bleeding"],["Valproate","Urease-producing urinary infection","Reye syndrome"],["Ornithine transcarbamylase deficiency","Severe catabolic stress","Total parenteral nutrition"],["Citrullinemia","Argininosuccinic aciduria","Multiple myeloma-associated hyperammonemia","Post-transplant metabolic decompensation"]
  ]),
  dive("d80","Name a cause or association of eosinophilia.","Hematology","Eosinophilia is associated with allergic disease, drug reactions, helminths, selected malignancies, immune disorders, and primary hematologic disease.",[
    ["Atopic disease"],["Asthma","Helminth infection"],["Drug hypersensitivity","Eosinophilic esophagitis"],["DRESS syndrome","Eosinophilic granulomatosis with polyangiitis","Hodgkin lymphoma"],["Strongyloidiasis","Schistosomiasis","Allergic bronchopulmonary aspergillosis"],["Hypereosinophilic syndrome","Adrenal insufficiency","Toxocariasis","Chronic eosinophilic leukemia"]
  ])

];

export type TriviaCategoryId = "anatomy" | "physiology" | "pathology" | "pharmacology" | "microbiology" | "clinical";
export interface TriviaCategory { id: TriviaCategoryId; name: string; short: string; icon: string; color: string }
export interface TriviaQuestion { id: string; category: TriviaCategoryId; question: string; options: [string,string,string,string]; answer: number; explanation: string; difficulty: 1 | 2 | 3 }
export const triviaCategories: TriviaCategory[] = [
  { id:"anatomy", name:"Anatomy", short:"ANATOMY", icon:"🦴", color:"#29b6f6" },
  { id:"physiology", name:"Physiology", short:"PHYSIOLOGY", icon:"⚡", color:"#8d70ff" },
  { id:"pathology", name:"Pathology", short:"PATHOLOGY", icon:"🧫", color:"#ff628d" },
  { id:"pharmacology", name:"Pharmacology", short:"PHARMA", icon:"💊", color:"#ffb547" },
  { id:"microbiology", name:"Microbiology", short:"MICRO", icon:"🦠", color:"#35cf9c" },
  { id:"clinical", name:"Clinical", short:"CLINICAL", icon:"🩺", color:"#ff7d45" }
];
export const triviaQuestions: TriviaQuestion[] = [
  {id:"ta01",category:"anatomy",difficulty:1,question:"Which nerve passes through the foramen ovale?",options:["Mandibular division of CN V","Maxillary division of CN V","Ophthalmic division of CN V","Facial nerve"],answer:0,explanation:"V3 exits the skull through the foramen ovale; V2 uses foramen rotundum and V1 uses the superior orbital fissure."},
  {id:"ta02",category:"anatomy",difficulty:1,question:"Which nerve provides the major motor supply to the diaphragm?",options:["Vagus nerve","Phrenic nerve","Intercostal nerve T12","Long thoracic nerve"],answer:1,explanation:"The phrenic nerve arises primarily from C3–C5 and innervates the diaphragm."},
  {id:"ta03",category:"anatomy",difficulty:2,question:"A fracture at the surgical neck of the humerus most threatens which nerve?",options:["Radial","Median","Axillary","Ulnar"],answer:2,explanation:"The axillary nerve winds around the surgical neck with the posterior circumflex humeral artery."},
  {id:"ta04",category:"anatomy",difficulty:2,question:"Which artery most commonly supplies the sinoatrial node?",options:["Left anterior descending","Right coronary artery","Left circumflex in every patient","Posterior descending artery"],answer:1,explanation:"The SA nodal artery most often arises from the RCA, although left circumflex origin is a normal variant."},
  {id:"ta05",category:"anatomy",difficulty:1,question:"What is the functional unit of the kidney?",options:["Glomerulus","Nephron","Renal pyramid","Collecting duct"],answer:1,explanation:"The nephron comprises the glomerulus and tubular segments that filter and modify the filtrate."},
  {id:"ta06",category:"anatomy",difficulty:2,question:"Where is cerebrospinal fluid primarily reabsorbed into the venous circulation?",options:["Choroid plexus","Arachnoid granulations","Ependymal lining","Cerebral aqueduct"],answer:1,explanation:"Arachnoid granulations return CSF to dural venous sinuses."},
  {id:"ta07",category:"anatomy",difficulty:2,question:"Compression of which retinal fibers causes bitemporal hemianopia?",options:["Temporal retinal fibers","Nasal retinal fibers","Macular fibers only","Optic tract fibers"],answer:1,explanation:"Nasal retinal fibers cross in the optic chiasm; a midline lesion classically causes bitemporal hemianopia."},
  {id:"ta08",category:"anatomy",difficulty:2,question:"Which structure forms the medial boundary of the femoral triangle?",options:["Sartorius","Inguinal ligament","Adductor longus","Iliopsoas"],answer:2,explanation:"The femoral triangle is bounded by the inguinal ligament superiorly, sartorius laterally, and adductor longus medially."},

  {id:"tp01",category:"physiology",difficulty:1,question:"Which change shifts the oxyhemoglobin dissociation curve to the right?",options:["Lower temperature","Lower 2,3-BPG","Higher carbon dioxide","Higher pH"],answer:2,explanation:"Increased CO₂, increased H⁺, increased temperature, and increased 2,3-BPG reduce hemoglobin's oxygen affinity."},
  {id:"tp02",category:"physiology",difficulty:1,question:"Which spirometric pattern is most characteristic of obstructive lung disease?",options:["Increased FEV₁/FVC","Reduced FEV₁/FVC","Normal FEV₁ with increased FVC","Increased total lung capacity is required"],answer:1,explanation:"Obstruction lowers FEV₁ disproportionately, reducing the FEV₁/FVC ratio."},
  {id:"tp03",category:"physiology",difficulty:2,question:"The Frank-Starling mechanism describes increased stroke volume in response to:",options:["Increased afterload","Increased end-diastolic fiber stretch","Reduced venous return","Reduced contractility"],answer:1,explanation:"Within physiologic limits, greater preload stretches myocardial fibers and increases stroke volume."},
  {id:"tp04",category:"physiology",difficulty:2,question:"ADH increases water reabsorption in collecting ducts primarily through which receptor?",options:["V1a","V1b","V2","V3"],answer:2,explanation:"V2 receptor activation increases cAMP and inserts aquaporin-2 channels into the collecting duct apical membrane."},
  {id:"tp05",category:"physiology",difficulty:1,question:"Aldosterone acts most directly to increase:",options:["Sodium reabsorption and potassium secretion","Potassium reabsorption and sodium secretion","Bicarbonate secretion in the proximal tubule","Glucose uptake in skeletal muscle"],answer:0,explanation:"Aldosterone increases ENaC and Na⁺/K⁺-ATPase activity in principal cells, increasing sodium reabsorption and potassium secretion."},
  {id:"tp06",category:"physiology",difficulty:2,question:"The Bohr effect refers to reduced hemoglobin oxygen affinity with:",options:["Lower CO₂ and higher pH","Higher CO₂ and lower pH","Lower temperature","Lower 2,3-BPG"],answer:1,explanation:"Increased CO₂ and H⁺ promote oxygen unloading in metabolically active tissue."},
  {id:"tp07",category:"physiology",difficulty:1,question:"Which transporter is stimulated by insulin to move to the cell membrane in skeletal muscle?",options:["GLUT1","GLUT2","GLUT3","GLUT4"],answer:3,explanation:"Insulin promotes GLUT4 translocation in skeletal muscle and adipose tissue."},
  {id:"tp08",category:"physiology",difficulty:2,question:"Which nephron segment reabsorbs the largest fraction of filtered sodium?",options:["Proximal convoluted tubule","Thick ascending limb","Distal convoluted tubule","Collecting duct"],answer:0,explanation:"The proximal tubule reabsorbs roughly two-thirds of filtered sodium and water."},

  {id:"th01",category:"pathology",difficulty:1,question:"Which cell is characteristic of classical Hodgkin lymphoma?",options:["Reed–Sternberg cell","Auer-rod cell","Smudge cell","Touton giant cell"],answer:0,explanation:"Classical Hodgkin lymphoma contains Reed–Sternberg cells, typically CD15 and CD30 positive."},
  {id:"th02",category:"pathology",difficulty:1,question:"Which stain is classically used to demonstrate amyloid?",options:["Prussian blue","Congo red","PAS only","Masson trichrome"],answer:1,explanation:"Congo red–stained amyloid shows apple-green birefringence under polarized light."},
  {id:"th03",category:"pathology",difficulty:2,question:"What type of necrosis is typical after myocardial infarction?",options:["Liquefactive","Caseous","Coagulative","Fat"],answer:2,explanation:"Ischemia in most solid organs produces coagulative necrosis; the brain is the classic exception."},
  {id:"th04",category:"pathology",difficulty:1,question:"Which organism is classically associated with caseating granulomas?",options:["Mycobacterium tuberculosis","Staphylococcus epidermidis","Treponema pallidum","Bordetella pertussis"],answer:0,explanation:"Tuberculosis classically causes caseating granulomas, although morphology varies by host and site."},
  {id:"th05",category:"pathology",difficulty:2,question:"Which renal finding is typical of poststreptococcal glomerulonephritis?",options:["Normal complement in the acute phase","Subepithelial humps on electron microscopy","Linear IgG along the basement membrane","Isolated podocyte foot-process effacement"],answer:1,explanation:"Poststreptococcal GN classically shows granular immune deposits and subepithelial humps; C3 is often low."},
  {id:"th06",category:"pathology",difficulty:2,question:"Which finding is most characteristic of chronic myeloid leukemia?",options:["BCR-ABL fusion","PML-RARA fusion","JAK2 V617F in all cases","MYC translocation"],answer:0,explanation:"CML is driven by the BCR-ABL1 fusion from t(9;22), the Philadelphia chromosome."},
  {id:"th07",category:"pathology",difficulty:2,question:"Which process causes fat necrosis in acute pancreatitis?",options:["Pancreatic lipase-mediated triglyceride breakdown","Complement-mediated red-cell lysis","Neutrophil elastase in alveoli","Fibrin deposition in glomeruli"],answer:0,explanation:"Pancreatic enzymes release fatty acids that bind calcium, producing chalky saponification."},
  {id:"th08",category:"pathology",difficulty:1,question:"Which pathology is associated with noncaseating granulomas?",options:["Sarcoidosis","Acute appendicitis","Osteoarthritis","Minimal change disease"],answer:0,explanation:"Sarcoidosis classically causes noncaseating granulomas, but infection must be excluded."},

  {id:"tf01",category:"pharmacology",difficulty:1,question:"Unfractionated heparin exerts its anticoagulant effect by potentiating:",options:["Protein C","Antithrombin","Plasmin","Vitamin K epoxide reductase"],answer:1,explanation:"Heparin accelerates antithrombin-mediated inhibition of thrombin and factor Xa."},
  {id:"tf02",category:"pharmacology",difficulty:1,question:"Warfarin inhibits which enzyme?",options:["Cyclooxygenase-1","Thrombin","Vitamin K epoxide reductase","Factor Xa"],answer:2,explanation:"Warfarin inhibits VKORC1, reducing regeneration of reduced vitamin K and synthesis of functional factors II, VII, IX, and X."},
  {id:"tf03",category:"pharmacology",difficulty:1,question:"ACE-inhibitor cough is associated with increased:",options:["Bradykinin","Histamine degradation","Aldosterone","Acetylcholine"],answer:0,explanation:"ACE also degrades bradykinin; its accumulation contributes to cough and, rarely, angioedema."},
  {id:"tf04",category:"pharmacology",difficulty:1,question:"Aminoglycosides inhibit bacterial protein synthesis by binding which ribosomal subunit?",options:["30S","50S","60S","80S"],answer:0,explanation:"Aminoglycosides bind the 30S subunit, causing misreading of mRNA; they are concentration-dependent bactericidal agents."},
  {id:"tf05",category:"pharmacology",difficulty:1,question:"Vancomycin inhibits bacterial cell-wall synthesis by binding:",options:["Penicillin-binding proteins","D-Ala-D-Ala termini","DNA gyrase","30S ribosome"],answer:1,explanation:"Vancomycin binds D-Ala-D-Ala on peptidoglycan precursors, blocking cell-wall assembly."},
  {id:"tf06",category:"pharmacology",difficulty:1,question:"Atropine is an antagonist at which receptor?",options:["Nicotinic","Muscarinic","Alpha-1","Beta-2"],answer:1,explanation:"Atropine competitively blocks muscarinic acetylcholine receptors."},
  {id:"tf07",category:"pharmacology",difficulty:2,question:"Methotrexate inhibits which enzyme?",options:["Dihydrofolate reductase","Thymidylate synthase","Xanthine oxidase","HMG-CoA reductase"],answer:0,explanation:"Methotrexate inhibits dihydrofolate reductase, reducing tetrahydrofolate availability and DNA synthesis."},
  {id:"tf08",category:"pharmacology",difficulty:2,question:"Which antidote is used for acetaminophen toxicity?",options:["Fomepizole","N-acetylcysteine","Flumazenil","Pralidoxime"],answer:1,explanation:"N-acetylcysteine replenishes glutathione and supports detoxification of NAPQI."},

  {id:"tm01",category:"microbiology",difficulty:1,question:"Which genus is catalase positive?",options:["Streptococcus","Enterococcus","Staphylococcus","Aerococcus"],answer:2,explanation:"Staphylococci are catalase positive; streptococci and enterococci are catalase negative."},
  {id:"tm02",category:"microbiology",difficulty:1,question:"Which organism is classically oxidase positive and produces blue-green pigment?",options:["Pseudomonas aeruginosa","Escherichia coli","Shigella sonnei","Streptococcus pyogenes"],answer:0,explanation:"Pseudomonas aeruginosa is oxidase positive and may produce pyocyanin and pyoverdine pigments."},
  {id:"tm03",category:"microbiology",difficulty:1,question:"Which bacteria are acid-fast because of mycolic acids in their cell walls?",options:["Mycobacteria","Neisseria","Clostridia","Spirochetes"],answer:0,explanation:"Mycobacteria have lipid-rich, mycolic-acid-containing cell walls that retain acid-fast stains."},
  {id:"tm04",category:"microbiology",difficulty:1,question:"Pseudomembranous colitis after antibiotic exposure is classically caused by:",options:["Clostridioides difficile","Campylobacter jejuni","Vibrio cholerae","Yersinia pestis"],answer:0,explanation:"C. difficile toxins damage colonic mucosa and produce pseudomembranes."},
  {id:"tm05",category:"microbiology",difficulty:1,question:"Which virus is associated with a positive heterophile antibody test in infectious mononucleosis?",options:["Cytomegalovirus","Epstein–Barr virus","Parvovirus B19","Adenovirus"],answer:1,explanation:"EBV infects B cells via CD21 and often causes heterophile-positive infectious mononucleosis."},
  {id:"tm06",category:"microbiology",difficulty:2,question:"Which bacterium is a lancet-shaped, gram-positive diplococcus?",options:["Streptococcus pneumoniae","Enterococcus faecalis","Neisseria gonorrhoeae","Moraxella catarrhalis"],answer:0,explanation:"S. pneumoniae is an encapsulated, alpha-hemolytic, lancet-shaped gram-positive diplococcus."},
  {id:"tm07",category:"microbiology",difficulty:1,question:"Which organism causes syphilis?",options:["Borrelia burgdorferi","Treponema pallidum","Leptospira interrogans","Rickettsia rickettsii"],answer:1,explanation:"Treponema pallidum is a spirochete transmitted primarily through sexual contact and transplacentally."},
  {id:"tm08",category:"microbiology",difficulty:2,question:"A painless eschar with marked surrounding edema after animal-hide exposure suggests:",options:["Bacillus anthracis","Francisella tularensis","Yersinia pestis","Pasteurella multocida"],answer:0,explanation:"Cutaneous anthrax classically forms a painless black eschar with surrounding edema."},

  {id:"tc01",category:"clinical",difficulty:1,question:"A patient with diabetic ketoacidosis has potassium 2.8 mEq/L. What should happen before insulin is started?",options:["Give bicarbonate immediately","Replace potassium","Give IV calcium","Start insulin at a higher dose"],answer:1,explanation:"Insulin shifts potassium intracellularly. With severe hypokalemia, replace potassium first and delay insulin until it is safe per protocol."},
  {id:"tc02",category:"clinical",difficulty:1,question:"Which medication is first-line for anaphylaxis?",options:["IV diphenhydramine","IM epinephrine","Inhaled albuterol alone","IV corticosteroid"],answer:1,explanation:"Prompt intramuscular epinephrine in the anterolateral thigh is first-line treatment; adjuncts do not replace it."},
  {id:"tc03",category:"clinical",difficulty:1,question:"What is the initial brain imaging study for most patients with suspected acute stroke?",options:["Noncontrast head CT","MRI with contrast","Carotid ultrasound","CT of the cervical spine"],answer:0,explanation:"Noncontrast CT rapidly evaluates for hemorrhage; vascular imaging and MRI may follow depending on the pathway."},
  {id:"tc04",category:"clinical",difficulty:2,question:"A patient has fever, meningismus, and a new focal neurologic deficit. What is the safest immediate approach?",options:["Delay treatment until lumbar puncture","Start empiric antimicrobials promptly and obtain indicated neuroimaging before LP","Perform LP before cultures or treatment","Give corticosteroids only"],answer:1,explanation:"A focal deficit is a reason to image before LP, but empiric treatment should not be delayed while waiting for imaging."},
  {id:"tc05",category:"clinical",difficulty:1,question:"Which ECG finding is most characteristic of acute pericarditis?",options:["Diffuse ST elevation with PR depression","ST depression in V1–V3 only","Delta wave","Peaked T waves with wide QRS"],answer:0,explanation:"Acute pericarditis classically causes diffuse concave ST elevation and PR depression, with important exceptions."},
  {id:"tc06",category:"clinical",difficulty:2,question:"A patient with suspected ectopic pregnancy is hypotensive with peritoneal signs. What is the priority?",options:["Outpatient serial hCG","Urgent operative management and resuscitation","Methotrexate and discharge","Wait for a repeat ultrasound in 48 hours"],answer:1,explanation:"Hemodynamic instability suggests rupture and requires immediate resuscitation and surgical management."},
  {id:"tc07",category:"clinical",difficulty:1,question:"Which finding is most concerning for septic arthritis in a patient with an acutely swollen joint?",options:["Fever and severe pain with passive range of motion","Chronic painless crepitus","Symmetric DIP nodules","Pain that resolves with activity"],answer:0,explanation:"An acutely painful joint with restricted passive motion warrants urgent arthrocentesis to evaluate for infection."},
  {id:"tc08",category:"clinical",difficulty:1,question:"A patient has crushing chest pain and an ECG with ST elevation in contiguous leads. What is the key time-critical action?",options:["Arrange urgent reperfusion","Schedule outpatient stress testing","Wait for a second troponin before activating the pathway","Start antibiotics"],answer:0,explanation:"A STEMI requires immediate reperfusion assessment and activation; do not wait for troponin when the ECG is diagnostic."}
];


function classifyTriviaTopic(raw: string): TriviaCategoryId {
  const text = raw.toLowerCase();
  if (/\b(drug|medication|antidote|antibiotic|insulin|anticoagulant|pharmac|dose|toxicity|overdose|reversal|beta blocker|diuretic|warfarin|heparin)\b/.test(text)) return "pharmacology";
  if (/\b(bacter|virus|viral|fung|parasite|microb|infection|infectious|sepsis|pneumonia|meningitis|mycobacter|treponema|clostrid|staph|strep|pseudomonas|legionella|organism)\b/.test(text)) return "microbiology";
  if (/\b(anatom|nerve|cranial|cortex|cerebell|hippocamp|artery|vein|bone|muscle|spinal|optic|retina|foramen|nephron|atrium|ventricle|diaphragm)\b/.test(text)) return "anatomy";
  if (/\b(physiolog|electrolyte|acid.base|anion gap|potassium|sodium|calcium|hormone|thyroid|adrenal|glucose|insulin resistance|oxygen|ventilat|osmolality|aldosterone|cortisol|fev1|preload|afterload)\b/.test(text)) return "physiology";
  if (/\b(patholog|biopsy|histolog|malignan|carcinoma|leukemia|lymphoma|tumou?r|necrosis|granuloma|amyloid|hemolytic|anemia|vasculitis|neoplasm|metaplasia|dysplasia)\b/.test(text)) return "pathology";
  return "clinical";
}

const associationTrivia: TriviaQuestion[] = pairsBank.map(([term, definition], index) => {
  const correct = String(definition);
  const distractors = [...new Set(pairsBank.map((pair) => String(pair[1])).filter((value) => value !== correct && value.trim().length > 0))];
  const chosen = shuffle(distractors, seeded(hashSeed("assoc|" + index + "|" + term))).slice(0, 3);
  const options = shuffle([correct, ...chosen], seeded(hashSeed("order|" + term))) as [string,string,string,string];
  return {
    id: "assoc-" + String(index + 1).padStart(3, "0"),
    category: classifyTriviaTopic(String(term) + " " + correct),
    question: "Which description best matches " + term + "?",
    options,
    answer: options.indexOf(correct),
    explanation: "Term: " + String(term) + ". Association: " + correct,
    difficulty: 1
  };
});

const diagnosisTrivia: TriviaQuestion[] = diagnosisCases
  .filter((item) => item.options.length === 4 && item.options.includes(item.answer))
  .map((item) => ({
    id: "diagnosis-" + item.id,
    category: classifyTriviaTopic(item.title + " " + item.clues.join(" ") + " " + item.explanation),
    question: "Which diagnosis best fits this presentation? " + item.clues.slice(0, 3).join(" "),
    options: [...item.options] as [string,string,string,string],
    answer: item.options.indexOf(item.answer),
    explanation: item.explanation + " Reference: " + item.source,
    difficulty: 2
  }));

const nextStepTrivia: TriviaQuestion[] = nextStepCases
  .filter((item) => item.options.length === 4 && item.answer >= 0 && item.answer < 4)
  .map((item) => ({
    id: "nextstep-" + item.id,
    category: classifyTriviaTopic(item.specialty + " " + item.vignette + " " + item.question),
    question: item.vignette + " " + item.question,
    options: [...item.options] as [string,string,string,string],
    answer: item.answer,
    explanation: item.explanation + " Reference: " + item.source,
    difficulty: 2
  }));

// Large, curated clinical banks back the wheel so categories do not run out after a few sessions.
triviaQuestions.push(...associationTrivia, ...diagnosisTrivia, ...nextStepTrivia);

export const triviaContentCounts = {
  authoredQuestions: 48,
  associationQuestions: associationTrivia.length,
  diagnosisQuestions: diagnosisTrivia.length,
  nextStepQuestions: nextStepTrivia.length,
  totalQuestions: triviaQuestions.length,
  byCategory: Object.fromEntries(triviaCategories.map((category) => [
    category.id,
    triviaQuestions.filter((question) => question.category === category.id).length
  ])) as Record<TriviaCategoryId, number>
};
