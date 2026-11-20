/**
 * Scale Lab content: "how big is it, really?" estimation on a fixed log scale (every notch is 10x the last).
 * Values are typical adult reference figures rounded for play; anatomy varies, so scoring gives a bullseye within 25%.
 * Base units: mass in grams, length in metres, volume in litres, time in seconds, count unitless.
 */
export type ScaleCategory = "mass" | "length" | "volume" | "count" | "time";
export interface ScaleItem { id: string; cat: ScaleCategory; name: string; icon: string; value: number; fact: string }
export interface ScaleUnit { label: string; factor: number }
export interface ScaleCategoryInfo {
  title: string; ask: string; icon: string;
  /** Fixed ruler range (base units). Fixed per category so the ruler never hints at an answer. */
  min: number; max: number;
  units: ScaleUnit[];
  landmarks: { name: string; value: number }[];
}

export const SCALE_CATEGORIES: Record<ScaleCategory, ScaleCategoryInfo> = {
  mass: {
    title: "Weight", ask: "How heavy?", icon: "⚖️", min: 1e-5, max: 1e5,
    units: [{ label: "µg", factor: 1e-6 }, { label: "mg", factor: 1e-3 }, { label: "g", factor: 1 }, { label: "kg", factor: 1e3 }],
    landmarks: [{ name: "a grain of rice", value: 0.025 }, { name: "a paperclip", value: 1 }, { name: "a baseball", value: 145 }, { name: "a bag of sugar", value: 1000 }],
  },
  length: {
    title: "Size", ask: "How long is it?", icon: "📏", min: 1e-6, max: 1e1,
    units: [{ label: "µm", factor: 1e-6 }, { label: "mm", factor: 1e-3 }, { label: "cm", factor: 1e-2 }, { label: "m", factor: 1 }],
    landmarks: [{ name: "a human hair's width", value: 7e-5 }, { name: "a grain of sand", value: 5e-4 }, { name: "a credit card", value: 0.0856 }, { name: "a door", value: 2 }],
  },
  volume: {
    title: "Volume", ask: "How much fluid?", icon: "🧪", min: 1e-6, max: 1e2,
    units: [{ label: "µL", factor: 1e-6 }, { label: "mL", factor: 1e-3 }, { label: "L", factor: 1 }],
    landmarks: [{ name: "a raindrop", value: 5e-5 }, { name: "a teaspoon", value: 0.005 }, { name: "a soda can", value: 0.355 }, { name: "a gallon of milk", value: 3.785 }],
  },
  count: {
    title: "Count", ask: "How many?", icon: "🔢", min: 1, max: 1e14,
    units: [{ label: "×1", factor: 1 }, { label: "thousand", factor: 1e3 }, { label: "million", factor: 1e6 }, { label: "billion", factor: 1e9 }, { label: "trillion", factor: 1e12 }],
    landmarks: [{ name: "a dozen eggs", value: 12 }, { name: "seats in a big stadium", value: 80000 }, { name: "people in New York City", value: 8.3e6 }, { name: "people on Earth", value: 8e9 }],
  },
  time: {
    title: "Time", ask: "How long does it last?", icon: "⏱️", min: 1e-3, max: 1e10,
    units: [{ label: "ms", factor: 1e-3 }, { label: "sec", factor: 1 }, { label: "min", factor: 60 }, { label: "hours", factor: 3600 }, { label: "days", factor: 86400 }, { label: "years", factor: 31557600 }],
    landmarks: [{ name: "a camera flash", value: 0.001 }, { name: "a TV commercial", value: 30 }, { name: "a feature film", value: 7200 }, { name: "a school year", value: 2.4e7 }],
  },
};

const it = (id: string, cat: ScaleCategory, name: string, icon: string, value: number, fact: string): ScaleItem => ({ id, cat, name, icon, value, fact });

export const scaleItems: ScaleItem[] = [
  // Weight (grams)
  it("m-stapes", "mass", "The stapes bone in the ear", "👂", 0.003, "About 3 mg, the lightest bone in the body."),
  it("m-parathyroid", "mass", "One parathyroid gland", "🟡", 0.04, "Roughly 30–50 mg each; most people have four."),
  it("m-pineal", "mass", "The pineal gland", "🌲", 0.15, "Pine-cone shaped and only about 0.1–0.2 g."),
  it("m-pituitary", "mass", "The pituitary gland", "🫘", 0.5, "About half a gram, yet it runs much of the endocrine system."),
  it("m-adrenal", "mass", "One adrenal gland", "🔺", 5, "Around 4–5 g, sitting on top of each kidney."),
  it("m-eye", "mass", "One eyeball", "👁️", 7.5, "About 7–8 g and roughly the size of a ping-pong ball."),
  it("m-ovary", "mass", "One ovary", "🥚", 7, "Around 5–8 g in an adult."),
  it("m-thyroid", "mass", "The thyroid gland", "🦋", 20, "About 15–25 g."),
  it("m-prostate", "mass", "The prostate", "🌰", 20, "Roughly walnut-sized, around 20 g in a young adult."),
  it("m-testis", "mass", "One testis", "⚪", 20, "About 15–25 g each."),
  it("m-spinal", "mass", "The spinal cord", "🦴", 35, "Only about 35–40 g, despite spanning most of the back."),
  it("m-uterus", "mass", "A non-pregnant uterus", "🍐", 70, "About 60–80 g, pear-shaped."),
  it("m-pancreas", "mass", "The pancreas", "🥖", 100, "Roughly 80–120 g."),
  it("m-spleen", "mass", "The spleen", "🟣", 150, "About 150 g in a healthy adult."),
  it("m-kidney", "mass", "One kidney", "🫘", 150, "Around 125–170 g each."),
  it("m-heart", "mass", "The heart", "🫀", 300, "Roughly 250–350 g, about the size of a fist."),
  it("m-placenta", "mass", "A full-term placenta", "🍰", 500, "About 500 g, grown from scratch in nine months."),
  it("m-lungs", "mass", "Both lungs together", "🫁", 1000, "About 1 kg combined, though they hold a huge air volume."),
  it("m-brain", "mass", "The brain", "🧠", 1400, "About 1.4 kg, around 2% of body weight."),
  it("m-liver", "mass", "The liver", "🍖", 1500, "The heaviest internal organ at roughly 1.5 kg."),
  it("m-marrow", "mass", "All bone marrow", "🦴", 2600, "About 2.6 kg in an adult."),
  it("m-skin", "mass", "All of your skin", "🧴", 4000, "About 3.5–4.5 kg, the heaviest and largest organ."),
  it("m-aspirin", "mass", "A standard aspirin tablet", "💊", 0.325, "A regular adult tablet is 325 mg."),
  it("m-levo", "mass", "A typical levothyroxine dose", "💊", 1e-4, "100 micrograms, a tiny daily dose."),
  it("m-digoxin", "mass", "A typical digoxin maintenance dose", "💊", 1.25e-4, "0.125 mg is the common daily tablet."),
  it("m-salt", "mass", "Daily sodium limit for adults", "🧂", 2.3, "Guidelines suggest under about 2,300 mg of sodium a day."),
  it("m-coffee", "mass", "Caffeine in a cup of coffee", "☕", 0.095, "Roughly 95 mg in an 8 oz cup."),

  // Size (metres)
  it("l-ecoli", "length", "An E. coli bacterium", "🦠", 2e-6, "About 2 µm long."),
  it("l-platelet", "length", "A platelet's diameter", "🩸", 2.5e-6, "Only 2–3 µm across."),
  it("l-rbc", "length", "A red blood cell's diameter", "🔴", 7.5e-6, "About 7–8 µm; capillaries can be barely wider."),
  it("l-neutrophil", "length", "A neutrophil's diameter", "⚪", 1.2e-5, "Around 10–12 µm."),
  it("l-sperm", "length", "A sperm cell, head to tail", "🏊", 5.5e-5, "About 55–60 µm in total."),
  it("l-oocyte", "length", "A human egg cell", "🥚", 1.2e-4, "About 0.12 mm, the largest cell in the body, just visible to the naked eye."),
  it("l-alveolus", "length", "One alveolus (lung air sac)", "🫁", 2e-4, "About 0.2 mm across."),
  it("l-30g", "length", "Outer diameter of a 30-gauge needle", "💉", 3.1e-4, "0.31 mm, the fine needle used for insulin."),
  it("l-25g", "length", "Outer diameter of a 25-gauge needle", "💉", 5.1e-4, "About 0.51 mm."),
  it("l-cornea", "length", "Thickness of the central cornea", "👁️", 5.5e-4, "About 0.55 mm."),
  it("l-18g", "length", "Outer diameter of an 18-gauge needle", "💉", 1.27e-3, "1.27 mm, a large-bore IV needle."),
  it("l-stapes", "length", "The stapes bone's length", "👂", 3e-3, "Around 3 mm, the smallest bone."),
  it("l-et", "length", "Inside diameter of an adult breathing tube", "🫁", 7.5e-3, "Adult tubes are usually 7.0–8.0 mm."),
  it("l-eyeball", "length", "Front-to-back length of the eyeball", "👁️", 0.024, "About 24 mm."),
  it("l-cochlea", "length", "The cochlea if it were uncoiled", "🐌", 0.035, "About 35 mm of spiral packed into a snail shell."),
  it("l-female-urethra", "length", "A female urethra", "📏", 0.04, "Around 4 cm."),
  it("l-optic", "length", "The optic nerve", "👁️", 0.05, "About 5 cm in total length."),
  it("l-appendix", "length", "The appendix", "🐛", 0.09, "Around 9 cm on average, with a wide range."),
  it("l-trachea", "length", "The trachea (windpipe)", "🫁", 0.11, "About 10–12 cm."),
  it("l-kidney", "length", "One kidney's length", "🫘", 0.11, "About 10–12 cm."),
  it("l-fallopian", "length", "A fallopian tube", "📏", 0.11, "About 10–12 cm."),
  it("l-heart", "length", "The heart's length", "🫀", 0.12, "About 12 cm from base to apex."),
  it("l-pancreas", "length", "The pancreas", "🥖", 0.15, "Around 12–15 cm."),
  it("l-male-urethra", "length", "A male urethra", "📏", 0.2, "About 20 cm."),
  it("l-esophagus", "length", "The esophagus", "🍽️", 0.25, "About 25 cm from throat to stomach."),
  it("l-ureter", "length", "One ureter", "📏", 0.27, "About 25–30 cm."),
  it("l-spinal", "length", "The spinal cord", "🦴", 0.45, "Around 45 cm, ending near the first or second lumbar vertebra."),
  it("l-femur", "length", "The femur", "🦴", 0.48, "About 48 cm in an adult man, the longest bone."),
  it("l-axon", "length", "The longest single nerve cell", "⚡", 1, "A motor neuron's axon can run about a metre from spine to foot."),
  it("l-dna", "length", "DNA in one cell, stretched out", "🧬", 2, "About 2 metres of DNA fit inside each nucleus."),
  it("l-colon", "length", "The large intestine", "🌀", 1.5, "About 1.5 m."),
  it("l-small", "length", "The small intestine", "🌀", 6, "About 6 m by many measures, though it is shorter in life."),

  // Volume (litres)
  it("v-aqueous", "volume", "Aqueous humor in the eye", "👁️", 2.5e-4, "About 0.25 mL."),
  it("v-epipen", "volume", "An epinephrine auto-injector dose", "💉", 3e-4, "0.3 mL of 1 mg/mL epinephrine."),
  it("v-synovial", "volume", "Synovial fluid in a normal knee", "🦵", 0.002, "A couple of mL at most."),
  it("v-semen", "volume", "A typical ejaculate", "💧", 0.003, "About 2–5 mL."),
  it("v-vitreous", "volume", "Vitreous humor in the eye", "👁️", 0.004, "About 4 mL, most of the eye's volume."),
  it("v-vial", "volume", "A standard insulin vial", "💉", 0.01, "10 mL of U-100 insulin."),
  it("v-pericardial", "volume", "Normal fluid around the heart", "🫀", 0.03, "Up to about 15–50 mL."),
  it("v-stroke", "volume", "The heart's stroke volume", "🫀", 0.07, "About 70 mL pumped per beat."),
  it("v-csf", "volume", "Total cerebrospinal fluid", "🧠", 0.15, "About 150 mL, replaced several times a day."),
  it("v-prbc", "volume", "A unit of packed red cells", "🩸", 0.3, "About 300 mL."),
  it("v-donation", "volume", "A whole-blood donation", "🩸", 0.45, "About 450 mL, roughly a pint."),
  it("v-tidal", "volume", "A normal tidal breath", "🫁", 0.5, "About 500 mL in a resting adult."),
  it("v-bladder", "volume", "Comfortable bladder capacity", "🚽", 0.5, "About 400–600 mL before a strong urge."),
  it("v-amniotic", "volume", "Amniotic fluid near term", "🤰", 0.8, "About 800 mL."),
  it("v-stomach", "volume", "Stomach capacity after a big meal", "🍽️", 1, "About 1 L, expandable to more."),
  it("v-residual", "volume", "Residual volume left in the lungs", "🫁", 1.2, "About 1.2 L stays after a full exhale."),
  it("v-urine", "volume", "Daily urine output", "🚽", 1.5, "Roughly 1–2 L per day."),
  it("v-gastric", "volume", "Gastric juice made per day", "🧪", 2.5, "About 2–3 L."),
  it("v-plasma", "volume", "Plasma volume", "🩸", 3, "About 3 L of your 5 L of blood."),
  it("v-vc", "volume", "Vital capacity", "🫁", 4.8, "About 4.8 L in an adult man."),
  it("v-blood", "volume", "Total blood volume", "🩸", 5, "About 5 L in an average adult."),
  it("v-co", "volume", "Resting cardiac output per minute", "🫀", 5, "About 5 L pumped every minute."),
  it("v-tlc", "volume", "Total lung capacity", "🫁", 6, "About 6 L in an adult man."),
  it("v-water", "volume", "Total body water", "💦", 42, "About 42 L in a 70 kg adult, around 60% of body weight."),

  // Count
  it("n-chromo", "count", "Chromosome pairs in a human cell", "🧬", 23, "23 pairs, 46 in all."),
  it("n-teeth", "count", "Permanent teeth in a full adult mouth", "🦷", 32, "32 including wisdom teeth."),
  it("n-ribs", "count", "Ribs in the human body", "🦴", 24, "12 pairs."),
  it("n-bones", "count", "Bones in an adult skeleton", "🦴", 206, "206, though babies have about 300."),
  it("n-muscles", "count", "Named skeletal muscles", "💪", 600, "Roughly 600–650."),
  it("n-mito", "count", "Mitochondria in one liver cell", "🔋", 2000, "About 1,000–2,000 in a hepatocyte."),
  it("n-breaths", "count", "Breaths taken in a day", "🫁", 20000, "About 20,000 at rest."),
  it("n-genes", "count", "Protein-coding genes in the genome", "🧬", 20000, "About 20,000, fewer than once guessed."),
  it("n-beats", "count", "Heartbeats in a day", "🫀", 100000, "About 100,000."),
  it("n-hair", "count", "Hairs on a typical scalp", "💇", 100000, "About 100,000 follicles."),
  it("n-follicles", "count", "Hair follicles on the whole body", "🧔", 5e6, "About 5 million."),
  it("n-sweat", "count", "Sweat glands in the skin", "💦", 3e6, "Roughly 2–4 million."),
  it("n-nephron", "count", "Nephrons in one kidney", "🫘", 1e6, "About a million."),
  it("n-rbcsec", "count", "New red blood cells made every second", "🔴", 2e6, "About 2 million per second."),
  it("n-alveoli", "count", "Alveoli in both lungs", "🫁", 4.8e8, "About 300–480 million."),
  it("n-breaths-life", "count", "Breaths in an 80-year life", "🫁", 6e8, "Around 600 million."),
  it("n-bp", "count", "DNA base pairs in the human genome", "🧬", 3.1e9, "About 3.1 billion in one copy."),
  it("n-beats-life", "count", "Heartbeats in an 80-year life", "🫀", 3e9, "About 3 billion."),
  it("n-neurons", "count", "Neurons in the brain", "🧠", 8.6e10, "About 86 billion."),
  it("n-cells", "count", "Cells in the human body", "🧍", 3.7e13, "About 37 trillion by one estimate."),
  it("n-gut", "count", "Bacteria living in the gut", "🦠", 3.8e13, "Around 38 trillion, about as many as human cells."),
  it("n-rbc", "count", "Red blood cells in the body", "🔴", 2.5e13, "About 25 trillion, roughly a quarter of all cells."),

  // Time (seconds)
  it("t-ap", "time", "A nerve's action potential", "⚡", 0.002, "Around 1–2 milliseconds."),
  it("t-blink", "time", "A blink", "👁️", 0.3, "About a third of a second."),
  it("t-cycle", "time", "One heartbeat at 75 per minute", "🫀", 0.8, "0.8 seconds."),
  it("t-adenosine", "time", "Half-life of adenosine", "💉", 10, "Under 10 seconds, which is why it is pushed fast."),
  it("t-circulation", "time", "One trip of blood around the whole body", "🩸", 60, "About a minute at rest."),
  it("t-epi", "time", "Half-life of IV epinephrine", "💉", 150, "A couple of minutes."),
  it("t-anoxia", "time", "Brain without oxygen before damage starts", "🧠", 300, "Irreversible injury begins after about 4–6 minutes."),
  it("t-rem", "time", "One sleep cycle", "😴", 5400, "About 90 minutes."),
  it("t-amox", "time", "Half-life of amoxicillin", "💊", 3600, "About an hour."),
  it("t-ibu", "time", "Half-life of ibuprofen", "💊", 7200, "About 2 hours."),
  it("t-neutro", "time", "A neutrophil's half-life in blood", "⚪", 25200, "Roughly 7 hours."),
  it("t-digoxin", "time", "Half-life of digoxin", "💊", 144000, "About 40 hours with normal kidneys."),
  it("t-gut", "time", "Turnover of the gut lining", "🌀", 345600, "Replaced about every 4 days."),
  it("t-platelet", "time", "A platelet's lifespan", "🩸", 777600, "About 8–10 days."),
  it("t-measles", "time", "Measles incubation", "🤒", 1036800, "About 10–14 days."),
  it("t-skin", "time", "Turnover of the outer skin", "🧴", 2419200, "Roughly 28 days."),
  it("t-hcq", "time", "Half-life of hydroxychloroquine", "💊", 3456000, "About 40 days."),
  it("t-amio", "time", "Half-life of amiodarone", "💊", 5000000, "About 58 days on average."),
  it("t-rbc", "time", "A red blood cell's lifespan", "🔴", 10368000, "About 120 days."),
  it("t-gestation", "time", "A full-term pregnancy", "🤰", 24192000, "About 40 weeks."),
  it("t-bone", "time", "Time to remodel the whole adult skeleton", "🦴", 315576000, "Roughly 10 years."),
];
