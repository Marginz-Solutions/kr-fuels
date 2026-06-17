"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { ChevronDown, Search, Check } from "lucide-react"
import { C } from "@/constants/colors"

// Reusable, on-theme dropdown — a port of the public site's station-locator
// LocationSelect into the admin design system (the `C` palette + inline styles).
// A native <select> can't have its option list styled, so we render our own pill
// button + popup: an optional in-menu search, a brand-highlighted active option
// with a check, and close-on-outside-click / Escape. Used everywhere the admin
// app needs a value picker so every dropdown looks and behaves identically.

export type SelectOption = { value: string; label: string; disabled?: boolean }
type RawOption = string | number | SelectOption

type SelectProps = {
  value: string
  onChange: (value: string) => void
  options: RawOption[]
  /** Label shown on the trigger when no option matches the current value. */
  placeholder?: string
  /** Show the in-menu search box. Defaults to true once the list is long (> 8). */
  searchable?: boolean
  searchPlaceholder?: string
  /** Allow committing a typed value that isn't in the list (combobox behaviour). */
  creatable?: boolean
  ariaLabel?: string
  disabled?: boolean
  /** Render the trigger with an error border (form validation). */
  invalid?: boolean
  /** "sm" = compact toolbar control, "md" = form field (default). */
  size?: "sm" | "md"
  /** Stretch the trigger to fill its container (form fields / grid cells). */
  block?: boolean
  minWidth?: number
  /** Force a wider popup than the trigger (long option labels). */
  menuMinWidth?: number
}

const normalize = (o: RawOption): SelectOption =>
  typeof o === "object" ? { ...o, value: String(o.value), label: o.label } : { value: String(o), label: String(o) }

const MENU_Z = 4000

const Select = ({
  value,
  onChange,
  options,
  placeholder = "Select",
  searchable,
  searchPlaceholder = "Search…",
  creatable = false,
  ariaLabel,
  disabled = false,
  invalid = false,
  size = "md",
  block = false,
  minWidth,
  menuMinWidth,
}: SelectProps) => {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const [query, setQuery] = useState("")
  const [hovered, setHovered] = useState<string | null>(null)
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const items = useMemo(() => options.map(normalize), [options])
  const sm = size === "sm"
  const showSearch = searchable ?? items.length > 8

  const close = useCallback(() => {
    setOpen(false)
    setQuery("")
    setHovered(null)
  }, [])

  // Anchor the fixed-position popup to the trigger. Fixed positioning lets the
  // menu escape any `overflow:hidden` / scroll-clipping ancestor (toolbars,
  // drawers, modals) instead of being cut off inside them.
  const place = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = Math.max(r.width, menuMinWidth ?? r.width)
    const vw = window.innerWidth
    const left = Math.min(Math.max(8, r.left), Math.max(8, vw - 8 - width))
    setPos({ top: r.bottom + 8, left, width })
  }, [menuMinWidth])

  useEffect(() => {
    if (!open) return
    place()
    const reflow = () => place()
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      close()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    // capture:true catches scrolls inside nested scroll containers too.
    window.addEventListener("scroll", reflow, true)
    window.addEventListener("resize", reflow)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("scroll", reflow, true)
      window.removeEventListener("resize", reflow)
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, place, close])

  const selected = items.find((o) => o.value === value)
  const label = selected ? selected.label : value && creatable ? value : placeholder
  const isPlaceholder = !selected && !(value && creatable)

  const term = query.trim().toLowerCase()
  const filtered = useMemo(
    () => (term ? items.filter((o) => o.label.toLowerCase().includes(term)) : items),
    [items, term],
  )
  // Offer to commit a freshly-typed value when nothing matches exactly.
  const showCreate =
    creatable && !!query.trim() && !items.some((o) => o.label.toLowerCase() === term)

  const triggerStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: sm ? 8 : 12,
    width: block ? "100%" : "auto",
    minWidth: minWidth ?? (block ? undefined : sm ? 120 : 160),
    boxSizing: "border-box",
    padding: sm ? "7px 12px" : "10px 16px",
    borderRadius: 9999,
    border: `1px solid ${open || hover ? C.p : invalid ? C.red : C.bd}`,
    background: C.white,
    color: isPlaceholder ? C.tm : C.t,
    fontSize: sm ? 12 : 14,
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: disabled ? "not-allowed" : "pointer",
    outline: "none",
    boxShadow: open ? `0 0 0 3px ${C.p}26` : "none",
    opacity: disabled ? 0.55 : 1,
    transition: "border-color 0.15s, box-shadow 0.15s",
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => !disabled && (open ? close() : setOpen(true))}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={triggerStyle}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <ChevronDown
          size={sm ? 14 : 16}
          color={open ? C.p : C.tm}
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && pos && (
        <div
          ref={menuRef}
          role="listbox"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: MENU_Z,
            overflow: "hidden",
            borderRadius: 16,
            border: `1px solid ${C.bd}`,
            background: C.white,
            boxShadow: "0 12px 40px rgba(13,26,16,0.16)",
          }}
        >
          {showSearch && (
            <div style={{ borderBottom: `1px solid ${C.bd}`, padding: 8 }}>
              <div style={{ position: "relative" }}>
                <Search
                  size={15}
                  color={C.tm}
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "8px 12px 8px 34px",
                    borderRadius: 9999,
                    border: `1px solid ${C.bd}`,
                    background: C.bg,
                    color: C.t,
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.p; e.currentTarget.style.background = C.white }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = C.bd; e.currentTarget.style.background = C.bg }}
                />
              </div>
            </div>
          )}

          <div style={{ maxHeight: 288, overflowY: "auto", padding: 6 }}>
            {filtered.length === 0 && !showCreate ? (
              <div style={{ padding: "24px 12px", textAlign: "center", fontSize: 13, color: C.tm }}>No results</div>
            ) : (
              <>
                {filtered.map((o) => {
                  const active = o.value === value
                  const hot = hovered === o.value && !active
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      disabled={o.disabled}
                      onClick={() => { onChange(o.value); close() }}
                      onMouseEnter={() => setHovered(o.value)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "none",
                        textAlign: "left",
                        fontSize: sm ? 13 : 14,
                        fontWeight: active ? 600 : 500,
                        fontFamily: "inherit",
                        cursor: o.disabled ? "not-allowed" : "pointer",
                        background: active ? C.p : hot ? C.pXLight : "transparent",
                        color: active ? C.white : hot ? C.p : C.tm,
                        opacity: o.disabled ? 0.5 : 1,
                        transition: "background 0.12s, color 0.12s",
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.label}</span>
                      {active && <Check size={15} style={{ flexShrink: 0 }} />}
                    </button>
                  )
                })}

                {showCreate && (
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => { onChange(query.trim()); close() }}
                    onMouseEnter={() => setHovered(null)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      textAlign: "left",
                      fontSize: sm ? 13 : 14,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      background: C.pXLight,
                      color: C.p,
                    }}
                  >
                    Use “{query.trim()}”
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Select
