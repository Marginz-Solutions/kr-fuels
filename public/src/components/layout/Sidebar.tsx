import type { FC } from "react";
import { ChevronRight, ChevronLeft, Fuel } from "lucide-react";
import { C } from "../../constants/colors";
import { NAV } from "../../constants/navigation";
import type { PageId } from "../../types";

interface SidebarProps {
  page: PageId;
  setPage: (page: PageId) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const Sidebar: FC<SidebarProps> = ({ page, setPage, collapsed, setCollapsed }) => (
  <aside
    style={{
      width:         collapsed ? 72 : 252,
      minHeight:     "100vh",
      background:    C.p,
      display:       "flex",
      flexDirection: "column",
      transition:    "width 0.25s ease",
      overflow:      "hidden",
      flexShrink:    0,
    }}
  >
    {/* Logo */}
    <div
      style={{
        padding:     collapsed ? "20px 0" : "20px 16px",
        display:     "flex",
        alignItems:  "center",
        gap:         10,
        borderBottom:"1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          width:          36,
          height:         36,
          borderRadius:   10,
          background:     C.s,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
          margin:         collapsed ? "0 auto" : 0,
        }}
      >
        <Fuel size={18} color={C.t} />
      </div>
      {!collapsed && (
        <div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 15, lineHeight: 1 }}>KR Fuels</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Admin Panel</div>
        </div>
      )}
    </div>

    {/* Nav items */}
    <nav style={{ flex: 1, padding: collapsed ? "12px 0" : "12px 8px" }}>
      {NAV.map(({ id, label, icon: Icon }) => {
        const active = page === id;
        return (
          <button
            key={id}
            onClick={() => setPage(id)}
            title={collapsed ? label : undefined}
            style={{
              width:          "100%",
              display:        "flex",
              alignItems:     "center",
              gap:            10,
              padding:        collapsed ? "10px 0" : "10px 12px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius:   10,
              border:         "none",
              cursor:         "pointer",
              fontFamily:     "inherit",
              background:     active ? "rgba(255,255,255,0.15)" : "transparent",
              color:          active ? C.white : "rgba(255,255,255,0.65)",
              fontSize:       14,
              fontWeight:     active ? 600 : 400,
              marginBottom:   2,
              transition:     "background 0.15s, color 0.15s",
            }}
          >
            <Icon size={18} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            {!collapsed && (
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {label}
              </span>
            )}
            {!collapsed && active && (
              <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.6 }} />
            )}
          </button>
        );
      })}
    </nav>

    {/* Collapse toggle */}
    <div style={{ padding: collapsed ? "12px 0" : "12px 8px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width:          "100%",
          display:        "flex",
          alignItems:     "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding:        collapsed ? "10px 0" : "10px 12px",
          borderRadius:   10,
          border:         "none",
          cursor:         "pointer",
          background:     "transparent",
          color:          "rgba(255,255,255,0.5)",
          fontFamily:     "inherit",
          fontSize:       13,
        }}
      >
        {!collapsed && <span>Collapse</span>}
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  </aside>
);

export default Sidebar;
