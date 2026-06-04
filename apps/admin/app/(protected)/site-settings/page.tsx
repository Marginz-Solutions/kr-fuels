"use client";
import { useEffect, useRef, useState } from "react";
import { Globe, Save, Loader2, Video, Upload, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { C } from "../../../constants/colors";
import { card, btn, inp, iconBtn } from "../../../styles/shared";
import { authedGet, authedSend } from "@/lib/authed-fetch";
import { API_BASE } from "@/lib/api-base";
import { HOME_VIDEO_URL_DEFAULT, type SiteSettings } from "@/types";

const SOCIALS: Array<keyof NonNullable<SiteSettings["social"]>> = ["facebook", "instagram", "twitter", "linkedin", "youtube"];

export default function SiteSettingsPage() {
  const [tags, setTags] = useState("");
  const [social, setSocial] = useState<Record<string, string>>({});
  const [homeVideoUrl, setHomeVideoUrl] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    authedGet<{ data: SiteSettings }>("/site-settings")
      .then((r) => {
        setTags((r.data.footerTags ?? []).join(", "));
        setSocial({ ...(r.data.social ?? {}) } as Record<string, string>);
        setHomeVideoUrl(r.data.homeVideoUrl ?? "");
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const uploadVideo = async (file: File) => {
    setVideoUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${API_BASE}/site-settings/upload`, { method: "POST", credentials: "include", body: fd });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Upload failed");
      setHomeVideoUrl(json.url);
      toast.success("Video uploaded — remember to save");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setVideoUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await authedSend("/site-settings", "PUT", {
        footerTags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        social,
        homeVideoUrl: homeVideoUrl.trim(),
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
          <div style={{ fontSize: 12, color: C.tm }}>Home video, footer tags and social links shown across the website.</div>
        </div>
      </div>

      {/* Home page video */}
      <div style={{ ...card(), padding: 22, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Video size={15} style={{ color: C.p }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: C.t }}>Home page video</div>
        </div>
        <div style={{ fontSize: 11, color: C.tm, marginBottom: 12 }}>
          Shown in the “See Auto LPG in Action” block on the home page. Paste a hosted MP4/WebM (or YouTube/embed) URL, or upload a clip (max 100MB).
        </div>

        {/* Preview */}
        {homeVideoUrl && (
          <div style={{ position: "relative", marginBottom: 12, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.bd}`, background: "#000", aspectRatio: "16 / 9" }}>
            {/youtube\.com|youtu\.be|vimeo\.com|\/embed\//i.test(homeVideoUrl) ? (
              <iframe src={homeVideoUrl} title="Home video preview" allowFullScreen style={{ width: "100%", height: "100%", border: "none" }} />
            ) : (
              <video src={homeVideoUrl} controls preload="metadata" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            style={{ ...inp(), flex: 1 }}
            value={homeVideoUrl}
            onChange={(e) => setHomeVideoUrl(e.target.value)}
            placeholder="https://…/video.mp4"
          />
          {homeVideoUrl && (
            <button title="Clear video" aria-label="Clear video" style={iconBtn("ghost", 36, { color: C.red })} onClick={() => setHomeVideoUrl("")}>
              <X size={15} />
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            style={{ ...btn("ghost"), fontSize: 12 }}
            disabled={videoUploading}
            onClick={() => videoInputRef.current?.click()}
          >
            {videoUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {videoUploading ? "Uploading…" : "Upload video"}
          </button>
          <button
            type="button"
            style={{ ...btn("ghost"), fontSize: 12 }}
            onClick={() => setHomeVideoUrl(HOME_VIDEO_URL_DEFAULT)}
          >
            <RotateCcw size={14} />Use default TVC
          </button>
          <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadVideo(f); e.target.value = ""; }} />
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
