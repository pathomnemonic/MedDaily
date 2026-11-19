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
  ])
];
