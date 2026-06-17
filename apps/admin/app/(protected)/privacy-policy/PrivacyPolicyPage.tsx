"use client";
import { useState, type FC } from "react";
import {
  Globe,
  FileText,
  Edit,
  Save,
  X,
  RotateCcw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Shield,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { C } from "../../../constants/colors";
import { card, btn, inp } from "../../../styles/shared";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  PrivacyPolicy,
  PrivacyPolicySection,
} from "@/types";
import { createPrivacyPolicy, fetchPrivacyPolicy, updatePrivacyPolicy } from "@/lib/api/privacy-policy";
import { fmtDate } from "../contact/ContactPage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  slug: string;
  status: "published" | "draft";
  banner: { title: string; subtitle: string };
  sections: PrivacyPolicySection[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS: FormState = {
  title: "Privacy Policy",
  slug: "privacy-policy",
  status: "published",
  banner: {
    title: "Privacy Policy",
    subtitle: "Your privacy is important to us.",
  },
  sections: [
    { id: "section_1", title: "Introduction", content: "KR Fuels respects your privacy and is committed to protecting your personal information." },
    { id: "section_2", title: "Information We Collect", content: "We may collect personal details such as name, phone number, email address, and feedback submitted through forms." },
    { id: "section_3", title: "How We Use Your Information", content: "The information collected is used to improve our services, respond to enquiries, and provide customer support." },
    { id: "section_4", title: "Cookies", content: "Our website may use cookies to improve user experience and website performance." },
    { id: "section_5", title: "Third Party Services", content: "We may use trusted third-party services such as Google Maps and analytics tools." },
    { id: "section_6", title: "Contact Us", content: "For any privacy-related concerns, contact us at support@krfuels.com." },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toFormState(p: PrivacyPolicy): FormState {
  return {
    title: p.title,
    slug: p.slug,
    status: p.status,
    banner: { ...p.banner },
    sections: p.sections.map((s) => ({ ...s })),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader: FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.bd}` }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.p}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: C.p }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.t, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.tm, marginTop: 2 }}>{subtitle}</div>
    </div>
  </div>
);

const FieldLabel: FC<{ children: React.ReactNode; htmlFor?: string }> = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.tm, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
    {children}
  </label>
);

// ─── Section Editor ───────────────────────────────────────────────────────────

const SectionEditor: FC<{
  sections: PrivacyPolicySection[];
  onChange: (sections: PrivacyPolicySection[]) => void;
  disabled?: boolean;
}> = ({ sections, onChange, disabled }) => {

  const update = (idx: number, patch: Partial<PrivacyPolicySection>) => {
    onChange(sections.map((s, i) => i === idx ? { ...s, ...patch } : s));
  };

  const remove = (idx: number) => onChange(sections.filter((_, i) => i !== idx));

  const move = (idx: number, dir: -1 | 1) => {
    const arr = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange(arr);
  };

  const addSection = () => {
    const id = `section_${Date.now()}`;
    onChange([...sections, { id, title: "", content: "" }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {sections.map((s, idx) => (
        <div key={s.id} style={{ border: `1px solid ${C.bd}`, borderRadius: 12, padding: 16, background: C.bg }}>
          {/* Section header row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: `${C.p}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.p, flexShrink: 0 }}>
              {idx + 1}
            </div>
            <input
              value={s.title}
              disabled={disabled}
              onChange={(e) => update(idx, { title: e.target.value })}
              placeholder="Section title (optional — leave blank for preamble)…"
              style={{ ...inp(), flex: 1, fontSize: 13, fontWeight: 500 }}
            />
            {!disabled && (
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button onClick={() => move(idx, -1)} disabled={idx === 0} title="Move up" style={{ ...btn("ghost"), padding: "4px 6px", opacity: idx === 0 ? 0.3 : 1 }}>
                  <ChevronUp size={13} />
                </button>
                <button onClick={() => move(idx, 1)} disabled={idx === sections.length - 1} title="Move down" style={{ ...btn("ghost"), padding: "4px 6px", opacity: idx === sections.length - 1 ? 0.3 : 1 }}>
                  <ChevronDown size={13} />
                </button>
                <button onClick={() => remove(idx)} title="Delete section" style={{ ...btn("ghost"), padding: "4px 6px", color: C.red }}>
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
          <textarea
            value={s.content}
            disabled={disabled}
            onChange={(e) => update(idx, { content: e.target.value })}
            placeholder="Section content…"
            rows={3}
            style={{ ...inp(), width: "100%", fontSize: 13, resize: "vertical", minHeight: 80 }}
          />
        </div>
      ))}

      {!disabled && (
        <button onClick={addSection} style={{ ...btn("ghost"), alignSelf: "flex-start", fontSize: 13 }}>
          <Plus size={14} /> Add Section
        </button>
      )}
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: FC<{ status: "published" | "draft" }> = ({ status }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 500,
    background: status === "published" ? "#ecfdf5" : "#f3f4f6",
    color: status === "published" ? "#065f46" : "#6b7280",
    border: `1px solid ${status === "published" ? "#a7f3d0" : "#e5e7eb"}`,
  }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: status === "published" ? "#10b981" : "#9ca3af" }} />
    {status === "published" ? "Published" : "Draft"}
  </span>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const PrivacyPolicyPage: FC<{ initialData: PrivacyPolicy | null }> = ({ initialData }) => {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(
    initialData ? toFormState(initialData) : DEFAULTS
  );
  const [isEditing, setIsEditing] = useState(false);

  const { data: policy } = useQuery({
    queryKey: ["privacy-policy"],
    queryFn: fetchPrivacyPolicy,
    initialData,
  });

  const patch = (p: Partial<FormState>) => setForm((prev) => ({ ...prev, ...p }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (policy?.id) return updatePrivacyPolicy(policy.id, form);
      return createPrivacyPolicy(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-policy"] });
      setIsEditing(false);
      toast.success(policy?.id ? "Privacy policy updated!" : "Privacy policy created!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save privacy policy");
    },
  });

  const handleCancel = () => {
    setIsEditing(false);
    setForm(policy ? toFormState(policy) : DEFAULTS);
  };

  // ── Responsive styles ──────────────────────────────────────────────────────
  const isMobileStyle = `
    @media (max-width: 640px) {
      .pp-grid { grid-template-columns: 1fr !important; }
      .pp-header { flex-direction: column !important; align-items: flex-start !important; }
      .pp-actions { flex-wrap: wrap !important; }
    }
    /* Make the difference between view-mode and edit-mode obvious. */
    .pp-editing input:not(:disabled),
    .pp-editing textarea:not(:disabled) {
      background: ${C.white} !important;
      cursor: text;
      border-color: #c9d6d2 !important;
    }
    .pp-editing input:not(:disabled):focus,
    .pp-editing textarea:not(:disabled):focus {
      outline: none;
      border-color: ${C.p} !important;
      box-shadow: 0 0 0 3px rgba(20,107,94,0.18) !important;
    }
  `;

  return (
    <div className={isEditing ? "pp-root pp-editing" : "pp-root"} style={{ padding: 24 }}>
      <style>{isMobileStyle}</style>

      {/* Page header */}
      <div className="pp-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${C.p}15`, display: "flex", alignItems: "center", justifyContent: "center", color: C.p }}>
            <Shield size={18} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.t }}>Privacy Policy</div>
            <div style={{ fontSize: 12, color: C.tm }}>Manage your website's privacy policy content</div>
          </div>
        </div>

        <div className="pp-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={{ ...btn(), padding: "7px 16px", fontSize: 12 }}>
              <Edit size={13} /> Edit Policy
            </button>
          ) : (
            <>
              <button onClick={handleCancel} style={{ ...btn("ghost"), padding: "7px 14px", fontSize: 12 }}>
                <X size={13} /> Cancel
              </button>
              <button
                onClick={() => {

                  // Policy title
                  if (!form.title.trim()) {
                    toast.error("Policy title is required");
                    return;
                  }

                  // Slug
                  if (!form.slug.trim()) {
                    toast.error("Slug is required");
                    return;
                  }

                  // Banner title
                  if (!form.banner.title.trim()) {
                    toast.error("Banner title is required");
                    return;
                  }

                  // Banner subtitle
                  if (!form.banner.subtitle.trim()) {
                    toast.error("Banner subtitle is required");
                    return;
                  }

                  // Sections validation
                  if (form.sections.length === 0) {
                    toast.error("At least one section is required");
                    return;
                  }

                  // Empty section validation. Title is optional — the first
                  // section is an untitled preamble (effective date + intro);
                  // every section must still carry content.
                  const hasInvalidSection = form.sections.some(
                    (section) => !section.content.trim()
                  );

                  if (hasInvalidSection) {
                    toast.error(
                      "Every section must have content"
                    );

                    return;
                  }

                  // Save
                  saveMutation.mutate();
                }}
                disabled={saveMutation.isPending}
                style={{ ...btn(), padding: "7px 16px", fontSize: 12 }}
              >
                <Save size={13} /> {saveMutation.isPending ? "Saving..." : "Save Policy"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editing-mode banner */}
      {isEditing && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", marginBottom: 16, borderRadius: 10,
          background: `${C.p}10`, border: `1px solid ${C.p}33`, color: C.p,
          fontSize: 12.5, fontWeight: 500,
        }}>
          <Edit size={14} />
          Editing mode — all fields below are now editable. Click into any field and type, then “Save Policy”.
        </div>
      )}

      {/* Body */}
      <div className="pp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Banner card */}
          <div style={{ ...card(), padding: 22 }}>
            <SectionHeader icon={<FileText size={17} />} title="Banner" subtitle="Displayed at the top of the privacy policy page" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 14 }}>
              <div>
                <FieldLabel htmlFor="banner-title">Banner Title</FieldLabel>
                <input id="banner-title" disabled={!isEditing} style={{ ...inp(), fontSize: 13, width: "100%" }} value={form.banner.title} onChange={(e) => patch({ banner: { ...form.banner, title: e.target.value } })} placeholder="Privacy Policy" />
              </div>
              <div>
                <FieldLabel htmlFor="banner-subtitle">Banner Subtitle</FieldLabel>
                <input id="banner-subtitle" disabled={!isEditing} style={{ ...inp(), fontSize: 13, width: "100%" }} value={form.banner.subtitle} onChange={(e) => patch({ banner: { ...form.banner, subtitle: e.target.value } })} placeholder="Your privacy is important to us." />
              </div>
            </div>
          </div>

          {/* General info card */}
          <div style={{ ...card(), padding: 22 }}>
            <SectionHeader icon={<Globe size={17} />} title="General" subtitle="Page title, slug, and publish status" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 14, marginBottom: 14 }}>
              <div>
                <FieldLabel htmlFor="pp-title">Page Title</FieldLabel>
                <input id="pp-title" disabled={!isEditing} style={{ ...inp(), fontSize: 13, width: "100%" }} value={form.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Privacy Policy" />
              </div>
              <div>
                <FieldLabel htmlFor="pp-slug">Slug</FieldLabel>
                <input id="pp-slug" disabled={!isEditing} style={{ ...inp(), fontSize: 13, width: "100%", opacity: 0.7 }} value={form.slug} onChange={(e) => patch({ slug: e.target.value })} placeholder="privacy-policy" />
              </div>
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                {(["published", "draft"] as const).map((s) => (
                  <button
                    key={s}
                    disabled={!isEditing}
                    onClick={() => patch({ status: s })}
                    style={{
                      ...btn(form.status === s ? undefined : "ghost"),
                      padding: "6px 16px",
                      fontSize: 12,
                      opacity: !isEditing ? 0.7 : 1,
                      cursor: !isEditing ? "default" : "pointer",
                    }}
                  >
                    {s === "published" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sections card */}
          <div style={{ ...card(), padding: 22 }}>
            <SectionHeader icon={<FileText size={17} />} title="Sections" subtitle="Add, edit, reorder, or remove policy sections" />
            <SectionEditor
              sections={form.sections}
              onChange={(sections) => patch({ sections })}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Status card */}
          <div style={{ ...card(), padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.t, marginBottom: 14 }}>Document Status</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: C.tm }}>Status</span>
                <StatusBadge status={form.status} />
              </div>
              <div style={{ borderTop: `1px solid ${C.bd}`, paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: C.tm, marginBottom: 2 }}>Slug</div>
                <div style={{ fontSize: 12, color: C.p, fontFamily: "monospace", background: `${C.p}10`, padding: "3px 8px", borderRadius: 6 }}>/{form.slug}</div>
              </div>
              {policy?.publishedAt && (
                <div style={{ borderTop: `1px solid ${C.bd}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: C.tm, marginBottom: 2 }}>Published</div>
                  <div style={{ fontSize: 12, color: C.t, fontWeight: 500 }}>{fmtDate(policy.publishedAt)}</div>
                </div>
              )}
              {policy?.updatedAt && (
                <div style={{ borderTop: `1px solid ${C.bd}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: C.tm, marginBottom: 2 }}>Last updated</div>
                  <div style={{ fontSize: 12, color: C.t, fontWeight: 500 }}>{fmtDate(policy.updatedAt)}</div>
                </div>
              )}
              {policy?.updatedBy && (
                <div style={{ borderTop: `1px solid ${C.bd}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: C.tm, marginBottom: 2 }}>Updated by</div>
                  <div style={{ fontSize: 12, color: C.t, fontWeight: 500 }}>{policy.updatedBy}</div>
                </div>
              )}
            </div>
          </div>

          {/* Summary card */}
          <div style={{ ...card(), padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.t, marginBottom: 14 }}>Summary</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: C.tm }}>Sections</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.t }}>{form.sections.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: C.tm }}>Total words</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.t }}>
                  {form.sections.reduce((acc, s) => acc + s.content.split(" ").filter(Boolean).length, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Sections quick nav */}
          <div style={{ ...card(), padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.t, marginBottom: 14 }}>Sections</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {form.sections.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: `${C.p}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: C.p, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 12, color: s.title ? C.t : C.tm, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.title || "Untitled section"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;