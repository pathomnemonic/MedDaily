import { LETTER_DICTIONARY } from "./dataLetterDictionary";

/** Clinical and anatomical four-letter endpoints for Letter Rungs. */
export const medicalRungWords = [
  "ACNE", "AIDS", "ACHE", "BACK", "BILE", "BITE", "BODY", "BONE", "BURN", "CARE",
  "CAST", "CELL", "CLOT", "COLD", "CURE", "CYST", "DIET", "DOSE", "DRUG", "DUCT",
  "EARS", "EYES", "FOOT", "GOUT", "GUMS", "HAND", "HEAD", "HEAL", "HEAR", "HEEL",
  "HEME", "HIPS", "IRIS", "KNEE", "LENS", "LIDO", "LIMB", "LIPS", "LOBE", "LUNG",
  "MASK", "MASS", "MOLE", "NAIL", "NECK", "NODE", "NOSE", "PAIN", "PATH", "PILL",
  "PUS", "RASH", "RICE", "RIBS", "RISK", "SCAN", "SHOT", "SHIN", "SKIN", "SORE",
  "TEST", "TEAR", "TICK", "TOES", "TUBE", "ULNA", "URIC", "VEIN", "VIAL", "WARD",
  "WART", "WOMB", "WORM", "XRAY"
].filter((word) => word.length === 4);

/** Four-letter intermediate words come from the same curated medical-game dictionary. */
export const rungDictionary = new Set([...LETTER_DICTIONARY, ...medicalRungWords].filter((word) => /^[A-Z]{4}$/.test(word)));
