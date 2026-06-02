import { useState, useRef, useCallback } from "react"
import { Modal } from '@/components/ui'
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/axios"
import { Spin } from "antd"
import { C } from "@/constants/colors"
import { toast } from "sonner"

type ExcelUploadModalProps = {
    open: boolean
    setOpen: (val: boolean) => void,
    fetchList: (p:number,l:number)=> Promise<void>
}

const REQUIRED_COLUMNS = [
    { key: "district", label: "District", icon: "🏛️" },
    { key: "area", label: "Area", icon: "🗺️" },
    { key: "stationName", label: "Station Name", icon: "🏪" },
    { key: "contactPerson", label: "Contact Person", icon: "👤" },
    { key: "mobileNumber", label: "Mobile Number", icon: "📱" },
    { key: "telephone", label: "Telephone", icon: "☎️" },
    { key: "emailID", label: "Email ID", icon: "✉️" },
    { key: "doorNo", label: "Door No", icon: "🚪" },
    { key: "street", label: "Street", icon: "🛣️" },
    { key: "pincode", label: "Pincode", icon: "📮" },
    {key:"workingHours",label:"Working Hours",icon:"⏱️"},
    { key: "latitude", label: "Latitude", icon: "📍" },
    { key: "longitude", label: "Longitude", icon: "📍" },
]

const ExcelUploadModal = ({ open, setOpen,fetchList }: ExcelUploadModalProps) => {
    const [dragging, setDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)

    const validateFile = (f: File) => {
        const valid = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
        ]
        if (!valid.includes(f.type) && !f.name.match(/\.(xlsx|xls)$/i)) {
            setError("Only .xlsx or .xls files are accepted.")
            setFile(null)
            return
        }
        setError(null)
        setFile(f)
    }

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) validateFile(f)
    }, [])

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
    const onDragLeave = () => setDragging(false)
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) validateFile(f)
    }

    const handleUpload = async () => {
        if (!file) return
        const formData: FormData = new FormData()
        formData.append("file", file)
        setLoading(true)
        const resposne = await api.post("/stations/upload/file", formData)
        if (!resposne.data) {
            toast.error("Upload Failed")
        }
        else {
            await fetchList(1,10)
            toast.success("Uploaded Successfully!")
        }
        formData.delete("file")
        setLoading(false)
        setOpen(false)
        setFile(null)
    }

    const handleClose = () => {
        setOpen(false)
        setFile(null)
        setError(null)
    }

    return (
        <Modal open={open} onClose={handleClose} title="Upload Excel">
            <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "4px 0 8px" }}>

                {/* Drop Zone */}
                <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={() => !file && inputRef.current?.click()}
                    style={{
                        border: `2px dashed ${dragging ? "#2563eb" : file ? "#16a34a" : error ? "#dc2626" : "#cbd5e1"}`,
                        borderRadius: 12,
                        padding: "28px 20px",
                        textAlign: "center",
                        background: dragging ? "#eff6ff" : file ? "#f0fdf4" : error ? "#fef2f2" : "#f8fafc",
                        cursor: file ? "default" : "pointer",
                        transition: "all 0.2s ease",
                    }}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: "none" }}
                        onChange={onFileChange}
                    />

                    {file ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 10,
                                background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                <FileSpreadsheet size={26} color="#16a34a" />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#15803d" }}>{file.name}</p>
                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 4,
                                    fontSize: 12, color: "#dc2626", background: "none",
                                    border: "none", cursor: "pointer", padding: "2px 6px",
                                }}
                            >
                                <X size={13} /> Remove
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 10,
                                background: dragging ? "#dbeafe" : "#e2e8f0",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "background 0.2s"
                            }}>
                                <Upload size={24} color={dragging ? "#2563eb" : "#64748b"} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
                                    {dragging ? "Drop your file here" : "Drag & drop your Excel file"}
                                </p>
                                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
                                    or <span style={{ color: "#2563eb", fontWeight: 500 }}>click to browse</span> — .xlsx or .xls only
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10 }}>
                            <AlertCircle size={14} color="#dc2626" />
                            <span style={{ fontSize: 12, color: "#dc2626" }}>{error}</span>
                        </div>
                    )}
                </div>

                {/* Column Reference */}
                <div style={{
                    border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden"
                }}>
                    <div style={{
                        padding: "10px 14px",
                        background: "#f1f5f9",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex", alignItems: "center", gap: 8
                    }}>
                        <CheckCircle2 size={15} color="#2563eb" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                            Required columns in your Excel sheet
                        </span>
                    </div>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: 1,
                        background: "#e2e8f0",
                    }}>
                        {REQUIRED_COLUMNS.map(col => (
                            <div
                                key={col.key}
                                style={{
                                    padding: "8px 12px",
                                    background: "#ffffff",
                                    display: "flex", alignItems: "center", gap: 8,
                                }}
                            >
                                <span style={{ fontSize: 14 }}>{col.icon}</span>
                                <div>
                                    <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "#1e293b" }}>{col.label}</p>
                                    <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>Header: {col.key}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: "8px 14px", background: "#fffbeb", borderTop: "1px solid #fde68a" }}>
                        <p style={{ margin: 0, fontSize: 11, color: "#92400e" }}>
                            ⚠️ Column header names must match exactly (case-sensitive) as shown above.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button
                        onClick={handleClose}
                        style={{
                            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                            border: "1px solid #e2e8f0", background: "#fff", color: "#475569", cursor: "pointer"
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file}
                        style={{
                            padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                            border: "none", cursor: file ? "pointer" : "not-allowed",
                            background: file ? "#2563eb" : "#cbd5e1", color: "#fff",
                            transition: "background 0.2s"
                        }}
                    >
                        {loading ? (<Loader2 size={14} color={C.tm} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />) : "upload"}

                    </button>
                </div>

            </div>
        </Modal>
    )
}

export default ExcelUploadModal