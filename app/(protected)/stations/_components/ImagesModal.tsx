import { Modal } from '@/components/ui'
import { btn } from '@/styles/shared'
import { C } from '@/constants/colors'
import React, { useState, useCallback, useEffect } from 'react'
import UploadModal from './UploadModal'
import Pagination from '@/components/ui/Pagination'
import { api } from '@/lib/axios'
import { Pagination as MetaData } from "@/types/dust"
import { StationListSkeleton } from './StationListSkeleton'
import { ImageGridSkeleton } from './ImageGridSkeleton'
import { Station as OriginalStation } from "@/types/dust"
import { toast } from 'sonner'

// ── types ────────────────────────────────────────────────
export type Station = { id: string; stationName: string; imageCount: number, images: string[] }
export type ImageItem = { id: string; url: string, stationId: string }

const LIMIT_OPTIONS = [12, 24, 48]
const ACCENT = '#3b82f6'

// ── component ────────────────────────────────────────────
type ImagesModalProps = { open: boolean; setOpen: (val: boolean) => void, setOriginalStations: React.Dispatch<React.SetStateAction<OriginalStation[]>> }

const ImagesModal = ({ open, setOpen, setOriginalStations }: ImagesModalProps) => {
    const [stations, setStations] = useState<Station[]>([])
    const [images, setImages] = useState<ImageItem[]>([])
    const [imageMeta, setImageMeta] = useState<MetaData>()
    const [uploadOpen, setUploadOpen] = useState(false)
    const [stationSearch, setStationSearch] = useState('')
    const [selectedStation, setSelectedStation] = useState<string | null>(null)
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
    const [lastIndex, setLastIndex] = useState<number | null>(null)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(12)
    const [assigning, setAssigning] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const filteredStations = stations?.filter(s =>
        s.stationName.toLowerCase().includes(stationSearch.toLowerCase())
    )


    const handleDelete = async (image: ImageItem) => {
        setDeletingId(image.id)
        try {
            await api.delete(`/stations/images/${image.id}`, {
                params: {
                    url: image.url
                }
            })
            setImages(prev => prev.filter(img => img.id !== image.id))

            setSelectedImages(prev => {
                const next = new Set(prev)
                next.delete(image.id)
                return next
            })
            toast.success("Image deleted")
        } catch {
            toast.error("Failed to delete image")
        }
        finally {
            setDeletingId(null)
        }
    }


    const fetchData = async () => {
        setStations([])
        setImages([])
        setLoading(true)

        try {
            const [stationsData, imagesData] = await Promise.all([
                api.get("/stations/all"),
                api.get("/stations/images", {
                    params: { page, limit }
                })
            ])

            setStations(stationsData.data.data)
            setImages(imagesData.data.data)
            console.log(imagesData.data.data)
            setImageMeta(imagesData.data.meta)
            setLoading(false)
        } catch (err) {
            console.error("Failed to fetch stations:", err)
        }
    }

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [page, limit, open])

    // ── image selection ──────────────────────────────────
    const handleImageClick = useCallback(
        (e: React.MouseEvent, id: string, idx: number) => {
            if (e.ctrlKey || e.metaKey) {
                setSelectedImages(prev => {
                    const next = new Set(prev)
                    next.has(id) ? next.delete(id) : next.add(id)
                    return next
                })
                setLastIndex(idx)
            } else if (e.shiftKey && lastIndex !== null) {
                const lo = Math.min(lastIndex, idx)
                const hi = Math.max(lastIndex, idx)
                setSelectedImages(prev => {
                    const next = new Set(prev)
                    images.slice(lo, hi + 1).forEach(img => next.add(img.id))
                    return next
                })
            } else {
                setSelectedImages(new Set([id]))
                setLastIndex(idx)
            }
        },
        [lastIndex, images]
    )

    const changePage = (p: number) => {
        setPage(p)
        setSelectedImages(new Set())
        setLastIndex(null)
    }

    const handleAssign = async () => {
        if (!selectedStation || selectedImages.size === 0) return
        try {
            setAssigning(true)

            const response = await api.patch(`/stations/${selectedStation}/images/assign`, {
                imageUrls: images
                    .filter(img => selectedImages.has(img.id))
                    .map(img => img.url),
                imageIds: images
                    .filter(img => selectedImages.has(img.id))
                    .map(img => img.id)
            })
            await fetchData()
            setSelectedImages(new Set())
            setStations(prev => prev.map(p =>
                p.id === selectedStation
                    ? { ...p, images: [...(p.images ?? []), response.data.urls], imageCount: p.imageCount + selectedImages.size }
                    : p
            ))
            setOriginalStations(prev => prev.map(p =>
                p.id === selectedStation
                    ? { ...p, images: [...(p.images ?? []), ...(response.data.urls ?? [])] }
                    : p
            ))
            toast.success("Images Assigned")
        } catch (err) {
            toast.error("Failed")
            console.error("Assign failed:", err)
        } finally {
            setAssigning(false)
        }
    }

    const assignedStation = stations?.find(s => s.id === selectedStation)
    const canAssign = !!selectedStation && selectedImages.size > 0

    return (
        <div>
            <Modal
                open={open}
                title="Images"
                onClose={() => setOpen(false)}
                size="sm-340 md-800 lg-1400"
            >
                <div style={{ display: 'flex', gap: 12, height: '65vh', minHeight: 420 }}>

                    {/* ── LEFT: station list ──────────────────────── */}
                    <div style={{
                        width: 210,
                        minWidth: 160,
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        border: `1px solid ${C.bd}`,
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}>
                        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.bd}` }}>
                            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.t, opacity: 0.45 }}>
                                Stations
                            </p>
                            <input
                                value={stationSearch}
                                onChange={e => setStationSearch(e.target.value)}
                                placeholder="Search…"
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

                        {loading
                            && <StationListSkeleton count={20} />
                        }

                        {!loading && (
                            <div style={{ overflowY: 'auto', flex: 1 }}>
                                {filteredStations.map(station => {
                                    const active = selectedStation === station.id
                                    return (
                                        <div
                                            key={station.id}
                                            onClick={() => setSelectedStation(prev => prev === station.id ? null : station.id)}
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
                                                fontSize: 10,
                                                fontWeight: 500,
                                                color: active ? ACCENT : C.t,
                                                opacity: active ? 1 : 0.4,
                                                background: active ? `${ACCENT}20` : `${C.bd}`,
                                                padding: '2px 6px',
                                                borderRadius: 10,
                                                marginLeft: 6,
                                                flexShrink: 0,
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
                    </div>

                    {/* ── RIGHT: images ───────────────────────────── */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>

                        {/* toolbar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {selectedImages.size > 0 ? (
                                    <>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>{selectedImages.size}</span>
                                        <span style={{ fontSize: 13, color: C.t, opacity: 0.5 }}>selected</span>
                                        <button
                                            style={{ ...btn('ghost'), padding: '3px 8px', fontSize: 11, marginLeft: 4 }}
                                            onClick={() => setSelectedImages(new Set())}
                                        >
                                            Clear
                                        </button>
                                    </>
                                ) : (
                                    <span style={{ fontSize: 12, color: C.t, opacity: 0.4 }}>
                                        Click · Shift+click · Ctrl+click
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 11, color: C.t, opacity: 0.45 }}>Per page</span>
                                {LIMIT_OPTIONS.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => { setLimit(opt); changePage(1) }}
                                        style={{
                                            ...btn(limit === opt ? 'primary' : 'ghost'),
                                            padding: '3px 9px',
                                            fontSize: 12,
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                                <div style={{ width: 1, height: 18, background: C.bd, margin: '0 2px' }} />
                                <button style={{ ...btn(), padding: '4px 12px', fontSize: 13 }} onClick={() => setUploadOpen(true)}>
                                    + Upload
                                </button>
                            </div>
                        </div>

                        {loading && (
                            <ImageGridSkeleton count={50} />
                        )}

                        {/* image grid */}
                        {!loading && (
                            <div
                                style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: 8,
                                    alignContent: 'start',
                                    padding: 2,
                                }}
                            >
                                {images.map((img, idx) => {
                                    const isSelected = selectedImages.has(img.id)
                                    return (
                                        <div
                                            key={img.id}
                                            onClick={e => handleImageClick(e, img.id, idx)}
                                            style={{
                                                position: 'relative',
                                                aspectRatio: '1',
                                                borderRadius: 7,
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: isSelected ? `2.5px solid ${ACCENT}` : `2.5px solid transparent`,
                                                boxSizing: 'border-box',
                                                userSelect: 'none',
                                                transition: 'border-color 0.1s',
                                            }}
                                            className="img-tile"
                                        >
                                            <img
                                                src={img.url}
                                                alt="image"
                                                draggable={false}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            />

                                            {/* Delete button — visible on hover when NOT selected */}
                                            {!isSelected && (
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation()
                                                        handleDelete(img)
                                                    }}
                                                    disabled={deletingId === img.id}
                                                    className="delete-btn"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 5,
                                                        right: 5,
                                                        width: 22,
                                                        height: 22,
                                                        borderRadius: '50%',
                                                        background: 'rgba(0,0,0,0.55)',
                                                        border: 'none',
                                                        cursor: deletingId === img.id ? 'not-allowed' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 0,
                                                        opacity: 0,
                                                        transition: 'opacity 0.15s, background 0.15s',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {deletingId === img.id ? (
                                                        // Spinner
                                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                                                            style={{ animation: 'spin 0.7s linear infinite' }}>
                                                            <circle cx="5" cy="5" r="4" stroke="#fff" strokeWidth="1.6"
                                                                strokeDasharray="16" strokeDashoffset="6" strokeLinecap="round" />
                                                        </svg>
                                                    ) : (
                                                        // X icon
                                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                            <path d="M1 1l8 8M9 1L1 9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                                                        </svg>
                                                    )}
                                                </button>
                                            )}

                                            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

                                            {/* Selection overlay — visible when selected */}
                                            {isSelected && (
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: `${ACCENT}22`,
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    justifyContent: 'flex-end',
                                                    padding: 5,
                                                }}>
                                                    <div style={{
                                                        width: 18,
                                                        height: 18,
                                                        borderRadius: '50%',
                                                        background: ACCENT,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}>
                                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                            <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                <style>{`
    .img-tile:hover .delete-btn { opacity: 1 !important; }
    .delete-btn:hover { background: rgba(220,38,38,0.85) !important; }
`}</style>
                            </div>
                        )}

                        {/* pagination + assign row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>

                            {/* pagination */}
                            <div>
                                <Pagination
                                    meta={{
                                        total: imageMeta?.total!,
                                        page,
                                        limit,
                                        totalPages: imageMeta?.totalPages!,
                                        hasNextPage: page < imageMeta?.totalPages!,
                                        hasPrevPage: page > 1,
                                    }}
                                    page={page}
                                    onPageChange={changePage}
                                />
                            </div>

                            {/* assign button */}
                            <button
                                disabled={!canAssign || assigning}
                                onClick={handleAssign}
                                style={{
                                    ...btn(canAssign ? 'primary' : 'ghost'),
                                    padding: '6px 14px',
                                    fontSize: 13,
                                    opacity: canAssign && !assigning ? 1 : 0.45,
                                    maxWidth: 320,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {assigning
                                    ? `Assigning…`
                                    : canAssign
                                        ? `Assign ${selectedImages.size} image${selectedImages.size > 1 ? 's' : ''} → ${assignedStation?.stationName}`
                                        : 'Select images & a station to assign'}
                            </button>

                        </div>
                    </div>
                </div>
            </Modal>

            <UploadModal open={uploadOpen} setOpen={setUploadOpen} stations={stations} setStations={setStations} fetchData={fetchData} setOriginalStations={setOriginalStations} />
        </div>
    )
}

export default ImagesModal