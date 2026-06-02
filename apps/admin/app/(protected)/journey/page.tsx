"use client";
import { useEffect, useState } from "react";
import { Route, Plus, Trash2, Save, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { C } from "../../../constants/colors";
import { card, btn, inp, iconBtn } from "../../../styles/shared";
import { Modal, FormField } from "../../../components/ui";
import { authedGet, authedSend } from "@/lib/authed-fetch";
import type { JourneyMilestone } from "@/types";

type Draft = { year: string; title: string; description: string; image: string; order: number };
const EMPTY: Draft = { year: "", title: "", description: "", image: "", order: 0 };

export default function JourneyPage() {
  const [items, setItems] = useState<JourneyMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JourneyMilestone | null>(null);
  const [form, setForm] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JourneyMilestone | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () =>
    authedGet<{ message: JourneyMilestone[] }>("/journey")
      .then((r) => setItems(r.message ?? []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, order: items.length + 1 }); setOpen(true); };
  const openEdit = (m: JourneyMilestone) => {
    setEditing(m);
    setForm({ year: m.year, title: m.title, description: m.description, image: m.image ?? "", order: m.order ?? 0 });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setBusy(true);
    try {
      if (editing) await authedSend(`/journey/${editing.id}`, "PATCH", { ...form, order: Number(form.order) });
      else await authedSend("/journey", "POST", { ...form, order: Number(form.order) });
      toast.success(editing ? "Milestone updated" : "Milestone added");
      setOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await authedSend(`/journey/${deleteTarget.id}`, "DELETE");
      toast.success("Milestone deleted");
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: C.p, display: "flex", alignItems: "center", justifyContent: "center", color: C.white }}><Route size={18} /></div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.t }}>Our Journey</div>
            <div style={{ fontSize: 12, color: C.tm }}>Milestones shown on the website timeline.</div>
          </div>
        </div>
        <button style={btn()} onClick={openAdd}><Plus size={15} />Add Milestone</button>
      </div>

      {loading ? (
        <div style={{ color: C.tm }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ ...card(), padding: 40, textAlign: "center", color: C.tm, fontSize: 13 }}>No milestones yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((m) => (
            <div key={m.id} style={{ ...card(), padding: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ minWidth: 56, fontWeight: 700, color: C.p }}>{m.year || "—"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: C.t }}>{m.title}</div>
                <div style={{ fontSize: 13, color: C.tm, marginTop: 2 }}>{m.description}</div>
              </div>
              <button title="Edit milestone" aria-label="Edit milestone" style={iconBtn("ghost")} onClick={() => openEdit(m)}><Pencil size={14} /></button>
              <button title="Delete milestone" aria-label="Delete milestone" style={iconBtn("ghost", 30, { color: C.red })} onClick={() => setDeleteTarget(m)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} title={editing ? "Edit Milestone" : "Add Milestone"} onClose={() => setOpen(false)} width={460}>
        <FormField label="Year"><input style={inp()} value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} placeholder="2007" /></FormField>
        <FormField label="Title"><input style={inp()} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Founded in Trichy" /></FormField>
        <FormField label="Description"><textarea style={{ ...inp(), minHeight: 80, resize: "vertical" }} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></FormField>
        <FormField label="Image URL (optional)"><input style={inp()} value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} placeholder="https://…" /></FormField>
        <FormField label="Order"><input style={inp()} type="number" value={String(form.order)} onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))} /></FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button style={btn("ghost")} onClick={() => setOpen(false)}>Cancel</button>
          <button style={btn()} onClick={save} disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{editing ? "Save" : "Add"}</button>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} title="Delete Milestone" onClose={() => !deleting && setDeleteTarget(null)} width={400}>
        <p style={{ fontSize: 14, color: C.t, lineHeight: 1.5, margin: 0 }}>
          Delete milestone <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
          <button style={btn("ghost")} onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
          <button style={btn("danger")} onClick={confirmDelete} disabled={deleting}>
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
