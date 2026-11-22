import type { MimeKind } from "./dataMime";

const add = (kind: MimeKind, terms: string[]) => terms.map((term) => ({ term, kind }));
export const mimeDeckExpansion = [
  ...add("Procedure", [
    "Placing a urinary catheter","Removing sutures","Applying a splint","Performing a lumbar puncture","Collecting a sputum sample",
    "Inserting a central line","Placing an arterial line","Performing a pelvic examination","Checking pupillary reflexes","Testing visual fields",
    "Performing a Romberg test","Doing a heel-to-shin test","Checking capillary refill","Performing a thyroid examination","Palpating the abdomen",
    "Checking for pitting edema","Performing a rectal examination","Using a peak flow meter","Giving a nebulizer treatment","Applying oxygen by nasal cannula",
    "Using an incentive spirometer","Performing CPR on a mannequin","Performing a surgical time-out","Changing a wound dressing","Removing a cast",
    "Performing an ECG","Drawing an arterial blood gas","Collecting a urine sample","Performing a throat swab","Testing hearing with a tuning fork",
    "Performing a fundoscopic examination","Performing a skin biopsy","Applying a cervical collar","Doing a FAST ultrasound","Checking an ankle-brachial index",
    "Administering eye drops","Flushing an IV line","Performing hand hygiene with sanitizer","Checking a Babinski reflex","Applying a wound-closure strip"
  ]),
  ...add("Symptom", [
    "Shortness of breath while climbing stairs","Wheezing during an asthma attack","Vertigo with the room spinning","Fainting from syncope","Dizziness on standing up",
    "Feeling a racing heartbeat","Chest pressure during exertion","Sharp pain with a deep breath","Guarding from abdominal pain","Rebound tenderness on examination",
    "Yellow skin from jaundice","A swollen abdomen from ascites","Swelling in both legs","Calf pain while walking from claudication","Sudden weakness on one side",
    "Facial droop from a stroke","Slurred speech","Expressive aphasia while searching for words","A resting hand tremor","A shuffling Parkinsonian gait",
    "Staggering from ataxia","Eyes jerking with nystagmus","Drooping eyelid from ptosis","Seeing double from diplopia","Squinting from photophobia",
    "Neck stiffness from meningismus","Back spasms","Pain shooting down the leg from sciatica","A swollen painful joint","A gout flare in the big toe",
    "Hives spreading across the skin","Swelling of the lips from angioedema","Scratching itchy eczema","Thick plaques from psoriasis","Blisters from a skin eruption",
    "Hyperventilating during a panic attack","Restlessness during mania","Responding to auditory hallucinations","Confusion from delirium","Searching for words with memory loss",
    "Tossing and turning with insomnia","Moving legs from restless legs syndrome","Rushing to the bathroom with urinary urgency","Burning with urination","Doubling over from renal colic",
    "Running to the bathroom with diarrhea","Straining with constipation","Choking while swallowing from dysphagia","Hiccups that will not stop","Flushing during a hot flash"
  ]),
  ...add("Ward life", [
    "Getting paged during lunch","Trying to find a computer on wheels","A code team rushing down the hallway","Giving sign-out at shift change","A nurse calling about a critical potassium",
    "A resident checking the patient census","A medical student presenting a new admission","Waiting for an interpreter to arrive","Calling radiology for a scan read","A consultant returning a page",
    "A family meeting in the ICU","Explaining a procedure to a patient","A patient refusing a medication","A patient asking for another blanket","The printer running out of paper",
    "Searching for a vein before an IV","A nurse looking for the attending physician","An attending teaching at the bedside","Rushing to morning report","Trying to remember a computer password",
    "Checking the crash cart","Calling the laboratory about a specimen","A patient pressing the call button repeatedly","A transport team moving a patient","A resident falling asleep on call",
    "A student writing a SOAP note","A team rounding in the hallway","A doctor reviewing a CT scan","A pharmacist clarifying a medication order","A patient being discharged home",
    "A family member asking for an update","A patient practicing with an incentive spirometer","A resident carrying too many charts","An intern juggling three pagers","A medical student looking for the correct room",
    "A patient being admitted from the emergency department","A nurse documenting vital signs","A doctor calling the operating room","A team celebrating a successful resuscitation","A clinician washing hands between rooms"
  ]),
  ...add("Instrument", [
    "Penlight","Glucometer","Peak flow meter","Spirometer","Nebulizer mask","Oxygen face mask","Nasal cannula","Laryngoscope","Endotracheal tube","Bag-valve mask",
    "Suction catheter","Urinary catheter","Foley drainage bag","IV infusion pump","Syringe pump","Central venous catheter","Arterial line transducer","Surgical retractor","Hemostat clamp","Suture needle driver",
    "Staple remover","Wound drain","Chest tube","Incentive spirometer","Vaginal speculum","Vaginal ultrasound probe","Doppler ultrasound probe","Dermatoscope","Snellen eye chart","Slit lamp",
    "ECG electrode","Blood collection tube","Urine dipstick","Bone marrow biopsy needle","Laryngeal mask airway"
  ]),
  ...add("Specialty", [
    "Neonatologist","Nephrologist","Gastroenterologist","Endocrinologist","Rheumatologist","Hematologist","Medical oncologist","Infectious disease specialist","Pulmonologist","Critical care intensivist",
    "Trauma surgeon","Vascular surgeon","Cardiothoracic surgeon","Plastic surgeon","Pain medicine specialist","Sleep medicine physician","Sports medicine doctor","Palliative care physician","Hospitalist","Medical geneticist",
    "Pathology resident","Radiation oncologist","Interventional radiologist","Neuro-ophthalmologist","Child psychiatrist","Geriatrician","Reproductive endocrinologist","Allergist and immunologist","Clinical pharmacologist","Maternal-fetal medicine specialist"
  ]),
  ...add("Patient", [
    "A patient learning to empty a new ostomy bag","A patient practicing with a walker","A patient learning to use an inhaler","A patient with a cast trying to scratch an itch","A patient trying to swallow a large pill",
    "A patient afraid of an MRI machine","A patient waking up in the recovery room","A patient learning to inject insulin","A patient using a home blood pressure cuff","A patient adjusting hearing aids",
    "A patient learning to walk with a prosthetic leg","A patient doing physical therapy after a stroke","A patient practicing speech after aphasia","A patient wearing a neck brace","A patient on crutches after surgery",
    "A patient trying to use a bedpan","A patient waiting for a biopsy result","A patient receiving chemotherapy","A patient receiving hemodialysis","A patient fitting a CPAP mask",
    "A patient holding a newborn baby","A patient trying to quit smoking","A patient with a migraine hiding in a dark room","A patient recovering from a broken hip","A patient with a sprained wrist",
    "A patient with a swollen ankle","A patient with a sore throat","A patient recovering from food poisoning","A patient having an allergic reaction","A patient shivering with fever and chills",
    "A patient with a nosebleed","A patient having a seizure","A patient with Parkinson disease freezing while walking","A patient with dementia searching for a familiar face","A patient having a panic attack",
    "A patient adjusting a sleep apnea mask"
  ])
];
