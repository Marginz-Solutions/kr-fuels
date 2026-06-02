"use client"
import Link from "next/link"
import { Feedback } from "@/types/dust"
import { fmtDate, ListItem, statusColor, statusLabel, Tab } from "../ContactPage"
import { C } from "@/constants/colors"
import { useCallback, useEffect, useState } from "react"
import { Calendar, Check, Loader2, LocateIcon, Mail, MessageSquare, Phone, Star, Tag, Trash2, User, X } from "lucide-react"
import { btn, iconBtn } from "@/styles/shared"
import { Badge } from "@/components/ui"
import { avatarGradient } from "@/lib/avatarColor"

type DrawerProps = {
    item: ListItem | null
    tab: Tab
    onClose: () => void
    resolving: string | null
    deleting: string | null
    resolve: (id: string) => void
    remove: (id: string) => void
}

const isFeedbackItem = (item: ListItem): item is Feedback => "rating" in item

const truncate = (text: string, len = 60) =>
    text?.length > len ? text.slice(0, len) + "..." : text;

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div style={{
        display: "flex",
        gap: 12,
        padding: "14px 0",
        borderBottom: `1px solid ${C.bd}`,
        alignItems: "flex-start",
    }}>
        <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: C.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: C.tm,
        }}>
            {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.tm, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                {label}
            </div>
            <div style={{ fontSize: 13, color: C.t, lineHeight: 1.6, wordBreak: "break-word" }}>
                {value}
            </div>
        </div>
    </div>
)

export const Drawer = ({ item, tab, onClose, resolving, deleting, resolve, remove }: DrawerProps) => {
    const [mounted, setMounted] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (item) {
            setMounted(true)
            requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
        } else {
            setOpen(false)
            const t = setTimeout(() => setMounted(false), 300)
            return () => clearTimeout(t)
        }
    }, [item])

    const handleClose = useCallback(() => {
        setOpen(false)
        setTimeout(onClose, 280)
    }, [onClose])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
        document.addEventListener("keydown", handler)
        return () => document.removeEventListener("keydown", handler)
    }, [handleClose])

    if (!mounted || !item) return null

    const isFb = isFeedbackItem(item)

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(0,0,0,0.32)",
                    zIndex: 999,
                    backdropFilter: "blur(2px)",
                    WebkitBackdropFilter: "blur(2px)",
                    opacity: open ? 1 : 0,
                    transition: "opacity 0.28s ease",
                }}
            />

            {/* Panel */}
            <div style={{
                position: "fixed", top: 0, right: 0, bottom: 0,
                width: 440, maxWidth: "95vw",
                background: C.white,
                zIndex: 1000,
                boxShadow: "-10px 0 44px rgba(26,46,41,0.12)",
                display: "flex", flexDirection: "column",
                transform: open ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
            }}>

                {/* Header */}
                <div style={{
                    padding: "16px 20px",
                    borderBottom: `1px solid ${C.bd}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexShrink: 0,
                    background: C.bg,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: "50%",
                            ...avatarGradient(item.name ?? "?"),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 15, flexShrink: 0,
                        }}>
                            {item.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.t }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: C.tm, marginTop: 1 }}>{item.email}</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {tab === "feedback" && isFb && (
                            <Badge color={statusColor(isFb ? (item ).status : "pending")}>
                                {statusLabel((item).status)}
                            </Badge>
                        )}
                        <button
                            onClick={handleClose}
                            aria-label="Close"
                            style={iconBtn("ghost", 30, { color: C.tm })}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 20px" }}>
                    <DetailRow icon={<User size={14} />} label="Full Name" value={item.name} />
                    <DetailRow
                        icon={<Mail size={14} />}
                        label="Email Address"
                        value={
                            <Link href={`mailto:${item.email}`} style={{ color: C.p, textDecoration: "none" }}>
                                {item.email}
                            </Link>
                        }
                    />

                    {tab === "feedback" && isFb && (
                        <>
                            {(item ).phoneNo && (
                                <DetailRow icon={<Phone size={14} />} label="Phone Number" value={(item ).phoneNo} />
                            )}
                            {(item).category && (
                                <DetailRow icon={<Tag size={14} />} label="Category" value={(item ).category} />
                            )}
                            <DetailRow
                                icon={<Star size={14} />}
                                label="Rating"
                                value={
                                    <span style={{ display: "flex", gap: 2, alignItems: "center" }}>
                                        {Array.from({ length: 5 }, (_, idx) => (
                                            <span key={idx} style={{
                                                fontSize: 18,
                                                color: idx < (item ).rating ? "#f59e0b" : C.bd,
                                                lineHeight: 1,
                                            }}>★</span>
                                        ))}
                                        <span style={{ fontSize: 12, color: C.tm, marginLeft: 6 }}>
                                            {(item).rating} / 5
                                        </span>
                                    </span>
                                }
                            />
                            {(item).stationName && (
                                <DetailRow icon={<LocateIcon size={14} />} label="Station" value={(item ).stationName} />
                            )}
                        </>
                    )}

                    <DetailRow
                        icon={<MessageSquare size={14} />}
                        label="Message"
                        value={<span style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{truncate(item.message)}</span>}
                    />
                    <DetailRow icon={<Calendar size={14} />} label="Submitted" value={fmtDate(item.createdAt)} />
                </div>

                {/* Footer actions */}
                <div style={{
                    padding: "14px 20px",
                    borderTop: `1px solid ${C.bd}`,
                    display: "flex", gap: 8,
                    flexShrink: 0,
                    background: C.bg,
                }}>
                    {tab === "feedback" && isFb && (
                        <button
                            onClick={() => resolve(item.id!)}
                            disabled={resolving === item.id || (item ).status === "resolved"}
                            style={{
                                ...btn("primary"),
                                flex: 1,
                                justifyContent: "center",
                                fontSize: 13,
                                opacity: (item ).status === "resolved" ? 0.45 : 1,
                            }}
                        >
                            {resolving === item.id
                                ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                                : <Check size={13} />
                            }
                            {(item).status === "resolved" ? "Resolved" : "Mark Resolved"}
                        </button>
                    )}
                    <button
                        onClick={() => { remove(item.id!); handleClose() }}
                        disabled={deleting === item.id}
                        style={{ ...btn("ghost"), padding: "8px 16px", color: C.red, fontSize: 13 }}
                    >
                        {deleting === item.id
                            ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                            : <Trash2 size={13} />
                        }
                        Delete
                    </button>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </>
    )
}