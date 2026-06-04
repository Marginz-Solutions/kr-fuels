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

export const FAQ_FALLBACK: FaqPublic[] = [
  { id: "fb-f1", question: "What is Auto LPG and how is it different from domestic LPG?", answer: "Auto LPG is an automotive-grade liquefied petroleum gas dispensed at high-pressure certified stations for vehicles. Domestic LPG is a low-pressure cooking fuel and is not legal or safe for vehicles." },
  { id: "fb-f2", question: "How much can I save by switching to Auto LPG?", answer: "Most drivers save 35–40% on running costs compared with petrol, since Auto LPG is priced significantly lower per litre." },
  { id: "fb-f3", question: "Is Auto LPG safe for my vehicle?", answer: "Yes. It uses BIS-certified conversion kits and tanks built to automotive safety standards, and it burns cleaner than petrol." },
  { id: "fb-f4", question: "Which vehicles can be converted to Auto LPG?", answer: "Most petrol cars, taxis and SUVs can be converted with an approved kit. Speak to our team for a free suitability check." },
  { id: "fb-f5", question: "How long does a conversion take and pay back?", answer: "A typical conversion is completed in a day, and the kit usually pays for itself within several months depending on your running." },
  { id: "fb-f6", question: "Where can I find my nearest Auto LPG station?", answer: "Use the Stations page to filter by district and amenities and get directions to your nearest KR Trans Fuels station." },
];
