import { useState, type FC } from "react";
import { Plus, Search, Edit2, Trash2, MapPin, Store, Check, Map, AlertCircle, Grid, List, Clock, Save } from "lucide-react";
import { Image as ImgIcon } from "lucide-react";

import { C }              from "../../constants/colors";
import { mockStations }   from "../../constants/mockData";
import { card, btn, inp } from "../../styles/shared";
import { Badge, StatCard } from "../../components/ui";
import type { Station, StationFormDraft } from "../../types";

const DISTRICTS = ["Madurai", "Chennai", "Coimbatore", "Trichy", "Salem", "Tirunelveli", "Other"] as const;

const EMPTY_FORM: StationFormDraft = {
  name: "", address: "", phone: "", district: "Madurai", hours: "", mapLink: "",
};

const StationsPage: FC = () => {
  const [list,    setList]    = useState<Station[]>(mockStations);
  const [view,    setView]    = useState<"table" | "grid">("table");
  const [search,  setSearch]  = useState("");
  const [district,setDistrict]= useState("All");
  const [drawer,  setDrawer]  = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [form,    setForm]    = useState<StationFormDraft>(EMPTY_FORM);

  const allDistricts = ["All", ...new Set(list.map((s) => s.district))];

  const filtered = list.filter(
    (s) =>
      (district === "All" || s.district === district) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.address.toLowerCase().includes(search.toLowerCase())),
  );

  const openEdit = (s: Station) => {
    setEditing(s);
    setForm({ name: s.name, address: s.address, phone: s.phone, district: s.district, hours: s.hours, mapLink: s.mapLink });
    setDrawer(true);
  };

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDrawer(true); };

  const save = () => {
    if (editing) {
      setList((l) => l.map((s) => (s.id === editing.id ? { ...s, ...form } : s)));
    } else {
      setList((l) => [...l, { id: Date.now(), ...form, status: "active", images: 0 }]);
    }
    setDrawer(false);
  };

  const remove = (id: number) => setList((l) => l.filter((s) => s.id !== id));

  return (
    <div style={{ padding: 24 }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard icon={<Store size={18} />}       label="Total Stations"    value={list.length}                                sub="Active network"    />
        <StatCard icon={<Check size={18} />}       label="Active Stations"   value={list.filter((s) => s.status === "active").length}  sub="Operational"       />
        <StatCard icon={<Map size={18} />}         label="Districts Covered" value={new Set(list.map((s) => s.district)).size} sub="Across Tamil Nadu" />
        <StatCard icon={<AlertCircle size={18} />} label="Inactive"          value={list.filter((s) => s.status === "inactive").length} sub="Needs attention"   />
      </div>

      {/* Table / Grid card */}
      <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 10, padding: "7px 12px" }}>
            <Search size={14} color={C.tm} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stations..." style={{ border: "none", background: "transparent", fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", color: C.t }} />
          </div>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} style={{ ...inp({ width: "auto", padding: "7px 12px" }), minWidth: 140 }}>
            {allDistricts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <div style={{ display: "flex", gap: 4 }}>
            {(["table", "grid"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} style={{ ...btn("ghost"), padding: 8, background: view === v ? C.pXLight : "transparent", color: view === v ? C.p : C.tm }}>
                {v === "table" ? <List size={16} /> : <Grid size={16} />}
              </button>
            ))}
          </div>
          <button style={btn()} onClick={openAdd}><Plus size={14} />Add Station</button>
        </div>

        {/* Table view */}
        {view === "table" ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["Station Name", "District", "Address", "Phone", "Hours", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: C.tm, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} style={{ borderTop: `1px solid ${C.bd}`, background: i % 2 === 0 ? C.white : "#fafcfb" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: C.t, fontSize: 13 }}>{s.name}</td>
                  <td style={{ padding: "12px 16px" }}><Badge color="blue">{s.district}</Badge></td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm, maxWidth: 200 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.address}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm }}>{s.phone}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm, whiteSpace: "nowrap" }}>
                    <Clock size={11} style={{ marginRight: 4 }} />{s.hours}
                  </td>
                  <td style={{ padding: "12px 16px" }}><Badge color={s.status === "active" ? "green" : "red"}>{s.status}</Badge></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(s)} style={{ ...btn("ghost"), padding: "4px 8px" }}><Edit2 size={13} /></button>
                      <button onClick={() => remove(s.id)} style={{ ...btn("ghost"), padding: "4px 8px", color: C.red }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Grid view */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, padding: 16 }}>
            {filtered.map((s) => (
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
                    <button onClick={() => remove(s.id)} style={{ ...btn("ghost"), padding: "5px 8px", color: C.red }}><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side Drawer */}
      {drawer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 440, background: C.white, height: "100%", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.bd}` }}>
              <span style={{ fontWeight: 600, fontSize: 16, color: C.t }}>{editing ? "Edit Station" : "Add New Station"}</span>
              <button onClick={() => setDrawer(false)} style={{ ...btn("ghost"), padding: 6 }}>✕</button>
            </div>
            <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
              {(
                [
                  ["name",    "Station Name",        "text", "KR Fuels ..."],
                  ["address", "Full Address",         "text", "Street, City, PIN"],
                  ["phone",   "Contact Number",       "tel",  "+91 98421 ..."],
                  ["hours",   "Opening Hours",        "text", "6:00 AM - 10:00 PM"],
                  ["mapLink", "Google Maps Link",     "url",  "https://maps.google.com/..."],
                ] as const
              ).map(([key, label, type, placeholder]) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: C.t, marginBottom: 4, display: "block" }}>{label}</label>
                  <input
                    style={inp()}
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: C.t, marginBottom: 4, display: "block" }}>District</label>
                <select style={inp()} value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}>
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: C.t, marginBottom: 4, display: "block" }}>Station Images</label>
                <div style={{ border: `2px dashed ${C.bd}`, borderRadius: 12, padding: "20px 0", textAlign: "center", color: C.tm, fontSize: 13 }}>
                  <ImgIcon size={22} style={{ margin: "0 auto 8px" }} /><br />
                  Upload multiple station images<br />
                  <span style={{ color: C.p, cursor: "pointer" }}>Click to browse</span> or drag & drop
                </div>
              </div>
            </div>
            <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.bd}`, display: "flex", gap: 8 }}>
              <button style={{ ...btn("ghost"), flex: 1, justifyContent: "center" }} onClick={() => setDrawer(false)}>Cancel</button>
              <button style={{ ...btn(), flex: 1, justifyContent: "center" }}       onClick={save}><Save size={14} />Save Station</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationsPage;
