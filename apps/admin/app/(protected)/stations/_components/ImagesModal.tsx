import { Modal } from '@/components/ui'
import { btn } from '@/styles/shared'
import { C } from '@/constants/colors'
import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import UploadModal from './UploadModal'
import { api } from '@/lib/axios'
import { StationListSkeleton } from './StationListSkeleton'
import { ImageGridSkeleton } from './ImageGridSkeleton'
import { Station as OriginalStation } from "@/types/dust"
import { toast } from 'sonner'
import { PanelLeftClose, PanelLeftOpen, LayoutGrid, Upload, Trash2, Loader2 } from 'lucide-react'
// ── types ────────────────────────────────────────────────
export type Station = { id: string; stationName: string; imageCount: number, images: string[] }
export type ImageItem = { id: string; url: string, stationId: string }

const ACCENT = '#3b82f6'

// Left-rail views: "all" = every station's images; otherwise a stationId.
const ALL = 'all'
type View = typeof ALL | string

// ── component ────────────────────────────────────────────
// Read-only gallery of existing station images. Uploading + assigning to a
// station lives in the Upload modal; here you can browse and remove (select →
// Delete → confirm).
type ImagesModalProps = { open: boolean; setOpen: (val: boolean) => void, setOriginalStations: React.Dispatch<React.SetStateAction<OriginalStation[]>> }

const ImagesModal = ({ open, setOpen, setOriginalStations }: ImagesModalProps) => {
    const [stations, setStations] = useState<Station[]>([])
    const [uploadOpen, setUploadOpen] = useState(false)
    const [stationSearch, setStationSearch] = useState('')
    const [view, setView] = useState<View>(ALL)
    const [loading, setLoading] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [selected, setSelected] = useState<Set<string>>(new Set())  // selected image ids
    const [lastIndex, setLastIndex] = useState<number | null>(null)    // anchor for shift-range
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const filteredStations = stations?.filter(s =>
        s.stationName.toLowerCase().includes(stationSearch.toLowerCase())
    )

    // A station's images are authoritative URL strings on the station doc (what the
    // public site renders); synthesise stable, source-tagged items for the grid.
    const stationItems = (s: Station): ImageItem[] =>
        (s.images ?? []).map(url => ({ id: `${s.id}::${url}`, url, stationId: s.id }))

    const viewedStation = view !== ALL ? stations?.find(s => s.id === view) : undefined

    const displayedImages: ImageItem[] = useMemo(() => {
        if (view === ALL) return stations.flatMap(stationItems)
        return viewedStation ? stationItems(viewedStation) : []
    }, [view, stations, viewedStation])

    const allCount = useMemo(
        () => stations.reduce((n, s) => n + (s.images?.length ?? 0), 0),
        [stations]
    )

    const clearSelection = () => { setSelected(new Set()); setLastIndex(null) }

    // Switch the right panel and drop any in-progress selection.
    const changeView = (v: View) => { setView(v); clearSelection() }

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await api.get("/stations/all")
            setStations(res.data.data)
        } catch (err) {
            console.error("Failed to fetch images:", err)
            toast.error("Failed to load images")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            setView(ALL)
            clearSelection()
            fetchData()
        }
    }, [open])

    // Click toggles selection; Shift+click selects the range from the last anchor.
    const handleImageClick = (e: React.MouseEvent, id: string, idx: number) => {
        if (e.shiftKey && lastIndex !== null) {
            const lo = Math.min(lastIndex, idx)
            const hi = Math.max(lastIndex, idx)
            setSelected(prev => {
                const next = new Set(prev)
                displayedImages.slice(lo, hi + 1).forEach(img => next.add(img.id))
                return next
            })
        } else {
            setSelected(prev => {
                const next = new Set(prev)
                next.has(id) ? next.delete(id) : next.add(id)
                return next
            })
            setLastIndex(idx)
        }
    }

    // Remove every selected image from its station (drops the URL from
    // station.images, keeping the live site consistent).
    const handleConfirmDelete = async () => {
        const items = displayedImages.filter(i => selected.has(i.id))
        if (!items.length) return
        setDeleting(true)

        const results = await Promise.allSettled(items.map(img =>
            api.delete(`/stations/${img.stationId}/images`, { data: { imageUrl: img.url } })
        ))

        // Collect successfully-removed URLs per station.
        const removed = new Map<string, Set<string>>()
        let failures = 0
        items.forEach((img, i) => {
            if (results[i].status === 'fulfilled') {
                if (!removed.has(img.stationId)) removed.set(img.stationId, new Set())
                removed.get(img.stationId)!.add(img.url)
            } else {
                failures++
            }
        })

        if (removed.size) {
            setStations(prev => prev.map(s => {
                const set = removed.get(s.id)
                if (!set) return s
                const imgs = (s.images ?? []).filter(u => !set.has(u))
                return { ...s, images: imgs, imageCount: imgs.length }
            }))
            setOriginalStations(prev => prev.map(p => {
                const set = p.id ? removed.get(p.id) : undefined
                if (!set) return p
                return { ...p, images: (p.images ?? []).filter(u => !set.has(u)) }
            }))
        }

        const okCount = items.length - failures
        clearSelection()
        setConfirmOpen(false)
        setDeleting(false)
        if (failures === 0) toast.success(`${okCount} image${okCount > 1 ? 's' : ''} removed`)
        else if (okCount === 0) toast.error("Failed to remove images")
        else toast.error(`${okCount} removed · ${failures} failed`)
    }

    const headerLabel =
        view === ALL ? `All images · ${allCount}` : `${viewedStation?.stationName ?? 'Station'} · ${displayedImages.length}`

    return (
        <div>
            <Modal
                open={open}
                title="Images"
                onClose={() => setOpen(false)}
                size="sm-340 md-800 lg-1400"
            >
                <div style={{ display: 'flex', gap: 12, height: '65vh', minHeight: 420 }}>

                    {/* ── LEFT: views (All / stations) ── */}
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
                            justifyContent: 'space-between',
                            gap: 8,
                        }}>
                            {sidebarOpen && (
                                <>
                                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.t, opacity: 0.45, whiteSpace: 'nowrap' }}>
                                        Library
                                    </p>
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                        aria-label="Collapse sidebar"
                                        title="Collapse sidebar"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: C.t, opacity: 0.45, display: 'flex', flexShrink: 0 }}
                                    >
                                        <PanelLeftClose size={15} />
                                    </button>
                                </>
                            )}

                            {!sidebarOpen && (
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    aria-label="Expand sidebar"
                                    title="Expand sidebar"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: C.t, opacity: 0.45, display: 'flex', margin: '0 auto' }}
                                >
                                    <PanelLeftOpen size={15} />
                                </button>
                            )}
                        </div>

                        {/* Search — only when open */}
                        {sidebarOpen && (
                            <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.bd}` }}>
                                <input
                                    value={stationSearch}
                                    onChange={e => setStationSearch(e.target.value)}
                                    placeholder="Search stations…"
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        padding: '5px 8px',
                                        fontSize: 12,
                                        border: `1px solid ${C.bd}`,
                                        borderRadius: 6,
                                        background: 'transparent',
                                        color: C.t,
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        )}

                        {/* List */}
                        {sidebarOpen && (
                            <>
                                {loading && <StationListSkeleton count={20} />}
                                {!loading && (
                                    <div style={{ overflowY: 'auto', flex: 1 }}>
                                        {/* All images */}
                                        {(() => {
                                            const active = view === ALL
                                            return (
                                                <div
                                                    onClick={() => changeView(ALL)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '9px 12px 9px 14px', cursor: 'pointer',
                                                        borderLeft: `3px solid ${active ? ACCENT : 'transparent'}`,
                                                        borderBottom: `1px solid ${C.bd}`,
                                                        background: active ? `${ACCENT}12` : 'transparent',
                                                        transition: 'background 0.12s',
                                                    }}
                                                >
                                                    <span style={{ fontSize: 13, color: C.t, fontWeight: active ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                        <LayoutGrid size={13} style={{ opacity: 0.6 }} /> All images
                                                    </span>
                                                    <span style={{
                                                        fontSize: 10, fontWeight: 500,
                                                        color: active ? ACCENT : C.t, opacity: active ? 1 : 0.4,
                                                        background: active ? `${ACCENT}20` : C.bd,
                                                        padding: '2px 6px', borderRadius: 10, marginLeft: 6, flexShrink: 0,
                                                    }}>
                                                        {allCount}
                                                    </span>
                                                </div>
                                            )
                                        })()}

                                        {filteredStations.map(station => {
                                            const active = view === station.id
                                            return (
                                                <div
                                                    key={station.id}
                                                    onClick={() => changeView(station.id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '9px 12px 9px 14px',
                                                        cursor: 'pointer',
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
                                                        color: active ? ACCENT : C.t,
                                                        opacity: active ? 1 : 0.4,
                                                        background: active ? `${ACCENT}20` : C.bd,
                                                        padding: '2px 6px', borderRadius: 10,
                                                        marginLeft: 6, flexShrink: 0,
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
                                )}
                            </>
                        )}
                    </div>

                    {/* ── RIGHT: images ───────────────────────────── */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, minHeight: 0 }}>

                        {/* Toolbar — selection actions take over once images are selected */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, flexShrink: 0, minHeight: 32 }}>
                            {selected.size > 0 ? (
                                <>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>
                                        {selected.size} selected
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <button
                                            onClick={() => setConfirmOpen(true)}
                                            style={{ ...btn('danger'), padding: '5px 14px', fontSize: 13 }}
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                        <button
                                            onClick={clearSelection}
                                            style={{ ...btn('ghost'), padding: '5px 14px', fontSize: 13 }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span style={{ fontSize: 13, color: C.t, opacity: 0.55, fontWeight: 600 }}>
                                        {headerLabel}
                                    </span>
                                    <button style={{ ...btn(), padding: '4px 12px', fontSize: 13 }} onClick={() => setUploadOpen(true)}>
                                        <Upload size={14} />Upload
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Scrollable image area */}
                        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                            {loading && <ImageGridSkeleton count={50} />}

                            {!loading && (
                                <>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                        gap: 8,
                                        padding: 2,
                                    }}>
                                        {displayedImages.map((img, idx) => {
                                            const isSelected = selected.has(img.id)
                                            return (
                                                <div
                                                    key={img.id}
                                                    onClick={e => handleImageClick(e, img.id, idx)}
                                                    style={{
                                                        position: 'relative',
                                                        aspectRatio: '1',
                                                        width: '100%',
                                                        minWidth: 0,
                                                        borderRadius: 7,
                                                        overflow: 'hidden',
                                                        cursor: 'pointer',
                                                        userSelect: 'none',
                                                        border: isSelected ? `2.5px solid ${ACCENT}` : `1px solid ${C.bd}`,
                                                        boxSizing: 'border-box',
                                                        transition: 'border-color 0.1s',
                                                    }}
                                                    className="img-tile"
                                                >
                                                    <Image
                                                        src={img.url}
                                                        alt=""
                                                        fill
                                                        sizes="160px"
                                                        draggable={false}
                                                        style={{ objectFit: 'cover' }}
                                                    />

                                                    {/* selection check — filled when selected, faint ring on hover */}
                                                    <div
                                                        className="select-badge"
                                                        style={{
                                                            position: 'absolute', top: 6, left: 6,
                                                            width: 18, height: 18, borderRadius: '50%',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            background: isSelected ? ACCENT : 'rgba(255,255,255,0.75)',
                                                            border: isSelected ? 'none' : `1.5px solid ${C.bd}`,
                                                            opacity: isSelected ? 1 : 0,
                                                            transition: 'opacity 0.12s',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {isSelected && (
                                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                                <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>

                                                    {isSelected && (
                                                        <div style={{ position: 'absolute', inset: 0, background: `${ACCENT}1f`, pointerEvents: 'none' }} />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {displayedImages.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.t, opacity: 0.4, fontSize: 13 }}>
                                            {view === ALL ? 'No images yet' : 'This station has no images yet'}
                                        </div>
                                    )}

                                    <style>{`
          .img-tile:hover .select-badge { opacity: 1; }
        `}</style>
                                </>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div style={{ flexShrink: 0, borderTop: `1px solid ${C.bd}`, paddingTop: 10 }}>
                            <span style={{ fontSize: 12, color: C.t, opacity: 0.5 }}>
                                {selected.size > 0
                                    ? 'Shift-click to select a range. Use Delete to remove the selected images.'
                                    : 'Click images to select them, then Delete. Use “Upload” to add images to a station.'}
                            </span>
                        </div>

                    </div>
                </div>
            </Modal>

            {/* Delete confirmation */}
            <Modal
                open={confirmOpen}
                title="Delete images?"
                onClose={() => { if (!deleting) setConfirmOpen(false) }}
                width={420}
            >
                <p style={{ margin: 0, fontSize: 14, color: C.t, lineHeight: 1.5 }}>
                    Remove <b>{selected.size}</b> selected image{selected.size > 1 ? 's' : ''} from
                    {view === ALL ? ' their station(s)' : ` ${viewedStation?.stationName ?? 'this station'}`}?
                    This removes {selected.size > 1 ? 'them' : 'it'} from the website too.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                    <button
                        onClick={() => setConfirmOpen(false)}
                        disabled={deleting}
                        style={{ ...btn('ghost'), padding: '7px 16px', fontSize: 13, opacity: deleting ? 0.5 : 1 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        disabled={deleting}
                        style={{ ...btn('danger'), padding: '7px 16px', fontSize: 13, opacity: deleting ? 0.6 : 1 }}
                    >
                        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        {deleting ? 'Deleting…' : `Delete ${selected.size}`}
                    </button>
                </div>
            </Modal>

            <UploadModal
                open={uploadOpen}
                setOpen={setUploadOpen}
                stations={stations}
                setStations={setStations}
                fetchData={fetchData}
                setOriginalStations={setOriginalStations}
                defaultStation={view !== ALL ? view : null}
            />
        </div>
    )
}

export default ImagesModal
