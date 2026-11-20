/**
 * Branch Lab content: a mystery microbe or drug sits somewhere in a taxonomy tree. Each lineage is a "/"-separated
 * path whose last part is the answer; every guess reveals how much of its lineage it shares with the mystery item.
 * Clues are shown only after several misses and must not name the answer or its genus.
 */
export interface BranchLeaf { name: string; path: string[]; clue: string }
export type BranchSet = "microbe" | "drug";

const parse = (rows: string): BranchLeaf[] =>
  rows.trim().split("\n").map((line) => {
    const [lineage, clue] = line.split("|");
    const path = lineage.split("/").map((s) => s.trim());
    return { name: path[path.length - 1], path, clue: clue.trim() };
  });

export const microbeLeaves: BranchLeaf[] = parse(`
Bacteria/Gram-positive/Cocci/Staphylococcus/Staphylococcus aureus|Golden, coagulase-positive colonies behind skin abscesses, toxic shock and a famously methicillin-resistant strain.
Bacteria/Gram-positive/Cocci/Staphylococcus/Staphylococcus epidermidis|Skin commensal that sticks to catheters and prosthetic valves by making biofilm; coagulase-negative.
Bacteria/Gram-positive/Cocci/Staphylococcus/Staphylococcus saprophyticus|Coagulase-negative cause of urinary infections in young, sexually active women; resistant to novobiocin.
Bacteria/Gram-positive/Cocci/Streptococcus/Streptococcus pyogenes|Beta-hemolytic and bacitracin-sensitive; sore throat, impetigo, and later rheumatic fever.
Bacteria/Gram-positive/Cocci/Streptococcus/Streptococcus agalactiae|Colonizes the vagina and causes neonatal sepsis and meningitis; hippurate-positive and CAMP-positive.
Bacteria/Gram-positive/Cocci/Streptococcus/Streptococcus pneumoniae|Lancet-shaped diplococci, optochin-sensitive and bile-soluble; lobar pneumonia with rusty sputum.
Bacteria/Gram-positive/Cocci/Streptococcus/Streptococcus mutans|A viridans-group member that builds plaque and causes dental caries.
Bacteria/Gram-positive/Cocci/Enterococcus/Enterococcus faecalis|Grows in bile and 6.5% salt; urinary infections and endocarditis, treated with ampicillin.
Bacteria/Gram-positive/Cocci/Enterococcus/Enterococcus faecium|Hospital pathogen frequently resistant to both ampicillin and vancomycin.
Bacteria/Gram-positive/Rods/Bacillus/Bacillus anthracis|Spore-forming rod with a poly-D-glutamate capsule; painless black eschar and mediastinal widening.
Bacteria/Gram-positive/Rods/Bacillus/Bacillus cereus|Food poisoning from reheated rice; a preformed toxin causes rapid vomiting.
Bacteria/Gram-positive/Rods/Clostridium/Clostridioides difficile|Antibiotic-associated pseudomembranous colitis from toxins A and B; spores survive hand sanitizer.
Bacteria/Gram-positive/Rods/Clostridium/Clostridium tetani|A toxin blocks inhibitory neurotransmitter release, causing spasms and a locked jaw.
Bacteria/Gram-positive/Rods/Clostridium/Clostridium botulinum|A toxin blocks acetylcholine release, causing a descending flaccid paralysis; infants and honey.
Bacteria/Gram-positive/Rods/Clostridium/Clostridium perfringens|Alpha toxin (lecithinase) drives gas gangrene with a double zone of hemolysis.
Bacteria/Gram-positive/Rods/Listeria/Listeria monocytogenes|Tumbling motility and growth in the fridge; deli meats, pregnancy and neonatal meningitis.
Bacteria/Gram-positive/Rods/Corynebacterium/Corynebacterium diphtheriae|Club-shaped rods that form a grey pseudomembrane through an ADP-ribosylating exotoxin.
Bacteria/Gram-positive/Rods/Actinomyces/Actinomyces israelii|Sulfur granules and draining sinus tracts along the jaw; a filamentous anaerobe.
Bacteria/Gram-positive/Rods/Nocardia/Nocardia asteroides|Weakly acid-fast branching rods causing lung and brain abscesses in the immunocompromised; sulfonamide-sensitive.
Bacteria/Gram-negative/Cocci/Neisseria/Neisseria meningitidis|Maltose-fermenting diplococcus; petechial rash and adrenal hemorrhage in the Waterhouse-Friderichsen picture.
Bacteria/Gram-negative/Cocci/Neisseria/Neisseria gonorrhoeae|Ferments only glucose and grows on Thayer-Martin agar; urethritis and septic arthritis.
Bacteria/Gram-negative/Cocci/Moraxella/Moraxella catarrhalis|Beta-lactamase producer behind otitis media in children and COPD flare-ups.
Bacteria/Gram-negative/Rods/Enterobacterales/Escherichia coli|Lactose-fermenting rod that is the leading cause of urinary infections; some strains make a Shiga-like toxin.
Bacteria/Gram-negative/Rods/Enterobacterales/Klebsiella pneumoniae|Mucoid capsule, currant-jelly sputum in alcoholics, and a liver abscess in some regions.
Bacteria/Gram-negative/Rods/Enterobacterales/Salmonella Typhi|Rose spots, relative bradycardia and a chronic gallbladder carrier state.
Bacteria/Gram-negative/Rods/Enterobacterales/Shigella dysenteriae|Non-lactose fermenter with tiny inocula needed; bloody diarrhea and hemolytic uremic syndrome.
Bacteria/Gram-negative/Rods/Enterobacterales/Proteus mirabilis|Swarming motility, urease-positive, and struvite stones in alkaline urine.
Bacteria/Gram-negative/Rods/Enterobacterales/Yersinia pestis|Bipolar "safety pin" stain; fleas carry it and it causes painful buboes.
Bacteria/Gram-negative/Rods/Enterobacterales/Enterobacter cloacae|Hospital organism with inducible AmpC beta-lactamase, so third-generation cephalosporins can fail.
Bacteria/Gram-negative/Rods/Enterobacterales/Serratia marcescens|Red pigment-producing opportunist in hospital catheters and respiratory equipment.
Bacteria/Gram-negative/Rods/Non-fermenters/Pseudomonas aeruginosa|Oxidase-positive, blue-green pigment and grape-like odor; burns, hot tubs and cystic fibrosis lungs.
Bacteria/Gram-negative/Rods/Non-fermenters/Acinetobacter baumannii|Multidrug-resistant coccobacillus in ventilated, intensive-care and war-wound infections.
Bacteria/Gram-negative/Rods/Non-fermenters/Stenotrophomonas maltophilia|Intrinsically resistant to carbapenems; trimethoprim-sulfamethoxazole is the usual treatment.
Bacteria/Gram-negative/Rods/Fastidious and zoonotic/Haemophilus influenzae|Needs factors X and V on chocolate agar; epiglottitis in unvaccinated children.
Bacteria/Gram-negative/Rods/Fastidious and zoonotic/Bordetella pertussis|Paroxysmal cough with an inspiratory whoop and marked lymphocytosis.
Bacteria/Gram-negative/Rods/Fastidious and zoonotic/Legionella pneumophila|Stains poorly, needs charcoal yeast agar; air-conditioning outbreaks with hyponatremia and diarrhea.
Bacteria/Gram-negative/Rods/Fastidious and zoonotic/Brucella abortus|Undulant fever from unpasteurized dairy or livestock contact; intracellular in macrophages.
Bacteria/Gram-negative/Rods/Fastidious and zoonotic/Francisella tularensis|Rabbit and tick exposure causes ulceroglandular disease; extremely infectious in the lab.
Bacteria/Gram-negative/Rods/Fastidious and zoonotic/Pasteurella multocida|Cellulitis within hours of a cat or dog bite.
Bacteria/Gram-negative/Rods/Anaerobes/Bacteroides fragilis|Most common anaerobe in intra-abdominal abscesses; resistant to many penicillins.
Bacteria/Gram-negative/Curved rods/Vibrio cholerae|Comma-shaped, rice-water diarrhea from a toxin that locks adenylate cyclase on.
Bacteria/Gram-negative/Curved rods/Campylobacter jejuni|Undercooked poultry and bloody diarrhea, and later Guillain-Barré syndrome.
Bacteria/Gram-negative/Curved rods/Helicobacter pylori|Makes urease to survive stomach acid; peptic ulcers and gastric lymphoma.
Bacteria/Spirochetes/Treponema pallidum|Too thin for Gram staining; painless chancre, then rash on the palms and soles.
Bacteria/Spirochetes/Borrelia burgdorferi|Tick-borne with an expanding "bullseye" rash, then facial palsy and arthritis.
Bacteria/Spirochetes/Leptospira interrogans|Rat urine in floodwater; fever, jaundice and renal failure in Weil disease.
Bacteria/Acid-fast/Mycobacterium tuberculosis|Slow-growing, with cord factor and mycolic acids; caseating granulomas in the upper lobes.
Bacteria/Acid-fast/Mycobacterium leprae|Cannot be cultured on artificial media; grows best in cool tissue and the armadillo; skin and nerve loss.
Bacteria/Acid-fast/Mycobacterium avium|Disseminated infection in advanced HIV when CD4 falls below about 50; prophylaxed with azithromycin.
Bacteria/Intracellular and atypical/Chlamydia trachomatis|Obligate intracellular with elementary and reticulate bodies; most common bacterial sexually transmitted infection.
Bacteria/Intracellular and atypical/Rickettsia rickettsii|Tick bite, then a rash that starts on the wrists and ankles and spreads to the trunk.
Bacteria/Intracellular and atypical/Coxiella burnetii|Inhaled from livestock birth products; Q fever with pneumonia, hepatitis and culture-negative endocarditis.
Bacteria/Intracellular and atypical/Mycoplasma pneumoniae|No cell wall, so it does not stain and beta-lactams fail; walking pneumonia and cold agglutinins.
Viruses/DNA viruses/Herpesviridae/Herpes simplex virus 1|Latent in the trigeminal ganglion; cold sores and the temporal-lobe encephalitis seen on imaging.
Viruses/DNA viruses/Herpesviridae/Varicella-zoster virus|Chickenpox first, then dermatomal vesicles years later from a dorsal root ganglion.
Viruses/DNA viruses/Herpesviridae/Cytomegalovirus|Owl's-eye inclusions; congenital hearing loss and retinitis in advanced AIDS.
Viruses/DNA viruses/Herpesviridae/Epstein-Barr virus|Atypical lymphocytes and a positive heterophile test; "kissing disease" and Burkitt lymphoma.
Viruses/DNA viruses/Hepadnaviridae/Hepatitis B virus|Partially double-stranded DNA with reverse transcriptase; surface antigen means current infection.
Viruses/DNA viruses/Papillomaviridae/Human papillomavirus|Types 16 and 18 drive cervical cancer; koilocytes on a Pap smear.
Viruses/DNA viruses/Adenoviridae/Adenovirus|Naked double-stranded DNA; pharyngoconjunctival fever and hemorrhagic cystitis.
Viruses/DNA viruses/Parvoviridae/Parvovirus B19|Slapped-cheek rash in children and aplastic crisis in sickle cell disease.
Viruses/DNA viruses/Poxviridae/Variola virus|Replicates in the cytoplasm and was eradicated in 1980; synchronous pustules.
Viruses/RNA viruses/Orthomyxoviridae/Influenza A virus|Segmented genome, hemagglutinin and neuraminidase drift and shift; winter epidemics and pandemics.
Viruses/RNA viruses/Coronaviridae/SARS-CoV-2|Enveloped positive-strand RNA using the ACE2 receptor; anosmia and a global pandemic.
Viruses/RNA viruses/Paramyxoviridae/Measles virus|Koplik spots, then a rash from the head down; subacute sclerosing panencephalitis years later.
Viruses/RNA viruses/Paramyxoviridae/Mumps virus|Parotitis, orchitis and aseptic meningitis; prevented by a vaccine given in childhood.
Viruses/RNA viruses/Paramyxoviridae/Respiratory syncytial virus|Bronchiolitis in infants; palivizumab prevents it in premature babies.
Viruses/RNA viruses/Flaviviridae/Dengue virus|Mosquito-borne breakbone fever; a second infection with another serotype risks hemorrhage.
Viruses/RNA viruses/Flaviviridae/Hepatitis C virus|Chronic infection from blood exposure, now curable with direct-acting antivirals.
Viruses/RNA viruses/Flaviviridae/Yellow fever virus|Jaundice and hemorrhage with Councilman bodies; Aedes mosquitoes and a live vaccine.
Viruses/RNA viruses/Flaviviridae/Zika virus|Mosquito or sexual transmission, linked to microcephaly after infection in pregnancy.
Viruses/RNA viruses/Picornaviridae/Poliovirus|Faecal-oral spread and destruction of anterior horn cells causing asymmetric flaccid paralysis.
Viruses/RNA viruses/Picornaviridae/Hepatitis A virus|Faecal-oral, no chronic carrier state; a vaccine and immunoglobulin protect.
Viruses/RNA viruses/Picornaviridae/Rhinovirus|Acid-labile, the most common cause of the common cold.
Viruses/RNA viruses/Retroviridae/HIV-1|Reverse transcriptase and gp120 binding CD4 cells; the target of antiretroviral therapy.
Viruses/RNA viruses/Filoviridae/Ebola virus|Thread-like negative-strand RNA with hemorrhagic fever and high fatality; spread by body fluids.
Viruses/RNA viruses/Rhabdoviridae/Rabies virus|Bullet-shaped, travels retrograde along nerves; Negri bodies and hydrophobia.
Viruses/RNA viruses/Togaviridae/Rubella virus|German measles with cataracts and a patent ductus in congenital infection.
Viruses/RNA viruses/Reoviridae/Rotavirus|Segmented double-stranded RNA and the most common cause of infant diarrhea before vaccination.
Fungi/Yeasts/Candida albicans|Germ tubes at body temperature; thrush, vaginitis and invasive candidemia.
Fungi/Yeasts/Cryptococcus neoformans|Encapsulated yeast shown with India ink; meningitis in advanced HIV and pigeon droppings.
Fungi/Yeasts/Pneumocystis jirovecii|Ground-glass pneumonia with high LDH in advanced HIV; trimethoprim-sulfamethoxazole prophylaxis.
Fungi/Molds/Aspergillus fumigatus|Acute-angle branching hyphae; fungus ball in old cavities and invasive disease in neutropenia.
Fungi/Dimorphic fungi/Histoplasma capsulatum|Bat and bird droppings in river valleys; tiny yeasts inside macrophages.
Fungi/Dimorphic fungi/Coccidioides immitis|Desert Southwest dust; spherules containing endospores and valley fever.
Fungi/Dimorphic fungi/Blastomyces dermatitidis|Broad-based budding yeast with skin and bone lesions after soil exposure near rivers and lakes.
Fungi/Dermatophytes/Trichophyton rubrum|Most common cause of athlete's foot and ringworm; KOH shows hyphae.
Parasites/Protozoa/Blood and tissue/Plasmodium falciparum|Banana-shaped gametocytes and the most severe malaria with cerebral involvement.
Parasites/Protozoa/Blood and tissue/Plasmodium vivax|Relapses from dormant liver stages unless primaquine is given; Duffy antigen is required.
Parasites/Protozoa/Blood and tissue/Toxoplasma gondii|Cat feces and undercooked meat; ring-enhancing brain lesions in AIDS and congenital infection.
Parasites/Protozoa/Blood and tissue/Trypanosoma cruzi|Kissing-bug vector in the Americas; megacolon, megaesophagus and a dilated cardiomyopathy.
Parasites/Protozoa/Blood and tissue/Leishmania donovani|Sandfly-borne with intracellular amastigotes causing fever, splenomegaly and pancytopenia.
Parasites/Protozoa/Gut/Giardia lamblia|Foul-smelling, greasy diarrhea from lakes and streams; pear-shaped trophozoites.
Parasites/Protozoa/Gut/Entamoeba histolytica|Flask-shaped colon ulcers and an "anchovy paste" liver abscess.
Parasites/Protozoa/Gut/Cryptosporidium parvum|Acid-fast oocysts in watery diarrhea, severe in AIDS and resistant to chlorine.
Parasites/Helminths/Nematodes/Ascaris lumbricoides|Largest intestinal roundworm; larvae pass through the lungs and adults can obstruct the bowel.
Parasites/Helminths/Nematodes/Enterobius vermicularis|Nighttime perianal itching diagnosed with the tape test.
Parasites/Helminths/Nematodes/Strongyloides stercoralis|Autoinfection allows hyperinfection with steroids; larvae penetrate the skin.
Parasites/Helminths/Nematodes/Necator americanus|Penetrates bare feet and causes iron-deficiency anemia by feeding on blood in the gut.
Parasites/Helminths/Cestodes/Taenia solium|Undercooked pork gives the adult worm; eggs cause cysts in the brain.
Parasites/Helminths/Trematodes/Schistosoma mansoni|Freshwater snails and lateral-spined eggs; periportal fibrosis of the liver.
Parasites/Ectoparasites/Sarcoptes scabiei|Burrows between the fingers, intense nocturnal itch, treated with permethrin.
`);

export const drugLeaves: BranchLeaf[] = parse(`
Antimicrobials/Beta-lactams/Penicillins/Amoxicillin|Oral first choice for strep throat and otitis media, with a rash if given during mononucleosis.
Antimicrobials/Beta-lactams/Penicillins/Penicillin G|Long-acting benzathine injection treats early syphilis.
Antimicrobials/Beta-lactams/Cephalosporins/Cefazolin|The standard surgical prophylaxis antibiotic for skin flora.
Antimicrobials/Beta-lactams/Cephalosporins/Ceftriaxone|Once-daily injection that crosses the blood-brain barrier; used for meningitis and gonorrhea.
Antimicrobials/Beta-lactams/Cephalosporins/Cefepime|A fourth-generation agent with antipseudomonal activity for febrile neutropenia.
Antimicrobials/Beta-lactams/Carbapenems/Meropenem|Broad-spectrum last-line option for resistant gram-negative rods; can lower the seizure threshold.
Antimicrobials/Beta-lactams/Monobactams/Aztreonam|Spares most patients with penicillin allergy but covers only gram-negative rods.
Antimicrobials/Protein synthesis inhibitors/Macrolides/Azithromycin|Five-day course for atypical pneumonia; prolongs the QT interval.
Antimicrobials/Protein synthesis inhibitors/Tetracyclines/Doxycycline|Avoid in pregnancy and children; stains teeth; treats Lyme disease and rickettsial infections.
Antimicrobials/Protein synthesis inhibitors/Aminoglycosides/Gentamicin|Concentration-dependent killing with nephrotoxicity and ototoxicity; needs oxygen to enter bacteria.
Antimicrobials/Protein synthesis inhibitors/Lincosamides/Clindamycin|Covers anaerobes above the diaphragm and carries a high risk of Clostridioides difficile colitis.
Antimicrobials/Protein synthesis inhibitors/Oxazolidinones/Linezolid|Resistant gram-positive infections; serotonin syndrome and myelosuppression with long courses.
Antimicrobials/Cell wall inhibitors/Glycopeptides/Vancomycin|Binds the D-Ala-D-Ala end of cell wall precursors; infusion reaction called red man syndrome.
Antimicrobials/DNA-targeting agents/Fluoroquinolones/Ciprofloxacin|Tendon rupture and cartilage concerns; avoid with antacids containing calcium or magnesium.
Antimicrobials/DNA-targeting agents/Fluoroquinolones/Levofloxacin|A respiratory fluoroquinolone with good pneumococcal coverage.
Antimicrobials/DNA-targeting agents/Nitroimidazoles/Metronidazole|Disulfiram-like reaction with alcohol; covers anaerobes and protozoa.
Antimicrobials/DNA-targeting agents/Folate antagonists/Trimethoprim-sulfamethoxazole|Hyperkalemia, rash and bone-marrow suppression; prophylaxis for Pneumocystis pneumonia.
Antimicrobials/Antimycobacterials/Rifampin|Turns body fluids orange and induces cytochrome P450 enzymes.
Antimicrobials/Antimycobacterials/Isoniazid|Needs pyridoxine to prevent neuropathy; hepatitis and slow versus fast acetylators.
Antimicrobials/Antivirals/Nucleoside analogs/Acyclovir|Activated by viral thymidine kinase; crystal nephropathy if not hydrated.
Antimicrobials/Antivirals/Nucleoside analogs/Tenofovir|Backbone of HIV and hepatitis B regimens with kidney and bone effects.
Antimicrobials/Antivirals/Neuraminidase inhibitors/Oseltamivir|Best started within 48 hours of influenza symptoms.
Antimicrobials/Antifungals/Azoles/Fluconazole|Single oral dose treats vaginal candidiasis; inhibits ergosterol synthesis and the liver enzymes that clear other drugs.
Antimicrobials/Antifungals/Polyenes/Amphotericin B|Binds ergosterol and forms pores; "shake and bake" infusion reactions and nephrotoxicity.
Antimicrobials/Antifungals/Echinocandins/Micafungin|Blocks beta-glucan synthesis in the fungal cell wall and is first-line for invasive candidiasis.
Cardiovascular/Beta-blockers/Cardioselective/Metoprolol|Reduces mortality after myocardial infarction and in heart failure with reduced ejection fraction.
Cardiovascular/Beta-blockers/Non-selective/Propranolol|Also used for essential tremor, migraine prevention and thyrotoxic symptoms; can worsen asthma.
Cardiovascular/Beta-blockers/Alpha and beta blockers/Carvedilol|Adds vasodilation through alpha blockade and is used in heart failure.
Cardiovascular/RAAS inhibitors/ACE inhibitors/Lisinopril|Dry cough and angioedema from bradykinin; contraindicated in pregnancy.
Cardiovascular/RAAS inhibitors/ARBs/Losartan|Blocks angiotensin II receptors without the cough and also lowers uric acid.
Cardiovascular/RAAS inhibitors/Aldosterone antagonists/Spironolactone|Potassium-sparing with gynecomastia; improves survival in heart failure and treats hirsutism.
Cardiovascular/Calcium channel blockers/Dihydropyridines/Amlodipine|Peripheral edema and gingival hyperplasia; vasodilates without slowing the heart.
Cardiovascular/Calcium channel blockers/Non-dihydropyridines/Diltiazem|Slows atrioventricular nodal conduction and treats rapid atrial fibrillation.
Cardiovascular/Diuretics/Loop diuretics/Furosemide|Inhibits the Na-K-2Cl pump and causes ototoxicity and hypokalemia; sulfa-containing.
Cardiovascular/Diuretics/Thiazides/Hydrochlorothiazide|Raises calcium and lowers urinary calcium, so it helps calcium stones and worsens gout.
Cardiovascular/Lipid-lowering agents/Statins/Atorvastatin|Inhibits HMG-CoA reductase; myopathy and liver enzyme elevation.
Cardiovascular/Lipid-lowering agents/Statins/Rosuvastatin|A high-potency agent with less cytochrome P450 metabolism.
Cardiovascular/Lipid-lowering agents/Absorption inhibitors/Ezetimibe|Blocks cholesterol uptake at the intestinal brush border.
Cardiovascular/Antiarrhythmics/Potassium channel blockers/Amiodarone|Pulmonary fibrosis, thyroid dysfunction and blue-gray skin; half-life of weeks.
Cardiovascular/Antiarrhythmics/Class IC blockers/Flecainide|Avoid after myocardial infarction because of excess mortality in the CAST trial.
Cardiovascular/Antiarrhythmics/Cardiac glycosides/Digoxin|Inhibits the Na-K ATPase; yellow-green vision and a narrow therapeutic window.
Cardiovascular/Vasodilators/Nitrates/Nitroglycerin|Relieves angina by venodilation; nitrate-free interval prevents tolerance and sildenafil is contraindicated.
Cardiovascular/Vasopressors/Norepinephrine|First-line pressor in septic shock acting mainly on alpha-1 receptors.
Hematology/Anticoagulants/Vitamin K antagonists/Warfarin|Needs INR monitoring; skin necrosis and many drug interactions; reversed by vitamin K.
Hematology/Anticoagulants/Heparins/Enoxaparin|Subcutaneous low-molecular-weight option that inhibits factor Xa and is cleared by the kidney.
Hematology/Anticoagulants/Direct oral anticoagulants/Apixaban|A factor Xa inhibitor taken twice daily for atrial fibrillation without INR checks.
Hematology/Antiplatelets/Aspirin|Irreversibly inhibits cyclooxygenase-1; Reye syndrome in children with viral illness.
Hematology/Antiplatelets/Clopidogrel|Irreversible P2Y12 blockade after coronary stenting; a prodrug activated by CYP2C19.
Endocrine/Diabetes agents/Biguanides/Metformin|First-line for type 2 diabetes; lactic acidosis risk and no hypoglycemia on its own.
Endocrine/Diabetes agents/SGLT2 inhibitors/Empagliflozin|Glycosuria with genital yeast infections and benefit in heart failure and kidney disease.
Endocrine/Diabetes agents/GLP-1 agonists/Semaglutide|Weekly injection for diabetes and weight loss; pancreatitis and gastroparesis concerns.
Endocrine/Diabetes agents/Sulfonylureas/Glipizide|Closes the potassium channel on beta cells and risks hypoglycemia.
Endocrine/Diabetes agents/Insulins/Insulin glargine|A peakless, long-acting basal hormone injected once daily.
Endocrine/Thyroid agents/Levothyroxine|Take on an empty stomach; dose adjusted by TSH.
Endocrine/Corticosteroids/Glucocorticoids/Prednisone|Cushingoid features, osteoporosis and adrenal suppression with long use.
Endocrine/Corticosteroids/Glucocorticoids/Dexamethasone|Potent, long-acting steroid used for cerebral edema and antenatal lung maturity.
Neuropsychiatric/Antidepressants/SSRIs/Sertraline|Sexual dysfunction and GI upset are common; risk of serotonin syndrome with other serotonergic drugs.
Neuropsychiatric/Antidepressants/SSRIs/Fluoxetine|A very long half-life makes missed doses forgiving and discontinuation mild.
Neuropsychiatric/Antidepressants/SNRIs/Venlafaxine|Can raise blood pressure at higher doses and causes severe discontinuation symptoms.
Neuropsychiatric/Antidepressants/Tricyclics/Amitriptyline|Anticholinergic effects and sodium channel blockade; QRS widening in overdose treated with bicarbonate.
Neuropsychiatric/Antipsychotics/Atypical/Olanzapine|Weight gain and metabolic syndrome with less parkinsonism than older agents.
Neuropsychiatric/Antipsychotics/Typical/Haloperidol|High-potency dopamine blocker with dystonia and the risk of neuroleptic malignant syndrome.
Neuropsychiatric/Sedative-hypnotics/Benzodiazepines/Lorazepam|Treats status epilepticus and alcohol withdrawal; glucuronidated so safer in liver disease.
Neuropsychiatric/Sedative-hypnotics/Benzodiazepines/Diazepam|Long-acting with active metabolites that accumulate in older patients.
Neuropsychiatric/Mood stabilizers/Lithium|Narrow therapeutic window with tremor, nephrogenic diabetes insipidus and hypothyroidism.
Neuropsychiatric/Anticonvulsants/Sodium channel blockers/Phenytoin|Gingival hyperplasia, hirsutism, zero-order kinetics and a fetal hydantoin syndrome.
Neuropsychiatric/Anticonvulsants/Sodium channel blockers/Carbamazepine|First-line for trigeminal neuralgia; Stevens-Johnson risk in some Asian ancestries with HLA-B*1502.
Neuropsychiatric/Anticonvulsants/SV2A ligands/Levetiracetam|Few interactions but can cause irritability and behavior changes.
Neuropsychiatric/Anticonvulsants/Valproate/Valproic acid|Neural tube defects, hepatotoxicity and pancreatitis; also treats migraine and bipolar disorder.
Pain and inflammation/Opioids/Morphine|Mu receptor agonist with miosis, constipation and histamine release; reversed by naloxone.
Pain and inflammation/Opioids/Fentanyl|Very potent synthetic agent with rapid onset and chest wall rigidity at high doses.
Pain and inflammation/NSAIDs/Ibuprofen|Inhibits both cyclooxygenase enzymes; gastric irritation, kidney injury and closes a patent ductus.
Pain and inflammation/NSAIDs/Ketorolac|Parenteral agent limited to five days because of bleeding and kidney risk.
Pain and inflammation/Analgesics/Acetaminophen|Little anti-inflammatory effect; overdose causes liver failure treated with N-acetylcysteine.
Gastrointestinal/Acid suppression/Proton pump inhibitors/Omeprazole|Irreversibly blocks H-K ATPase and increases risks of C. difficile, fractures and low magnesium.
Gastrointestinal/Acid suppression/H2 blockers/Famotidine|Blocks histamine receptors on parietal cells with fewer interactions than its older relative.
Gastrointestinal/Antiemetics/5-HT3 antagonists/Ondansetron|Prevents chemotherapy-induced nausea and prolongs the QT interval.
Respiratory/Bronchodilators/Beta-2 agonists/Albuterol|Rescue inhaler causing tremor, tachycardia and low potassium.
Respiratory/Bronchodilators/Anticholinergics/Tiotropium|Long-acting muscarinic antagonist used daily in COPD.
Respiratory/Controllers/Inhaled corticosteroids/Fluticasone|Oral thrush unless the mouth is rinsed after use.
Respiratory/Controllers/Leukotriene antagonists/Montelukast|Neuropsychiatric warning; blocks cysteinyl leukotriene receptors in aspirin-sensitive asthma.
Immunology and oncology/Immunosuppressants/Antimetabolites/Methotrexate|Dihydrofolate reductase inhibitor with weekly dosing for arthritis; rescued with folinic acid.
Immunology and oncology/Immunosuppressants/Calcineurin inhibitors/Tacrolimus|Transplant drug with nephrotoxicity, tremor and diabetes.
Immunology and oncology/Immunosuppressants/TNF inhibitors/Adalimumab|Reactivates latent tuberculosis, so screen first; used in rheumatoid arthritis and Crohn disease.
Immunology and oncology/Cancer therapies/Monoclonal antibodies/Rituximab|Targets CD20 on B cells in lymphoma and autoimmune disease; reactivates hepatitis B.
Immunology and oncology/Cancer therapies/Alkylating agents/Cisplatin|Nephrotoxicity, ototoxicity and severe nausea; hydration and amifostine help.
Immunology and oncology/Cancer therapies/Anthracyclines/Doxorubicin|Cumulative dose-related dilated cardiomyopathy, prevented with dexrazoxane.
Immunology and oncology/Cancer therapies/Vinca alkaloids/Vincristine|Blocks microtubule assembly and causes a peripheral neuropathy with little marrow toxicity.
Immunology and oncology/Cancer therapies/Tyrosine kinase inhibitors/Imatinib|Targets the BCR-ABL fusion of the Philadelphia chromosome in chronic myeloid leukemia.
`);

import { branchMicrobeYear, branchDrugYear } from "./dataBranchYear";

const uniqueLeaves = (leaves: BranchLeaf[]): BranchLeaf[] => {
  const seen = new Set<string>();
  return leaves.filter((leaf) => {
    const key = leaf.name.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const branchSets: Record<BranchSet, BranchLeaf[]> = {
  microbe: uniqueLeaves([...microbeLeaves, ...branchMicrobeYear]),
  drug: uniqueLeaves([...drugLeaves, ...branchDrugYear])
};
