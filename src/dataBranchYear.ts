import type { BranchLeaf } from "./dataBranch";

/**
 * Year-bank extension for Branch Lab. These are additional distinct organisms and medicines,
 * not aliases of existing leaves. Clues avoid naming the answer or its genus.
 */
const parse = (rows: string): BranchLeaf[] => rows.trim().split("\n").map((line) => {
  const [lineage, clue] = line.split("|");
  const path = lineage.split("/").map((part) => part.trim());
  return { name: path[path.length - 1], path, clue: clue.trim() };
});

export const branchMicrobeYear: BranchLeaf[] = parse(`
Bacteria/Gram-positive/Rods/Actinobacteria/Cutibacterium acnes|Slow-growing anaerobic skin commensal associated with acne and infections of implanted hardware.
Bacteria/Gram-positive/Rods/Actinobacteria/Actinomyces naeslundii|Oral commensal that can contribute to cervicofacial infection and adherent dental plaque.
Bacteria/Gram-positive/Rods/Actinobacteria/Actinomyces odontolyticus|Oral anaerobe occasionally recovered from polymicrobial abscesses and bacteremia.
Bacteria/Gram-positive/Rods/Actinobacteria/Arcanobacterium haemolyticum|Can cause pharyngitis with a scarlatiniform rash, especially in adolescents.
Bacteria/Gram-positive/Rods/Actinobacteria/Gardnerella vaginalis|Pleomorphic vaginal organism associated with clue cells and a fishy odor.
Bacteria/Gram-positive/Rods/Actinobacteria/Rhodococcus equi|Intracellular coccobacillus causing cavitary pneumonia in advanced immunosuppression; colonies may become salmon-pink.
Bacteria/Gram-positive/Rods/Actinobacteria/Tropheryma whipplei|PAS-positive macrophages in the small bowel accompany weight loss, diarrhea and migratory arthralgias.
Bacteria/Gram-positive/Cocci/Streptococcus/Streptococcus gallolyticus|Bacteremia or endocarditis should prompt evaluation for an occult colonic neoplasm.
Bacteria/Gram-positive/Cocci/Streptococcus/Streptococcus anginosus|Member of the abscess-forming group, associated with deep brain, liver and intra-abdominal collections.
Bacteria/Gram-positive/Cocci/Streptococcus/Streptococcus dysgalactiae|Can cause cellulitis, bacteremia and pharyngitis with beta-hemolysis.
Bacteria/Gram-positive/Cocci/Enterococcus/Enterococcus casseliflavus|Motile intestinal isolate with intrinsic low-level resistance to glycopeptides.
Bacteria/Gram-positive/Rods/Clostridia/Clostridium septicum|Spontaneous atraumatic myonecrosis is a warning sign for an underlying colonic malignancy.
Bacteria/Gram-positive/Rods/Clostridia/Clostridium sordellii|Rare toxin-mediated infection associated with profound leukemoid reaction and refractory shock.
Bacteria/Gram-positive/Rods/Clostridia/Clostridium novyi|Spore-forming anaerobe linked to gas gangrene and severe injection-associated soft-tissue infection.
Bacteria/Gram-positive/Rods/Clostridia/Clostridium difficile ribotype 027|Hypervirulent lineage associated with increased toxin production and severe antibiotic-associated colitis.
Bacteria/Gram-negative/Rods/Enterobacterales/Citrobacter freundii|Inducible AmpC production can make third-generation cephalosporin therapy unreliable.
Bacteria/Gram-negative/Rods/Enterobacterales/Proteus vulgaris|Urease-positive, swarming urinary pathogen associated with alkaline urine and infection stones.
Bacteria/Gram-negative/Rods/Enterobacterales/Morganella morganii|Urease-producing opportunist with inducible AmpC resistance and healthcare-associated urinary infections.
Bacteria/Gram-negative/Rods/Enterobacterales/Providencia stuartii|Often colonizes long-term urinary catheters and can be highly drug resistant.
Bacteria/Gram-negative/Rods/Enterobacterales/Edwardsiella tarda|Aquatic exposure can precede gastroenteritis or wound infection.
Bacteria/Gram-negative/Rods/Enterobacterales/Enterobacter hormaechei|Healthcare-associated member of a cloacae complex with inducible AmpC potential.
Bacteria/Gram-negative/Rods/Enterobacterales/Klebsiella oxytoca|Can cause antibiotic-associated hemorrhagic colitis and occasionally liver abscess.
Bacteria/Gram-negative/Rods/Enterobacterales/Escherichia coli O157:H7|Shiga toxin-producing strain linked to bloody diarrhea and hemolytic uremic syndrome.
Bacteria/Gram-negative/Rods/Enterobacterales/Escherichia coli K1|Capsular strain associated with neonatal meningitis.
Bacteria/Gram-negative/Rods/Enterobacterales/Salmonella Enteritidis|Nontyphoidal foodborne pathogen associated with poultry and eggs.
Bacteria/Gram-negative/Rods/Enterobacterales/Salmonella Typhimurium|Nontyphoidal enteric pathogen that can cause invasive disease in vulnerable hosts.
Bacteria/Gram-negative/Rods/Enterobacterales/Shigella sonnei|Common cause of bacillary dysentery in higher-income settings; very low infectious dose.
Bacteria/Gram-negative/Rods/Enterobacterales/Yersinia enterocolitica|Pork exposure can precede terminal ileitis and pseudoappendicitis.
Bacteria/Gram-negative/Rods/Enterobacterales/Yersinia pseudotuberculosis|Can cause mesenteric adenitis and a scarlet-fever-like syndrome.
Bacteria/Gram-negative/Rods/Non-fermenters/Burkholderia cepacia complex|Important in cystic fibrosis and chronic granulomatous disease; intrinsically resistant to many antibiotics.
Bacteria/Gram-negative/Rods/Non-fermenters/Burkholderia pseudomallei|Soil and water exposure in endemic regions can cause melioidosis with multiple abscesses.
Bacteria/Gram-negative/Rods/Non-fermenters/Burkholderia mallei|Equine-associated pathogen that causes glanders.
Bacteria/Gram-negative/Rods/Non-fermenters/Achromobacter xylosoxidans|Nonfermenter occasionally causing chronic airway infection in cystic fibrosis.
Bacteria/Gram-negative/Rods/Non-fermenters/Elizabethkingia anophelis|Water-associated opportunist linked to neonatal meningitis and healthcare outbreaks.
Bacteria/Gram-negative/Rods/Fastidious and zoonotic/Capnocytophaga canimorsus|Dog bite exposure can cause fulminant sepsis, particularly after splenectomy or with heavy alcohol use.
Bacteria/Gram-negative/Rods/Fastidious and zoonotic/Eikenella corrodens|Human bite and clenched-fist injuries can yield a slow-growing organism with a bleach-like odor.
Bacteria/Gram-negative/Rods/Fastidious and zoonotic/Kingella kingae|Important cause of osteoarticular infection in toddlers; may follow a mild upper-respiratory illness.
Bacteria/Gram-negative/Rods/Fastidious and zoonotic/Aggregatibacter actinomycetemcomitans|HACEK organism associated with periodontal disease and culture-negative endocarditis.
Bacteria/Gram-negative/Rods/Fastidious and zoonotic/Cardiobacterium hominis|HACEK organism associated with subacute endocarditis and embolic phenomena.
Bacteria/Gram-negative/Rods/Fastidious and zoonotic/Eikenella corrodens|Slow-growing oral flora organism associated with human bite wounds and endocarditis.
Bacteria/Gram-negative/Curved rods/Campylobacter jejuni|Undercooked poultry can cause inflammatory diarrhea followed by an acute immune neuropathy.
Bacteria/Gram-negative/Curved rods/Campylobacter coli|Poultry-associated enteritis with curved motile rods and inflammatory diarrhea.
Bacteria/Gram-negative/Curved rods/Helicobacter heilmannii|Less common gastric helicobacter associated with gastritis and peptic ulcer disease.
Bacteria/Gram-negative/Curved rods/Aeromonas hydrophila|Freshwater exposure can precede wound infection or watery diarrhea.
Bacteria/Gram-negative/Curved rods/Plesiomonas shigelloides|Freshwater or seafood exposure can precede acute gastroenteritis.
Bacteria/Gram-negative/Spirochetes/Borrelia recurrentis|Louse-borne infection causing relapsing fever.
Bacteria/Gram-negative/Spirochetes/Borrelia hermsii|Tick-borne relapsing fever associated with soft ticks and rustic cabins.
Bacteria/Gram-negative/Spirochetes/Leptospira interrogans|Animal urine exposure can cause jaundice, renal failure and conjunctival suffusion.
Bacteria/Gram-negative/Spirochetes/Brachyspira pilosicoli|Intestinal spirochetosis associated with chronic diarrhea, especially in immunocompromised patients.
Bacteria/Gram-negative/Obligate intracellular/Chlamydia trachomatis|Intracellular pathogen causing urethritis, cervicitis, trachoma and neonatal conjunctivitis.
Bacteria/Gram-negative/Obligate intracellular/Chlamydia pneumoniae|Atypical respiratory pathogen associated with pharyngitis and prolonged cough.
Bacteria/Gram-negative/Obligate intracellular/Chlamydia psittaci|Bird exposure can precede atypical pneumonia with systemic symptoms.
Bacteria/Gram-negative/Obligate intracellular/Rickettsia rickettsii|Tick-borne illness with fever, headache and rash that classically involves palms and soles.
Bacteria/Gram-negative/Obligate intracellular/Rickettsia prowazekii|Louse-borne infection associated with crowded conditions and a truncal rash.
Bacteria/Gram-negative/Obligate intracellular/Rickettsia typhi|Flea-borne infection causing murine typhus.
Bacteria/Gram-negative/Obligate intracellular/Ehrlichia chaffeensis|Tick-borne illness with leukopenia, thrombocytopenia and morulae in monocytes.
Bacteria/Gram-negative/Obligate intracellular/Anaplasma phagocytophilum|Tick-borne illness with morulae in granulocytes and cytopenias.
Bacteria/Gram-negative/Obligate intracellular/Coxiella burnetii|Livestock birth products can transmit an aerosolized pathogen causing atypical pneumonia or culture-negative endocarditis.
Bacteria/Gram-negative/Obligate intracellular/Bartonella henselae|Cat exposure can cause regional lymphadenopathy or bacillary angiomatosis.
Bacteria/Gram-negative/Obligate intracellular/Bartonella quintana|Body-louse transmission causes trench fever and can cause culture-negative endocarditis.
Bacteria/Gram-negative/Obligate intracellular/Orientia tsutsugamushi|Chigger-borne scrub typhus may produce an eschar and regional lymphadenopathy.
Bacteria/Gram-negative/Obligate intracellular/Anaplasma platys|Tick-borne veterinary pathogen causing cyclic thrombocytopenia in dogs.
Bacteria/Acid-fast/Mycobacteria/Mycobacterium leprae|Prefers cooler tissues, causing skin lesions and peripheral nerve damage with sensory loss.
Bacteria/Acid-fast/Mycobacteria/Mycobacterium kansasii|Photochromogenic nontuberculous species causing upper-lobe cavitary lung disease.
Bacteria/Acid-fast/Mycobacteria/Mycobacterium marinum|Aquarium or fish exposure can cause nodular skin lesions along lymphatics.
Bacteria/Acid-fast/Mycobacteria/Mycobacterium abscessus|Rapid-growing species associated with chronic lung disease and difficult-to-treat skin or device infections.
Bacteria/Acid-fast/Mycobacteria/Mycobacterium fortuitum|Rapid-growing environmental species causing post-procedural skin and soft-tissue infection.
Bacteria/Acid-fast/Mycobacteria/Mycobacterium chelonae|Rapid-growing species associated with disseminated skin lesions in immunosuppressed patients.
Bacteria/Acid-fast/Mycobacteria/Mycobacterium xenopi|Nontuberculous species associated with cavitary pulmonary disease, especially in structural lung disease.
Bacteria/Acid-fast/Mycobacteria/Mycobacterium ulcerans|Produces a cytotoxic toxin and causes painless necrotic skin ulcers.
Bacteria/Acid-fast/Mycobacteria/Mycobacterium bovis|Zoonotic member of the tuberculosis complex associated with unpasteurized dairy and intrinsic pyrazinamide resistance.
Bacteria/Acid-fast/Mycobacteria/Mycobacterium avium complex|Disseminated infection can occur with profound CD4 depletion; also causes pulmonary disease.
Bacteria/Acid-fast/Mycobacteria/Mycobacterium gordonae|Common water contaminant that is usually of low pathogenicity.
Fungi/Yeasts/Candida/Candida glabrata|Often less susceptible to azoles than its common relative and can cause invasive candidiasis.
Fungi/Yeasts/Candida/Candida auris|Multidrug-resistant yeast associated with healthcare outbreaks and persistent environmental contamination.
Fungi/Yeasts/Cryptococcus/Cryptococcus gattii|Can cause pulmonary or CNS disease in apparently immunocompetent hosts.
Fungi/Yeasts/Endemic dimorphic/Blastomyces dermatitidis|Broad-based budding yeast associated with pulmonary disease and verrucous or ulcerative skin lesions.
Fungi/Yeasts/Endemic dimorphic/Coccidioides immitis|Desert exposure can cause pulmonary illness and spherules containing endospores.
Fungi/Yeasts/Endemic dimorphic/Coccidioides posadasii|Southwestern soil exposure can cause a flu-like pulmonary illness and erythema nodosum.
Fungi/Yeasts/Endemic dimorphic/Paracoccidioides brasiliensis|Latin American exposure can cause oral mucosal lesions and pulmonary disease.
Fungi/Yeasts/Endemic dimorphic/Talaromyces marneffei|Bamboo rat exposure in Southeast Asia is associated with disseminated infection in advanced HIV.
Fungi/Molds/Aspergillus/Aspergillus flavus|Can produce aflatoxin and cause invasive disease, especially in immunocompromised hosts.
Fungi/Molds/Aspergillus/Aspergillus niger|Black conidia; may cause otomycosis and occasionally invasive disease.
Fungi/Molds/Aspergillus/Aspergillus terreus|Invasive mold notable for intrinsic resistance to amphotericin B.
Fungi/Molds/Mucorales/Rhizopus arrhizus|Angioinvasive mold associated with diabetic ketoacidosis and necrotic sinus disease.
Fungi/Molds/Mucorales/Lichtheimia corymbifera|Mucormycosis agent that can cause pulmonary or rhino-orbital infection.
Fungi/Molds/Fusarium/Fusarium solani|Can cause keratitis and disseminated infection with skin lesions in neutropenia.
Fungi/Molds/Scedosporium/Scedosporium apiospermum|Can cause invasive disease after near-drowning and may involve the CNS.
Fungi/Molds/Pneumocystis/Pneumocystis jirovecii|Advanced cellular immunodeficiency can lead to diffuse hypoxemic pneumonia with elevated LDH.
Parasites/Protozoa/Amoebae/Naegleria fowleri|Warm freshwater entering the nose can cause rapidly fatal meningoencephalitis.
Parasites/Protozoa/Amoebae/Acanthamoeba castellanii|Can cause keratitis in contact-lens users and granulomatous encephalitis in immunocompromised hosts.
Parasites/Protozoa/Flagellates/Trichomonas vaginalis|Motile flagellate causing vaginitis with frothy discharge and a strawberry cervix.
Parasites/Protozoa/Flagellates/Giardia duodenalis|Contaminated water can cause greasy, foul-smelling diarrhea and bloating.
Parasites/Protozoa/Flagellates/Leishmania donovani|Sandfly-transmitted infection causing fever, splenomegaly and pancytopenia.
Parasites/Protozoa/Flagellates/Trypanosoma cruzi|Triatomine exposure can cause cardiomyopathy and megacolon years later.
Parasites/Protozoa/Flagellates/Trypanosoma brucei|Tsetse fly exposure can cause relapsing fever and progressive somnolence.
Parasites/Protozoa/Apicomplexa/Babesia microti|Tick-borne intraerythrocytic parasite with Maltese-cross tetrads, especially severe after splenectomy.
Parasites/Protozoa/Apicomplexa/Toxoplasma gondii|Undercooked meat or cat feces exposure; ring-enhancing brain lesions in advanced HIV.
Parasites/Protozoa/Apicomplexa/Cryptosporidium parvum|Waterborne oocysts cause watery diarrhea that can be prolonged in AIDS.
Parasites/Protozoa/Apicomplexa/Cyclospora cayetanensis|Fresh produce exposure can cause relapsing watery diarrhea.
Parasites/Protozoa/Apicomplexa/Cystoisospora belli|AIDS-associated watery diarrhea with large acid-fast oocysts.
Parasites/Helminths/Nematodes/Strongyloides stercoralis|Autoinfection can cause hyperinfection after corticosteroids with gram-negative sepsis.
Parasites/Helminths/Nematodes/Enterobius vermicularis|Nocturnal perianal itching; eggs are collected with transparent adhesive tape.
Parasites/Helminths/Nematodes/Trichinella spiralis|Undercooked pork or wild game can cause myalgia, periorbital edema and eosinophilia.
Parasites/Helminths/Nematodes/Onchocerca volvulus|Blackfly transmission causes pruritic dermatitis and river blindness.
Parasites/Helminths/Nematodes/Loa loa|Daytime biting flies transmit a worm that may migrate across the conjunctiva.
Parasites/Helminths/Trematodes/Schistosoma haematobium|Freshwater exposure in Africa can cause terminal hematuria and bladder squamous carcinoma.
Parasites/Helminths/Trematodes/Clonorchis sinensis|Raw freshwater fish exposure is associated with biliary inflammation and cholangiocarcinoma.
Parasites/Helminths/Cestodes/Echinococcus granulosus|Dog-sheep cycle produces hydatid cysts; rupture can trigger anaphylaxis.
Parasites/Helminths/Cestodes/Diphyllobothrium latum|Raw freshwater fish can transmit a tapeworm that consumes vitamin B12.
Parasites/Helminths/Cestodes/Taenia solium|Ingestion of eggs can cause neurocysticercosis with seizures.
`);

export const branchDrugYear: BranchLeaf[] = parse(`
Cardiovascular/Antihypertensives/ACE inhibitors/Benazepril|Can cause cough, hyperkalemia and fetal toxicity; increases bradykinin.
Cardiovascular/Antihypertensives/ACE inhibitors/Quinapril|Blocks conversion of angiotensin I and can cause angioedema.
Cardiovascular/Antihypertensives/ARBs/Candesartan|Blocks the angiotensin II type 1 receptor without inhibiting bradykinin breakdown.
Cardiovascular/Antihypertensives/ARBs/Irbesartan|Used in hypertension and diabetic kidney disease; monitor potassium and creatinine.
Cardiovascular/Antihypertensives/Thiazide-like diuretics/Indapamide|Long-acting distal tubular diuretic that can cause hyponatremia and hyperuricemia.
Cardiovascular/Antihypertensives/Thiazide-like diuretics/Chlorthalidone|Long-acting thiazide-like agent associated with hypokalemia and hyperuricemia.
Cardiovascular/Antihypertensives/Calcium-channel blockers/Felodipine|Dihydropyridine that causes peripheral edema and reflex tachycardia.
Cardiovascular/Antihypertensives/Calcium-channel blockers/Nicardipine|Intravenous dihydropyridine used for acute blood-pressure control.
Cardiovascular/Antihypertensives/Calcium-channel blockers/Clevidipine|Ultra-short-acting intravenous dihydropyridine delivered in a lipid emulsion.
Cardiovascular/Antihypertensives/Alpha blockers/Doxazosin|Relaxes vascular smooth muscle and can cause first-dose orthostatic hypotension.
Cardiovascular/Antihypertensives/Alpha blockers/Prazosin|Used for hypertension and trauma-related nightmares; may cause syncope after the first dose.
Cardiovascular/Antihypertensives/Central agents/Clonidine|Central alpha-2 agonist; abrupt withdrawal can cause rebound hypertension.
Cardiovascular/Antihypertensives/Central agents/Methyldopa|Pregnancy-compatible central agent associated with Coombs-positive hemolytic anemia.
Cardiovascular/Antihypertensives/Vasodilators/Hydralazine|Arteriolar dilator associated with drug-induced lupus and reflex tachycardia.
Cardiovascular/Antihypertensives/Vasodilators/Minoxidil|Potent arteriolar dilator that can cause hypertrichosis and pericardial effusion.
Cardiovascular/Heart failure/ARNI/Sacubitril-valsartan|Neprilysin inhibition plus receptor blockade improves outcomes in HFrEF; avoid concurrent ACE inhibitor.
Cardiovascular/Heart failure/SGLT2 inhibitors/Dapagliflozin|Improves heart-failure outcomes even without diabetes; counsel about genital infections and volume depletion.
Cardiovascular/Heart failure/SGLT2 inhibitors/Empagliflozin|Reduces heart-failure events and renal progression; can rarely cause euglycemic ketoacidosis.
Cardiovascular/Heart failure/Mineralocorticoid antagonists/Eplerenone|Selective aldosterone receptor blocker with less gynecomastia than its older counterpart.
Cardiovascular/Heart failure/Mineralocorticoid antagonists/Finerenone|Nonsteroidal mineralocorticoid receptor antagonist used in diabetic CKD.
Cardiovascular/Antiarrhythmics/Class IA/Procainamide|Can prolong QT and cause drug-induced lupus; used for selected wide-complex tachycardias.
Cardiovascular/Antiarrhythmics/Class IB/Lidocaine|Sodium-channel blocker used for ventricular arrhythmias; neurologic toxicity can precede cardiac effects.
Cardiovascular/Antiarrhythmics/Class IC/Flecainide|Slows conduction and is avoided in structural or ischemic heart disease.
Cardiovascular/Antiarrhythmics/Class IC/Propafenone|Sodium-channel blocker with beta-blocking properties; avoid in structural heart disease.
Cardiovascular/Antiarrhythmics/Class III/Dofetilide|Potassium-channel blocker requiring monitored initiation because of torsades risk.
Cardiovascular/Antiarrhythmics/Class III/Ibutilide|Intravenous agent used for atrial flutter or fibrillation conversion; can cause torsades.
Cardiovascular/Antiarrhythmics/Class III/Dronedarone|Amiodarone-related agent contraindicated in permanent atrial fibrillation and severe heart failure.
Cardiovascular/Antiarrhythmics/Class IV/Verapamil|Non-dihydropyridine agent that slows AV nodal conduction and can worsen systolic heart failure.
Cardiovascular/Antiarrhythmics/Class IV/Diltiazem|AV nodal blocker used for rate control; may cause bradycardia and hypotension.
Cardiovascular/Antiplatelets/P2Y12 inhibitors/Prasugrel|Irreversible platelet inhibitor contraindicated after prior stroke or TIA.
Cardiovascular/Antiplatelets/P2Y12 inhibitors/Ticagrelor|Reversible P2Y12 inhibitor associated with dyspnea and increased uric acid.
Cardiovascular/Antiplatelets/GPIIb-IIIa inhibitors/Eptifibatide|Intravenous platelet inhibitor used during selected coronary interventions; monitor platelets.
Cardiovascular/Anticoagulants/Direct thrombin inhibitors/Bivalirudin|Intravenous direct thrombin inhibitor used during PCI and in some patients with HIT.
Cardiovascular/Anticoagulants/Direct thrombin inhibitors/Argatroban|Hepatic clearance makes it useful for anticoagulation in HIT with renal dysfunction.
Cardiovascular/Anticoagulants/Factor Xa inhibitors/Edoxaban|Oral direct factor Xa inhibitor used for selected VTE and atrial fibrillation indications.
Cardiovascular/Anticoagulants/Factor Xa inhibitors/Fondaparinux|Synthetic pentasaccharide that indirectly inhibits factor Xa through antithrombin.
Cardiovascular/Lipid lowering/PCSK9 inhibitors/Alirocumab|Monoclonal antibody that increases LDL-receptor recycling and lowers LDL cholesterol.
Cardiovascular/Lipid lowering/ACL inhibitors/Bempedoic acid|Inhibits ATP-citrate lyase and can cause hyperuricemia or tendon injury.
Cardiovascular/Lipid lowering/Fibrates/Fenofibrate|Activates PPAR-alpha to lower triglycerides; monitor renal function and muscle symptoms.
Endocrine/Diabetes/GLP-1 receptor agonists/Semaglutide|Incretin mimetic associated with weight loss and delayed gastric emptying.
Endocrine/Diabetes/GLP-1 receptor agonists/Liraglutide|Daily incretin mimetic with cardiovascular benefit in selected patients with type 2 diabetes.
Endocrine/Diabetes/GLP-1 receptor agonists/Dulaglutide|Weekly incretin mimetic that improves glycemic control and cardiovascular outcomes.
Endocrine/Diabetes/GLP-1 receptor agonists/Exenatide|Incretin mimetic that is renally cleared and may cause nausea.
Endocrine/Diabetes/DPP-4 inhibitors/Sitagliptin|Inhibits incretin degradation; generally weight neutral but may cause severe joint pain.
Endocrine/Diabetes/DPP-4 inhibitors/Linagliptin|Incretin-preserving agent that generally does not require renal dose adjustment.
Endocrine/Diabetes/Sulfonylureas/Glimepiride|Stimulates pancreatic insulin release and can cause prolonged hypoglycemia.
Endocrine/Diabetes/Meglitinides/Repaglinide|Short-acting insulin secretagogue taken around meals; skip when a meal is skipped.
Endocrine/Thyroid/Thionamides/Propylthiouracil|Blocks thyroid peroxidase and peripheral T4-to-T3 conversion; preferred in thyroid storm and first trimester.
Endocrine/Thyroid/Thionamides/Methimazole|Blocks thyroid hormone synthesis; associated with agranulocytosis and aplasia cutis.
Endocrine/Adrenal/Glucocorticoids/Fludrocortisone|Mineralocorticoid replacement used in primary adrenal insufficiency.
Endocrine/Adrenal/Glucocorticoids/Metyrapone|Inhibits 11-beta-hydroxylase and can be used in testing or treatment of hypercortisolism.
Endocrine/Bone/Antiresorptives/Denosumab|Monoclonal antibody against RANKL; discontinuation can cause rebound vertebral fractures.
Endocrine/Bone/Antiresorptives/Zoledronic acid|Intravenous bisphosphonate associated with acute-phase reaction and osteonecrosis of the jaw.
Endocrine/Bone/Anabolic agents/Teriparatide|PTH analog that stimulates bone formation when given intermittently.
Infectious disease/Antibiotics/Beta-lactams/Carbapenems/Ertapenem|Once-daily carbapenem without reliable activity against Pseudomonas or enterococci.
Infectious disease/Antibiotics/Beta-lactams/Cephalosporins/Cefepime|Fourth-generation agent with antipseudomonal activity; neurotoxicity risk rises in renal impairment.
Infectious disease/Antibiotics/Beta-lactams/Cephalosporins/Ceftaroline|Advanced cephalosporin with activity against MRSA.
Infectious disease/Antibiotics/Beta-lactams/Penicillins/Piperacillin-tazobactam|Broad-spectrum antipseudomonal combination with anaerobic coverage.
Infectious disease/Antibiotics/Glycopeptides/Telavancin|Lipoglycopeptide used for selected gram-positive infections; can prolong QT and affect renal function.
Infectious disease/Antibiotics/Lipopeptides/Daptomycin|Causes myopathy and is inactivated by pulmonary surfactant, so not used for pneumonia.
Infectious disease/Antibiotics/Oxazolidinones/Tedizolid|Oxazolidinone used for acute bacterial skin infections with a shorter course than its relative.
Infectious disease/Antibiotics/Tetracyclines/Omadacycline|Aminomethylcycline used for selected community-acquired pneumonia and skin infections.
Infectious disease/Antibiotics/Macrolides/Clarithromycin|Inhibits CYP3A4 and can cause QT prolongation and drug interactions.
Infectious disease/Antibiotics/Aminoglycosides/Tobramycin|Aminoglycoside used for serious gram-negative infection and inhaled therapy in cystic fibrosis.
Infectious disease/Antibiotics/Fluoroquinolones/Moxifloxacin|Respiratory fluoroquinolone with anaerobic activity but no reliable Pseudomonas coverage.
Infectious disease/Antibiotics/Antifolates/Trimethoprim|Blocks bacterial dihydrofolate reductase and can raise potassium and creatinine.
Infectious disease/Antibiotics/Antifolates/Pyrimethamine|Inhibits protozoal dihydrofolate reductase and is paired with folinic acid.
Infectious disease/Antivirals/Herpes/Valacyclovir|Oral prodrug of an antiviral nucleoside analogue used for HSV and VZV.
Infectious disease/Antivirals/Herpes/Foscarnet|Pyrophosphate analogue used for resistant herpesvirus infection; can cause electrolyte disturbances.
Infectious disease/Antivirals/Influenza/Baloxavir|Inhibits cap-dependent endonuclease and is given as a single oral dose for influenza.
Infectious disease/Antivirals/HIV/Maraviroc|CCR5 antagonist that requires tropism testing before use.
Infectious disease/Antivirals/HIV/Dolutegravir|Integrase inhibitor with a high resistance barrier; can interact with polyvalent cations.
Infectious disease/Antivirals/HIV/Darunavir|Protease inhibitor commonly boosted with ritonavir or cobicistat.
Infectious disease/Antifungals/Azoles/Voriconazole|Associated with visual disturbances, photosensitivity and periostitis.
Infectious disease/Antifungals/Echinocandins/Caspofungin|Inhibits fungal beta-glucan synthesis and is used for invasive candidiasis.
Infectious disease/Antifungals/Polyenes/Flucytosine|Antimetabolite paired with amphotericin for cryptococcal meningitis; monitor marrow and liver.
Neuropsychiatric/Anticonvulsants/Sodium channel blockers/Lamotrigine|Slow titration reduces risk of severe rash; useful in bipolar maintenance and epilepsy.
Neuropsychiatric/Anticonvulsants/Sodium channel blockers/Oxcarbazepine|Related to carbamazepine; hyponatremia is a notable adverse effect.
Neuropsychiatric/Anticonvulsants/Sodium channel blockers/Lacosamide|Can prolong the PR interval and is used for focal-onset seizures.
Neuropsychiatric/Anticonvulsants/Calcium channel ligands/Gabapentin|Renally cleared alpha-2-delta ligand used for neuropathic pain and focal seizures.
Neuropsychiatric/Anticonvulsants/Calcium channel ligands/Pregabalin|Alpha-2-delta ligand associated with edema, sedation and misuse potential.
Neuropsychiatric/Anticonvulsants/SV2A ligands/Brivaracetam|SV2A ligand related to levetiracetam, sometimes with fewer behavioral adverse effects.
Neuropsychiatric/Anticonvulsants/Carbonic anhydrase inhibitors/Topiramate|Can cause kidney stones, paresthesias, cognitive slowing and weight loss.
Neuropsychiatric/Anticonvulsants/Carbonic anhydrase inhibitors/Zonisamide|Sulfonamide-related antiseizure medicine associated with kidney stones and oligohidrosis.
Neuropsychiatric/Anticonvulsants/Other/Ethosuximide|T-type calcium-channel blocker used for absence seizures.
Neuropsychiatric/Anticonvulsants/Other/Perampanel|AMPA receptor antagonist associated with serious behavioral adverse effects.
Neuropsychiatric/Antidepressants/SSRIs/Fluvoxamine|SSRI with substantial CYP-mediated interactions, used in obsessive-compulsive disorder.
Neuropsychiatric/Antidepressants/SNRIs/Duloxetine|SNRI used for depression, anxiety and neuropathic pain; avoid in severe liver disease.
Neuropsychiatric/Antidepressants/Other/Bupropion|Norepinephrine-dopamine reuptake inhibitor that lowers seizure threshold.
Neuropsychiatric/Antidepressants/Other/Mirtazapine|Can increase appetite and weight and is often sedating at lower doses.
Neuropsychiatric/Antidepressants/Tricyclics/Nortriptyline|Tricyclic with anticholinergic and cardiac conduction toxicity in overdose.
Neuropsychiatric/Antipsychotics/Atypical/Aripiprazole|Partial dopamine agonist that can cause akathisia and impulse-control problems.
Neuropsychiatric/Antipsychotics/Atypical/Quetiapine|Sedating atypical antipsychotic with metabolic adverse effects and orthostatic hypotension.
Neuropsychiatric/Antipsychotics/Atypical/Clozapine|Requires blood-count monitoring because of severe neutropenia risk.
Neuropsychiatric/Antipsychotics/Typical/Fluphenazine|High-potency first-generation antipsychotic associated with extrapyramidal symptoms.
Neuropsychiatric/Anxiolytics/Buspirone|Partial 5-HT1A agonist without the dependence profile of benzodiazepines.
Neuropsychiatric/ADHD stimulants/Lisdexamfetamine|Prodrug stimulant converted to dextroamphetamine; can raise heart rate and blood pressure.
Neuropsychiatric/ADHD nonstimulants/Atomoxetine|Selective norepinephrine reuptake inhibitor; monitor for rare liver injury and suicidality warning.
Neuropsychiatric/Parkinson therapies/MAO-B inhibitors/Rasagiline|Selective MAO-B inhibitor used for Parkinson disease; review serotonergic interactions.
Neuropsychiatric/Parkinson therapies/Dopamine agonists/Pramipexole|Can cause sleep attacks, edema and impulse-control disorders.
Neuropsychiatric/Parkinson therapies/COMT inhibitors/Entacapone|Prolongs levodopa effect and can cause diarrhea and orange-brown urine.
Neuropsychiatric/Parkinson therapies/Amantadine|Can reduce dyskinesias and cause livedo reticularis or confusion.
Pain and inflammation/Opioids/Buprenorphine|Partial mu agonist used for pain and opioid use disorder; high receptor affinity.
Pain and inflammation/Opioids/Tramadol|Weak mu agonist and monoamine reuptake inhibitor; can cause seizures and serotonin toxicity.
Pain and inflammation/Opioids/Methadone|Long-acting opioid that can prolong QT and accumulate because of variable half-life.
Pain and inflammation/NSAIDs/Celecoxib|COX-2 selective agent with lower ulcer risk but potential cardiovascular harm.
Pain and inflammation/NSAIDs/Meloxicam|Preferential COX-2 inhibitor associated with renal and cardiovascular adverse effects.
Pain and inflammation/Gout/Allopurinol|Xanthine oxidase inhibitor; start low and consider HLA-B*58:01 risk in selected ancestry groups.
Pain and inflammation/Gout/Febuxostat|Xanthine oxidase inhibitor with cardiovascular safety considerations.
Pain and inflammation/Gout/Colchicine|Disrupts microtubules and can cause diarrhea, myopathy and marrow suppression.
Gastrointestinal/IBD/Aminosalicylates/Mesalamine|Topical or oral anti-inflammatory used for ulcerative colitis; monitor renal function.
Gastrointestinal/IBD/Immunomodulators/Azathioprine|Thiopurine associated with marrow suppression, hepatotoxicity and pancreatitis.
Gastrointestinal/IBD/Immunomodulators/6-mercaptopurine|Thiopurine whose toxicity is increased by xanthine oxidase inhibitors.
Gastrointestinal/IBD/Biologics/Infliximab|Anti-TNF monoclonal antibody; screen for latent tuberculosis and hepatitis B.
Gastrointestinal/IBD/Biologics/Vedolizumab|Gut-selective integrin blocker used in inflammatory bowel disease.
Gastrointestinal/IBD/Biologics/Ustekinumab|Targets the shared p40 subunit of interleukins 12 and 23.
Gastrointestinal/Antiemetics/Dopamine antagonists/Metoclopramide|D2 antagonist that increases gastric emptying and can cause tardive dyskinesia.
Gastrointestinal/Antiemetics/Neurokinin antagonists/Aprepitant|NK1 antagonist used for chemotherapy-induced nausea; interacts with CYP3A4.
Gastrointestinal/Laxatives/Secretagogues/Linaclotide|Guanylate cyclase-C agonist used for IBS-C and chronic idiopathic constipation.
Gastrointestinal/Acid suppression/Prostaglandin analogues/Misoprostol|Protects gastric mucosa but causes uterine contractions and is contraindicated in pregnancy when used for ulcer prevention.
Respiratory/Asthma biologics/Omalizumab|Anti-IgE antibody used for allergic asthma and chronic spontaneous urticaria.
Respiratory/Asthma biologics/Mepolizumab|Anti-IL-5 antibody used for eosinophilic asthma.
Respiratory/Asthma biologics/Dupilumab|Blocks IL-4 receptor alpha and can improve eosinophilic asthma and atopic dermatitis.
Respiratory/Pulmonary hypertension/Endothelin antagonists/Bosentan|Endothelin receptor blocker requiring liver monitoring and pregnancy prevention.
Respiratory/Pulmonary hypertension/PDE5 inhibitors/Sildenafil|PDE5 inhibitor used for pulmonary arterial hypertension and erectile dysfunction.
Immunology/Transplant/Calcineurin inhibitors/Cyclosporine|Immunosuppressant associated with nephrotoxicity, hypertension and gingival hyperplasia.
Immunology/Transplant/mTOR inhibitors/Sirolimus|Inhibits mTOR and can cause impaired wound healing, dyslipidemia and pneumonitis.
Immunology/Transplant/Antimetabolites/Mycophenolate mofetil|Inhibits inosine monophosphate dehydrogenase and is teratogenic.
Oncology/Cytotoxic/Antimetabolites/Capecitabine|Oral prodrug of 5-fluorouracil associated with hand-foot syndrome.
Oncology/Cytotoxic/Antimetabolites/Cytarabine|Pyrimidine analogue used in AML; high doses can cause cerebellar toxicity.
Oncology/Cytotoxic/Alkylating agents/Ifosfamide|Can cause hemorrhagic cystitis and encephalopathy; mesna is protective for the bladder.
Oncology/Cytotoxic/Anthracyclines/Daunorubicin|Anthracycline associated with cumulative cardiomyopathy.
Oncology/Targeted/EGFR inhibitors/Erlotinib|EGFR tyrosine kinase inhibitor associated with acneiform rash and diarrhea.
Oncology/Targeted/ALK inhibitors/Alectinib|ALK inhibitor used in selected lung cancers; can cause myalgia and bradycardia.
Oncology/Targeted/BRAF inhibitors/Vemurafenib|BRAF inhibitor used in selected mutation-positive cancers; can cause photosensitivity and secondary skin lesions.
Oncology/Targeted/CDK4-6 inhibitors/Palbociclib|Cell-cycle inhibitor associated with neutropenia.
Oncology/Targeted/PARP inhibitors/Olaparib|Inhibits DNA repair and is used in selected homologous-recombination deficient cancers.
Oncology/Hormonal therapies/Aromatase inhibitors/Anastrozole|Reduces peripheral estrogen synthesis and can accelerate bone loss.
Oncology/Hormonal therapies/Selective estrogen receptor modulators/Tamoxifen|Estrogen receptor modulator associated with endometrial cancer and venous thromboembolism risk.
Oncology/Hormonal therapies/Androgen receptor blockers/Enzalutamide|Androgen receptor inhibitor associated with fatigue, falls and seizure risk.
Oncology/Supportive care/G-CSF/Pegfilgrastim|Long-acting granulocyte colony-stimulating factor used to reduce febrile neutropenia risk.
Oncology/Supportive care/Erythropoiesis stimulants/Epoetin alfa|Stimulates erythropoiesis but can increase thrombotic risk and blood pressure.
`);

