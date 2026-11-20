/**
 * Crossmatch content: drug groups and drug properties. A puzzle crosses three row criteria with three column criteria;
 * every cell needs a drug that satisfies both, and each drug can be used once. Membership lists follow standard
 * pharmacology teaching and are deliberately limited to well-established associations.
 */
export interface CrossCriterion { id: string; label: string; kind: "class" | "property"; members: string[] }
const k = (id: string, label: string, kind: "class" | "property", members: string[]): CrossCriterion => ({ id, label, kind, members });

export const crossCriteria: CrossCriterion[] = [
  // Drug groups
  k("abx", "Antibiotic", "class", ["Amoxicillin", "Penicillin G", "Cefazolin", "Ceftriaxone", "Cefepime", "Meropenem", "Aztreonam", "Azithromycin", "Clarithromycin", "Doxycycline", "Gentamicin", "Clindamycin", "Linezolid", "Vancomycin", "Ciprofloxacin", "Levofloxacin", "Metronidazole", "Trimethoprim-sulfamethoxazole", "Rifampin", "Isoniazid"]),
  k("bb", "Beta-blocker", "class", ["Metoprolol", "Propranolol", "Carvedilol", "Atenolol", "Bisoprolol", "Labetalol", "Nadolol", "Sotalol"]),
  k("aed", "Antiepileptic", "class", ["Phenytoin", "Carbamazepine", "Levetiracetam", "Valproic acid", "Lamotrigine", "Phenobarbital", "Topiramate"]),
  k("antidep", "Antidepressant", "class", ["Sertraline", "Fluoxetine", "Citalopram", "Venlafaxine", "Amitriptyline", "Bupropion", "Mirtazapine", "Trazodone"]),
  k("antipsy", "Antipsychotic", "class", ["Olanzapine", "Haloperidol", "Quetiapine", "Risperidone", "Clozapine"]),
  k("anticoag", "Anticoagulant or antiplatelet", "class", ["Warfarin", "Heparin", "Enoxaparin", "Apixaban", "Rivaroxaban", "Dabigatran", "Aspirin", "Clopidogrel"]),
  k("dm", "Diabetes drug", "class", ["Metformin", "Empagliflozin", "Semaglutide", "Liraglutide", "Glipizide", "Glyburide", "Insulin glargine", "Pioglitazone", "Sitagliptin"]),
  k("diur", "Diuretic", "class", ["Furosemide", "Bumetanide", "Hydrochlorothiazide", "Chlorthalidone", "Spironolactone", "Acetazolamide"]),
  k("opioid", "Opioid", "class", ["Morphine", "Fentanyl", "Oxycodone", "Hydromorphone", "Tramadol", "Methadone", "Codeine"]),
  k("nsaid", "NSAID", "class", ["Ibuprofen", "Naproxen", "Ketorolac", "Celecoxib", "Indomethacin", "Aspirin"]),
  k("statin", "Statin", "class", ["Atorvastatin", "Rosuvastatin", "Simvastatin", "Pravastatin"]),
  k("raas", "ACE inhibitor or ARB", "class", ["Lisinopril", "Enalapril", "Ramipril", "Losartan", "Valsartan"]),
  k("antiviral", "Antiviral", "class", ["Acyclovir", "Tenofovir", "Oseltamivir", "Remdesivir", "Ritonavir"]),
  k("antifungal", "Antifungal", "class", ["Fluconazole", "Amphotericin B", "Micafungin", "Ketoconazole", "Voriconazole"]),
  k("onc", "Cancer or transplant drug", "class", ["Methotrexate", "Tacrolimus", "Cisplatin", "Doxorubicin", "Vincristine", "Imatinib", "Cyclophosphamide", "Cyclosporine"]),
  k("steroid", "Corticosteroid", "class", ["Prednisone", "Dexamethasone", "Hydrocortisone", "Methylprednisolone"]),
  k("ccb", "Calcium channel blocker", "class", ["Amlodipine", "Nifedipine", "Diltiazem", "Verapamil"]),
  k("benzo", "Benzodiazepine", "class", ["Lorazepam", "Diazepam", "Midazolam", "Alprazolam", "Clonazepam"]),
  k("antiarr", "Antiarrhythmic", "class", ["Amiodarone", "Digoxin", "Flecainide", "Lidocaine", "Sotalol", "Adenosine"]),
  k("resp", "Asthma or COPD drug", "class", ["Albuterol", "Tiotropium", "Fluticasone", "Montelukast", "Ipratropium", "Theophylline"]),
  // Properties
  k("qt", "Can prolong the QT interval", "property", ["Azithromycin", "Clarithromycin", "Levofloxacin", "Ciprofloxacin", "Haloperidol", "Quetiapine", "Ondansetron", "Amiodarone", "Sotalol", "Fluconazole", "Amitriptyline", "Citalopram", "Methadone", "Voriconazole"]),
  k("renal", "Cleared mostly by the kidneys", "property", ["Gentamicin", "Vancomycin", "Enoxaparin", "Dabigatran", "Lithium", "Digoxin", "Metformin", "Levetiracetam", "Acyclovir", "Cefazolin", "Meropenem", "Penicillin G", "Amoxicillin", "Tenofovir", "Atenolol", "Nadolol", "Sotalol", "Methotrexate", "Gabapentin", "Famotidine"]),
  k("hyperk", "Can cause hyperkalemia", "property", ["Lisinopril", "Enalapril", "Ramipril", "Losartan", "Valsartan", "Spironolactone", "Trimethoprim-sulfamethoxazole", "Heparin", "Ibuprofen", "Naproxen", "Ketorolac", "Tacrolimus", "Cyclosporine"]),
  k("hypok", "Can cause hypokalemia", "property", ["Furosemide", "Bumetanide", "Hydrochlorothiazide", "Chlorthalidone", "Albuterol", "Insulin glargine", "Amphotericin B", "Prednisone", "Hydrocortisone", "Acetazolamide"]),
  k("nephro", "Can damage the kidneys", "property", ["Gentamicin", "Vancomycin", "Ibuprofen", "Naproxen", "Ketorolac", "Cisplatin", "Amphotericin B", "Tacrolimus", "Cyclosporine", "Lithium", "Acyclovir", "Methotrexate"]),
  k("preg", "Should be avoided in pregnancy", "property", ["Lisinopril", "Enalapril", "Ramipril", "Losartan", "Valsartan", "Warfarin", "Methotrexate", "Valproic acid", "Phenytoin", "Carbamazepine", "Doxycycline", "Atorvastatin", "Rosuvastatin", "Simvastatin", "Pravastatin", "Lithium", "Topiramate"]),
  k("antidote", "Has a specific antidote or reversal agent", "property", ["Warfarin", "Heparin", "Enoxaparin", "Apixaban", "Rivaroxaban", "Dabigatran", "Morphine", "Fentanyl", "Oxycodone", "Hydromorphone", "Methadone", "Codeine", "Tramadol", "Lorazepam", "Diazepam", "Midazolam", "Digoxin", "Methotrexate", "Acetaminophen"]),
  k("inducer", "Strong CYP450 inducer", "property", ["Rifampin", "Phenytoin", "Carbamazepine", "Phenobarbital"]),
  k("inhibitor", "Important CYP450 inhibitor", "property", ["Fluconazole", "Ketoconazole", "Voriconazole", "Clarithromycin", "Ritonavir", "Amiodarone", "Fluoxetine", "Diltiazem", "Verapamil", "Ciprofloxacin"]),
  k("weightgain", "Often causes weight gain", "property", ["Olanzapine", "Quetiapine", "Risperidone", "Clozapine", "Mirtazapine", "Valproic acid", "Prednisone", "Insulin glargine", "Glipizide", "Glyburide", "Pioglitazone", "Amitriptyline", "Lithium"]),
  k("weightloss", "Often causes weight loss or appetite loss", "property", ["Semaglutide", "Liraglutide", "Empagliflozin", "Metformin", "Topiramate", "Bupropion"]),
  k("brady", "Can cause bradycardia", "property", ["Metoprolol", "Propranolol", "Carvedilol", "Atenolol", "Bisoprolol", "Labetalol", "Nadolol", "Sotalol", "Diltiazem", "Verapamil", "Digoxin", "Amiodarone", "Adenosine"]),
  k("serotonin", "Can contribute to serotonin syndrome", "property", ["Sertraline", "Fluoxetine", "Citalopram", "Venlafaxine", "Trazodone", "Linezolid", "Tramadol", "Fentanyl", "Ondansetron"]),
  k("ototox", "Can damage hearing", "property", ["Gentamicin", "Furosemide", "Bumetanide", "Cisplatin", "Aspirin", "Vancomycin"]),
  k("nti", "Has a narrow therapeutic index", "property", ["Warfarin", "Digoxin", "Lithium", "Phenytoin", "Tacrolimus", "Cyclosporine", "Gentamicin", "Vancomycin", "Carbamazepine", "Theophylline", "Methotrexate"]),
  k("suicid", "Carries a boxed warning for suicidality", "property", ["Sertraline", "Fluoxetine", "Citalopram", "Venlafaxine", "Amitriptyline", "Bupropion", "Mirtazapine", "Trazodone", "Quetiapine"]),
  k("hypogly", "Can cause hypoglycemia", "property", ["Insulin glargine", "Glipizide", "Glyburide"]),
  k("hypergly", "Can raise blood sugar", "property", ["Prednisone", "Dexamethasone", "Hydrocortisone", "Methylprednisolone", "Olanzapine", "Quetiapine", "Clozapine", "Hydrochlorothiazide", "Chlorthalidone", "Tacrolimus", "Cyclosporine"]),
  k("inject", "Usually given by injection or infusion", "property", ["Gentamicin", "Ceftriaxone", "Cefazolin", "Cefepime", "Meropenem", "Aztreonam", "Enoxaparin", "Heparin", "Insulin glargine", "Semaglutide", "Liraglutide", "Cisplatin", "Doxorubicin", "Vincristine", "Amphotericin B", "Micafungin", "Remdesivir", "Penicillin G", "Midazolam"]),
  k("pregok", "Generally considered safe in pregnancy", "property", ["Amoxicillin", "Penicillin G", "Cefazolin", "Ceftriaxone", "Azithromycin", "Labetalol", "Nifedipine", "Insulin glargine", "Enoxaparin", "Heparin", "Acetaminophen", "Levothyroxine", "Metoclopramide", "Ondansetron"]),
  k("bronchospasm", "Can trigger bronchospasm in asthma", "property", ["Propranolol", "Nadolol", "Carvedilol", "Labetalol", "Aspirin", "Ibuprofen", "Naproxen", "Ketorolac", "Indomethacin", "Adenosine"]),
  k("sedation", "Causes sedation", "property", ["Morphine", "Fentanyl", "Oxycodone", "Hydromorphone", "Codeine", "Lorazepam", "Diazepam", "Midazolam", "Alprazolam", "Clonazepam", "Phenobarbital", "Olanzapine", "Quetiapine", "Mirtazapine", "Trazodone", "Amitriptyline", "Gabapentin", "Diphenhydramine"]),
  k("anticholin", "Has strong anticholinergic effects", "property", ["Amitriptyline", "Diphenhydramine", "Oxybutynin", "Benztropine", "Clozapine", "Olanzapine", "Tiotropium", "Ipratropium"]),
  k("gibleed", "Can cause gastrointestinal bleeding", "property", ["Aspirin", "Ibuprofen", "Naproxen", "Ketorolac", "Indomethacin", "Celecoxib", "Warfarin", "Apixaban", "Rivaroxaban", "Clopidogrel", "Prednisone"]),
  k("liver", "Can cause liver injury", "property", ["Isoniazid", "Rifampin", "Acetaminophen", "Valproic acid", "Methotrexate", "Amiodarone", "Ketoconazole", "Fluconazole", "Voriconazole", "Carbamazepine"]),
];

/** Common brand names and abbreviations accepted when typing. */
export const crossAliases: Record<string, string> = {
  "TMP-SMX": "Trimethoprim-sulfamethoxazole", Bactrim: "Trimethoprim-sulfamethoxazole", HCTZ: "Hydrochlorothiazide", ASA: "Aspirin",
  Lasix: "Furosemide", Coumadin: "Warfarin", Lovenox: "Enoxaparin", Eliquis: "Apixaban", Xarelto: "Rivaroxaban", Plavix: "Clopidogrel",
  Glucophage: "Metformin", Lipitor: "Atorvastatin", Zocor: "Simvastatin", Zofran: "Ondansetron", Tylenol: "Acetaminophen", Paracetamol: "Acetaminophen",
  Motrin: "Ibuprofen", Advil: "Ibuprofen", Aleve: "Naproxen", Valium: "Diazepam", Ativan: "Lorazepam", Xanax: "Alprazolam", Prozac: "Fluoxetine",
  Zoloft: "Sertraline", Haldol: "Haloperidol", Zyprexa: "Olanzapine", Keppra: "Levetiracetam", Dilantin: "Phenytoin", Tegretol: "Carbamazepine",
  Depakote: "Valproic acid", Valproate: "Valproic acid", Cipro: "Ciprofloxacin", Levaquin: "Levofloxacin", Zithromax: "Azithromycin", Vancocin: "Vancomycin",
  Lanoxin: "Digoxin", Cordarone: "Amiodarone", "Vitamin K antagonist": "Warfarin", Epinephrine: "Adrenaline",
};

const all = new Map<string, string>();
for (const c of crossCriteria) for (const m of c.members) all.set(m.toLowerCase(), m);
/** Every drug that can appear as an answer. */
export const crossDrugs: string[] = [...all.values()].sort();
