import { C } from '@/constants/colors'
import { api } from '@/lib/axios'
import { btn, inp } from '@/styles/shared'
import { StationFormDraft } from '@/types'
import { Station } from '@/types/dust'
import { error } from 'console'
import { ImageIcon, Save, X } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { toast } from 'sonner'

type DrawerProps = {
    editing: Station | null
    setDrawer: (val: boolean) => void
    setStations: React.Dispatch<React.SetStateAction<Station[]>>
    form: StationFormDraft
    setForm: React.Dispatch<React.SetStateAction<StationFormDraft>>
    districts: string[]
    save: () => Promise<void>
    pendingFiles: File[]
    setPendingFiles: React.Dispatch<React.SetStateAction<File[]>>,
    loading: boolean
}

const Drawer = (props: DrawerProps) => {
    const { editing, form, setDrawer, setForm, districts, save, setStations, pendingFiles, setPendingFiles, loading } = props

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)


    const handleFiles = (files: FileList | null) => {
        if (!files) return
        setPendingFiles(prev => [...prev, ...Array.from(files)])
    }

    const onDeleteImage = async (url: string) => {
        console.log(url)
        try {
            const response = await api.delete(`/stations/${form.id}/images`, {
                data: { imageUrl: url }
            })
            if (response.data.success) {
                setForm(p => ({ ...p, images: (p.images ?? []).filter(img => img !== url) }))
                setStations(p => p.map(s =>
                    s.id === form.id
                        ? { ...s, images: (s.images ?? []).filter(img => img !== url) }
                        : s
                ))
            }
            toast.success("Image Removed")
        } catch {
            toast.error("Failed")
            console.error("error")
        }
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: 440, background: C.white, height: "100%", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.bd}` }}>
                    <span style={{ fontWeight: 600, fontSize: 16, color: C.t }}>{editing ? "Edit Station" : "Add New Station"}</span>
                    <button onClick={() => setDrawer(false)} style={{ ...btn("ghost"), padding: 6 }}>✕</button>
                </div>
                <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>

                    {/* Station Name */}
                    {([
                        ["stationName", "Station Name", "text", "KR Fuels Madurai Central"],
                        ["area", "Area", "text", "Anna Nagar, RS Puram..."],
                        ["contactPerson", "Contact Person", "text", "John Doe"],
                        ["mobileNumber", "Mobile Number", "tel", "+91 98421 00000"],
                        ["telephone", "Telephone (optional)", "tel", "044-XXXXXXXX"],
                        ["emailID", "Email ID (optional)", "email", "station@krfuels.in"],
                        ["workingHours", "Working Hours", "text", "6:00 AM - 10:00 PM"],
                    ] as const).map(([key, label, type, placeholder]) => (
                        <div key={key} style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: C.t, marginBottom: 4, display: "block" }}>{label}</label>
                            <input
                                style={inp()} type={type}
                                value={(form as any)[key] ?? ""}
                                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                                placeholder={placeholder}
                            />
                        </div>
                    ))}

                    {/* Address fields */}
                    <div style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: C.t, marginBottom: 4, display: "block" }}>Address</label>
                    </div>
                    {([
                        ["doorNo", "Door No", "1/30"],
                        ["street", "Street", "14, Bypass Road"],
                        ["pincode", "Pincode", "625001"],
                    ] as const).map(([key, label, placeholder]) => (
                        <div key={key} style={{ marginBottom: 10 }}>
                            <input
                                style={{ ...inp(), fontSize: 12 }} type="text"
                                value={(form.address as any)[key] ?? ""}
                                onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, [key]: e.target.value } }))}
                                placeholder={`${label} — ${placeholder}`}
                            />
                        </div>
                    ))}

                    {/* District */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: C.t, marginBottom: 4, display: "block" }}>District</label>
                        <select style={inp()} value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}>
                            {districts.map((d) => <option key={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* Location */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: C.t, marginBottom: 4, display: "block" }}>Location (lat / lng)</label>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                style={{ ...inp(), flex: 1 }} type="number" placeholder="Latitude"
                                value={form.location.latitude || ""}
                                onChange={(e) => setForm((p) => ({ ...p, location: { ...p.location, latitude: parseFloat(e.target.value) } }))}
                            />
                            <input
                                style={{ ...inp(), flex: 1 }} type="number" placeholder="Longitude"
                                value={form.location.longitude || ""}
                                onChange={(e) => setForm((p) => ({ ...p, location: { ...p.location, longitude: parseFloat(e.target.value) } }))}
                            />
                        </div>
                    </div>

                    {/* Images upload */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: C.t, marginBottom: 4, display: "block" }}>
                            Station Images
                        </label>

                        {/* Existing images */}
                        {form.images.length > 0 && (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                                gap: 8,
                                marginBottom: 10,
                            }}>
                                {form.images.map((url, i) => (
                                    <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.bd}` }}>
                                        <img
                                            src={url}
                                            alt={`Station image ${i + 1}`}
                                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                        />
                                        <button
                                            onClick={() => {
                                                setForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))
                                                onDeleteImage(url)
                                            }}
                                            style={{
                                                position: "absolute", top: 3, right: 3,
                                                width: 18, height: 18, borderRadius: "50%",
                                                background: "rgba(0,0,0,0.55)", border: "none",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                cursor: "pointer", padding: 0,
                                            }}
                                        >
                                            <X size={10} color="#fff" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload zone */}
                        <div style={{ border: `2px dashed ${C.bd}`, borderRadius: 12, padding: "20px 0", textAlign: "center", color: C.tm, fontSize: 13 }}>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: "none" }}
                                onChange={e => handleFiles(e.target.files)}
                            />

                            {/* Pending previews */}
                            {pendingFiles.length > 0 && (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                                    gap: 8,
                                    marginBottom: 10,
                                }}>
                                    {pendingFiles.map((file, i) => (
                                        <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.bd}` }}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                            />
                                            <button
                                                onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))}
                                                style={{
                                                    position: "absolute", top: 3, right: 3,
                                                    width: 18, height: 18, borderRadius: "50%",
                                                    background: "rgba(0,0,0,0.55)", border: "none",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer", padding: 0,
                                                }}
                                            >
                                                <X size={10} color="#fff" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
                                style={{
                                    border: `${dragging ? C.p : C.bd}`,
                                    borderRadius: 12,
                                    padding: "20px 0",
                                    textAlign: "center",
                                    color: C.tm,
                                    fontSize: 13,
                                    background: dragging ? `${C.p}08` : "transparent",
                                    cursor: "pointer",
                                    transition: "border-color 0.15s, background 0.15s",
                                }}
                            >
                                <ImageIcon size={22} style={{ margin: "0 auto 8px" }} /><br />
                                Upload multiple station images<br />
                                <span style={{ color: C.p }}>Click to browse</span> or drag & drop
                            </div>

                        </div>
                    </div>
                </div>

                <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.bd}`, display: "flex", gap: 8 }}>
                    <button style={{ ...btn("ghost"), flex: 1, justifyContent: "center" }} onClick={() => setDrawer(false)}>Cancel</button>
                    <button style={{ ...btn(), flex: 1, justifyContent: "center" }} onClick={save}
                        disabled={loading}
                    ><Save size={14} />
                        {loading ? ("Saving...") : "Save Station"}</button>
                </div>
            </div>
        </div>
    )
}

export default Drawer