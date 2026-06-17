import { Modal } from '@/components/ui'
import { btn } from '@/styles/shared'
import { C } from '@/constants/colors'
import React, { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent, SetStateAction } from 'react'
import { Station } from './ImagesModal'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import { PanelLeftClose, PanelLeftOpen, Check, ArrowUp } from 'lucide-react'
import { Station as OriginalStation } from "@/types/dust"

type UploadFile = {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
}


const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ACCENT = '#3b82f6'

type UploadModalProps = {
  open: boolean; setOpen: (val: boolean) => void, stations: Station[], setStations: React.Dispatch<SetStateAction<Station[]>>, fetchData: () => Promise<void>,
  setOriginalStations: React.Dispatch<React.SetStateAction<OriginalStation[]>>,
  defaultStation?: string | null
}

const UploadModal = ({ open, setOpen, stations, setStations, fetchData, setOriginalStations, defaultStation = null }: UploadModalProps) => {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [stationSearch, setStationSearch] = useState('')
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Preselect the station the user was viewing in the Images modal, so "Upload"
  // from a station's gallery targets that station out of the box.
  useEffect(() => {
    if (open) setSelectedStation(defaultStation)
  }, [open, defaultStation])

  const filteredStations = stations?.filter(s =>
    s.stationName.toLowerCase().includes(stationSearch.toLowerCase())
  )

  const toUploadFile = (file: File): UploadFile => ({
    id: `${file.name}-${file.size}-${Date.now()}`,
    file,
    preview: URL.createObjectURL(file),
    status: 'pending',
    progress: 0,
  })

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter(f => ACCEPTED.includes(f.type))
    if (!valid.length) return
    setFiles(prev => {
      const existingNames = new Set(prev.map(f => f.file.name))
      return [...prev, ...valid.filter(f => !existingNames.has(f.name)).map(toUploadFile)]
    })
  }, [])

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id))

  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = (e: DragEvent) => { e.preventDefault(); setDragging(false) }
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }

  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    if (!pendingFiles.length) return
    if (!selectedStation) {
      toast.error("Select a station to upload to")
      return
    }

    const formData = new FormData()
    pendingFiles.forEach(f => formData.append('images', f.file))
    formData.append('data', JSON.stringify({ stationId: selectedStation }))

    setFiles(prev => prev.map(p =>
      p.status === 'pending' ? { ...p, status: 'uploading', progress: 0 } : p
    ))

    try {
      const response = await api.post('/stations/upload/images', formData, {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / (e.total ?? 1))
          setFiles(prev => prev.map(p =>
            p.status === 'uploading' ? { ...p, progress: percent } : p
          ))
        }
      })

      setFiles(prev => prev.map(p =>
        p.status === 'uploading' ? { ...p, status: 'done', progress: 100 } : p
      ))

      // response.data.images is the array of saved {id,url,…}; pull the URLs so the
      // parent station list reflects the new images immediately (only when assigned).
      const uploadedUrls: string[] = (response.data.images ?? []).map((img: { url: string }) => img.url)
      await fetchData()
      if (selectedStation) {
        setOriginalStations(prev => prev.map(p =>
          p.id === selectedStation
            ? { ...p, images: [...(p.images ?? []), ...uploadedUrls] }
            : p
        ))
      }

      toast.success("Uploaded & assigned")

      setFiles([])

    } catch (err) {
      toast.error("Failed")
      console.error('Upload failed:', err)
      setFiles(prev => prev.map(p =>
        p.status === 'uploading' ? { ...p, status: 'error', progress: 0 } : p
      ))
    }
  }

  const pendingCount = files.filter(f => f.status === 'pending').length
  const uploadingCount = files.filter(f => f.status === 'uploading').length
  const doneCount = files.filter(f => f.status === 'done').length
  const activeStation = stations.find(s => s.id === selectedStation)
  const canUpload = pendingCount > 0 && !!selectedStation

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

  return (
    <Modal open={open} title="Upload Images" onClose={() => setOpen(false)} size="sm-340 md-800 lg-1200">
      <div style={{ display: 'flex', gap: 12, height: '65vh', minHeight: 420 }}>

        {/* ── LEFT: station list ──────────────────────── */}
        <div style={{
          width: sidebarOpen ? 210 : 40,
          minWidth: sidebarOpen ? 160 : 40,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${C.bd}`,
          borderRadius: 8,
          overflow: 'hidden',
          transition: 'width 0.2s ease, min-width 0.2s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '10px 12px',
            borderBottom: `1px solid ${C.bd}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'space-between' : 'center',
            gap: 8,
          }}>
            {sidebarOpen ? (
              <>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.t, opacity: 0.45, whiteSpace: 'nowrap' }}>
                  Upload to <span style={{ color: C.red, opacity: 0.8 }}>*</span>
                </p>
                <button onClick={() => setSidebarOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: C.t, opacity: 0.45, display: 'flex', flexShrink: 0 }}>
                  <PanelLeftClose size={15} />
                </button>
              </>
            ) : (
              <button onClick={() => setSidebarOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: C.t, opacity: 0.45, display: 'flex' }}>
                <PanelLeftOpen size={15} />
              </button>
            )}
          </div>

          {sidebarOpen && (
            <>
              {/* Search */}
              <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.bd}` }}>
                <input
                  value={stationSearch}
                  onChange={e => setStationSearch(e.target.value)}
                  placeholder="Search…"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '5px 8px', fontSize: 12,
                    border: `1px solid ${C.bd}`, borderRadius: 6,
                    background: 'transparent', color: C.t, outline: 'none',
                  }}
                />
              </div>

              {/* List */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {filteredStations.map(station => {
                  const active = selectedStation === station.id
                  return (
                    <div
                      key={station.id}
                      onClick={() => setSelectedStation(station.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 12px 9px 14px', cursor: 'pointer',
                        borderLeft: `3px solid ${active ? ACCENT : 'transparent'}`,
                        borderBottom: `1px solid ${C.bd}`,
                        background: active ? `${ACCENT}12` : 'transparent',
                        transition: 'background 0.12s',
                      }}
                    >
                      <span style={{ fontSize: 13, color: C.t, fontWeight: active ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {station.stationName}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 500,
                        color: active ? ACCENT : C.t, opacity: active ? 1 : 0.4,
                        background: active ? `${ACCENT}20` : C.bd,
                        padding: '2px 6px', borderRadius: 10, marginLeft: 6, flexShrink: 0,
                      }}>
                        {station.imageCount}
                      </span>
                    </div>
                  )
                })}
                {filteredStations.length === 0 && (
                  <p style={{ fontSize: 12, color: C.t, opacity: 0.4, textAlign: 'center', padding: '20px 12px', margin: 0 }}>
                    No stations found
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT: upload ───────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>

          {/* drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? ACCENT : C.bd}`,
              borderRadius: 10,
              padding: '26px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              background: dragging ? `${ACCENT}08` : 'transparent',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={dragging ? ACCENT : C.t}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: dragging ? 1 : 0.35 }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.t, opacity: dragging ? 1 : 0.7 }}>
              {dragging ? 'Drop images here' : 'Drag & drop images'}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: C.t, opacity: 0.4 }}>
              or click to browse · JPG, PNG, WEBP, GIF
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED.join(',')}
              style={{ display: 'none' }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => e.target.files && addFiles(e.target.files)}
            />
          </div>

          {/* file list */}
          {files.length > 0 && (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {files.map(f => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  border: `1px solid ${C.bd}`, borderRadius: 8,
                  background: f.status === 'done' ? '#22c55e10' : f.status === 'error' ? '#ef444410' : 'transparent',
                }}>
                  {/* Local object-URL preview — next/image can't optimize blob: URLs */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.preview} alt={f.file.name}
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: C.t, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.file.name}
                      </span>
                      <span style={{ fontSize: 11, color: C.t, opacity: 0.4, flexShrink: 0 }}>{formatSize(f.file.size)}</span>
                    </div>
                    {(f.status === 'uploading' || f.status === 'done') && (
                      <div style={{ marginTop: 5, height: 3, borderRadius: 99, background: C.bd, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${f.progress}%`, borderRadius: 99,
                          background: f.status === 'done' ? '#22c55e' : ACCENT,
                          transition: 'width 0.25s ease',
                        }} />
                      </div>
                    )}
                    <div style={{ marginTop: 3, fontSize: 11 }}>
                      {f.status === 'pending' && <span style={{ color: C.t, opacity: 0.4 }}>Ready to upload</span>}
                      {f.status === 'uploading' && <span style={{ color: ACCENT }}>{f.progress}%</span>}
                      {f.status === 'done' && <span style={{ color: '#22c55e' }}>Uploaded</span>}
                      {f.status === 'error' && <span style={{ color: '#ef4444' }}>Failed — retry</span>}
                    </div>
                  </div>
                  {f.status !== 'uploading' && (
                    <button onClick={() => removeFile(f.id)}
                      style={{ ...btn('ghost'), padding: 4, flexShrink: 0, opacity: 0.45 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M2 2l10 10M12 2L2 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {files.length === 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 12, color: C.t, opacity: 0.3, margin: 0 }}>No files selected</p>
            </div>
          )}

          {/* footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 8, paddingTop: 10, borderTop: `1px solid ${C.bd}`,
          }}>
            <div style={{ display: 'flex', gap: 14 }}>
              {files.length > 0 && (
                <span style={{ fontSize: 12, color: C.t, opacity: 0.5 }}>
                  <b style={{ opacity: 1 }}>{files.length}</b> file{files.length > 1 ? 's' : ''}
                </span>
              )}
              {doneCount > 0 && <span style={{ fontSize: 12, color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check size={13} /> {doneCount} uploaded</span>}
              {uploadingCount > 0 && <span style={{ fontSize: 12, color: ACCENT, display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowUp size={13} /> {uploadingCount} uploading…</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {pendingCount > 0 && (
                <button style={{ ...btn('ghost'), padding: '5px 12px', fontSize: 12, opacity: 0.5 }} onClick={() => setFiles([])}>
                  Clear all
                </button>
              )}
              <button
                disabled={!canUpload}
                onClick={handleUpload}
                style={{ ...btn(canUpload ? 'primary' : 'ghost'), padding: '6px 18px', fontSize: 13, opacity: canUpload ? 1 : 0.4 }}
              >
                {pendingCount === 0
                  ? 'All uploaded'
                  : !selectedStation
                    ? 'Select a station'
                    : `Upload ${pendingCount} → ${activeStation?.stationName}`}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Modal>
  )
}

export default UploadModal