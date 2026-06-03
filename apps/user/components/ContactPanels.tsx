"use client";
import { useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { FeedbackForm } from "@/components/FeedbackForm";

interface StationOption {
  id: string;
  stationName?: string;
  district?: string;
}

// Right-column panel on the Contact page: a segmented switcher between the general
// enquiry form (→ /enquiry) and the station feedback form with rating (→ /feedback).
export function ContactPanels({ stations }: { stations: StationOption[] }) {
  const [tab, setTab] = useState<"enquiry" | "feedback">("enquiry");

  const tabs = [
    { key: "enquiry", label: "Send a message", icon: MessageSquare },
    { key: "feedback", label: "Rate a station", icon: Star },
  ] as const;

  return (
    <div>
      <div className="mb-4 inline-flex rounded-full border border-line bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? "bg-brand text-white" : "text-ink/70 hover:text-brand"
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "enquiry" ? <ContactForm /> : <FeedbackForm stations={stations} />}
    </div>
  );
}
