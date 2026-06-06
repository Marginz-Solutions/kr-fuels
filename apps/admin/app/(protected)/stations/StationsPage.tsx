"use client"
import { useState, useEffect, type FC } from "react";
import { Plus, Edit2, Trash2, MapPin, Store, Check, Map, AlertCircle, Grid, List, Clock, Upload, Loader2, User, Phone } from "lucide-react";
import { C } from "../../../constants/colors";
import { card, btn, inp, iconBtn } from "../../../styles/shared";
import { Badge, StatCard } from "../../../components/ui";
import type { StationFormDraft } from "../../../types";
import Folder from "./_components/Folder";
import ImagesModal from "./_components/ImagesModal";
import { StationResponse, Station } from "@/types/dust";
import Drawer from "./_components/Drawer";
import { api } from "@/lib/axios";
import Pagination from "@/components/ui/Pagination";
import ExcelUploadModal from "./_components/ExcelUploadModal";
import { toast } from "sonner";

const EMPTY_FORM: StationFormDraft = {
  id: "",
  stationName: "", area: "", address: { street: "", doorNo: "", pincode: "" },
  contactPerson: "", mobileNumber: "", telephone: "", emailID: "",
  district: "Madurai", workingHours: "",
  location: { latitude: 0, longitude: 0 }, mapLink: "",
  status: "active",
  images: [],
  primaryImage: "",
}

const LIMIT_OPTIONS = [10, 25, 50, 100]

const StationsPage: FC<StationResponse> = (props) => {
  const { data, meta: initialMeta, stats: initialStats } = props;

  const [list, setList] = useState<Station[]>(data ?? []);
  const [meta, setMeta] = useState(initialMeta);
  const [stats, setStats] = useState(initialStats)
  const [districts, setDistricts] = useState(stats?.districts ?? []);
  const [view, setView] = useState<"table" | "grid">("table");
  const [isMobile, setIsMobile] = useState(false)
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [form, setForm] = useState<StationFormDraft>(EMPTY_FORM);
  const [imagesOpen, setImagesOpen] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Station | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const allDistricts = ["All", ...districts];

  // ── mobile detection ───────────────────────────────────
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setView("grid")
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // ── fetch ──────────────────────────────────────────────
  const fetchStations = async (p = page, l = limit) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(p),
        limit: String(l),
        ...(search && { search }),
        ...(district !== "All" && { district }),
      })
      const response = await api.get(`/stations?${params}`)
      setList(response.data.data)
      setMeta(response.data.meta)
      setStats(response.data.stats)
    } catch (err) {
      console.error("Fetch failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const remove = async (station: Station) => {
    setDeleteLoading(true)
    try {
      await api.delete(`/stations/${station.id}`)
      setList(l => l.filter(s => s.id !== station.id))
      setDeleteTarget(null)
      setDeleteLoading(false)
      fetchStations(1, 10)
      toast.success("Deleted Successfully")
    } catch (err) {
      console.error("Delete failed:", err)
      setDeleteLoading(false)
    }
  }

  useEffect(() => { fetchStations(page, limit) }, [page, limit])

  useEffect(() => {
    setPage(1)
    fetchStations(1, limit)
  }, [search, district])

  const handlePageChange = (p: number) => setPage(p)

  const handleLimitChange = (l: number) => {
    setLimit(l)
    setPage(1)
  }

  // ── crud ───────────────────────────────────────────────
  const openEdit = (s: Station) => {
    setPendingFiles([])
    setEditing(s)
    setForm({
      id: s.id, stationName: s.stationName, area: s.area,
      address: s.address, contactPerson: s.contactPerson,
      mobileNumber: s.mobileNumber, telephone: s.telephone ?? "",
      emailID: s.emailID ?? "", district: s.district,
      status: s.status,
      workingHours: s.workingHours, location: s.location,
      mapLink: s.mapLink ?? "", images: s.images ?? [],
      primaryImage: s.primaryImage ?? "",
    })
    setDrawer(true)
  }

  const openAdd = () => {
    setPendingFiles([])
    setEditing(null)
    setForm({ ...EMPTY_FORM, images: [] })
    setDrawer(true)
  }

  const save = async () => {
    const formData = new FormData()
    formData.append("data", JSON.stringify({
      stationName: form.stationName, area: form.area,
      contactPerson: form.contactPerson, mobileNumber: form.mobileNumber,
      telephone: form.telephone ?? "", emailID: form.emailID ?? "",
      district: form.district, workingHours: form.workingHours,
      status: form.status,
      mapLink: form.mapLink ?? "", address: form.address, location: form.location,
      primaryImage: form.primaryImage ?? "",
    }))
    pendingFiles.forEach(f => formData.append("images", f))
    try {
      setSaveLoading(true)
      if (editing) {
        const response = await api.patch(`/stations/${editing.id}`, formData)
        setList(l => l.map(s => s.id === editing.id ? { ...s, ...response.data.data, status: response.data.data.status ?? s.status } : s))
        toast.success("Edited Successfully")
      } else {
        await api.post("/stations", formData)
        fetchStations(1, limit)
        setPage(1)
        toast.success("Added Successfully")
      }
      setPendingFiles([])
      setDrawer(false)
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Failed")
      console.error("Save failed:", err)
    } finally {
      setSaveLoading(false)
    }
  }

  // Show the stored address as-is (doorNo → street → pincode). `area` is rendered
  // in its own column, so it's NOT appended here — appending it duplicated the
  // locality that `street` already contains (e.g. "…, Moolapalayam, Moolapalayam").
  const formatAddress = (s: Station) =>
    [s.address.doorNo, s.address.street, s.address.pincode].filter(Boolean).join(", ")

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard icon={<Store size={18} />} label="Total Stations" value={meta?.total} sub="Active network" />
        <StatCard icon={<Check size={18} />} label="Active Stations" value={stats?.active} sub="Operational" />
        <StatCard icon={<AlertCircle size={18} />} label="Inactive" value={stats?.inactive} sub="Needs attention" />
        <StatCard icon={<Map size={18} />} label="Districts Covered" value={stats?.totalDistricts} sub="Across Tamil Nadu" />
        <div className="flex items-center lg:justify-end justify-center mt-2">
          <Folder label="Images" color="amber" onClick={() => setImagesOpen(true)} />
        </div>
      </div>

      <div style={{ ...card(), padding: 0, overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${C.bd}`,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          <select
            value={district}
            onChange={e => setDistrict(e.target.value)}
            style={{ ...inp({ width: "auto", padding: "7px 12px" }), minWidth: 140 }}
          >
            {allDistricts.map(d => <option key={d}>{d}</option>)}
          </select>

          {/* limit selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: C.tm }}>Show</span>
            {LIMIT_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => handleLimitChange(opt)}
                style={{ ...btn(limit === opt ? 'primary' : 'ghost'), padding: "5px 10px", fontSize: 12 }}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* View toggle — desktop only */}
          {!isMobile && (
            <div style={{ display: "flex", gap: 4 }}>
              {(["table", "grid"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{ ...btn("ghost"), padding: 8, background: view === v ? C.p : "transparent", color: view === v ? C.white : C.tm }}
                >
                  {v === "table" ? <List size={16} /> : <Grid size={16} />}
                </button>
              ))}
            </div>
          )}

          <button style={btn()} onClick={openAdd}><Plus size={14} />Add Station</button>
          <button style={btn()} onClick={() => setExcelOpen(true)}><Upload size={14} />Upload</button>
        </div>

        <ExcelUploadModal open={excelOpen} setOpen={setExcelOpen} fetchList={fetchStations} />

        {/* Loading skeleton */}
        {loading && (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i} style={{ padding: "10px 16px" }}>
                      <div className="sk" style={{ height: 11, width: i === 0 ? 60 : i === 4 ? 50 : 80 }} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, ri) => (
                  <tr key={ri} style={{ borderTop: `1px solid ${C.bd}`, background: ri % 2 === 0 ? C.white : "#fafcfb" }}>
                    {Array.from({ length: 5 }).map((_, ci) => (
                      <td key={ci} style={{ padding: "12px 16px" }}>
                        <div
                          className="sk"
                          style={{
                            height: 13,
                            width: ci === 0 ? "70%" : ci === 4 ? "60%" : ci % 2 === 0 ? "80%" : "55%",
                            animationDelay: `${ri * 0.07}s`,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.bd}`, display: "flex", justifyContent: "flex-end", gap: 6, alignItems: "center" }}>
              <div className="sk" style={{ height: 13, width: 80, marginRight: 8 }} />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="sk" style={{ height: 28, width: 32, borderRadius: 8 }} />
              ))}
            </div>
          </>
        )}

        {/* Table view — desktop only */}
        {!loading && view === "table" && !isMobile && (
          <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {["Station Name", "Area", "District", "Contact", "Mobile", "Hours", "Status", "Actions"].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.tm,
                        whiteSpace: "nowrap",
                        position: h === "Station Name" ? "sticky" : undefined,
                        left: h === "Station Name" ? 0 : undefined,
                        background: h === "Station Name" ? C.bg : undefined,
                        zIndex: h === "Station Name" ? 1 : undefined,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((s, i) => (
                  <tr key={s.id} style={{ borderTop: `1px solid ${C.bd}`, background: i % 2 === 0 ? C.white : "#fafcfb" }}>
                    <td style={{
                      padding: "12px 16px", fontWeight: 500, color: C.t, fontSize: 13, whiteSpace: "nowrap",
                      position: "sticky", left: 0, background: i % 2 === 0 ? C.white : "#fafcfb",
                      zIndex: 1, boxShadow: "2px 0 6px -2px rgba(26,46,41,0.10)",
                    }}>
                      {s.stationName}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm, whiteSpace: "nowrap" }}>{s.area}</td>
                    <td style={{ padding: "12px 16px" }}><Badge color="blue">{s.district}</Badge></td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm, whiteSpace: "nowrap" }}>{s.contactPerson}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm, whiteSpace: "nowrap" }}>{s.mobileNumber}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm, whiteSpace: "nowrap" }}>
                      <Clock size={11} style={{ marginRight: 4 }} />{s.workingHours}
                    </td>
                    <td style={{ padding: "12px 16px" }}><Badge color={s.status === "active" ? "green" : "red"}>{s.status}</Badge></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(s)} title="Edit station" aria-label="Edit station" style={iconBtn("ghost")}><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteTarget(s)} title="Delete station" aria-label="Delete station" style={iconBtn("ghost", 30, { color: C.red })}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid view — always on mobile, optional on desktop */}
        {!loading && (view === "grid" || isMobile) && (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(auto-fill, minmax(min(100%, 160px), 1fr))"
              : "repeat(auto-fill, minmax(280px, 1fr))",
            gap: isMobile ? 10 : 16,
            padding: isMobile ? 10 : 16,
          }}>
            {list.map(s => {
              const thumb = s.primaryImage || s.images?.[0]
              return (
              <div key={s.id} style={{ border: `1px solid ${C.bd}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{
                  height: isMobile ? 104 : 160,
                  background: `linear-gradient(135deg, ${C.p}22, ${C.p}44)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={s.stationName}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <MapPin size={isMobile ? 20 : 28} color={C.p} />
                  )}
                </div>
                <div style={{ padding: isMobile ? 10 : 14, flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 6 }}>
                    <div style={{ fontWeight: 600, color: C.t, fontSize: isMobile ? 12 : 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.stationName}
                    </div>
                    <Badge color={s.status === "active" ? "green" : "red"}>{s.status}</Badge>
                  </div>
                  {!isMobile && (
                    <>
                      <div style={{ fontSize: 12, color: C.tm, marginBottom: 2 }}>{s.area} · <Badge color="blue">{s.district}</Badge></div>
                      <div style={{ fontSize: 12, color: C.tm, marginBottom: 8 }}>{formatAddress(s)}</div>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px 8px", fontSize: 12, marginBottom: 10 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: C.t, fontWeight: 500 }}>
                          <User size={12} color={C.tm} />{s.contactPerson}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: C.p, fontWeight: 600 }}>
                          <Phone size={12} />{s.mobileNumber}
                        </span>
                      </div>
                    </>
                  )}
                  {isMobile && (
                    <div style={{ fontSize: 11, color: C.tm, marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.area}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                    <button
                      onClick={() => openEdit(s)}
                      aria-label="Edit station"
                      style={{ ...btn("ghost"), padding: isMobile ? "4px 6px" : "5px 10px", fontSize: 12, flex: 1, justifyContent: "center" }}
                    >
                      <Edit2 size={12} />{!isMobile && "Edit"}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      title="Delete station"
                      aria-label="Delete station"
                      style={iconBtn("ghost", 30, { color: C.red })}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && (
          <div style={{ borderTop: `1px solid ${C.bd}` }} className="ms-5 me-5">
            <Pagination
              meta={meta}
              page={page}
              loading={loading}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <ImagesModal open={imagesOpen} setOpen={setImagesOpen} setOriginalStations={setList} />

      {drawer && (
        <Drawer
          districts={districts} editing={editing} form={form}
          save={save} setDrawer={setDrawer} setForm={setForm}
          setStations={setList} pendingFiles={pendingFiles}
          setPendingFiles={setPendingFiles} loading={saveLoading}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 1100,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: isMobile ? 16 : 0,
        }}>
          <div style={{
            background: C.white,
            borderRadius: 16,
            padding: isMobile ? 20 : 28,
            width: "100%",
            maxWidth: 380,
            boxShadow: "0 14px 44px rgba(26,46,41,0.16)",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: `${C.red}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Trash2 size={22} color={C.red} />
            </div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.t, marginBottom: 6 }}>Delete Station</div>
              <div style={{ fontSize: 13, color: C.tm, lineHeight: 1.5 }}>
                Are you sure you want to delete{" "}
                <span style={{ fontWeight: 600, color: C.t }}>{deleteTarget.stationName}</span>
                ? This action cannot be undone.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{ ...btn("ghost"), flex: 1, justifyContent: "center" }}
              >
                Cancel
              </button>
              <button
                disabled={deleteLoading}
                onClick={() => remove(deleteTarget)}
                style={{ ...btn(), flex: 1, justifyContent: "center", background: C.red, borderColor: C.red }}
              >
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={14} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StationsPage