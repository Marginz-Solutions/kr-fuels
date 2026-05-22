"use client"
import { useState, type FC } from "react";
import { Download, Check, Trash2, Save } from "lucide-react";

import { C }               from "../../constants/colors";
import { mockSubmissions } from "../../constants/mockData";
import { card, btn, inp }  from "../../styles/shared";
import { Badge, FormField } from "../../components/ui";
import type { Submission, SubmissionStatus, BadgeColor } from "../../types";

type Tab = "submissions" | "feedback" | "details";

const statusColor = (s: SubmissionStatus): BadgeColor =>
  s === "resolved" ? "green" : s === "in_progress" ? "blue" : "amber";

const statusLabel = (s: SubmissionStatus): string =>
  s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1);

const tabOptions: Array<[Tab, string]> = [
  ["submissions", "Form Submissions"],
  ["feedback",    "Feedback"],
  ["details",     "Contact Details"],
];

const TABLE_HEADS = ["Name", "Email", "Phone", "Message", "Date", "Status", "Actions"];

const ContactPage: FC = () => {
  const [tab,  setTab]  = useState<Tab>("submissions");
  const [list, setList] = useState<Submission[]>(mockSubmissions);

  const resolve = (id: number) =>
    setList((l) => l.map((x) => (x.id === id ? { ...x, status: "resolved" } : x)));

  const remove = (id: number) => setList((l) => l.filter((x) => x.id !== id));

  return (
    <div style={{ padding: 24 }}>
      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 12, padding: 4, marginBottom: 20, width: "fit-content" }}>
        {tabOptions.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              ...btn("ghost"),
              borderRadius: 9,
              padding:      "7px 16px",
              fontSize:     13,
              background:   tab === k ? C.white : "transparent",
              color:        tab === k ? C.t : C.tm,
              border:       tab === k ? `1px solid ${C.bd}` : "none",
              boxShadow:    tab === k ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Submissions / Feedback table */}
      {(tab === "submissions" || tab === "feedback") && (
        <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: C.t, fontSize: 14 }}>
              {tab === "submissions" ? "Contact Form Submissions" : "Feedback Submissions"}
            </span>
            <button style={{ ...btn("ghost"), padding: "6px 12px", fontSize: 12 }}><Download size={13} />Export CSV</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {TABLE_HEADS.map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: C.tm }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => (
                <tr key={s.id} style={{ borderTop: `1px solid ${C.bd}`, background: i % 2 === 0 ? C.white : "#fafcfb" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: C.t, fontSize: 13 }}>{s.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm }}>{s.email}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm }}>{s.phone}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.t, maxWidth: 200 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.message}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm }}>{s.date}</td>
                  <td style={{ padding: "12px 16px" }}><Badge color={statusColor(s.status)}>{statusLabel(s.status)}</Badge></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => resolve(s.id)} style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 12, color: C.green }}><Check size={12} />Resolve</button>
                      <button onClick={() => remove(s.id)}  style={{ ...btn("ghost"), padding: "4px 8px", color: C.red }}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contact details */}
      {tab === "details" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Company info */}
          <div style={{ ...card(), padding: 20 }}>
            <div style={{ fontWeight: 600, color: C.t, fontSize: 14, marginBottom: 16 }}>Company Information</div>
            {(
              [
                ["Address", "42, Industrial Estate, Madurai - 625003, Tamil Nadu"],
                ["Phone 1", "+91 452 234 5678"],
                ["Phone 2", "+91 98421 00000"],
                ["Email",   "teamkrfuels@gmail.com"],
                ["GST No.", "33AABCK1234M1Z5"],
              ] as const
            ).map(([l, v]) => (
              <div key={l} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.bd}` }}>
                <span style={{ fontSize: 12, color: C.tm, width: 80, flexShrink: 0 }}>{l}</span>
                <span style={{ fontSize: 13, color: C.t }}>{v}</span>
              </div>
            ))}
            <button style={{ ...btn(), marginTop: 14 }}><Save size={14} />Save Changes</button>
          </div>

          {/* Social links */}
          <div style={{ ...card(), padding: 20 }}>
            <div style={{ fontWeight: 600, color: C.t, fontSize: 14, marginBottom: 16 }}>Social Media Links</div>
            {(
              [
                ["Facebook",  "https://facebook.com/krfuels"],
                ["Instagram", "https://instagram.com/krfuels"],
                ["LinkedIn",  "https://linkedin.com/company/krfuels"],
                ["YouTube",   "https://youtube.com/@krfuels"],
              ] as const
            ).map(([l, v]) => (
              <FormField key={l} label={l}>
                <input style={inp()} defaultValue={v} />
              </FormField>
            ))}
            <button style={{ ...btn(), marginTop: 6 }}><Save size={14} />Save Links</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
