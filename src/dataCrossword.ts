import { crosswordBankExpansion } from "./dataCrosswordExpansion";

/** Clue bank for Mini Crossword. Answers are 4–8 letters, A–Z only; each clue has exactly one sensible answer. */
export const crosswordBank: [string, string][] = [
  ["AORTA", "Largest artery in the body"], ["FEMUR", "Longest bone in the body"], ["ULNA", "Forearm bone on the pinky side"], ["RADIUS", "Forearm bone on the thumb side"],
  ["TIBIA", "Shin bone"], ["FIBULA", "Slender bone beside the shin"], ["HUMERUS", "Upper arm bone"], ["PATELLA", "Kneecap"], ["STERNUM", "Breastbone"], ["CLAVICLE", "Collarbone"],
  ["SCAPULA", "Shoulder blade"], ["PELVIS", "Ring of hip bones"], ["SKULL", "Bony case around the brain"], ["STAPES", "Smallest bone in the body"], ["TENDON", "Tissue joining muscle to bone"],
  ["LIGAMENT", "Tissue joining bone to bone"], ["ATRIUM", "Upper chamber of the heart"], ["LIVER", "Organ that makes bile"], ["SPLEEN", "Organ that filters old red cells"], ["COLON", "Large intestine"],
  ["ILEUM", "Last part of the small intestine"], ["CECUM", "Pouch where the large bowel begins"], ["PANCREAS", "Gland that makes insulin and lipase"], ["THYROID", "Butterfly-shaped neck gland"],
  ["ADRENAL", "Gland sitting on top of the kidney"], ["BRAIN", "Organ inside the skull"], ["CORTEX", "Outer layer of the cerebrum"], ["NEURON", "Nerve cell"], ["SYNAPSE", "Gap between two neurons"],
  ["AXON", "Long fiber carrying signals away from a nerve cell body"], ["MYELIN", "Fatty sheath around axons"], ["INSULIN", "Hormone that lowers blood glucose"], ["GLUCOSE", "Blood sugar"],
  ["CORTISOL", "Stress hormone from the adrenal cortex"], ["ALBUMIN", "Main protein in blood plasma"], ["PLASMA", "Liquid part of blood"], ["PLATELET", "Cell fragment that helps clotting"],
  ["ANEMIA", "Low red cell count or hemoglobin"], ["SEPSIS", "Life-threatening response to infection"], ["EDEMA", "Swelling from extra fluid"], ["ULCER", "Open sore in a lining"], ["TUMOR", "Abnormal mass of tissue"],
  ["STROKE", "Brain attack"], ["COMA", "Prolonged unconsciousness"], ["SHOCK", "Circulation that fails to meet tissue needs"], ["ASTHMA", "Wheezy airway disease"], ["APNEA", "Pause in breathing"],
  ["DYSPNEA", "Shortness of breath"], ["FEVER", "Raised body temperature"], ["RASH", "Skin eruption"], ["HIVES", "Itchy raised welts"], ["ECZEMA", "Itchy, inflamed skin condition"], ["LUPUS", "Autoimmune disease with a butterfly rash"],
  ["GOUT", "Uric acid arthritis that loves the big toe"], ["MALARIA", "Mosquito-borne parasitic fever"], ["CHOLERA", "Rice-water diarrhea disease"], ["MEASLES", "Disease with Koplik spots"], ["MUMPS", "Parotid-swelling virus"],
  ["POLIO", "Vaccine-preventable paralyzing virus"], ["RABIES", "Fatal virus from animal bites"], ["TETANUS", "Lockjaw"], ["HERPES", "Cold sore virus family"], ["SHINGLES", "Painful dermatomal rash from varicella zoster"],
  ["TRIAGE", "Sorting patients by urgency"], ["SUTURE", "Surgical stitch"], ["SCALPEL", "Surgeon's blade"], ["STENT", "Tube that props a vessel open"], ["INTUBATE", "Place a breathing tube"], ["BIOPSY", "Tissue sample for diagnosis"],
  ["SPLINT", "Support for a broken limb"], ["ASPIRIN", "Antiplatelet drug that irreversibly blocks COX"], ["HEPARIN", "Anticoagulant reversed by protamine"], ["WARFARIN", "Vitamin K antagonist"], ["STATIN", "Cholesterol-lowering drug class"],
  ["MORPHINE", "Classic opioid painkiller"], ["NALOXONE", "Opioid overdose reversal drug"], ["ATROPINE", "Anticholinergic given for bradycardia"], ["LITHIUM", "Mood stabilizer with a narrow therapeutic window"], ["DIGOXIN", "Foxglove-derived heart drug"],
  ["ALVEOLI", "Tiny air sacs of the lung"], ["BRONCHI", "Airways branching from the trachea"], ["TRACHEA", "Windpipe"], ["LARYNX", "Voice box"], ["PHARYNX", "Throat"], ["NEPHRON", "Functional unit of the kidney"],
  ["URETER", "Tube from kidney to bladder"], ["URETHRA", "Tube that drains the bladder"], ["BLADDER", "Urine storage organ"], ["CORNEA", "Clear front window of the eye"], ["RETINA", "Light-sensing layer of the eye"],
  ["IRIS", "Colored part of the eye"], ["PUPIL", "Opening in the iris"], ["COCHLEA", "Spiral organ of hearing"], ["MUSCLE", "Tissue that contracts"], ["DENTIN", "Hard tissue under tooth enamel"],
  ["ENAMEL", "Hardest substance in the body"], ["MARROW", "Blood-cell factory inside bones"], ["FASCIA", "Connective tissue sheet around muscles"], ["VEIN", "Vessel returning blood to the heart"], ["VALVE", "One-way door in the heart"]
];

crosswordBank.push(...crosswordBankExpansion);
