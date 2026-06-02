"use client";
import { useState, useRef, type FC } from "react";
import {
  Save,
  RotateCcw,
  Globe,
  FileText,
  Tag,
  Image as ImgIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  X,
  Eye,
  Search,
  Edit,
} from "lucide-react";
import { C } from "../../../constants/colors";
import { card, btn, inp } from "../../../styles/shared";
import { toast } from "sonner";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchSeoSettings,
  createSeoSettings,
  updateSeoSettings,
  uploadSeoImage,
  deleteStorageImage,
} from "@/lib/api/seo-settings";
import { SeoSettings } from "@/types";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SeoFormState {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage: string;
}

const DEFAULTS: SeoFormState = {
  metaTitle: "KR Fuels | Auto LPG Stations in Tamil Nadu",
  metaDescription:
    "KR Fuels — Tamil Nadu's most trusted Auto LPG fuel provider. 23+ stations across major districts.",
  keywords: ["Auto LPG", "CNG", "Tamil Nadu", "Fuel station"],
  ogImage: "",
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

const TITLE_MAX = 60;
const DESC_MAX = 160;

function titleScore(v: string) {
  const l = v.length;
  if (l === 0) return { label: "Empty", color: C.red, pct: 0 };
  if (l < 30) return { label: "Too short", color: "#BA7517", pct: (l / TITLE_MAX) * 100 };
  if (l <= TITLE_MAX) return { label: "Good", color: C.p, pct: (l / TITLE_MAX) * 100 };
  return { label: "Too long", color: C.red, pct: 100 };
}

function descScore(v: string) {
  const l = v.length;
  if (l === 0) return { label: "Empty", color: C.red, pct: 0 };
  if (l < 70) return { label: "Too short", color: "#BA7517", pct: (l / DESC_MAX) * 100 };
  if (l <= DESC_MAX) return { label: "Good", color: C.p, pct: (l / DESC_MAX) * 100 };
  return { label: "Too long", color: C.red, pct: 100 };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const SectionHeader: FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}> = ({ icon, title, subtitle }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 20,
      paddingBottom: 16,
      borderBottom: `1px solid ${C.bd}`,
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: `${C.p}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: C.p,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.t, lineHeight: 1.3 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: C.tm, marginTop: 2 }}>{subtitle}</div>
    </div>
  </div>
);

const FieldLabel: FC<{ children: React.ReactNode; htmlFor?: string; hint?: string }> = ({
  children,
  htmlFor,
  hint,
}) => (
  <div style={{ marginBottom: 6 }}>
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 600,
        color: C.tm,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </label>
    {hint && (
      <span style={{ fontSize: 11, color: C.tm, marginTop: 2, display: "block" }}>
        {hint}
      </span>
    )}
  </div>
);

const CharBar: FC<{ pct: number; color: string; label: string; current: number; max: number }> = ({
  pct,
  color,
  label,
  current,
  max,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 6,
    }}
  >
    <div
      style={{
        flex: 1,
        height: 3,
        background: C.bd,
        borderRadius: 99,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(pct, 100)}%`,
          background: color,
          borderRadius: 99,
          transition: "width .2s, background .2s",
        }}
      />
    </div>
    <span style={{ fontSize: 11, color, fontWeight: 500, minWidth: 60 }}>
      {current}/{max} · {label}
    </span>
  </div>
);

// ─── Google SERP Preview ────────────────────────────────────────────────────────

const SerpPreview: FC<{ title: string; description: string; ogImage?: string }> = ({ title, description, ogImage }) => (
  <div
    style={{
      background: C.white,
      border: `1px solid ${C.bd}`,
      borderRadius: 12,
      padding: "14px 16px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 3,
          background: `${C.p}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Search size={10} color={C.p} />
      </div>
      <span style={{ fontSize: 11, color: C.tm, fontWeight: 500 }}>
        Google Search Preview
      </span>
    </div>

    {/* SERP card */}
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        padding: "10px 14px",
        border: `1px solid #e0e0e0`,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ fontSize: 11, color: "#202124", marginBottom: 2, opacity: 0.5 }}>
        https://krfuels.com ›
      </div>
      <div
        style={{
          fontSize: 16,
          color: "#1a0dab",
          fontWeight: 400,
          marginBottom: 4,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        {title || "Page Title"}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#4d5156",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {description || "Meta description will appear here…"}
      </div>
    </div>

    {ogImage && (
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 11, color: C.tm, fontWeight: 500, marginBottom: 6 }}>
          Social Share Preview
        </div>
        <div style={{
          border: `1px solid ${C.bd}`,
          borderRadius: 8,
          overflow: "hidden"
        }}>
          {/* OG image can be a local blob: URL during edit — next/image can't optimize those */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ogImage}
            alt="OG preview"
            style={{ width: "100%", aspectRatio: "1.91 / 1", objectFit: "contain", background: C.bg, display: "block" }}
          />
          <div style={{ padding: "8px 12px", background: "#f0f0f0" }}>
            <div style={{ fontSize: 12, color: "#606770", marginBottom: 2 }}>krfuels.com</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1d2129" }}>{title}</div>
            <div style={{ fontSize: 12, color: "#606770" }}>{description}</div>
          </div>
        </div>
      </div>
    )}
  </div>
);

// ─── OG Image Upload ────────────────────────────────────────────────────────────

const OgImageUpload: FC<{
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
}> = ({ value, onChange, disabled, onFileSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
    onChange(URL.createObjectURL(file));
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
        disabled={disabled}
      />

      {value ? (
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `1px solid ${C.bd}` }}>
          {/* value can be a local blob: URL after selecting a file — keep native <img> */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="OG preview"
            style={{ width: "100%", aspectRatio: "1200 / 630", objectFit: "contain", background: C.bg, display: "block" }}
          />
          {/* overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: 0,
              transition: "opacity .2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "1")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "0")}
          >
            {!disabled && (
            <button
              onClick={() => !disabled && inputRef.current?.click()}
              disabled={disabled}
              style={{
                ...btn("ghost"),
                background: "rgba(255,255,255,0.9)",
                color: C.t,
                padding: "6px 14px",
                fontSize: 12,
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <Upload size={13} /> Replace
            </button>
            )}
            {!disabled && (
            <button
              onClick={() => onChange("")}
              style={{
                ...btn("ghost"),
                background: "rgba(255,255,255,0.9)",
                color: C.red,
                padding: "6px 10px",
              }}
            >
              <X size={13} />
            </button>
            )}
          </div>
          {/* dimension badge */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              fontSize: 10,
              padding: "2px 7px",
              borderRadius: 4,
            }}
          >
            1200 × 630
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            width: "100%",
            border: `2px dashed ${C.bd}`,
            borderRadius: 12,
            padding: "28px 16px",
            background: C.bg,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            transition: "border-color .15s, background .15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = C.p;
            (e.currentTarget as HTMLButtonElement).style.background = `${C.p}08`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = C.bd;
            (e.currentTarget as HTMLButtonElement).style.background = C.bg;
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${C.p}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.p,
            }}
          >
            <ImgIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.t }}>
              Upload OG Image
            </div>
            <div style={{ fontSize: 11, color: C.tm, marginTop: 2 }}>
              Recommended: 1200 × 630 px · PNG or JPG
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

// ─── Keyword Tags ───────────────────────────────────────────────────────────────

const KeywordTags: FC<{
  keywords: string[];
  onChange: (kws: string[]) => void;
  disabled?: boolean;
}> = ({ keywords, onChange, disabled }) => {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || keywords.includes(trimmed)) return;
    onChange([...keywords, trimmed]);
    setInput("");
  };

  const remove = (kw: string) => onChange(keywords.filter((k) => k !== kw));

  return (
    <div>
      {/* Input row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Type a keyword and press Enter…"
          style={{ ...inp(), flex: 1, fontSize: 13 }}
        />
        <button
          onClick={add}
          disabled={!input.trim() || disabled}
          style={{
            ...btn(),
            padding: "7px 14px",
            opacity: !input.trim() || disabled ? 0.45 : 1,
            cursor: !input.trim() || disabled ? "not-allowed" : "pointer",
          }}
        >
          Add
        </button>
      </div>

      {/* Tag list */}
      {keywords.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {keywords.map((kw) => (
            <span
              key={kw}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                background: `${C.p}12`,
                color: C.p,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                border: `1px solid ${C.p}30`,
              }}
            >
              {kw}
              <button
                onClick={() => remove(kw)}
                disabled={disabled}
                style={{
                  background: "none",
                  border: "none",
                  cursor: disabled ? "not-allowed" : "pointer",
                  padding: 0,
                  display: "flex",
                  color: C.p,
                  opacity: disabled ? 0.45 : 0.6,
                  lineHeight: 1,
                }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {keywords.length === 0 && (
        <p style={{ fontSize: 12, color: C.tm }}>No keywords added yet.</p>
      )}
    </div>
  );
};

// ─── Score Card ─────────────────────────────────────────────────────────────────

const ScoreCard: FC<{ form: SeoFormState }> = ({ form }) => {
  const checks = [
    { label: "Meta title set", ok: form.metaTitle.length > 0 },
    { label: "Title length (30–60 chars)", ok: form.metaTitle.length >= 30 && form.metaTitle.length <= TITLE_MAX },
    { label: "Description set", ok: form.metaDescription.length > 0 },
    { label: "Description length (70–160 chars)", ok: form.metaDescription.length >= 70 && form.metaDescription.length <= DESC_MAX },
    { label: "Keywords added", ok: form.keywords.length > 0 },
    { label: "OG image uploaded", ok: !!form.ogImage },
  ];
  const score = checks.filter((c) => c.ok).length;
  const pct = Math.round((score / checks.length) * 100);
  const color = pct >= 80 ? C.p : pct >= 50 ? "#BA7517" : C.red;

  return (
    <div
      style={{
        ...card(),
        padding: 20,
        position: "sticky",
        top: 24,
      }}
    >
      {/* Score ring (simple) */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: `conic-gradient(${color} ${pct * 3.6}deg, ${C.bd} 0deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: C.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color,
            }}
          >
            {pct}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.t }}>SEO Score</div>
          <div style={{ fontSize: 11, color: C.tm, marginTop: 2 }}>
            {score}/{checks.length} checks passed
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {checks.map((c) => (
          <div
            key={c.label}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            {c.ok ? (
              <CheckCircle2 size={14} color={C.p} style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={14} color={C.bd} style={{ flexShrink: 0 }} />
            )}
            <span
              style={{
                fontSize: 12,
                color: c.ok ? C.t : C.tm,
                fontWeight: c.ok ? 500 : 400,
              }}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const SeoSettingsPage: FC<{ initialSeoSettings: SeoSettings | null }> = ({ initialSeoSettings }) => {


  const queryClient = useQueryClient();
  const initialData = initialSeoSettings || DEFAULTS;
  const [form, setForm] = useState<SeoFormState>({
    metaTitle: initialData.metaTitle,

    metaDescription:
      initialData.metaDescription,

    keywords: initialData.keywords,

    ogImage: initialData.ogImage,
  });
  const [preview, setPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingOgFile, setPendingOgFile] = useState<File | null>(null);


  const { data: seoSettings } = useQuery({
    queryKey: ["seo-settings"],

    queryFn: fetchSeoSettings,

    initialData: initialSeoSettings,
  });

  const patch = (p: Partial<SeoFormState>) => {
    setForm((prev) => ({ ...prev, ...p }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {

      let ogImageUrl = form.ogImage;

      if (pendingOgFile) {
        if (seoSettings?.ogImage) {
          await deleteStorageImage(seoSettings.ogImage).catch((err) => {
            console.error("Failed to delete old OG image:", err);
          });
        }
        ogImageUrl = await uploadSeoImage(pendingOgFile);
        setPendingOgFile(null);
      }

      const payload = { ...form, ogImage: ogImageUrl };


      // Update
      if (seoSettings?.id) {

        return updateSeoSettings(
          seoSettings.id,
          payload
        );
      }

      // Create
      return createSeoSettings(payload);
    },

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["seo-settings"],
      });
      setIsEditing(false);

      toast.success(
        seoSettings?.id
          ? "SEO settings updated successfully"
          : "SEO settings created successfully"
      );
    },

    onError: (error: Error) => {

      console.error(error);

      toast.error(
        error.message ||
        "Failed to save SEO settings"
      );
    },
  });

  const handleReset = () => {
    setForm(DEFAULTS);
  };

  const ts = titleScore(form.metaTitle);
  const ds = descScore(form.metaDescription);

  return (
    <div style={{ padding: 24 }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `${C.p}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.p,
            }}
          >
            <Globe size={18} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.t }}>
              SEO / Meta Settings
            </div>
            <div style={{ fontSize: 12, color: C.tm }}>
              Control how KR Fuels appears in search engines
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!isEditing ? (
            <>
              <button
                onClick={() => setPreview((v) => !v)}
                style={{ ...btn("ghost"), padding: "7px 14px", fontSize: 12 }}
              >
                <Eye size={13} /> {preview ? "Hide" : "Show"} Preview
              </button>
              <button
                onClick={() => setIsEditing(true)}
                style={{ ...btn(), padding: "7px 16px", fontSize: 12 }}
              >
                <Edit size={13} /> Edit Settings
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setPendingOgFile(null);
                  // Reset form back to last saved state
                  if (seoSettings) {
                    setForm({
                      metaTitle: seoSettings.metaTitle,
                      metaDescription: seoSettings.metaDescription,
                      keywords: seoSettings.keywords,
                      ogImage: seoSettings.ogImage,
                    });
                  } else {
                    setForm(DEFAULTS);
                  }
                }}
                style={{ ...btn("ghost"), padding: "7px 14px", fontSize: 12 }}
              >
                <X size={13} /> Cancel
              </button>
              <button
                onClick={handleReset}
                style={{ ...btn("ghost"), padding: "7px 14px", fontSize: 12 }}
              >
                <RotateCcw size={13} /> Reset
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                style={{ ...btn(), padding: "7px 16px", fontSize: 12 }}
                disabled={saveMutation.isPending}
              >
                <Save size={13} /> {saveMutation.isPending ? "Saving..." : "Save Settings"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body: two-column layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Left: form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* SERP preview (toggleable) */}
          {preview && (
            <SerpPreview title={form.metaTitle} description={form.metaDescription} ogImage={form.ogImage} />
          )}

          {/* Title & Description card */}
          <div style={{ ...card(), padding: 22 }}>

            <SectionHeader
              icon={<FileText size={17} />}
              title="Page Title & Description"
              subtitle="These appear directly in Google search results"
            />



            <div style={{ marginBottom: 18 }}>
              <FieldLabel htmlFor="meta-title" hint={`Ideal length: 30–${TITLE_MAX} characters`}>
                Meta Title
              </FieldLabel>
              <input
                id="meta-title"
                disabled={!isEditing}
                style={{ ...inp(), fontSize: 13, width: "100%" }}
                value={form.metaTitle}
                onChange={(e) => patch({ metaTitle: e.target.value })}
                maxLength={80}
                placeholder="e.g. KR Fuels | Auto LPG Stations in Tamil Nadu"
              />
              <CharBar
                pct={ts.pct}
                color={ts.color}
                label={ts.label}
                current={form.metaTitle.length}
                max={TITLE_MAX}
              />
            </div>

            <div>
              <FieldLabel htmlFor="meta-desc" hint={`Ideal length: 70–${DESC_MAX} characters`}>
                Meta Description
              </FieldLabel>
              <textarea
                id="meta-desc"
                disabled={!isEditing}
                style={{ ...inp(), fontSize: 13, width: "100%", height: 90, resize: "vertical" }}
                value={form.metaDescription}
                onChange={(e) => patch({ metaDescription: e.target.value })}
                maxLength={200}
                placeholder="A short, compelling summary of this page…"
              />
              <CharBar
                pct={ds.pct}
                color={ds.color}
                label={ds.label}
                current={form.metaDescription.length}
                max={DESC_MAX}
              />
            </div>
          </div>

          {/* Keywords card */}
          <div style={{ ...card(), padding: 22 }}>
            <SectionHeader
              icon={<Tag size={17} />}
              title="Keywords"
              subtitle="Meta keywords — type and press Enter to add"
            />
            <KeywordTags
              keywords={form.keywords}
              onChange={(kws) => patch({ keywords: kws })}
              disabled={!isEditing}
            />
          </div>

          {/* OG Image card */}
          <div style={{ ...card(), padding: 22 }}>
            <SectionHeader
              icon={<ImgIcon size={17} />}
              title="Open Graph Image"
              subtitle="Shown when sharing the link on social media or messaging apps"
            />
            <OgImageUpload
              value={form.ogImage}
              onChange={(url) => patch({ ogImage: url })}
              disabled={!isEditing}
              onFileSelect={setPendingOgFile}
            />
            {form.ogImage && (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: C.p,
                }}
              >
                <ExternalLink size={12} />
                <span>Image ready for social sharing</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: score sidebar */}
        <ScoreCard form={form} />
      </div>
    </div>
  );
};

export default SeoSettingsPage;