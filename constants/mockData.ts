import type {
  ChartDataPoint,
  DistrictDataPoint,
  Testimonial,
  Client,
  FAQ,
  Submission,
  FuelPrices,
  ProductCatalog,
} from "../types";

export const chartData: ChartDataPoint[] = [
  { month: "Jan", stations: 12, testimonials: 4,  inquiries: 18 },
  { month: "Feb", stations: 14, testimonials: 6,  inquiries: 22 },
  { month: "Mar", stations: 14, testimonials: 8,  inquiries: 19 },
  { month: "Apr", stations: 16, testimonials: 5,  inquiries: 31 },
  { month: "May", stations: 18, testimonials: 9,  inquiries: 27 },
  { month: "Jun", stations: 18, testimonials: 12, inquiries: 35 },
  { month: "Jul", stations: 21, testimonials: 7,  inquiries: 28 },
  { month: "Aug", stations: 23, testimonials: 11, inquiries: 42 },
];

export const districtData: DistrictDataPoint[] = [
  { district: "Madurai",     count: 5 },
  { district: "Chennai",     count: 8 },
  { district: "Coimbatore",  count: 4 },
  { district: "Salem",       count: 3 },
  { district: "Trichy",      count: 6 },
  { district: "Tirunelveli", count: 2 },
];

export const mockClients: Client[] = [
  { id: 1, name: "Tamil Nadu State Transport", website: "www.tnstc.in",           logo: "🚌", active: true,  order: 1 },
  { id: 2, name: "Infosys Limited",            website: "www.infosys.com",        logo: "💻", active: true,  order: 2 },
  { id: 3, name: "Ashok Leyland",              website: "www.ashokleyland.com",   logo: "🚛", active: true,  order: 3 },
  { id: 4, name: "KTC Logistics",              website: "www.ktclogistics.in",    logo: "📦", active: true,  order: 4 },
  { id: 5, name: "Ola Fleet",                  website: "www.olafleet.com",       logo: "🚗", active: false, order: 5 },
  { id: 6, name: "City Union Bank",            website: "www.cityunionbank.com",  logo: "🏦", active: true,  order: 6 },
];

export const mockFAQs: FAQ[] = [
  { id: 1, question: "What is Auto LPG and how does it work?",      answer: "Auto LPG (Liquefied Petroleum Gas) is a clean-burning fuel used in vehicles. It's stored in a pressurized tank and powers the engine via a conversion kit.", isLink: false },
  { id: 2, question: "How much can I save by converting to Auto LPG?", answer: "On average, vehicle owners save 35–45% on fuel costs compared to petrol. The conversion kit pays for itself within 8–12 months.",                          isLink: false },
  { id: 3, question: "Is Auto LPG safe for my vehicle?",             answer: "Yes, KR Fuels uses BIS-certified conversion kits that meet all Indian safety standards. The tanks are built to withstand 25x normal operating pressure.",     isLink: false },
  { id: 4, question: "Find our nearest station",                     answer: "https://krfuels.com/stations",                                                                                                                                      isLink: true  },
  { id: 5, question: "What vehicles can be converted to Auto LPG?",  answer: "Most petrol-powered cars, taxis, and SUVs can be converted. Diesel vehicles require a different process. Contact us for a free assessment.",                      isLink: false },
];

export const mockSubmissions: Submission[] = [
  { id: 1, name: "Arun Pandi", email: "arun@mail.com",   phone: "9842100100", message: "Interested in fleet conversion for 20 vehicles.",         date: "2025-01-15", status: "pending"     },
  { id: 2, name: "Kavitha S",  email: "kavitha@mail.com", phone: "9842100101", message: "Query about home delivery of LPG cylinders.",             date: "2025-01-14", status: "resolved"    },
  { id: 3, name: "Selvam R",   email: "selvam@mail.com",  phone: "9842100102", message: "Want to open a franchise station in Vellore.",            date: "2025-01-13", status: "in_progress" },
  { id: 4, name: "Deepa M",    email: "deepa@mail.com",   phone: "9842100103", message: "Issue with billing at Madurai station.",                  date: "2025-01-12", status: "resolved"    },
  { id: 5, name: "Nathan J",   email: "nathan@mail.com",  phone: "9842100104", message: "Request for bulk pricing for our transport company.",     date: "2025-01-11", status: "pending"     },
];

export const defaultFuelPrices: FuelPrices = {
  diesel:  87.62,
  petrol:  102.34,
  autoLPG: 49.80,
};
