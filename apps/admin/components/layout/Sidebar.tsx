"use client";
import type { FC } from "react";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { C } from "../../constants/colors";
import { NAV } from "../../constants/navigation";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  /** Mobile (<768px) renders the sidebar as an off-canvas drawer. */
  isMobile?: boolean;
  mobileOpen?: boolean;
  setMobileOpen?: (v: boolean) => void;
}

const Sidebar: FC<SidebarProps> = ({ collapsed, setCollapsed, isMobile = false, mobileOpen = false, setMobileOpen }) => {
  const pathname = usePathname();
  // On mobile the drawer is always full-width (never the collapsed rail).
  const isCollapsed = isMobile ? false : collapsed;

  return (
    <aside
      style={{
        width: isCollapsed ? 76 : 256,
        background: C.white,
        borderRight: `1px solid ${C.bd}`,
        display: "flex",
        flexDirection: "column",
        transition: isMobile ? "transform 0.25s ease" : "width 0.25s ease",
        overflow: "hidden",
        flexShrink: 0,
        ...(isMobile
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              height: "100dvh",
              zIndex: 300,
              transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
              boxShadow: mobileOpen ? "0 0 40px rgba(13,26,16,0.18)" : "none",
            }
          : { minHeight: "100vh" }),
      }}
    >
      {/* Brand lockup — height matches the Topbar (64px) so both headers align. */}
      <div
        style={{
          padding: isCollapsed ? "0" : "0 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: `1px solid ${C.bd}`,
          height: 64,
          justifyContent: isCollapsed ? "center" : "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div
            style={{
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              margin: isCollapsed ? "0 auto" : 0,
            }}
          >
            {/* Intrinsic 102×81 keeps the natural aspect ratio; height is fixed and width follows it (no squish). */}
            <Image src="/assets/logo.png" alt="KR Trans Fuels" width={102} height={81} style={{ height: 38, width: "auto" }} priority />
          </div>
          {!isCollapsed && (
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ color: C.t, fontWeight: 800, fontSize: 15 }}>K.R Trans Fuels</div>
              <div style={{ color: C.tm, fontSize: 11, fontWeight: 500, letterSpacing: "0.02em" }}>Admin Panel</div>
            </div>
          )}
        </div>
        {isMobile && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen?.(false)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 9999, border: "none",
              background: "transparent", color: C.tm, cursor: "pointer", flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: isCollapsed ? "12px 0" : "14px 10px", overflowY: "auto" }}>
        {NAV.map(({ id, label, icon: Icon, href }) => {
          const active = pathname === href; // ✅ match by URL path
          return (
            // next/link gives client-side transitions + automatic prefetch of the
            // route shell (loading.tsx) on hover/viewport, so nav feels instant.
            <Link
              key={id}
              href={href}
              title={isCollapsed ? label : undefined}
              onClick={() => { if (isMobile) setMobileOpen?.(false); }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = C.bg; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: isCollapsed ? "11px 0" : "10px 13px",
                justifyContent: isCollapsed ? "center" : "flex-start",
                borderRadius: 9999,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "none",
                background: active ? C.p : "transparent",
                color: active ? C.white : C.tm,
                boxShadow: active ? "0 4px 12px rgba(22,163,74,0.28)" : "none",
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                marginBottom: 3,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.4 : 1.9} style={{ flexShrink: 0 }} />
              {!isCollapsed && (
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {label}
                </span>
              )}
              {!isCollapsed && active && (
                <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.7 }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle — desktop only (mobile uses the drawer backdrop / close button). */}
      {!isMobile && (
        <div style={{ padding: isCollapsed ? "12px 0" : "12px 10px", borderTop: `1px solid ${C.bd}` }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "space-between",
              padding: isCollapsed ? "10px 0" : "10px 13px",
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              background: "transparent",
              color: C.tm,
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 500,
              transition: "background 0.15s",
            }}
          >
            {!isCollapsed && <span>Collapse</span>}
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
