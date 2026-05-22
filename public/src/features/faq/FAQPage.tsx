import { useState, type FC } from "react";
import { Plus, Search, Edit2, Trash2, ChevronRight, ChevronDown, Check } from "lucide-react";

import { C }             from "../../constants/colors";
import { mockFAQs }      from "../../constants/mockData";
import { card, btn, inp } from "../../styles/shared";
import { Badge, Modal, FormField } from "../../components/ui";
import type { FAQ, FAQFormDraft } from "../../types";

const EMPTY_DRAFT: FAQFormDraft = { question: "", answer: "", isLink: false };

const FAQPage: FC = () => {
  const [list,    setList]    = useState<FAQ[]>(mockFAQs);
  const [open,    setOpen]    = useState<number | null>(null);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form,    setForm]    = useState<FAQFormDraft>(EMPTY_DRAFT);

  const filtered = list.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase()),
  );

  const openEdit = (f: FAQ) => {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, isLink: f.isLink });
    setModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_DRAFT);
    setModal(true);
  };

  const save = () => {
    if (editing) {
      setList((l) => l.map((f) => (f.id === editing.id ? { ...f, ...form } : f)));
    } else {
      setList((l) => [...l, { id: Date.now(), ...form }]);
    }
    setModal(false);
  };

  const remove = (id: number) => setList((l) => l.filter((f) => f.id !== id));

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.t }}>Frequently Asked Questions</div>
          <div style={{ fontSize: 12, color: C.tm }}>{list.length} FAQs</div>
        </div>
        <button style={btn()} onClick={openAdd}><Plus size={15} />Add FAQ</button>
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: C.white, border: `1px solid ${C.bd}`, borderRadius: 10, padding: "9px 12px" }}>
          <Search size={14} color={C.tm} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            style={{ border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", width: "100%", color: C.t }}
          />
        </div>
      </div>

      {/* Accordion list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((f) => (
          <div key={f.id} style={{ ...card(), padding: 0, overflow: "hidden" }}>
            <div
              style={{ display: "flex", alignItems: "center", padding: "14px 16px", cursor: "pointer" }}
              onClick={() => setOpen(open === f.id ? null : f.id)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: C.t }}>{f.question}</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {f.isLink && <Badge color="blue">Link</Badge>}
                <button onClick={(e) => { e.stopPropagation(); openEdit(f); }} style={{ ...btn("ghost"), padding: "4px 8px" }}><Edit2 size={13} /></button>
                <button onClick={(e) => { e.stopPropagation(); remove(f.id); }} style={{ ...btn("ghost"), padding: "4px 8px", color: C.red }}><Trash2 size={13} /></button>
                {open === f.id ? <ChevronDown size={16} color={C.tm} /> : <ChevronRight size={16} color={C.tm} />}
              </div>
            </div>
            {open === f.id && (
              <div style={{ padding: "12px 16px 14px", color: C.tm, fontSize: 13, borderTop: `1px solid ${C.bd}` }}>
                {f.isLink
                  ? <a href={f.answer} style={{ color: C.blue }}>{f.answer}</a>
                  : f.answer
                }
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modal} title={editing ? "Edit FAQ" : "Add FAQ"} onClose={() => setModal(false)}>
        <FormField label="Question">
          <input style={inp()} value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} placeholder="Enter the question" />
        </FormField>
        <FormField label="Answer / URL">
          <textarea
            style={{ ...inp(), height: 100, resize: "vertical" }}
            value={form.answer}
            onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
            placeholder={form.isLink ? "https://..." : "Enter the answer"}
          />
        </FormField>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <input
            type="checkbox"
            id="isLink"
            checked={form.isLink}
            onChange={(e) => setForm((p) => ({ ...p, isLink: e.target.checked }))}
          />
          <label htmlFor="isLink" style={{ fontSize: 13, color: C.t, cursor: "pointer" }}>
            This FAQ links to an external URL
          </label>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={btn("ghost")} onClick={() => setModal(false)}>Cancel</button>
          <button style={btn()}        onClick={save}><Check size={14} />{editing ? "Update" : "Add"} FAQ</button>
        </div>
      </Modal>
    </div>
  );
};

export default FAQPage;
