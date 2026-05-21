import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  LayoutDashboard, MessageSquare, Users, MapPin, Package,
  HelpCircle, Phone, FileText, Settings, Bell, Search, User,
  Plus, Edit2, Trash2, ChevronRight, ChevronDown, ChevronLeft,
  X, Check, Menu, Grid, List, Download, Filter, Star,
  Globe, Mail, Map, Clock, ArrowUpRight, Zap, Store,
  Tag, Link, RefreshCw, TrendingUp, Fuel, AlertCircle,
  Image as ImgIcon, Eye, LogOut, Save, ToggleLeft, ToggleRight
} from "lucide-react";

// ─── Design tokens ───────────────────────────────────────
const C = {
  p: "oklch(0.43 0.06 172.08)",
  pDark: "oklch(0.32 0.07 172.08)",
  pLight: "oklch(0.58 0.08 172.08)",
  pXLight: "oklch(0.92 0.04 172.08)",
  s: "oklch(0.94 0.17 124.44)",
  sDark: "oklch(0.72 0.16 124.44)",
  bg: "#f0f5f3",
  white: "#ffffff",
  bd: "#e2e8f0",
  t: "#1a2e29",
  tm: "#5a7872",
  green: "#10b981", greenBg: "#dcfce7", greenText: "#166534",
  amber: "#f59e0b", amberBg: "#fef3c7", amberText: "#92400e",
  red: "#ef4444", redBg: "#fee2e2", redText: "#991b1b",
  blue: "#3b82f6", blueBg: "#dbeafe", blueText: "#1e40af",
};

// ─── Shared style factories ───────────────────────────────
const card = (extra = {}) => ({
  background: C.white, borderRadius: 16, border: `1px solid ${C.bd}`,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)", ...extra,
});
const btn = (v = "primary", extra = {}) => ({
  background: v === "primary" ? C.p : v === "secondary" ? C.s : v === "danger" ? C.red : "transparent",
  color: v === "primary" ? C.white : v === "danger" ? C.white : v === "secondary" ? C.t : C.tm,
  border: v === "ghost" ? `1px solid ${C.bd}` : "none",
  borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 500,
  fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6,
  fontFamily: "inherit", transition: "opacity 0.15s", whiteSpace: "nowrap", ...extra,
});
const inp = (extra = {}) => ({
  width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.bd}`,
  fontSize: 14, fontFamily: "inherit", outline: "none", background: C.white,
  color: C.t, boxSizing: "border-box", ...extra,
});
const lbl = { fontSize: 13, fontWeight: 500, color: C.t, marginBottom: 4, display: "block" };
const pill = (color) => {
  const map = { green: [C.greenBg, C.greenText], amber: [C.amberBg, C.amberText], red: [C.redBg, C.redText], blue: [C.blueBg, C.blueText] };
  const [bg, cl] = map[color] || [C.pXLight, C.p];
  return { display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color: cl, textTransform: "uppercase", letterSpacing: "0.04em" };
};

// ─── Mock Data ────────────────────────────────────────────
const chartData = [
  { month: "Jan", stations: 12, testimonials: 4, inquiries: 18 },
  { month: "Feb", stations: 14, testimonials: 6, inquiries: 22 },
  { month: "Mar", stations: 14, testimonials: 8, inquiries: 19 },
  { month: "Apr", stations: 16, testimonials: 5, inquiries: 31 },
  { month: "May", stations: 18, testimonials: 9, inquiries: 27 },
  { month: "Jun", stations: 18, testimonials: 12, inquiries: 35 },
  { month: "Jul", stations: 21, testimonials: 7, inquiries: 28 },
  { month: "Aug", stations: 23, testimonials: 11, inquiries: 42 },
];
const districtData = [
  { district: "Madurai", count: 5 }, { district: "Chennai", count: 8 },
  { district: "Coimbatore", count: 4 }, { district: "Salem", count: 3 },
  { district: "Trichy", count: 6 }, { district: "Tirunelveli", count: 2 },
];
const mockTestimonials = [
  { id: 1, name: "Raj Kumar", designation: "Fleet Manager, KTC Logistics", review: "KR Fuels has transformed our fleet operations. The Auto LPG conversion saved us 35% on fuel costs.", date: "2024-12-10", rating: 5 },
  { id: 2, name: "Priya Devi", designation: "Operations Head, City Buses", review: "Excellent service and consistent quality. Our entire fleet runs on KR Fuels Auto LPG.", date: "2024-11-22", rating: 5 },
  { id: 3, name: "Suresh Anand", designation: "Private Vehicle Owner", review: "Converted my car 6 months ago. The savings are real and the staff guided me perfectly.", date: "2024-11-05", rating: 4 },
  { id: 4, name: "Meena Rajan", designation: "Transport Supervisor, Infosys", review: "KR Fuels stations are well-maintained. Clean, fast, and professional.", date: "2024-10-18", rating: 5 },
  { id: 5, name: "Vijay Selvam", designation: "Taxi Aggregator, Ola Partner", review: "Saved lakhs this year. Best decision switching to Auto LPG with KR Fuels.", date: "2024-09-30", rating: 5 },
];
const mockClients = [
  { id: 1, name: "Tamil Nadu State Transport", website: "www.tnstc.in", logo: "🚌", active: true, order: 1 },
  { id: 2, name: "Infosys Limited", website: "www.infosys.com", logo: "💻", active: true, order: 2 },
  { id: 3, name: "Ashok Leyland", website: "www.ashokleyland.com", logo: "🚛", active: true, order: 3 },
  { id: 4, name: "KTC Logistics", website: "www.ktclogistics.in", logo: "📦", active: true, order: 4 },
  { id: 5, name: "Ola Fleet", website: "www.olafleet.com", logo: "🚗", active: false, order: 5 },
  { id: 6, name: "City Union Bank", website: "www.cityunionbank.com", logo: "🏦", active: true, order: 6 },
];
const mockStations = [
  { id: 1, name: "KR Fuels Madurai Central", address: "14, Bypass Road, Madurai - 625001", phone: "+91 98421 00001", district: "Madurai", status: "active", hours: "6:00 AM - 10:00 PM", mapLink: "https://maps.google.com", images: 3 },
  { id: 2, name: "KR Fuels Chennai Anna Nagar", address: "Plot 22, 6th Ave, Anna Nagar, Chennai", phone: "+91 98421 00002", district: "Chennai", status: "active", hours: "24 Hours", mapLink: "https://maps.google.com", images: 4 },
  { id: 3, name: "KR Fuels Coimbatore RS Puram", address: "45, DB Road, RS Puram, Coimbatore", phone: "+91 98421 00003", district: "Coimbatore", status: "active", hours: "6:00 AM - 11:00 PM", mapLink: "https://maps.google.com", images: 2 },
  { id: 4, name: "KR Fuels Trichy Thillai Nagar", address: "Plot 7, Thillai Nagar, Trichy", phone: "+91 98421 00004", district: "Trichy", status: "active", hours: "7:00 AM - 10:00 PM", mapLink: "https://maps.google.com", images: 3 },
  { id: 5, name: "KR Fuels Salem Junction", address: "82, Omalur Road, Salem", phone: "+91 98421 00005", district: "Salem", status: "inactive", hours: "8:00 AM - 9:00 PM", mapLink: "https://maps.google.com", images: 1 },
  { id: 6, name: "KR Fuels Tirunelveli", address: "17, High Ground Road, Tirunelveli", phone: "+91 98421 00006", district: "Tirunelveli", status: "active", hours: "6:00 AM - 10:00 PM", mapLink: "https://maps.google.com", images: 2 },
];
const mockFAQs = [
  { id: 1, question: "What is Auto LPG and how does it work?", answer: "Auto LPG (Liquefied Petroleum Gas) is a clean-burning fuel used in vehicles. It's stored in a pressurized tank and powers the engine via a conversion kit.", isLink: false },
  { id: 2, question: "How much can I save by converting to Auto LPG?", answer: "On average, vehicle owners save 35–45% on fuel costs compared to petrol. The conversion kit pays for itself within 8–12 months.", isLink: false },
  { id: 3, question: "Is Auto LPG safe for my vehicle?", answer: "Yes, KR Fuels uses BIS-certified conversion kits that meet all Indian safety standards. The tanks are built to withstand 25x normal operating pressure.", isLink: false },
  { id: 4, question: "Find our nearest station", answer: "https://krfuels.com/stations", isLink: true },
  { id: 5, question: "What vehicles can be converted to Auto LPG?", answer: "Most petrol-powered cars, taxis, and SUVs can be converted. Diesel vehicles require a different process. Contact us for a free assessment.", isLink: false },
];
const mockSubmissions = [
  { id: 1, name: "Arun Pandi", email: "arun@mail.com", phone: "9842100100", message: "Interested in fleet conversion for 20 vehicles.", date: "2025-01-15", status: "pending" },
  { id: 2, name: "Kavitha S", email: "kavitha@mail.com", phone: "9842100101", message: "Query about home delivery of LPG cylinders.", date: "2025-01-14", status: "resolved" },
  { id: 3, name: "Selvam R", email: "selvam@mail.com", phone: "9842100102", message: "Want to open a franchise station in Vellore.", date: "2025-01-13", status: "in_progress" },
  { id: 4, name: "Deepa M", email: "deepa@mail.com", phone: "9842100103", message: "Issue with billing at Madurai station.", date: "2025-01-12", status: "resolved" },
  { id: 5, name: "Nathan J", email: "nathan@mail.com", phone: "9842100104", message: "Request for bulk pricing for our transport company.", date: "2025-01-11", status: "pending" },
];
const mockProducts = {
  "CNG Kits": { icon: "🔧", items: ["Sequential Kit", "Mono Point Kit", "Bi-Fuel Kit"] },
  "Auto LPG": { icon: "⛽", items: ["4-Cylinder Kit", "6-Cylinder Kit", "Commercial Kit"] },
  "Accessories": { icon: "🛠️", items: ["Reducers", "Injectors", "ECU Units", "Filters"] },
};
const fuelPrices = { diesel: 87.62, petrol: 102.34, autoLPG: 49.80 };

// ─── Utility components ───────────────────────────────────
const Badge = ({ children, color = "green" }) => <span style={pill(color)}>{children}</span>;

const Modal = ({ open, title, onClose, children, width = 500 }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ ...card(), width, maxWidth: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.bd}` }}>
          <span style={{ fontWeight: 600, fontSize: 16, color: C.t }}>{title}</span>
          <button onClick={onClose} style={{ ...btn("ghost"), padding: 6 }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

const FormField = ({ label: l, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={lbl}>{l}</label>
    {children}
  </div>
);

const StatCard = ({ icon, label, value, sub, color = C.p }) => (
  <div style={{ ...card(), padding: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 13, color: C.tm, marginBottom: 6, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: C.t, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: C.tm, marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: C.pXLight, display: "flex", alignItems: "center", justifyContent: "center", color }}>
        {icon}
      </div>
    </div>
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "clients", label: "Clients / Collaborators", icon: Users },
  { id: "stations", label: "Auto LPG Stations", icon: MapPin },
  { id: "products", label: "Products", icon: Package },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "contact", label: "Contact & Forms", icon: Phone },
  { id: "settings", label: "Website Settings", icon: Settings },
  { id: "profile", label: "Admin Profile", icon: User },
];

const Sidebar = ({ page, setPage, collapsed, setCollapsed }) => (
  <aside style={{
    width: collapsed ? 72 : 252, minHeight: "100vh", background: C.p,
    display: "flex", flexDirection: "column", transition: "width 0.25s ease",
    overflow: "hidden", flexShrink: 0,
  }}>
    <div style={{ padding: collapsed ? "20px 0" : "20px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: C.s, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, margin: collapsed ? "0 auto" : 0 }}>
        <Fuel size={18} color={C.t} />
      </div>
      {!collapsed && (
        <div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 15, lineHeight: 1 }}>KR Fuels</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Admin Panel</div>
        </div>
      )}
    </div>

    <nav style={{ flex: 1, padding: collapsed ? "12px 0" : "12px 8px" }}>
      {NAV.map(({ id, label, icon: Icon }) => {
        const active = page === id;
        return (
          <button key={id} onClick={() => setPage(id)} title={collapsed ? label : undefined} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: collapsed ? "10px 0" : "10px 12px", justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit",
            background: active ? "rgba(255,255,255,0.15)" : "transparent",
            color: active ? C.white : "rgba(255,255,255,0.65)",
            fontSize: 14, fontWeight: active ? 600 : 400, marginBottom: 2,
            transition: "background 0.15s, color 0.15s",
          }}>
            <Icon size={18} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>}
            {!collapsed && active && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.6 }} />}
          </button>
        );
      })}
    </nav>

    <div style={{ padding: collapsed ? "12px 0" : "12px 8px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
      <button onClick={() => setCollapsed(!collapsed)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between",
        padding: collapsed ? "10px 0" : "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
        background: "transparent", color: "rgba(255,255,255,0.5)", fontFamily: "inherit", fontSize: 13,
      }}>
        {!collapsed && <span>Collapse</span>}
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  </aside>
);

// ─── Topbar ───────────────────────────────────────────────
const Topbar = ({ page, fuels }) => {
  const pageLabel = NAV.find(n => n.id === page)?.label || "Dashboard";
  return (
    <header style={{
      display: "flex", alignItems: "center", gap: 16, padding: "0 24px",
      height: 64, background: C.white, borderBottom: `1px solid ${C.bd}`,
      flexShrink: 0, position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.t }}>{pageLabel}</div>
        <div style={{ fontSize: 12, color: C.tm }}>KR Fuels Admin Portal</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 10, padding: "7px 12px", width: 220 }}>
        <Search size={15} color={C.tm} />
        <input placeholder="Search..." style={{ border: "none", background: "transparent", fontSize: 13, color: C.t, outline: "none", width: "100%", fontFamily: "inherit" }} />
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {[["Diesel", fuels.diesel, "blue"], ["Petrol", fuels.petrol, "amber"], ["Auto LPG", fuels.autoLPG, "green"]].map(([l, v, c]) => (
          <div key={l} style={{ ...pill(c), padding: "4px 10px", fontSize: 11 }}>
            <Fuel size={10} style={{ marginRight: 4 }} />₹{v}/{l === "Auto LPG" ? "L" : "L"}
          </div>
        ))}
      </div>

      <button style={{ ...btn("ghost"), padding: 8, position: "relative" }}>
        <Bell size={18} />
        <span style={{ position: "absolute", top: 5, right: 5, width: 8, height: 8, background: C.red, borderRadius: "50%", border: "2px solid white" }} />
      </button>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.pXLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.p, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        KR
      </div>
    </header>
  );
};

// ─── Page: Dashboard ─────────────────────────────────────
const DashboardPage = ({ prices, onEditPrice }) => {
  const [editPrice, setEditPrice] = useState(false);
  const [draft, setDraft] = useState({ ...prices });

  return (
    <div style={{ padding: 24 }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard icon={<MapPin size={20} />} label="Total LPG Stations" value="23" sub="+2 this month" />
        <StatCard icon={<MessageSquare size={20} />} label="Testimonials" value="18" sub="4.9★ avg rating" />
        <StatCard icon={<Users size={20} />} label="Collaborators" value="12" sub="9 active" />
        <StatCard icon={<HelpCircle size={20} />} label="Total FAQs" value="15" sub="3 updated recently" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Area chart */}
        <div style={{ ...card(), padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, color: C.t, fontSize: 15 }}>Activity Overview</div>
              <div style={{ fontSize: 12, color: C.tm }}>Stations · Testimonials · Inquiries</div>
            </div>
            <button style={{ ...btn("ghost"), padding: "5px 10px", fontSize: 12 }}><RefreshCw size={13} /> Refresh</button>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.p} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.p} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.sDark} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.sDark} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.bd} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.tm }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.tm }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.bd}`, fontSize: 12 }} />
              <Area type="monotone" dataKey="stations" stroke={C.p} strokeWidth={2} fill="url(#gS)" name="Stations" />
              <Area type="monotone" dataKey="inquiries" stroke={C.sDark} strokeWidth={2} fill="url(#gI)" name="Inquiries" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel prices card */}
        <div style={{ ...card(), padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: C.t, fontSize: 15 }}>Fuel Prices</div>
            <button onClick={() => setEditPrice(true)} style={{ ...btn("ghost"), padding: "4px 10px", fontSize: 12 }}><Edit2 size={12} /> Edit</button>
          </div>
          {[["Diesel", draft.diesel, "blue", "⛽"], ["Petrol", draft.petrol, "amber", "🚗"], ["Auto LPG", draft.autoLPG, "green", "🔥"]].map(([l, v, c, em]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.bd}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{em}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, color: C.t }}>{l}</div>
                  <div style={{ fontSize: 11, color: C.tm }}>per litre</div>
                </div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, color: C.p }}>₹{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: "8px 12px", background: C.pXLight, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: C.tm }}>Verified by</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.p }}>teamkrfuels@gmail.com</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Bar chart */}
        <div style={{ ...card(), padding: 20 }}>
          <div style={{ fontWeight: 600, color: C.t, fontSize: 15, marginBottom: 4 }}>Stations by District</div>
          <div style={{ fontSize: 12, color: C.tm, marginBottom: 14 }}>Active station distribution</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={districtData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.bd} vertical={false} />
              <XAxis dataKey="district" tick={{ fontSize: 11, fill: C.tm }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.tm }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.bd}`, fontSize: 12 }} />
              <Bar dataKey="count" fill={C.p} radius={[6, 6, 0, 0]} name="Stations" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent feedback */}
        <div style={{ ...card(), padding: 20 }}>
          <div style={{ fontWeight: 600, color: C.t, fontSize: 15, marginBottom: 14 }}>Recent Feedback</div>
          {mockSubmissions.slice(0, 4).map(s => (
            <div key={s.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.bd}`, alignItems: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.pXLight, color: C.p, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                {s.name.charAt(0)}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.t }}>{s.name}</div>
                <div style={{ fontSize: 12, color: C.tm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.message}</div>
              </div>
              <Badge color={s.status === "resolved" ? "green" : s.status === "in_progress" ? "blue" : "amber"}>
                {s.status === "in_progress" ? "Active" : s.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Price Modal */}
      <Modal open={editPrice} title="Edit Fuel Prices" onClose={() => setEditPrice(false)} width={380}>
        {[["diesel", "Diesel (₹/L)"], ["petrol", "Petrol (₹/L)"], ["autoLPG", "Auto LPG (₹/L)"]].map(([k, l]) => (
          <FormField key={k} label={l}>
            <input style={inp()} type="number" step="0.01" value={draft[k]} onChange={e => setDraft(p => ({ ...p, [k]: e.target.value }))} />
          </FormField>
        ))}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={btn("ghost")} onClick={() => setEditPrice(false)}>Cancel</button>
          <button style={btn()} onClick={() => { onEditPrice(draft); setEditPrice(false); }}><Check size={14} />Save Prices</button>
        </div>
      </Modal>
    </div>
  );
};

// ─── Page: Testimonials ───────────────────────────────────
const TestimonialsPage = () => {
  const [list, setList] = useState(mockTestimonials);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", designation: "", review: "" });

  const filtered = list.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.review.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ name: "", designation: "", review: "" }); setModal(true); };
  const openEdit = t => { setEditing(t); setForm({ name: t.name, designation: t.designation, review: t.review }); setModal(true); };
  const save = () => {
    if (editing) setList(l => l.map(t => t.id === editing.id ? { ...t, ...form } : t));
    else setList(l => [...l, { id: Date.now(), ...form, date: new Date().toISOString().split("T")[0], rating: 5 }]);
    setModal(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.t }}>Customer Testimonials</div>
          <div style={{ fontSize: 12, color: C.tm }}>{list.length} total reviews</div>
        </div>
        <button style={btn()} onClick={openAdd}><Plus size={15} />Add Testimonial</button>
      </div>

      <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", gap: 10 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 10, padding: "7px 12px" }}>
            <Search size={14} color={C.tm} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search testimonials..." style={{ border: "none", background: "transparent", fontSize: 13, outline: "none", fontFamily: "inherit", color: C.t, width: "100%" }} />
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Customer", "Designation", "Review", "Rating", "Date", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: C.tm, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id} style={{ borderTop: `1px solid ${C.bd}`, background: i % 2 === 0 ? C.white : "#fafcfb" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.pXLight, color: C.p, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{t.name.charAt(0)}</div>
                    <span style={{ fontWeight: 500, fontSize: 13, color: C.t }}>{t.name}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.tm }}>{t.designation}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.t, maxWidth: 260 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.review}</div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ color: C.amber, fontSize: 13 }}>{"★".repeat(t.rating)}</span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm }}>{t.date}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(t)} style={{ ...btn("ghost"), padding: "4px 8px" }}><Edit2 size={13} /></button>
                    <button onClick={() => setList(l => l.filter(x => x.id !== t.id))} style={{ ...btn("ghost"), padding: "4px 8px", color: C.red }}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} title={editing ? "Edit Testimonial" : "Add Testimonial"} onClose={() => setModal(false)}>
        <FormField label="Customer Name">
          <input style={inp()} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
        </FormField>
        <FormField label="Designation">
          <input style={inp()} value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} placeholder="e.g. Fleet Manager, Company Name" />
        </FormField>
        <FormField label={`Review (${form.review.length}/300 characters)`}>
          <textarea style={{ ...inp(), height: 100, resize: "vertical" }} maxLength={300} value={form.review} onChange={e => setForm(p => ({ ...p, review: e.target.value }))} placeholder="Customer review..." />
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={btn("ghost")} onClick={() => setModal(false)}>Cancel</button>
          <button style={btn()} onClick={save}><Check size={14} />{editing ? "Update" : "Add"} Testimonial</button>
        </div>
      </Modal>
    </div>
  );
};

// ─── Page: Clients ────────────────────────────────────────
const ClientsPage = () => {
  const [list, setList] = useState(mockClients);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", website: "", logo: "🏢", active: true });

  const toggle = id => setList(l => l.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const del = id => setList(l => l.filter(c => c.id !== id));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.t }}>Clients & Collaborators</div>
          <div style={{ fontSize: 12, color: C.tm }}>{list.filter(c => c.active).length} active partners</div>
        </div>
        <button style={btn()} onClick={() => setModal(true)}><Plus size={15} />Add Collaborator</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
        {list.map(c => (
          <div key={c.id} style={{ ...card(), padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                {c.logo}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Badge color={c.active ? "green" : "red"}>{c.active ? "Active" : "Inactive"}</Badge>
              </div>
            </div>
            <div style={{ fontWeight: 600, color: C.t, fontSize: 14, marginBottom: 4 }}>{c.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.tm, fontSize: 12, marginBottom: 14 }}>
              <Globe size={12} />{c.website}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => toggle(c.id)} style={{ ...btn("ghost"), padding: "5px 10px", fontSize: 12, flex: 1, justifyContent: "center" }}>
                {c.active ? <ToggleRight size={14} color={C.green} /> : <ToggleLeft size={14} />}
                {c.active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => del(c.id)} style={{ ...btn("ghost"), padding: "5px 8px", color: C.red }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} title="Add Collaborator" onClose={() => setModal(false)} width={420}>
        <FormField label="Company Name">
          <input style={inp()} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Company name" />
        </FormField>
        <FormField label="Website URL">
          <input style={inp()} value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="www.example.com" />
        </FormField>
        <FormField label="Logo Upload">
          <div style={{ border: `2px dashed ${C.bd}`, borderRadius: 12, padding: "24px 0", textAlign: "center", color: C.tm, fontSize: 13 }}>
            <ImgIcon size={24} style={{ margin: "0 auto 8px" }} /><br />Drop logo here or <span style={{ color: C.p, cursor: "pointer" }}>browse files</span>
          </div>
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={btn("ghost")} onClick={() => setModal(false)}>Cancel</button>
          <button style={btn()} onClick={() => { setList(l => [...l, { id: Date.now(), ...form, order: l.length + 1 }]); setModal(false); }}><Check size={14} />Add Collaborator</button>
        </div>
      </Modal>
    </div>
  );
};

// ─── Page: Stations ───────────────────────────────────────
const StationsPage = () => {
  const [list, setList] = useState(mockStations);
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All");
  const [drawer, setDrawer] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "", district: "Madurai", hours: "", mapLink: "" });

  const districts = ["All", ...new Set(list.map(s => s.district))];
  const filtered = list.filter(s =>
    (district === "All" || s.district === district) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.address.toLowerCase().includes(search.toLowerCase()))
  );
  const openEdit = s => { setEditing(s); setForm({ name: s.name, address: s.address, phone: s.phone, district: s.district, hours: s.hours, mapLink: s.mapLink }); setDrawer(true); };
  const openAdd = () => { setEditing(null); setForm({ name: "", address: "", phone: "", district: "Madurai", hours: "", mapLink: "" }); setDrawer(true); };
  const save = () => {
    if (editing) setList(l => l.map(s => s.id === editing.id ? { ...s, ...form } : s));
    else setList(l => [...l, { id: Date.now(), ...form, status: "active", images: 0 }]);
    setDrawer(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard icon={<Store size={18} />} label="Total Stations" value={list.length} sub="Active network" />
        <StatCard icon={<Check size={18} />} label="Active Stations" value={list.filter(s => s.status === "active").length} sub="Operational" />
        <StatCard icon={<Map size={18} />} label="Districts Covered" value={new Set(list.map(s => s.district)).size} sub="Across Tamil Nadu" />
        <StatCard icon={<AlertCircle size={18} />} label="Inactive" value={list.filter(s => s.status === "inactive").length} sub="Needs attention" />
      </div>

      <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 10, padding: "7px 12px" }}>
            <Search size={14} color={C.tm} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stations..." style={{ border: "none", background: "transparent", fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", color: C.t }} />
          </div>
          <select value={district} onChange={e => setDistrict(e.target.value)} style={{ ...inp({ width: "auto", padding: "7px 12px" }), minWidth: 140 }}>
            {districts.map(d => <option key={d}>{d}</option>)}
          </select>
          <div style={{ display: "flex", gap: 4 }}>
            {[["table", List], ["grid", Grid]].map(([v, Ico]) => (
              <button key={v} onClick={() => setView(v)} style={{ ...btn("ghost"), padding: 8, background: view === v ? C.pXLight : "transparent", color: view === v ? C.p : C.tm }}>
                <Ico size={16} />
              </button>
            ))}
          </div>
          <button style={btn()} onClick={openAdd}><Plus size={14} />Add Station</button>
        </div>

        {view === "table" ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["Station Name", "District", "Address", "Phone", "Hours", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: C.tm, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} style={{ borderTop: `1px solid ${C.bd}`, background: i % 2 === 0 ? C.white : "#fafcfb" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: C.t, fontSize: 13 }}>{s.name}</td>
                  <td style={{ padding: "12px 16px" }}><Badge color="blue">{s.district}</Badge></td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm, maxWidth: 200 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.address}</div></td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm }}>{s.phone}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm, whiteSpace: "nowrap" }}><Clock size={11} style={{ marginRight: 4 }} />{s.hours}</td>
                  <td style={{ padding: "12px 16px" }}><Badge color={s.status === "active" ? "green" : "red"}>{s.status}</Badge></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(s)} style={{ ...btn("ghost"), padding: "4px 8px" }}><Edit2 size={13} /></button>
                      <button onClick={() => setList(l => l.filter(x => x.id !== s.id))} style={{ ...btn("ghost"), padding: "4px 8px", color: C.red }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, padding: 16 }}>
            {filtered.map(s => (
              <div key={s.id} style={{ border: `1px solid ${C.bd}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ height: 80, background: `linear-gradient(135deg, ${C.p}22, ${C.p}44)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin size={28} color={C.p} />
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, color: C.t, fontSize: 13 }}>{s.name}</div>
                    <Badge color={s.status === "active" ? "green" : "red"}>{s.status}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: C.tm, marginBottom: 4 }}>{s.address}</div>
                  <div style={{ fontSize: 12, color: C.tm, marginBottom: 10 }}>{s.phone} · {s.hours}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(s)} style={{ ...btn("ghost"), padding: "5px 10px", fontSize: 12, flex: 1, justifyContent: "center" }}><Edit2 size={12} />Edit</button>
                    <button onClick={() => setList(l => l.filter(x => x.id !== s.id))} style={{ ...btn("ghost"), padding: "5px 8px", color: C.red }}><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Station Drawer */}
      {drawer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 440, background: C.white, height: "100%", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.bd}` }}>
              <span style={{ fontWeight: 600, fontSize: 16, color: C.t }}>{editing ? "Edit Station" : "Add New Station"}</span>
              <button onClick={() => setDrawer(false)} style={{ ...btn("ghost"), padding: 6 }}><X size={16} /></button>
            </div>
            <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
              {[["name", "Station Name", "text", "KR Fuels ..."], ["address", "Full Address", "text", "Street, City, PIN"], ["phone", "Contact Number", "tel", "+91 98421 ..."], ["hours", "Opening Hours", "text", "6:00 AM - 10:00 PM"], ["mapLink", "Google Maps Link", "url", "https://maps.google.com/..."]].map(([k, l, t, ph]) => (
                <FormField key={k} label={l}>
                  <input style={inp()} type={t} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={ph} />
                </FormField>
              ))}
              <FormField label="District">
                <select style={inp()} value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))}>
                  {["Madurai", "Chennai", "Coimbatore", "Trichy", "Salem", "Tirunelveli", "Other"].map(d => <option key={d}>{d}</option>)}
                </select>
              </FormField>
              <FormField label="Station Images">
                <div style={{ border: `2px dashed ${C.bd}`, borderRadius: 12, padding: "20px 0", textAlign: "center", color: C.tm, fontSize: 13 }}>
                  <ImgIcon size={22} style={{ margin: "0 auto 8px" }} /><br />
                  Upload multiple station images<br />
                  <span style={{ color: C.p, cursor: "pointer" }}>Click to browse</span> or drag & drop
                </div>
              </FormField>
            </div>
            <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.bd}`, display: "flex", gap: 8 }}>
              <button style={{ ...btn("ghost"), flex: 1, justifyContent: "center" }} onClick={() => setDrawer(false)}>Cancel</button>
              <button style={{ ...btn(), flex: 1, justifyContent: "center" }} onClick={save}><Save size={14} />Save Station</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Page: Products ───────────────────────────────────────
const ProductsPage = () => {
  const [activeCategory, setActiveCategory] = useState("CNG Kits");
  const [activeProduct, setActiveProduct] = useState(null);
  const [modal, setModal] = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 20 }}>
        {/* Category sidebar */}
        <div style={{ ...card(), padding: 0, width: 220, flexShrink: 0, overflow: "hidden", alignSelf: "flex-start" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.bd}`, fontWeight: 600, color: C.t, fontSize: 14 }}>Categories</div>
          {Object.entries(mockProducts).map(([cat, { icon }]) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
              border: "none", cursor: "pointer", fontFamily: "inherit",
              background: activeCategory === cat ? C.pXLight : "transparent",
              color: activeCategory === cat ? C.p : C.t, fontSize: 13, fontWeight: activeCategory === cat ? 600 : 400,
              borderLeft: activeCategory === cat ? `3px solid ${C.p}` : "3px solid transparent",
            }}>
              <span style={{ fontSize: 18 }}>{icon}</span>{cat}
            </button>
          ))}
          <div style={{ padding: 12 }}>
            <button style={{ ...btn("ghost"), width: "100%", justifyContent: "center", fontSize: 13 }}><Plus size={14} />Add Category</button>
          </div>
        </div>

        {/* Products area */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: C.t, fontSize: 15 }}>{activeCategory}</div>
            <button style={btn()} onClick={() => setModal(true)}><Plus size={14} />Add Product</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
            {mockProducts[activeCategory]?.items.map((item, i) => (
              <div key={item} style={{ ...card(), padding: 0, overflow: "hidden", cursor: "pointer" }} onClick={() => setActiveProduct(item)}>
                <div style={{ height: 90, background: `linear-gradient(135deg, ${C.p}15, ${C.p}30)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={30} color={C.p} />
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, color: C.t, fontSize: 13, marginBottom: 4 }}>{item}</div>
                  <div style={{ fontSize: 12, color: C.tm, marginBottom: 10 }}>3 components · 2 variants</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 12 }} onClick={e => { e.stopPropagation(); setActiveProduct(item); }}><Eye size={12} />View</button>
                    <button style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 12 }}><Edit2 size={12} />Edit</button>
                    <button style={{ ...btn("ghost"), padding: "4px 8px", color: C.red }}><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product detail modal */}
      {activeProduct && (
        <Modal open={!!activeProduct} title={activeProduct} onClose={() => setActiveProduct(null)} width={560}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {["GFI", "Tartarini", "BRC"].map(b => (
              <div key={b} style={{ flex: 1, border: `1px solid ${C.bd}`, borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>⚙️</div>
                <div style={{ fontWeight: 600, color: C.t, fontSize: 13 }}>{b}</div>
                <div style={{ fontSize: 11, color: C.tm }}>2 models</div>
              </div>
            ))}
          </div>
          <div style={{ background: C.bg, borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 600, color: C.t, fontSize: 13, marginBottom: 10 }}>Components</div>
            {["Reducer", "Injector Rail", "ECU", "Filler Valve"].map(comp => (
              <div key={comp} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.bd}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: C.white, border: `1px solid ${C.bd}`, display: "flex", alignItems: "center", justifyContent: "center" }}>🔩</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.t }}>{comp}</div>
                  <div style={{ fontSize: 11, color: C.tm }}>Click to add description</div>
                </div>
                <button style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 12 }}><Edit2 size={12} /></button>
              </div>
            ))}
            <button style={{ ...btn("ghost"), marginTop: 10, fontSize: 12 }}><Plus size={12} />Add Component</button>
          </div>
        </Modal>
      )}

      <Modal open={modal} title="Add New Product" onClose={() => setModal(false)}>
        <FormField label="Product Name"><input style={inp()} placeholder="e.g. EZ Blue Kit" /></FormField>
        <FormField label="Category"><select style={inp()}>{Object.keys(mockProducts).map(k => <option key={k}>{k}</option>)}</select></FormField>
        <FormField label="Description"><textarea style={{ ...inp(), height: 80, resize: "vertical" }} placeholder="Product description..." /></FormField>
        <FormField label="Product Image">
          <div style={{ border: `2px dashed ${C.bd}`, borderRadius: 12, padding: "20px 0", textAlign: "center", color: C.tm, fontSize: 13 }}>
            <ImgIcon size={22} style={{ margin: "0 auto 8px" }} /><br />Upload product image
          </div>
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={btn("ghost")} onClick={() => setModal(false)}>Cancel</button>
          <button style={btn()} onClick={() => setModal(false)}><Check size={14} />Add Product</button>
        </div>
      </Modal>
    </div>
  );
};

// ─── Page: FAQ ────────────────────────────────────────────
const FAQPage = () => {
  const [list, setList] = useState(mockFAQs);
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: "", answer: "", isLink: false });

  const filtered = list.filter(f => f.question.toLowerCase().includes(search.toLowerCase()));
  const openEdit = f => { setEditing(f); setForm({ question: f.question, answer: f.answer, isLink: f.isLink }); setModal(true); };
  const save = () => {
    if (editing) setList(l => l.map(f => f.id === editing.id ? { ...f, ...form } : f));
    else setList(l => [...l, { id: Date.now(), ...form }]);
    setModal(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.t }}>Frequently Asked Questions</div>
          <div style={{ fontSize: 12, color: C.tm }}>{list.length} FAQs</div>
        </div>
        <button style={btn()} onClick={() => { setEditing(null); setForm({ question: "", answer: "", isLink: false }); setModal(true); }}><Plus size={15} />Add FAQ</button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: C.white, border: `1px solid ${C.bd}`, borderRadius: 10, padding: "9px 12px" }}>
          <Search size={14} color={C.tm} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search FAQs..." style={{ border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", width: "100%", color: C.t }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(f => (
          <div key={f.id} style={{ ...card(), padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", cursor: "pointer" }} onClick={() => setOpen(open === f.id ? null : f.id)}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: C.t }}>{f.question}</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {f.isLink && <Badge color="blue">Link</Badge>}
                <button onClick={e => { e.stopPropagation(); openEdit(f); }} style={{ ...btn("ghost"), padding: "4px 8px" }}><Edit2 size={13} /></button>
                <button onClick={e => { e.stopPropagation(); setList(l => l.filter(x => x.id !== f.id)); }} style={{ ...btn("ghost"), padding: "4px 8px", color: C.red }}><Trash2 size={13} /></button>
                {open === f.id ? <ChevronDown size={16} color={C.tm} /> : <ChevronRight size={16} color={C.tm} />}
              </div>
            </div>
            {open === f.id && (
              <div style={{ padding: "0 16px 14px", color: C.tm, fontSize: 13, borderTop: `1px solid ${C.bd}`, paddingTop: 12 }}>
                {f.isLink ? <a href={f.answer} style={{ color: C.blue }}>{f.answer}</a> : f.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={modal} title={editing ? "Edit FAQ" : "Add FAQ"} onClose={() => setModal(false)}>
        <FormField label="Question">
          <input style={inp()} value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} placeholder="Enter the question" />
        </FormField>
        <FormField label="Answer / URL">
          <textarea style={{ ...inp(), height: 100, resize: "vertical" }} value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} placeholder={form.isLink ? "https://..." : "Enter the answer"} />
        </FormField>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <input type="checkbox" id="isLink" checked={form.isLink} onChange={e => setForm(p => ({ ...p, isLink: e.target.checked }))} />
          <label htmlFor="isLink" style={{ fontSize: 13, color: C.t, cursor: "pointer" }}>This FAQ links to an external URL</label>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={btn("ghost")} onClick={() => setModal(false)}>Cancel</button>
          <button style={btn()} onClick={save}><Check size={14} />{editing ? "Update" : "Add"} FAQ</button>
        </div>
      </Modal>
    </div>
  );
};

// ─── Page: Contact ────────────────────────────────────────
const ContactPage = () => {
  const [tab, setTab] = useState("submissions");
  const [list, setList] = useState(mockSubmissions);

  const statusColor = s => s === "resolved" ? "green" : s === "in_progress" ? "blue" : "amber";
  const statusLabel = s => s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 12, padding: 4, marginBottom: 20, width: "fit-content" }}>
        {[["submissions", "Form Submissions"], ["feedback", "Feedback"], ["details", "Contact Details"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            ...btn("ghost"), borderRadius: 9, padding: "7px 16px", fontSize: 13,
            background: tab === k ? C.white : "transparent",
            color: tab === k ? C.t : C.tm,
            border: tab === k ? `1px solid ${C.bd}` : "none",
            boxShadow: tab === k ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
          }}>{l}</button>
        ))}
      </div>

      {(tab === "submissions" || tab === "feedback") && (
        <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: C.t, fontSize: 14 }}>{tab === "submissions" ? "Contact Form Submissions" : "Feedback Submissions"}</span>
            <button style={{ ...btn("ghost"), padding: "6px 12px", fontSize: 12 }}><Download size={13} />Export CSV</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["Name", "Email", "Phone", "Message", "Date", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: C.tm }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => (
                <tr key={s.id} style={{ borderTop: `1px solid ${C.bd}`, background: i % 2 === 0 ? C.white : "#fafcfb" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: C.t, fontSize: 13 }}>{s.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm }}>{s.email}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm }}>{s.phone}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.t, maxWidth: 200 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.message}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm }}>{s.date}</td>
                  <td style={{ padding: "12px 16px" }}><Badge color={statusColor(s.status)}>{statusLabel(s.status)}</Badge></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setList(l => l.map(x => x.id === s.id ? { ...x, status: "resolved" } : x))} style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 12, color: C.green }}><Check size={12} />Resolve</button>
                      <button onClick={() => setList(l => l.filter(x => x.id !== s.id))} style={{ ...btn("ghost"), padding: "4px 8px", color: C.red }}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "details" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ ...card(), padding: 20 }}>
            <div style={{ fontWeight: 600, color: C.t, fontSize: 14, marginBottom: 16 }}>Company Information</div>
            {[["Address", "42, Industrial Estate, Madurai - 625003, Tamil Nadu"], ["Phone 1", "+91 452 234 5678"], ["Phone 2", "+91 98421 00000"], ["Email", "teamkrfuels@gmail.com"], ["GST No.", "33AABCK1234M1Z5"]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.bd}` }}>
                <span style={{ fontSize: 12, color: C.tm, width: 80, flexShrink: 0 }}>{l}</span>
                <span style={{ fontSize: 13, color: C.t }}>{v}</span>
              </div>
            ))}
            <button style={{ ...btn(), marginTop: 14 }}><Save size={14} />Save Changes</button>
          </div>
          <div style={{ ...card(), padding: 20 }}>
            <div style={{ fontWeight: 600, color: C.t, fontSize: 14, marginBottom: 16 }}>Social Media Links</div>
            {[["Facebook", "https://facebook.com/krfuels"], ["Instagram", "https://instagram.com/krfuels"], ["LinkedIn", "https://linkedin.com/company/krfuels"], ["YouTube", "https://youtube.com/@krfuels"]].map(([l, v]) => (
              <FormField key={l} label={l}>
                <input style={inp()} defaultValue={v} />
              </FormField>
            ))}
            <button style={{ ...btn(), marginTop: 6 }}><Save size={14} />Save Links</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Page: Settings ───────────────────────────────────────
const SettingsPage = () => {
  const [tab, setTab] = useState("general");
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 12, padding: 4, marginBottom: 20, width: "fit-content" }}>
        {[["general", "General"], ["fuel", "Fuel & Savings"], ["hero", "Hero Section"], ["seo", "SEO / Meta"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            ...btn("ghost"), borderRadius: 9, padding: "7px 16px", fontSize: 13,
            background: tab === k ? C.white : "transparent", color: tab === k ? C.t : C.tm,
            border: tab === k ? `1px solid ${C.bd}` : "none",
            boxShadow: tab === k ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
          }}>{l}</button>
        ))}
      </div>

      <div style={{ ...card(), padding: 24, maxWidth: 640 }}>
        {tab === "general" && (
          <>
            <FormField label="Website Name"><input style={inp()} defaultValue="KR Fuels" /></FormField>
            <FormField label="Tagline"><input style={inp()} defaultValue="Tamil Nadu's Trusted Auto LPG Provider" /></FormField>
            <FormField label="Footer Text"><textarea style={{ ...inp(), height: 80 }} defaultValue="© 2025 KR Fuels. All rights reserved." /></FormField>
            <FormField label="Contact Email"><input style={inp()} defaultValue="teamkrfuels@gmail.com" /></FormField>
          </>
        )}
        {tab === "fuel" && (
          <>
            <FormField label="Auto LPG Savings %"><input style={inp()} type="number" defaultValue="38" /></FormField>
            <FormField label="Savings Banner Text"><input style={inp()} defaultValue="Save up to 38% on fuel costs with Auto LPG!" /></FormField>
            <FormField label="Diesel Price (₹/L)"><input style={inp()} type="number" step="0.01" defaultValue="87.62" /></FormField>
            <FormField label="Petrol Price (₹/L)"><input style={inp()} type="number" step="0.01" defaultValue="102.34" /></FormField>
            <FormField label="Auto LPG Price (₹/L)"><input style={inp()} type="number" step="0.01" defaultValue="49.80" /></FormField>
          </>
        )}
        {tab === "hero" && (
          <>
            <FormField label="Hero Headline"><input style={inp()} defaultValue="Drive Smarter with Auto LPG" /></FormField>
            <FormField label="Hero Subheadline"><textarea style={{ ...inp(), height: 80 }} defaultValue="KR Fuels operates 23+ Auto LPG stations across Tamil Nadu. Save more, drive more." /></FormField>
            <FormField label="CTA Button Text"><input style={inp()} defaultValue="Find Nearest Station" /></FormField>
            <FormField label="Hero Background Image">
              <div style={{ border: `2px dashed ${C.bd}`, borderRadius: 12, padding: "20px 0", textAlign: "center", color: C.tm, fontSize: 13 }}>
                <ImgIcon size={22} style={{ margin: "0 auto 8px" }} /><br />Upload hero image (1920×1080 recommended)
              </div>
            </FormField>
          </>
        )}
        {tab === "seo" && (
          <>
            <FormField label="Meta Title"><input style={inp()} defaultValue="KR Fuels | Auto LPG Stations in Tamil Nadu" /></FormField>
            <FormField label="Meta Description"><textarea style={{ ...inp(), height: 80 }} defaultValue="KR Fuels — Tamil Nadu's most trusted Auto LPG fuel provider. 23+ stations across major districts." /></FormField>
            <FormField label="Keywords"><input style={inp()} defaultValue="Auto LPG, CNG, KR Fuels, Tamil Nadu, fuel station" /></FormField>
            <FormField label="OG Image">
              <div style={{ border: `2px dashed ${C.bd}`, borderRadius: 12, padding: "16px 0", textAlign: "center", color: C.tm, fontSize: 13 }}>
                <ImgIcon size={20} style={{ margin: "0 auto 6px" }} /><br />Upload OG image (1200×630)
              </div>
            </FormField>
          </>
        )}
        <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
          <button style={btn()}><Save size={14} />Save Settings</button>
          <button style={btn("ghost")}>Reset to Default</button>
        </div>
      </div>
    </div>
  );
};

// ─── Page: Profile ────────────────────────────────────────
const ProfilePage = () => (
  <div style={{ padding: 24 }}>
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
      <div style={{ ...card(), padding: 24, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.p, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 28, margin: "0 auto 14px" }}>KR</div>
        <div style={{ fontWeight: 700, fontSize: 17, color: C.t }}>KR Fuels Admin</div>
        <div style={{ fontSize: 13, color: C.tm, marginBottom: 6 }}>Super Administrator</div>
        <Badge color="green">Active</Badge>
        <div style={{ marginTop: 16, padding: "12px 0", borderTop: `1px solid ${C.bd}` }}>
          <div style={{ fontSize: 12, color: C.tm }}>Last login</div>
          <div style={{ fontSize: 13, color: C.t, fontWeight: 500 }}>Today, 09:32 AM</div>
        </div>
        <div style={{ padding: "12px 0", borderTop: `1px solid ${C.bd}` }}>
          <div style={{ fontSize: 12, color: C.tm }}>Member since</div>
          <div style={{ fontSize: 13, color: C.t, fontWeight: 500 }}>January 2023</div>
        </div>
        <button style={{ ...btn("danger"), width: "100%", justifyContent: "center", marginTop: 10, borderRadius: 10 }}><LogOut size={14} />Sign Out</button>
      </div>

      <div>
        <div style={{ ...card(), padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: C.t, fontSize: 14, marginBottom: 16 }}>Profile Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="First Name"><input style={inp()} defaultValue="KR" /></FormField>
            <FormField label="Last Name"><input style={inp()} defaultValue="Fuels" /></FormField>
            <FormField label="Email Address"><input style={inp()} defaultValue="admin@krfuels.com" /></FormField>
            <FormField label="Phone"><input style={inp()} defaultValue="+91 98421 00000" /></FormField>
          </div>
          <FormField label="Role"><input style={inp()} defaultValue="Super Administrator" disabled /></FormField>
          <button style={{ ...btn(), marginTop: 8 }}><Save size={14} />Update Profile</button>
        </div>

        <div style={{ ...card(), padding: 20 }}>
          <div style={{ fontWeight: 600, color: C.t, fontSize: 14, marginBottom: 16 }}>Change Password</div>
          <FormField label="Current Password"><input style={inp()} type="password" placeholder="••••••••" /></FormField>
          <FormField label="New Password"><input style={inp()} type="password" placeholder="••••••••" /></FormField>
          <FormField label="Confirm New Password"><input style={inp()} type="password" placeholder="••••••••" /></FormField>
          <button style={btn()}><Check size={14} />Update Password</button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main App ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [prices, setPrices] = useState(fuelPrices);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage prices={prices} onEditPrice={p => setPrices({ diesel: +p.diesel, petrol: +p.petrol, autoLPG: +p.autoLPG })} />;
      case "testimonials": return <TestimonialsPage />;
      case "clients": return <ClientsPage />;
      case "stations": return <StationsPage />;
      case "products": return <ProductsPage />;
      case "faq": return <FAQPage />;
      case "contact": return <ContactPage />;
      case "settings": return <SettingsPage />;
      case "profile": return <ProfilePage />;
      default: return <DashboardPage prices={prices} onEditPrice={setPrices} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: C.bg, overflow: "hidden" }}>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar page={page} fuels={prices} />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}