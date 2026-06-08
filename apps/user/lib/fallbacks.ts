// Demo/fallback content used ONLY when the backend returns nothing (e.g. before real
// Firebase credentials are wired in). Real data from /api/v1/public/* always overrides
// these. Keeps the public pages from looking broken/empty during setup.
import type { StationPublic, ProductPublic, FaqPublic, ClientPublic } from "@/lib/api";

// Technology-partner logos shown on the existing KR Fuels site (krfuels.com partner
// strip: GFI, BRC, Zavoli). Used only when the admin `clients` collection has no
// collaborators yet; real entries seeded/added in the admin override these.
export const PARTNERS_FALLBACK: ClientPublic[] = [
  { id: "fb-pt1", name: "GFI", type: "collaborator", website: "https://www.gficontrolsystems.eu/", logo: "/assets/feature-3.png" },
  { id: "fb-pt2", name: "BRC Gas Equipment", type: "collaborator", website: "https://www.brc.it/", logo: "/assets/feature-1.png" },
  { id: "fb-pt3", name: "Zavoli", type: "collaborator", website: "https://www.zavoli.com/en/", logo: "/assets/feature-2.png" },
];

export const STATIONS_FALLBACK: StationPublic[] = [
  {
    id: "fb-try-01", stationName: "KR Trans Fuels — Cantonment", district: "Tiruchirappalli", area: "Cantonment",
    address: { doorNo: "No. 20", street: "Lawson's Road", pincode: 620001 }, workingHours: "Open 24x7",
    status: "active", stationCode: "KRTF-TRY-01", contactPerson: "Station Manager", mobileNumber: "9585586667",
    amenities: ["24x7", "Free Water", "Nitrogen Air", "Parking"], location: { latitude: 10.8050, longitude: 78.6856 },
  },
  {
    id: "fb-try-02", stationName: "KR Trans Fuels — Srirangam", district: "Tiruchirappalli", area: "Srirangam",
    address: { doorNo: "112", street: "Chennai Trunk Road", pincode: 620006 }, workingHours: "6:00 AM – 10:00 PM",
    status: "active", stationCode: "KRTF-TRY-02", contactPerson: "Station Manager", mobileNumber: "9585586667",
    amenities: ["Free Water", "Air Filling", "Parking"], location: { latitude: 10.8624, longitude: 78.6953 },
  },
  {
    id: "fb-mdu-01", stationName: "KR Trans Fuels — Mattuthavani", district: "Madurai", area: "Mattuthavani",
    address: { doorNo: "45", street: "Melur Road", pincode: 625020 }, workingHours: "Open 24x7",
    status: "active", stationCode: "KRTF-MDU-01", contactPerson: "Station Manager", mobileNumber: "9585586667",
    amenities: ["24x7", "Nitrogen Air", "Restroom"], location: { latitude: 9.9396, longitude: 78.1530 },
  },
  {
    id: "fb-cbe-01", stationName: "KR Trans Fuels — Avinashi Road", district: "Coimbatore", area: "Peelamedu",
    address: { doorNo: "78", street: "Avinashi Road", pincode: 641004 }, workingHours: "6:00 AM – 11:00 PM",
    status: "active", stationCode: "KRTF-CBE-01", contactPerson: "Station Manager", mobileNumber: "9585586667",
    amenities: ["Free Water", "Parking", "Air Filling"], location: { latitude: 11.0299, longitude: 77.0350 },
  },
  {
    id: "fb-che-01", stationName: "KR Trans Fuels — Guindy", district: "Chennai", area: "Guindy",
    address: { doorNo: "9", street: "Mount Road (GST Road)", pincode: 600032 }, workingHours: "Open 24x7",
    status: "active", stationCode: "KRTF-CHE-01", contactPerson: "Station Manager", mobileNumber: "9585586667",
    amenities: ["24x7", "Free Water", "Nitrogen Air", "Restroom"], location: { latitude: 13.0067, longitude: 80.2206 },
  },
  {
    id: "fb-slm-01", stationName: "KR Trans Fuels — Hasthampatti", district: "Salem", area: "Hasthampatti",
    address: { doorNo: "23", street: "Omalur Main Road", pincode: 636007 }, workingHours: "6:00 AM – 10:00 PM",
    status: "active", stationCode: "KRTF-SLM-01", contactPerson: "Station Manager", mobileNumber: "9585586667",
    amenities: ["Parking", "Air Filling"], location: { latitude: 11.6712, longitude: 78.1460 },
  },
  {
    id: "fb-erd-01", stationName: "KR Trans Fuels — Perundurai Road", district: "Erode", area: "Perundurai Road",
    address: { doorNo: "150", street: "Perundurai Road", pincode: 638011 }, workingHours: "6:00 AM – 10:00 PM",
    status: "active", stationCode: "KRTF-ERD-01", contactPerson: "Station Manager", mobileNumber: "9585586667",
    amenities: ["Free Water", "Parking"], location: { latitude: 11.3410, longitude: 77.7172 },
  },
  {
    id: "fb-tnj-01", stationName: "KR Trans Fuels — Thanjavur Bypass", district: "Thanjavur", area: "Bypass Road",
    address: { doorNo: "5", street: "Trichy–Thanjavur Bypass", pincode: 613005 }, workingHours: "Open 24x7",
    status: "active", stationCode: "KRTF-TNJ-01", contactPerson: "Station Manager", mobileNumber: "9585586667",
    amenities: ["24x7", "Nitrogen Air", "Free Water"], location: { latitude: 10.7867, longitude: 79.1378 },
  },
  {
    id: "fb-tvl-01", stationName: "KR Trans Fuels — Palayamkottai", district: "Tirunelveli", area: "Palayamkottai",
    address: { doorNo: "67", street: "Trivandrum Road", pincode: 627002 }, workingHours: "6:00 AM – 10:00 PM",
    status: "active", stationCode: "KRTF-TVL-01", contactPerson: "Station Manager", mobileNumber: "9585586667",
    amenities: ["Parking", "Restroom", "Air Filling"], location: { latitude: 8.7139, longitude: 77.7567 },
  },
];

const EMPTY_PRODUCT_FIELDS = {
  tagline: "", sections: [], specs: [],
  cta_primary_text: "Find a station", cta_primary_href: "/stations",
  cta_secondary_text: "Talk to our team", cta_secondary_href: "/contact",
  is_external: false,
};

export const PRODUCTS_FALLBACK: ProductPublic[] = [
  { ...EMPTY_PRODUCT_FIELDS, id: "fb-p1", slug: "auto-lpg", product_name: "Auto LPG Fuel", product_category: "Fuel", description: "Clean-burning, economical Auto LPG dispensed at every KR Trans Fuels station — save up to 40% over petrol.", product_image: "", gallery_images: [], external_url: "" },
  { ...EMPTY_PRODUCT_FIELDS, id: "fb-p2", slug: "conversionkit", product_name: "Conversion Kits", product_category: "Equipment", description: "BIS-certified Venturi & Sequential conversion kits for petrol vehicles, fitted by trained technicians.", product_image: "", gallery_images: [], external_url: "", is_external: true },
  { ...EMPTY_PRODUCT_FIELDS, id: "fb-p3", slug: "lubricants", product_name: "Lubricants", product_category: "Accessories", description: "Specialised engine lubricants formulated for Auto LPG vehicles for longer engine life.", product_image: "", gallery_images: [], external_url: "" },
  { ...EMPTY_PRODUCT_FIELDS, id: "fb-p4", slug: "tanks", product_name: "Tanks & Multivalves", product_category: "Equipment", description: "Safety-certified high-pressure tanks and multivalves built to automotive standards.", product_image: "", gallery_images: [], external_url: "", is_external: true },
];

// The 7 FAQs published on krfuels.com/faq.php. Mirrored here as the fallback so the
// Guide page shows the real questions even before the admin `faqKrfuels` collection
// is seeded. Real entries managed in the admin override these.
export const FAQ_FALLBACK: FaqPublic[] = [
  { id: "fb-f1", question: "What is LPG?", answer: "Liquefied Petroleum Gas." },
  { id: "fb-f2", question: "What are the uses of LPG?", answer: "LPG is used for cooking, as automobile fuel, in industries and for agricultural purpose." },
  {
    id: "fb-f3",
    question: "What is the difference between Domestic LPG and Automotive LPG?",
    answer:
      "Auto LPG vs Domestic LPG:\n" +
      "• Grade: BIS 14861 (Auto LPG) vs BIS 4576 (Domestic LPG)\n" +
      "• Composition: Propane and Butane only (Auto LPG) vs Contains impurities also (Domestic LPG)\n" +
      "• Motor Octane Number (MON): 93+ (Auto LPG) vs 60+ (Domestic LPG)\n" +
      "• Sale: Sold through retail outlets approved by PESO (Petroleum and Explosives Safety Organization) (Auto LPG) vs Transferring from a domestic cylinder to a car/auto tank is illegal and punishable (Domestic LPG)\n" +
      "• Safety: Very safe (Auto LPG) vs Crude and unsafe method (Domestic LPG)",
  },
  {
    id: "fb-f4",
    question: "How safe is LPG as an automotive fuel?",
    answer:
      "Over 24 million vehicles consume 64 million tons of LPG worldwide through more than 3 lakh distributing points. There are more than 1500 LPG stations PAN India and 220 LPG stations across Tamil Nadu.\n\n" +
      "Some highly prominent people own them — for example, the President of the United States' limousine and the Queen's Rolls Royce in the UK.\n\n" +
      "LPG has exemplary safety records. LPG storage tanks are extremely robust (20 times more puncture resistant than petrol tanks), capable of withstanding huge impacts and collisions, and are certified by PESO. It has the lowest flammability range and a higher ignition temperature than petrol and diesel.",
  },
  {
    id: "fb-f5",
    question: "How to identify the right and genuine conversion kit?",
    answer:
      "Always have your car fitted with a genuine LPG conversion kit from authorized retrofitters. Check the genuine nature of the approval certificate issued by the competent authorities like ICAT, ARAI, PESO and STA.",
  },
  {
    id: "fb-f6",
    question: "Can I transfer LPG from a domestic cylinder or commercial cylinder into the LPG tank in my vehicle?",
    answer:
      "No, absolutely not. It is both illegal and highly unsafe. There is no approved mechanism or equipment to transfer LPG from cylinders to a tank.\n\n" +
      "Moreover, the BIS of LPG used for cooking is BIS 4576 and the BIS of LPG used as automotive fuel is 14861.\n\n" +
      "Using domestic LPG as automotive fuel will cause damage to the engine and conversion kit, and this will affect the performance of the vehicle.",
  },
  {
    id: "fb-f7",
    question: "What happens if an LPG converted vehicle is involved in an accident?",
    answer:
      "Authorized LPG tanks and kits are equipped with numerous safety devices and have been crash tested to prove that in the instance of a severe impact, they will deform and not puncture.",
  },
];
