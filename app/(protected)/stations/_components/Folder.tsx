"use client"

import { useState } from "react"

export type FolderColor = "amber" | "blue" | "teal" | "purple" | "gray"

export type FolderProps = {
  label: string
  count?: number
  badge?: number
  color?: FolderColor
  onClick?: () => void
  size?: "sm" | "md" | "lg"
}

const PALETTE: Record<FolderColor, { back: string; front: string; line: string; hoverBack: string; hoverFront: string }> = {
  amber:  { back: "#EF9F27", front: "#FAC775", line: "#EF9F27", hoverBack: "#BA7517", hoverFront: "#FAEEDA" },
  blue:   { back: "#378ADD", front: "#85B7EB", line: "#378ADD", hoverBack: "#185FA5", hoverFront: "#B5D4F4" },
  teal:   { back: "#1D9E75", front: "#5DCAA5", line: "#1D9E75", hoverBack: "#0F6E56", hoverFront: "#9FE1CB" },
  purple: { back: "#7F77DD", front: "#AFA9EC", line: "#7F77DD", hoverBack: "#534AB7", hoverFront: "#CECBF6" },
  gray:   { back: "#888780", front: "#B4B2A9", line: "#888780", hoverBack: "#5F5E5A", hoverFront: "#D3D1C7" },
}

const SIZES = {
  sm: { width: 72,  bodyH: 54, backH: 48, frontH: 39, tabW: 32, tabH: 10, lineW: 38, line2W: 28, label: 11, radius: 6 },
  md: { width: 96,  bodyH: 72, backH: 64, frontH: 52, tabW: 44, tabH: 14, lineW: 52, line2W: 40, label: 12, radius: 8 },
  lg: { width: 120, bodyH: 90, backH: 80, frontH: 65, tabW: 56, tabH: 16, lineW: 64, line2W: 48, label: 13, radius: 10 },
}

const Folder = ({
  label,
  count,
  badge,
  color = "amber",
  onClick,
  size = "md",
}: FolderProps) => {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const p = PALETTE[color]
  const s = SIZES[size]

  const backColor  = hovered ? p.hoverBack  : p.back
  const frontColor = hovered ? p.hoverFront : p.front
  const liftFront  = pressed || hovered

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        position: "relative",
        width: s.width,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Folder shape */}
      <div style={{ position: "relative", width: s.width, height: s.bodyH }}>

        {/* Tab */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: s.tabW,
          height: s.tabH,
          background: backColor,
          borderRadius: `${s.radius}px ${s.radius}px 0 0`,
          transition: "background 0.15s",
        }} />

        {/* Back panel */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: s.width,
          height: s.backH,
          background: backColor,
          borderRadius: `0 ${s.radius}px ${s.radius}px ${s.radius}px`,
          transition: "background 0.15s",
        }} />

        {/* Front panel */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: s.width,
          height: s.frontH,
          background: frontColor,
          borderRadius: `0 4px ${s.radius}px ${s.radius}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          transform: liftFront ? "translateY(-6px) rotate(-2deg)" : "none",
          transition: "background 0.15s, transform 0.18s cubic-bezier(0.4,0,0.2,1)",
          transformOrigin: "bottom left",
        }}>
          {/* Document lines */}
          <div style={{ width: s.lineW,  height: 1.5, background: p.line, borderRadius: 2, opacity: color === "gray" && count === 0 ? 0.45 : 1 }} />
          <div style={{ width: s.line2W, height: 1.5, background: p.line, borderRadius: 2, opacity: color === "gray" && count === 0 ? 0.35 : 0.75 }} />
        </div>

        {/* Badge */}
        {badge !== undefined && badge > 0 && (
          <div style={{
            position: "absolute",
            top: -4,
            right: -6,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            background: "#E24B4A",
            color: "#fff",
            fontSize: 10,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            boxSizing: "border-box",
            zIndex: 2,
            fontFamily: "inherit",
          }}>
            {badge > 99 ? "99+" : badge}
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{
        marginTop: 8,
        fontSize: s.label,
        fontWeight: 500,
        color: "var(--color-text-primary)",
        textAlign: "center",
        maxWidth: s.width,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}>
        {label}
      </div>

      {/* File count */}
      {count !== undefined && (
        <div style={{
          fontSize: s.label - 1,
          color: "var(--color-text-secondary)",
          textAlign: "center",
          marginTop: 2,
          fontFamily: "inherit",
        }}>
          {count === 0 ? "Empty" : `${count} file${count === 1 ? "" : "s"}`}
        </div>
      )}
    </div>
  )
}

export default Folder