"use client"
import { useState, type FC } from "react";
import { Plus, Search, Edit2, Trash2, Check } from "lucide-react";

import { C }                  from "../../constants/colors";
import { mockTestimonials }   from "../../constants/mockData";
import { card, btn, inp }     from "../../styles/shared";
import { Modal, FormField }   from "../../components/ui";
import type { Testimonial, TestimonialFormDraft } from "../../types";

const EMPTY_DRAFT: TestimonialFormDraft = { name: "", designation: "", review: "" };

const TestimonialsPage: FC = () => {
  const [list,    setList]    = useState<Testimonial[]>(mockTestimonials);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form,    setForm]    = useState<TestimonialFormDraft>(EMPTY_DRAFT);

  const filtered = list.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.review.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_DRAFT);
    setModal(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, designation: t.designation, review: t.review });
    setModal(true);
  };

  const save = () => {
    if (editing) {
      setList((l) => l.map((t) => (t.id === editing.id ? { ...t, ...form } : t)));
    } else {
      const newItem: Testimonial = {
        id:          Date.now(),
        ...form,
        date:   new Date().toISOString().split("T")[0],
        rating: 5,
      };
      setList((l) => [...l, newItem]);
    }
    setModal(false);
  };

  const remove = (id: number) => setList((l) => l.filter((t) => t.id !== id));

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.t }}>Customer Testimonials</div>
          <div style={{ fontSize: 12, color: C.tm }}>{list.length} total reviews</div>
        </div>
        <button style={btn()} onClick={openAdd}><Plus size={15} />Add Testimonial</button>
      </div>

      {/* Table card */}
      <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", gap: 10 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 10, padding: "7px 12px" }}>
            <Search size={14} color={C.tm} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search testimonials..."
              style={{ border: "none", background: "transparent", fontSize: 13, outline: "none", fontFamily: "inherit", color: C.t, width: "100%" }}
            />
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Customer", "Designation", "Review", "Rating", "Date", "Actions"].map((h) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: C.tm, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id} style={{ borderTop: `1px solid ${C.bd}`, background: i % 2 === 0 ? C.white : "#fafcfb" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.pXLight, color: C.p, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
                      {t.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 500, fontSize: 13, color: C.t }}>{t.name}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.tm }}>{t.designation}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.t, maxWidth: 260 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.review}</div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ color: C.amber, fontSize: 13 }}>{"★".repeat(t.rating)}</span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: C.tm }}>{t.date}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(t)} style={{ ...btn("ghost"), padding: "4px 8px" }}><Edit2 size={13} /></button>
                    <button onClick={() => remove(t.id)} style={{ ...btn("ghost"), padding: "4px 8px", color: C.red }}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modal} title={editing ? "Edit Testimonial" : "Add Testimonial"} onClose={() => setModal(false)}>
        <FormField label="Customer Name">
          <input style={inp()} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" />
        </FormField>
        <FormField label="Designation">
          <input style={inp()} value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} placeholder="e.g. Fleet Manager, Company Name" />
        </FormField>
        <FormField label={`Review (${form.review.length}/300 characters)`}>
          <textarea
            style={{ ...inp(), height: 100, resize: "vertical" }}
            maxLength={300}
            value={form.review}
            onChange={(e) => setForm((p) => ({ ...p, review: e.target.value }))}
            placeholder="Customer review..."
          />
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={btn("ghost")} onClick={() => setModal(false)}>Cancel</button>
          <button style={btn()}        onClick={save}><Check size={14} />{editing ? "Update" : "Add"} Testimonial</button>
        </div>
      </Modal>
    </div>
  );
};

export default TestimonialsPage;
