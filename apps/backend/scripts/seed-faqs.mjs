// Seed / sync the public FAQs (from krfuels.com/faq.php) into the "faqKrfuels"
// Firestore collection — the single collection the admin panel writes to and the
// public site now reads from.
//
// Usage (run from apps/backend):
//   node --env-file=.env.local scripts/seed-faqs.mjs            # upsert (safe, idempotent)
//   node --env-file=.env.local scripts/seed-faqs.mjs --replace  # wipe collection, insert these 7
//
// Default mode is a non-destructive UPSERT: matches existing docs by question
// (case-insensitive), updates them, and adds any that are missing. Existing FAQs
// not in this list are left untouched. Use --replace to make the collection
// contain EXACTLY these 7 (deletes every other FAQ first).

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

const COLLECTION = "faqKrfuels";
const REPLACE = process.argv.includes("--replace");

// The 7 FAQs published on krfuels.com/faq.php (verbatim, light copy-editing).
const FAQS = [
  { question: "What is LPG?", answer: "Liquefied Petroleum Gas.", isLink: false },
  {
    question: "What are the uses of LPG?",
    answer: "LPG is used for cooking, as automobile fuel, in industries and for agricultural purpose.",
    isLink: false,
  },
  {
    question: "What is the difference between Domestic LPG and Automotive LPG?",
    answer:
      "Auto LPG vs Domestic LPG:\n" +
      "• Grade: BIS 14861 (Auto LPG) vs BIS 4576 (Domestic LPG)\n" +
      "• Composition: Propane and Butane only (Auto LPG) vs Contains impurities also (Domestic LPG)\n" +
      "• Motor Octane Number (MON): 93+ (Auto LPG) vs 60+ (Domestic LPG)\n" +
      "• Sale: Sold through retail outlets approved by PESO (Petroleum and Explosives Safety Organization) (Auto LPG) vs Transferring from a domestic cylinder to a car/auto tank is illegal and punishable (Domestic LPG)\n" +
      "• Safety: Very safe (Auto LPG) vs Crude and unsafe method (Domestic LPG)",
    isLink: false,
  },
  {
    question: "How safe is LPG as an automotive fuel?",
    answer:
      "Over 24 million vehicles consume 64 million tons of LPG worldwide through more than 3 lakh distributing points. There are more than 1500 LPG stations PAN India and 220 LPG stations across Tamil Nadu.\n\n" +
      "Some highly prominent people own them — for example, the President of the United States' limousine and the Queen's Rolls Royce in the UK.\n\n" +
      "LPG has exemplary safety records. LPG storage tanks are extremely robust (20 times more puncture resistant than petrol tanks), capable of withstanding huge impacts and collisions, and are certified by PESO. It has the lowest flammability range and a higher ignition temperature than petrol and diesel.",
    isLink: false,
  },
  {
    question: "How to identify the right and genuine conversion kit?",
    answer:
      "Always have your car fitted with a genuine LPG conversion kit from authorized retrofitters. Check the genuine nature of the approval certificate issued by the competent authorities like ICAT, ARAI, PESO and STA.",
    isLink: false,
  },
  {
    question: "Can I transfer LPG from a domestic cylinder or commercial cylinder into the LPG tank in my vehicle?",
    answer:
      "No, absolutely not. It is both illegal and highly unsafe. There is no approved mechanism or equipment to transfer LPG from cylinders to a tank.\n\n" +
      "Moreover, the BIS of LPG used for cooking is BIS 4576 and the BIS of LPG used as automotive fuel is 14861.\n\n" +
      "Using domestic LPG as automotive fuel will cause damage to the engine and conversion kit, and this will affect the performance of the vehicle.",
    isLink: false,
  },
  {
    question: "What happens if an LPG converted vehicle is involved in an accident?",
    answer:
      "Authorized LPG tanks and kits are equipped with numerous safety devices and have been crash tested to prove that in the instance of a severe impact, they will deform and not puncture.",
    isLink: false,
  },
];

function initDb() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing FIREBASE_ADMIN_* env vars. Run with:  node --env-file=.env.local scripts/seed-faqs.mjs",
    );
  }
  const app =
    getApps().find((a) => a.name === "seed") ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }, "seed");
  return getFirestore(app, process.env.FIREBASE_DB ?? "(default)");
}

async function main() {
  const db = initDb();
  const col = db.collection(COLLECTION);
  const baseMs = Date.now();

  if (REPLACE) {
    const existing = await col.get();
    if (!existing.empty) {
      const batch = db.batch();
      existing.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      console.log(`Deleted ${existing.size} existing FAQ(s).`);
    }
    const batch = db.batch();
    FAQS.forEach((f, i) => {
      const ref = col.doc();
      batch.set(ref, {
        question: f.question,
        answer: f.answer,
        isLink: f.isLink ?? false,
        normalizedQues: f.question.toLowerCase(),
        // Stagger createdAt so the public site renders them in this exact order.
        createdAt: Timestamp.fromMillis(baseMs + i * 1000),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
    console.log(`Inserted ${FAQS.length} FAQ(s). Collection now contains exactly these.`);
    return;
  }

  // Upsert mode: match by normalized question; update if present, else add.
  const snap = await col.get();
  const byQuestion = new Map();
  snap.docs.forEach((d) => byQuestion.set((d.data().normalizedQues ?? d.data().question?.toLowerCase()), d));

  let added = 0;
  let updated = 0;
  for (let i = 0; i < FAQS.length; i++) {
    const f = FAQS[i];
    const key = f.question.toLowerCase();
    const existing = byQuestion.get(key);
    const payload = {
      question: f.question,
      answer: f.answer,
      isLink: f.isLink ?? false,
      normalizedQues: key,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (existing) {
      await existing.ref.update(payload);
      updated++;
    } else {
      await col.add({ ...payload, createdAt: Timestamp.fromMillis(baseMs + i * 1000) });
      added++;
    }
  }
  console.log(`Upsert complete: ${added} added, ${updated} updated. (Other FAQs left untouched.)`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  });
