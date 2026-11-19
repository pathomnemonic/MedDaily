/** Medical four-letter words used as the two ends of every Letter Rungs ladder. Words missing from the ladder dictionary are ignored. */
export const medicalRungWords = [
  "BONE", "LUNG", "VEIN", "PAIN", "CURE", "CARE", "HEAL", "BILE", "RASH", "SORE", "SICK", "CELL", "GERM", "DOSE", "PILL", "SKIN", "HAND", "HEAD", "FOOT", "NECK",
  "LIMB", "RIBS", "GUMS", "EYES", "EARS", "ACHE", "WARD", "CAST", "SHOT", "BEAT", "DIET", "DRUG", "VIAL", "TEST", "SCAN", "MASK", "GOWN", "COLD", "LOBE", "NODE",
  "HEEL", "KNEE", "SHIN", "TOES", "HIPS", "BACK", "BODY", "CHIN", "LIPS", "NOSE", "ARMS", "LEGS", "DUCT", "IRIS", "LENS", "ULNA", "GUTS", "FLUX", "WOMB", "MOLE",
  "CYST", "PUS", "TEAR", "HAIR", "NAIL", "HEAR", "SEPS", "BLOB", "WALK", "REST", "SLEEP", "LIFE", "DEAD", "WELL", "ILLS", "HURT", "FEVER", "COUGH"
].filter((w) => w.length === 4);
