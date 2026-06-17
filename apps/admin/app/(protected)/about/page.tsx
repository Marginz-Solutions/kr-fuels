"use client";
import { useEffect, useState } from "react";
import { Info, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { C } from "../../../constants/colors";
import { card, btn, inp, iconBtn } from "../../../styles/shared";
import { authedGet, authedSend } from "@/lib/authed-fetch";
import type { AboutContent, AboutContentBlock } from "@/types";

export default function AboutAdminPage() {
  const [data, setData] = useState<AboutContent>({ videoUrl: "", contentBlocks: [], showStationCount: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authedGet<{ data: AboutContent }>("/about")
      .then((r) => setData({ showStationCount: true, ...r.data, contentBlocks: r.data?.contentBlocks ?? [] }))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const setBlock = (i: number, patch: Partial<AboutContentBlock>) =>
    setData((d) => ({ ...d, contentBlocks: d.contentBlocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) }));
  const addBlock = () => setData((d) => ({ ...d, contentBlocks: [...d.contentBlocks, { heading: "", body: "" }] }));
  const removeBlock = (i: number) => setData((d) => ({ ...d, contentBlocks: d.contentBlocks.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      await authedSend("/about", "PUT", data);
      toast.success("About content saved");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 24, color: C.tm }}>Loading…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 820 }}>
      <Header icon={<Info size={18} />} title="About Us Page" subtitle="Video, narrative content and display options (live on the website)." />

      <div style={{ ...card(), padding: 22, marginBottom: 16 }}>
        <Label>Video URL (YouTube/embed)</Label>
        <input style={{ ...inp(), width: "100%" }} value={data.videoUrl ?? ""} onChange={(e) => setData((d) => ({ ...d, videoUrl: e.target.value }))} placeholder="https://www.youtube.com/embed/…" />
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, color: C.t }}>
          <input type="checkbox" checked={!!data.showStationCount} onChange={(e) => setData((d) => ({ ...d, showStationCount: e.target.checked }))} />
          Show live station count on the About page
        </label>
      </div>

      <div style={{ ...card(), padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.t }}>Content blocks</div>
          <button style={{ ...btn("ghost"), fontSize: 12 }} onClick={addBlock}><Plus size={14} />Add block</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.contentBlocks.map((b, i) => (
            <div key={i} style={{ border: `1px solid ${C.bd}`, borderRadius: 12, padding: 14, background: C.bg }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input style={{ ...inp(), flex: 1, fontWeight: 600 }} value={b.heading} onChange={(e) => setBlock(i, { heading: e.target.value })} placeholder="Heading" />
                <button title="Remove block" aria-label="Remove content block" style={iconBtn("ghost", 30, { color: C.red })} onClick={() => removeBlock(i)}><Trash2 size={14} /></button>
              </div>
              <textarea style={{ ...inp(), width: "100%", minHeight: 80, resize: "vertical" }} value={b.body} onChange={(e) => setBlock(i, { body: e.target.value })} placeholder="Body text" />
            </div>
          ))}
          {data.contentBlocks.length === 0 && <div style={{ color: C.tm, fontSize: 13 }}>No content blocks yet.</div>}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <button style={btn()} onClick={save} disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save About content</button>
      </div>
    </div>
  );
}

function Header({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${C.p}15`, display: "flex", alignItems: "center", justifyContent: "center", color: C.p }}>{icon}</div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.t }}>{title}</div>
        <div style={{ fontSize: 12, color: C.tm }}>{subtitle}</div>
      </div>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: C.tm, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{children}</div>;
}
