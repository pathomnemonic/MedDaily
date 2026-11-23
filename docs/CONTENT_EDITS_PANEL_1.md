# High-risk panel edits, round 1 (adjudicated; ready to apply)

Mechanical edits for Orion to apply (see ORION_PICKUP item 9). Quote the new text exactly. After editing run `npx vitest run` and `npx tsc --noEmit`; where a number is re-keyed also read the item's explanation and fix any sentence that still states the old value. Decisions marked **DECISION** are made; do not reopen them.

Locations: file:line is the current line of the item. `cf:` and `hf:` ids are generated, see the notes under each.

## Casefile (`cf:topic:index`)
The ids are built from the casefile bank in `src/CasefileClinical.tsx` / `src/dataClinicalCases.ts`; search the bank for the diagnosis name to find the entry (topic order gives the index).
- cf:cough:4 Legionella: finding → "a positive urinary antigen (serogroup 1)".
- cf:endo:1 Conn: append to explanation "Saline suppression confirms primary aldosteronism; imaging and adrenal vein sampling localize the adenoma."
- cf:kidney:1 membranous: explanation → "Membranous nephropathy is a leading cause of primary nephrotic syndrome in adults; primary disease is usually anti-PLA2R positive, while secondary forms link to hepatitis B, drugs, or malignancy."
- cf:liver:0 acute hep B: finding → "a positive surface antigen and IgM anti-HBc".
- cf:liver:4 hemochromatosis: explanation → "Treat with phlebotomy; screen for hepatocellular carcinoma if cirrhosis develops."
- cf:meningitis:3 cryptococcal: finding → "a positive CSF cryptococcal antigen test"; explanation → "Cryptococcal meningitis is diagnosed by CSF cryptococcal antigen and treated with amphotericin B plus flucytosine, then fluconazole."
- cf:rash:1 Lyme: finding → "the expanding erythema migrans rash itself, a clinical diagnosis".
- cf:stroke:6 PComm aneurysm: finding → "blood in the basal cisterns on non-contrast CT, with the aneurysm shown on CT angiography".
- cf:tox:0 acetaminophen 2 days post-overdose: finding → "markedly raised liver enzymes with a detectable acetaminophen level and a compatible history".

## Crossmatch (`src/dataCrossmatch.ts`)
- line 54 `anticholin`: remove "Tiotropium" and "Ipratropium".
- line 45 `ototox`: remove "Vancomycin".
- `inject`: **DECISION** remove Semaglutide from the injectable list (the oral form makes it ambiguous). If it appears in other keys' lists leave those.

## Next-step banks
- ns:n11 `src/data.ts:175` citation → IDSA 2004 community-acquired bacterial meningitis guideline (not the healthcare-associated ventriculitis/meningitis one).
- ns:nx117 `dataClinical5.ts:43` keyed option → "Pancreas-protocol imaging and staging through a multidisciplinary pathway, with tissue diagnosis when indicated".
- ns:nx123 `dataClinical6.ts:29` replace the "AAN neuromuscular junction disorder guidance" source with a generic established LEMS malignancy-screening reference (for example "Lambert-Eaton myasthenic syndrome reviews recommend screening for small-cell lung cancer").
- ns:nx35 `dataExpansion.ts:170` replace the AAP Febrile Infant citation with age-appropriate pediatric sepsis guidance (for example "Surviving Sepsis Campaign international guidelines for children").
- ns:nx37 `dataExpansion.ts:172` replace the first-seizure citation with emergency neuroimaging guidance (for example "ACEP clinical policy on seizures").
- ns:nx54 `dataClinical2.ts:40` keyed answer → immediate IV pulse glucocorticoids for threatened vision, never delaying for biopsy (ACR/VF 2021); update options/explanation to match.
- ns:nx72 `dataClinical3.ts:38` keyed answer → immediate broad-spectrum antibiotics plus urgent ERCP (acute bacterial cholangitis until proven otherwise).
- ns:nx88 `dataClinical4.ts:34` citation → British Society for Rheumatology guideline on inflammatory myopathy (2022).

## Hoofbeats (`src/dataHoofbeats.ts`; ids are `h` + the 1-based order of the `p(...)` calls, so hf:h03 is the 3rd prompt)
- h03 endocarditis: fever up to about 25%, splinter hemorrhages 15 to about 3, Janeway 9 to about 2, Osler 9 to about 2.
- h05 CAP causes: add SARS-CoV-2 and RSV (with sensible percentages; keep the list total near 100 including the "everything else" remainder the UI now shows).
- h15 amiodarone: pulmonary fibrosis 18 to about 5, corneal deposits up, add photosensitivity.
- h32 upper-lobe fibrosis: remove cystic fibrosis and ABPA.
- h04: add starvation ketoacidosis.
- h09: remove Seizure from causes of syncope.
- h13: add central venous catheter as a VTE risk factor.
- h16: remove beta-blockers and spironolactone from the first-line hypertension list.
- h17: add mixed Alzheimer/vascular dementia.
- h26: remove hydroxyzine from first-line GAD.
- h28: add escitalopram to QT-prolonging medications. **DECISION** also add ziprasidone and dofetilide; skip droperidol.
- h30: "contrast nephropathy" → "contrast-associated AKI".
- h43: remove idiopathic juvenile osteoporosis.
- h44: remove toxic shock syndrome. **DECISION** leave adrenal crisis out.
- h37: "Non-alcoholic fatty liver disease" → MASLD.
Hoofbeats synonyms live beside the data; if a removed answer was a synonym target, drop it there too. `src/hoofLogic.test.ts` must still pass.

## Labline (value, tolerance in that order)
- lx48 `dataExpansion.ts:196` key 1.5 (±0.3) → 2.0 (±0.5), fix the context/explanation text for the 1.5 to 2.5 times control range.
- lb:ly114 `dataYearExpansion.ts:238` content → "Common ferritin threshold suggesting iron deficiency in adults" (value 30 ±10 stays).
- `dataLablineYear.ts` tolerances: ly131 to ly134 and ly137: Na ±0.8 → ±1, K ±0.15 → ±0.2, total CO2 upper ±1.5 → ±2 (read each line to see which applies).
- ly141 line 15: **remove** the item.
- ly181 line 55: tolerance ±0.05 → ±0.1.
- ly217 line 91: 25 (±5). ly219 line 93: 7 (±1.5). ly220 line 94: 11 (±3). ly221 line 95: 2.0 (±0.4). ly249 line 123: 9 (±1.5). Update explanation sentences that mention the old key.
- ly239, ly240 lines 113, 114: tolerance ±20 → ±50.
- ly246 line 120: content/key → the age/4 + 4 formula for the upper limit of the A-a gradient (the explanation already gives it); compute the key for the item's stated age.
- ly257 line 131: content "lower limit" → "upper limit".
- ly351 line 225: "99 percentile" → "99th percentile".
- Duplicates (lb:l30/lx38, ly102/lx31, ly104/lx32, ly105/lx49, ly358/ly266, ly59/ly251, ly60/ly252, ly63/lz75, ly66/ly356, lz100/ly248): **DECISION** leave both; the daily set picks a handful per run, so a near-duplicate is rare and harmless. Only the exact duplicate ly63 = lz75: delete lz75.
- ly152 GGT and ly314 ethanol: no change.

## Triage (`src/data.ts:250` t07; `dataUtilityExpansion.ts:119` t39; `dataExpansion.ts` tx13 282, tx27 296, tx30 299; t08 in `data.ts`)
- t07 septic shock: step order so IV crystalloid resuscitation starts immediately, running with cultures and early broad-spectrum antibiotics; vasopressor if hypotension persists. Keep the step count.
- t39 and tx13 stroke: noncontrast CT, then thrombolysis eligibility and bolus without delay; CTA concurrent or after.
- tx27 PPH step 3: annotate TXA "as early as possible, within 3 hours of birth".
- tx30 meningitis: step 4 names CT before LP given impaired consciousness.
- t08: **DECISION** add dexamethasone to step 2, before or with the first antibiotic dose.
- Triage scenario repeats (t03/t39/tx13 and the others listed): leave.

## What Has More (`src/dataExtra.ts`, entries by text)
- badminton court comparison (about line 104): explanation and source note say "tennis court"; change to "badminton court".
- hl:16 skin 1.8 m² vs door (line 608): **DECISION** relabel the door as "a double-width entry door (about 2.1 m by 1.2 m)" with value 2.5, keeping "door greater".
- hl:20 total DNA length (line 595 area): use nucleated cells only, about 5 to 6 trillion, giving about 10 to 12 billion km; keyed answer unchanged.
- hl:28 nicotine: **DECISION** compare delivered dose on both sides (patch about 21 mg over 24 h vs a cigarette about 1 to 2 mg absorbed); relabel both and fix the explanation line "a 21-mg patch contains more nicotine".
- hl:8 heartbeats vs words (line 113): **DECISION** same interval, one hour: about 4,200 heartbeats vs about 10,000 words spoken; key words greater, rewrite the explanation.
- hl:15 iron: say "average adult male".
