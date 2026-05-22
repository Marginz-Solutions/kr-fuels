import { useState } from "react";

import { C }                  from "./constants/colors";
import { defaultFuelPrices }  from "./constants/mockData";
import { Sidebar, Topbar }    from "./components/layout";
import DashboardPage     from "./features/dashboard/DashboardPage";
import TestimonialsPage  from "./features/testimonials/TestimonialsPage";
import ClientsPage       from "./features/clients/ClientsPage";
import StationsPage      from "./features/stations/StationsPage";
import ProductsPage      from "./features/products/ProductsPage";
import FAQPage           from "./features/faq/FAQPage";
import ContactPage       from "./features/contact/ContactPage";
import SettingsPage      from "./features/settings/SettingsPage";
import ProfilePage       from "./features/profile/ProfilePage";
import type { FuelPrices, PageId } from "./types";

// ─── Page resolver ────────────────────────────────────────

interface PageResolverProps {
  page:        PageId;
  prices:      FuelPrices;
  onEditPrice: (p: FuelPrices) => void;
}

const PageResolver = ({ page, prices, onEditPrice }: PageResolverProps) => {
  switch (page) {
    case "dashboard":    return <DashboardPage prices={prices} onEditPrice={onEditPrice} />;
    case "testimonials": return <TestimonialsPage />;
    case "clients":      return <ClientsPage />;
    case "stations":     return <StationsPage />;
    case "products":     return <ProductsPage />;
    case "faq":          return <FAQPage />;
    case "contact":      return <ContactPage />;
    case "settings":     return <SettingsPage />;
    case "profile":      return <ProfilePage />;
    default:             return <DashboardPage prices={prices} onEditPrice={onEditPrice} />;
  }
};

// ─── Root ─────────────────────────────────────────────────

export default function App() {
  const [page,      setPage]      = useState<PageId>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [prices,    setPrices]    = useState<FuelPrices>(defaultFuelPrices);

  return (
    <div
      style={{
        display:    "flex",
        height:     "100vh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: C.bg,
        overflow:   "hidden",
      }}
    >
      <Sidebar
        page={page}
        setPage={setPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar page={page} fuels={prices} />
        <main style={{ flex: 1, overflowY: "auto" }}>
          <PageResolver page={page} prices={prices} onEditPrice={setPrices} />
        </main>
      </div>
    </div>
  );
}
