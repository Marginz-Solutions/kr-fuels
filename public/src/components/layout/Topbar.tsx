import type { FC } from "react";
import { Search, Bell, Fuel } from "lucide-react";
import { C } from "../../constants/colors";
import { NAV } from "../../constants/navigation";
import { pill } from "../../styles/shared";
import type { FuelPrices, PageId } from "../../types";

interface TopbarProps {
  page:  PageId;
  fuels: FuelPrices;
}

const fuelBadges: Array<[keyof FuelPrices, string, "blue" | "amber" | "green"]> = [
  ["diesel",  "Diesel",   "blue"],
  ["petrol",  "Petrol",   "amber"],
  ["autoLPG", "Auto LPG", "green"],
];

const Topbar: FC<TopbarProps> = ({ page, fuels }) => {
  const pageLabel = NAV.find((n) => n.id === page)?.label ?? "Dashboard";

  return (
    <header
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          16,
        padding:      "0 24px",
        height:       64,
        background:   C.white,
        borderBottom: `1px solid ${C.bd}`,
        flexShrink:   0,
        position:     "sticky",
        top:          0,
        zIndex:       100,
      }}
    >
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.t }}>{pageLabel}</div>
        <div style={{ fontSize: 12, color: C.tm }}>KR Fuels Admin Portal</div>
      </div>

      {/* Search */}
      <div
        style={{
          display:     "flex",
          alignItems:  "center",
          gap:         8,
          background:  C.bg,
          borderRadius:10,
          padding:     "7px 12px",
          width:       220,
        }}
      >
        <Search size={15} color={C.tm} />
        <input
          placeholder="Search..."
          style={{
            border:     "none",
            background: "transparent",
            fontSize:   13,
            color:      C.t,
            outline:    "none",
            width:      "100%",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Live fuel prices */}
      <div style={{ display: "flex", gap: 6 }}>
        {fuelBadges.map(([key, label, color]) => (
          <div key={key} style={{ ...pill(color), padding: "4px 10px", fontSize: 11 }}>
            <Fuel size={10} style={{ marginRight: 4 }} />
            ₹{fuels[key]}/{label === "Auto LPG" ? "L" : "L"}
          </div>
        ))}
      </div>

      {/* Notifications */}
      <button
        style={{
          background:   "transparent",
          border:       `1px solid ${C.bd}`,
          borderRadius: 10,
          padding:      8,
          cursor:       "pointer",
          position:     "relative",
          display:      "flex",
        }}
      >
        <Bell size={18} />
        <span
          style={{
            position:     "absolute",
            top:          5,
            right:        5,
            width:        8,
            height:       8,
            background:   C.red,
            borderRadius: "50%",
            border:       "2px solid white",
          }}
        />
      </button>

      {/* Avatar */}
      <div
        style={{
          width:          36,
          height:         36,
          borderRadius:   "50%",
          background:     C.pXLight,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          color:          C.p,
          fontWeight:     700,
          fontSize:       14,
          cursor:         "pointer",
        }}
      >
        KR
      </div>
    </header>
  );
};

export default Topbar;
