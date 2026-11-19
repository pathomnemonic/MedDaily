/**
 * "What Has More?" content. Every entry is a deliberately surprising, cross-domain comparison in the spirit of
 * "which has more fat: a day of propofol or 100 strips of bacon?". Dry same-domain exam comparisons (lobes of
 * the lung, pairs of nerves) are not used. Figures are rounded teaching estimates, flagged as approximate.
 */
export interface FunComparison { a: string; av: number; b: string; bv: number; unit: string; explanation: string; source: string; fun: true }

/** Existing entries that were not actually fun (trivially obvious, exam-like, or near-duplicates), dropped by prefix. */
export const DROPPED_COMPARISON_PREFIXES = [
  "Number of bones in a typical adult", "Blood volume in a typical adult", "Fat in 1 tablespoon of olive oil", "Protein in one large egg",
  "Sodium in 1 teaspoon", "Volume of typical adult daily urine output", "Total body water in a 70-kg", "Mass of an average adult liver",
  "Blood in a typical adult", "Saliva produced", "Cerebrospinal fluid produced", "Bile produced", "Red blood cells circulating",
  "Cranial nerves in a human", "Vertebrae in the adult", "Bones in the adult skull", "Auditory ossicles", "Bones in one adult foot",
  "Bones in one adult hand", "Pairs of ribs", "Chambers in the human heart", "Valves in the human heart", "Teeth in a typical adult",
  "Lobes in the right lung", "Typical core body temperature", "pH of gastric acid", "Normal arterial blood pH", "Cardiac output at rest",
  "Length of the adult esophagus", "Diameter of the adult aorta", "Length of the adult colon", "Mass of a typical adult human heart",
  "Approximate length of the adult small intestine" // kept as the tie-in with height below? no: dropped to avoid duplicating the giraffe-style length gag
];

const c = (a: string, av: number, b: string, bv: number, unit: string, explanation: string, source: string): FunComparison => ({ a, av, b, bv, unit, explanation, source, fun: true });

export const funComparisons: FunComparison[] = [
  c("Calories in 3 liters of D5W IV fluid (a typical day of maintenance fluids)", 510, "Calories in a Big Mac (about 590 kcal)", 590, "kcal", "D5W carries 50 g of dextrose per liter at 3.4 kcal/g, so three liters is about 510 kcal. Patients on IV fluids alone are getting less than a fast-food burger's energy.", "D5W composition (50 g/L dextrose, 3.4 kcal/g); typical fast-food nutrition labeling."),
  c("Sodium in 1 liter of normal saline (154 mmol)", 3540, "The recommended daily sodium limit for adults", 2300, "mg sodium", "A liter of 0.9% saline holds 154 mmol of sodium, about 3.5 g, which exceeds the 2,300 mg daily dietary limit. Fluid resuscitation is a salt load.", "0.9% NaCl composition; Dietary Guidelines for Americans sodium limit."),
  c("Potassium in a standard 20 mEq IV potassium chloride rider", 782, "Potassium in 5 medium bananas (about 420 mg each)", 2100, "mg potassium", "20 mEq of K+ is only about 780 mg, less than two bananas' worth. The danger of IV potassium is the speed and route, not the amount.", "Potassium atomic mass (39.1 mg/mEq); USDA banana potassium content."),
  c("Total length of DNA in all your cells laid end to end (about 2 m per cell × 37 trillion cells)", 74000000000, "Distance from Earth to the Sun", 150000000, "km", "Roughly 2 m of DNA per cell across about 37 trillion cells is around 74 billion km, hundreds of round trips to the Sun.", "Approximate human cell count and per-cell DNA length (rough teaching estimates)."),
  c("Blood your heart pumps in one day (about 5 L/min)", 7200, "Water in a typical six-person hot tub (about 1,500 L)", 1500, "liters", "At 5 L/min the heart moves about 7,200 L a day, nearly five hot tubs' worth.", "Typical resting cardiac output; typical hot tub volume."),
  c("Heartbeats in an 80-year life (at about 70 per minute)", 2900000000, "People alive on Earth (about 8 billion)", 8000000000, "count", "70 beats/min for 80 years is about 2.9 billion beats, still well short of the world's population.", "Simple arithmetic from typical resting heart rate."),
  c("Power your brain uses (about 20 W)", 20, "A typical LED light bulb (about 9 W)", 9, "watts", "The brain runs on about 20 W, roughly 20% of the body's resting energy, more than a household LED bulb.", "Typical cerebral metabolic rate estimates."),
  c("A 250-mL bag of 20% lipid emulsion (about 2 kcal/mL)", 500, "A slice of pepperoni pizza (about 300 kcal)", 300, "kcal", "Twenty-percent lipid emulsion delivers 2 kcal/mL, so one bag is about 500 kcal, more than a slice of pizza.", "Intravenous lipid emulsion labeling; typical pizza nutrition estimates."),
  c("Fat in one 20-mL vial of propofol 1% (about 2 g)", 2, "Fat in one tablespoon of butter (about 11 g)", 11, "g fat", "Propofol is a 10% lipid emulsion, so a 20-mL vial holds about 2 g of fat. A tablespoon of butter has more than five times as much.", "Propofol 1% product labeling; USDA butter composition."),
  c("Sugar in one ampule of D50 (50 mL of 50% dextrose)", 25, "Sugar in a 12-oz can of cola (about 39 g)", 39, "g sugar", "The emergency hypoglycemia rescue syringe contains 25 g of dextrose, less sugar than a can of soda.", "D50 composition; typical cola nutrition labeling."),
  c("Pure alcohol in a standard US beer (12 oz at 5%)", 14, "Pure alcohol in a standard shot of whiskey (1.5 oz at 40%)", 14, "g alcohol", "A standard drink is defined as about 14 g of pure alcohol, so the beer and the shot match. This is a tie.", "NIAAA standard drink definition."),
  c("Nicotine content of a 21-mg transdermal patch (delivered over 24 hours)", 21, "Nicotine content of one cigarette (about 12 mg)", 12, "mg nicotine", "A 21-mg patch contains more nicotine than a cigarette, but it is released slowly instead of in spikes. Only a fraction of a cigarette's nicotine is absorbed.", "Nicotine replacement labeling; tobacco product content estimates."),
  c("Radiation dose from one chest X-ray (about 0.1 mSv)", 100, "Radiation dose from eating 100 bananas (about 0.1 µSv each)", 10, "µSv", "The 'banana equivalent dose' is a playful unit: a chest X-ray is about a thousand bananas, so a hundred bananas is a tenth of that.", "Typical effective doses; banana equivalent dose is an informal teaching unit."),
  c("Hair growth per month (about 1.2 cm)", 12, "Fingernail growth per month (about 3 mm)", 3, "mm", "Scalp hair grows about 0.4 mm a day, roughly four times as fast as fingernails.", "Typical dermatology growth-rate estimates."),
  c("Red blood cells your marrow makes each second (about 2.4 million)", 2400000, "Seconds in one day", 86400, "count", "Marrow produces roughly 2 to 3 million red cells every second, dwarfing the 86,400 seconds in a day.", "Typical hematology estimates of erythropoiesis."),
  c("Skin weight in an adult (about 4 kg)", 4, "Liver weight in an adult (about 1.5 kg)", 1.5, "kg", "By weight, skin is the largest organ, more than twice the mass of the liver.", "Typical organ mass estimates."),
  c("Mass of microbes living in your gut (about 200 g)", 200, "A US stick of butter (113 g)", 113, "g", "Current estimates put the gut microbiome at roughly 200 g, nearly two sticks of butter.", "Recent human microbiome mass estimates."),
  c("Water content of a jellyfish (about 95%)", 95, "Water content of an adult human (about 60%)", 60, "% water", "Jellyfish are about 95% water, far wetter than a person.", "Typical biology reference values."),
  c("Protein-coding genes in the human genome (about 20,000)", 20000, "Protein-coding genes in rice (about 40,000)", 40000, "genes", "Rice has roughly twice as many protein-coding genes as people do.", "Approximate published genome annotations."),
  c("Human genome size (about 3.1 billion base pairs)", 3100000000, "Genome of the canopy plant Paris japonica (about 150 billion base pairs)", 150000000000, "base pairs", "Paris japonica holds the record for the largest known plant genome, nearly fifty times the human genome.", "Published genome-size records."),
  c("Droplets from one sneeze (up to about 40,000)", 40000, "Droplets from one cough (up to about 3,000)", 3000, "droplets", "Classic aerosol studies estimated that a sneeze can expel an order of magnitude more droplets than a cough. Counts vary widely by study.", "Classic droplet-count estimates; ranges vary between studies."),
  c("Field strength of a clinical 3-tesla MRI magnet", 3000, "A refrigerator magnet (about 5 mT)", 5, "mT", "A 3 T MRI is about 600 times stronger than a fridge magnet, which is why metal must stay out of the scanner room.", "Typical MRI field strengths; refrigerator magnet measurements."),
  c("Heat your resting body gives off (about 100 W)", 100, "A 60-W incandescent light bulb", 60, "watts", "At rest you shed about 100 W of heat, more than an old-fashioned bulb. A full waiting room warms itself.", "Typical resting metabolic heat output."),
  c("Total lung capacity of an adult (about 6 L)", 6, "Volume of a size-7 basketball (about 7.2 L)", 7.2, "liters", "Even fully inflated, adult lungs hold less than a basketball.", "Typical total lung capacity; basketball dimensions."),
  c("Blood in a standard whole-blood donation (about 470 mL)", 470, "A 12-oz can of soda (about 355 mL)", 355, "mL", "A donated pint is about 470 mL, more than a soda can.", "Standard donation volume; US soda can size."),
  c("Water you lose just by breathing out in a day (about 400 mL)", 400, "A standard 8-oz cup of coffee (about 240 mL)", 240, "mL", "Respiratory insensible water loss is a few hundred milliliters a day, more than a cup of coffee.", "Typical insensible respiratory water loss estimates.")
];
