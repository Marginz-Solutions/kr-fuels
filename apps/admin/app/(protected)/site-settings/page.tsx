"use client";
import { useEffect, useState } from "react";
import { Globe, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { C } from "../../../constants/colors";
import { card, btn, inp } from "../../../styles/shared";
import { authedGet, authedSend } from "@/lib/authed-fetch";
import type { SiteSettings } from "@/types";

const SOCIALS: Array<keyof NonNullable<SiteSettings["social"]>> = ["facebook", "instagram", "twitter", "linkedin", "youtube"];

export default function SiteSettingsPage() {
  const [tags, setTags] = useState("");
  const [social, setSocial] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authedGet<{ data: SiteSettings }>("/site-settings")
      .then((r) => {
        setTags((r.data.footerTags ?? []).join(", "));
        setSocial({ ...(r.data.social ?? {}) } as Record<string, string>);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await authedSend("/site-settings", "PUT", {
        footerTags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        social,
      });
      toast.success("Site settings saved");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 24, color: C.tm }}>Loading…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${C.p}15`, display: "flex", alignItems: "center", justifyContent: "center", color: C.p }}><Globe size={18} /></div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.t }}>Site Settings</div>
          <div style={{ fontSize: 12, color: C.tm }}>Footer tags and social links shown across the website.</div>
        </div>
      </div>

      <div style={{ ...card(), padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.t, marginBottom: 4 }}>Footer tags</div>
        <input style={{ ...inp(), width: "100%" }} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Eco-Friendly, Auto LPG, Since 2007" />
        <div style={{ fontSize: 11, color: C.tm, marginTop: 4 }}>Comma-separated. Rendered as tags in the website footer.</div>
      </div>

      <div style={{ ...card(), padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.t }}>Social links</div>
        {SOCIALS.map((s) => (
          <div key={s}>
            <div style={{ fontSize: 12, color: C.tm, marginBottom: 4, textTransform: "capitalize" }}>{s}</div>
            <input style={{ ...inp(), width: "100%" }} value={social[s] ?? ""} onChange={(e) => setSocial((p) => ({ ...p, [s]: e.target.value }))} placeholder={`https://${s}.com/…`} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <button style={btn()} onClick={save} disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save settings</button>
      </div>
    </div>
  );
}
