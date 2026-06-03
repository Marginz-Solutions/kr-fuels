"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown, ChevronUp, Eye, EyeOff, ImageIcon, Loader2,
  Plus, Trash2, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { C } from "../../../constants/colors";
import { card, btn, iconBtn } from "../../../styles/shared";
import { API_BASE } from "@/lib/api-base";
import type { HeroImage } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || `Request failed (${res.status})`);
  }
  return res.json();
}

// ─── Upload Zone ─────────────────────────────────────────────────────────────

function UploadZone({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(`${API_BASE}/hero-images/upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || !json.url) throw new Error(json.error || "Upload failed");
        onUploaded(json.url);
        toast.success("Image uploaded");
      } catch (e: any) {
        toast.error(e.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [upload],
  );

  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? C.p : C.bd}`,
        borderRadius: 16,
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        cursor: uploading ? "wait" : "pointer",
        background: dragging ? `${C.p}08` : C.bg,
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {uploading ? (
        <Loader2 size={28} style={{ color: C.p }} className="animate-spin" />
      ) : (
        <Upload size={28} style={{ color: C.tm }} />
      )}
      <div style={{ fontSize: 13, fontWeight: 600, color: C.t }}>
        {uploading ? "Uploading…" : "Click or drag an image here"}
      </div>
      <div style={{ fontSize: 12, color: C.tm }}>JPEG, PNG, WEBP or GIF · max 5 MB</div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
      />
    </div>
  );
}

// ─── Image Card ───────────────────────────────────────────────────────────────

interface ImageCardProps {
  img: HeroImage;
  isFirst: boolean;
  isLast: boolean;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onMove: (id: string, dir: "up" | "down") => void;
}

function ImageCard({ img, isFirst, isLast, onDelete, onToggle, onMove }: ImageCardProps) {
  return (
    <div
      style={{
        ...card(),
        overflow: "hidden",
        opacity: img.active ? 1 : 0.55,
        transition: "opacity 0.2s",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", background: C.bg }}>
        <Image
          src={img.url}
          alt="Hero slide"
          fill
          unoptimized
          style={{ objectFit: "cover" }}
        />
        {!img.active && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>
              HIDDEN
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 6 }}>
        {/* Order controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button
            title="Move up"
            aria-label="Move image up"
            disabled={isFirst}
            onClick={() => onMove(img.id, "up")}
            style={{
              ...iconBtn("ghost", 24),
              opacity: isFirst ? 0.3 : 1,
            }}
          >
            <ChevronUp size={13} />
          </button>
          <button
            title="Move down"
            aria-label="Move image down"
            disabled={isLast}
            onClick={() => onMove(img.id, "down")}
            style={{
              ...iconBtn("ghost", 24),
              opacity: isLast ? 0.3 : 1,
            }}
          >
            <ChevronDown size={13} />
          </button>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: C.tm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Slide {img.order + 1}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              color: img.active ? C.p : C.tm,
              marginTop: 2,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: img.active ? C.p : C.tm,
                flexShrink: 0,
              }}
            />
            {img.active ? "Visible" : "Hidden"}
          </div>
        </div>

        {/* Toggle visible */}
        <button
          title={img.active ? "Hide slide" : "Show slide"}
          aria-label={img.active ? "Hide slide" : "Show slide"}
          onClick={() => onToggle(img.id, !img.active)}
          style={iconBtn("ghost", 30)}
        >
          {img.active ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>

        {/* Delete */}
        <button
          title="Delete slide"
          aria-label="Delete slide"
          onClick={() => onDelete(img.id)}
          style={iconBtn("ghost", 30, { color: C.red })}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────

function ConfirmDelete({
  onConfirm,
  onCancel,
  busy,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ ...card(), padding: 24, maxWidth: 380, width: "90%", textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.t, marginBottom: 8 }}>Delete slide?</div>
        <div style={{ fontSize: 13, color: C.tm, marginBottom: 20 }}>
          This will permanently remove the image from Firebase Storage and the carousel.
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button style={btn("ghost")} onClick={onCancel} disabled={busy}>Cancel</button>
          <button style={btn("danger")} onClick={onConfirm} disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Default slides (shown before any custom slides are uploaded) ─────────────

const DEFAULT_SLIDES = [
  { url: "/assets/hero-2.jpg",            label: "Hero Slide 1" },
  { url: "/assets/hero-1.jpg",            label: "Hero Slide 2" },
  { url: "/assets/products/auto-lpg.jpg", label: "Auto LPG Station" },
];

// ─── DefaultsPanel ───────────────────────────────────────────────────────────

function DefaultsPanel({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div style={{ ...card(), padding: 20, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.t }}>Current default slides</div>
          <div style={{ fontSize: 12, color: C.tm, marginTop: 2 }}>
            No custom slides uploaded yet. The site is using these 3 built-in images.
            Save them to start managing the carousel from here.
          </div>
        </div>
        <button
          style={{ ...btn(), whiteSpace: "nowrap", flexShrink: 0 }}
          onClick={onSave}
          disabled={saving}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Save as slides
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {DEFAULT_SLIDES.map((s) => (
          <div key={s.url} style={{ ...card(), overflow: "hidden" }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", background: C.bg }}>
              <Image src={s.url} alt={s.label} fill style={{ objectFit: "cover" }} />
            </div>
            <div style={{ padding: "8px 12px", fontSize: 12, color: C.tm }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HeroImagesPage() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [seedingSaving, setSeedingSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/hero-images");
      setImages((res.data ?? []).sort((a: HeroImage, b: HeroImage) => a.order - b.order));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Seed default slides into Firestore ───────────────────────────────────────
  const handleSeedDefaults = useCallback(async () => {
    setSeedingSaving(true);
    try {
      await Promise.all(
        DEFAULT_SLIDES.map((s, i) =>
          apiFetch("/hero-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: s.url, order: i, active: true }),
          }),
        ),
      );
      toast.success("Default slides saved — you can now manage them here");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSeedingSaving(false);
    }
  }, [load]);

  // ── Upload callback ──────────────────────────────────────────────────────────
  const handleUploaded = useCallback(async (url: string) => {
    try {
      await apiFetch("/hero-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [load]);

  // ── Toggle visibility ────────────────────────────────────────────────────────
  const handleToggle = useCallback(async (id: string, active: boolean) => {
    setSavingIds((s) => new Set(s).add(id));
    try {
      await apiFetch(`/hero-images/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      setImages((imgs) => imgs.map((img) => (img.id === id ? { ...img, active } : img)));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingIds((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  }, []);

  // ── Reorder ──────────────────────────────────────────────────────────────────
  const handleMove = useCallback(async (id: string, dir: "up" | "down") => {
    const sorted = [...images].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((img) => img.id === id);
    if (idx < 0) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    // Swap orders optimistically.
    const updated = sorted.map((img, i) => {
      if (i === idx) return { ...img, order: sorted[swapIdx].order };
      if (i === swapIdx) return { ...img, order: sorted[idx].order };
      return img;
    });
    setImages(updated);

    // Persist both.
    try {
      await Promise.all([
        apiFetch(`/hero-images/${sorted[idx].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: sorted[swapIdx].order }),
        }),
        apiFetch(`/hero-images/${sorted[swapIdx].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: sorted[idx].order }),
        }),
      ]);
    } catch (e: any) {
      toast.error(e.message);
      await load(); // revert on error
    }
  }, [images, load]);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/hero-images/${deleteTarget}`, { method: "DELETE" });
      toast.success("Slide deleted");
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, load]);

  const sorted = [...images].sort((a, b) => a.order - b.order);
  const activeCount = images.filter((img) => img.active).length;

  return (
    <div style={{ padding: 24, maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
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
          <ImageIcon size={18} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.t }}>Hero Carousel</div>
          <div style={{ fontSize: 12, color: C.tm }}>
            Manage the full-width slides shown at the top of the home page.
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.tm }}>
            {activeCount} of {images.length} visible
          </span>
        </div>
      </div>

      {/* Upload zone */}
      <div style={{ marginBottom: 20 }}>
        <UploadZone onUploaded={handleUploaded} />
      </div>

      {/* Hint */}
      {images.length > 0 && (
        <div style={{ fontSize: 12, color: C.tm, marginBottom: 12 }}>
          Use the arrows to reorder slides. Visible slides appear in the carousel on the live site.
          {activeCount === 0 && (
            <span style={{ color: "#d97706", fontWeight: 600 }}>
              {" "}No slides are currently visible — the site will show the default images.
            </span>
          )}
        </div>
      )}

      {/* Default slides — shown only when Firestore has nothing yet */}
      {!loading && images.length === 0 && (
        <DefaultsPanel onSave={handleSeedDefaults} saving={seedingSaving} />
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader2 size={22} style={{ color: C.p }} className="animate-spin" />
        </div>
      ) : images.length === 0 ? null : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {sorted.map((img, i) => (
            <div key={img.id} style={{ opacity: savingIds.has(img.id) ? 0.6 : 1, transition: "opacity 0.15s" }}>
              <ImageCard
                img={img}
                isFirst={i === 0}
                isLast={i === sorted.length - 1}
                onDelete={setDeleteTarget}
                onToggle={handleToggle}
                onMove={handleMove}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDelete
          onConfirm={handleDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
          busy={deleting}
        />
      )}
    </div>
  );
}
