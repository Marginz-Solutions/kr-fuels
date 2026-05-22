"use client"
import { useState, type FC } from "react";
import { Plus, Globe, Trash2, ToggleLeft, ToggleRight, Check } from "lucide-react";
import { Image as ImgIcon } from "lucide-react";

import { C }                from "../../constants/colors";
import { mockClients }      from "../../constants/mockData";
import { card, btn, inp }   from "../../styles/shared";
import { Badge, Modal, FormField } from "../../components/ui";
import type { Client } from "../../types";

const ClientsPage: FC = () => {
  const [list,  setList]  = useState<Client[]>(mockClients);
  const [modal, setModal] = useState(false);
  const [form,  setForm]  = useState({ name: "", website: "", logo: "🏢", active: true });

  const toggle = (id: number) => setList((l) => l.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  const remove = (id: number) => setList((l) => l.filter((c) => c.id !== id));

  const handleAdd = () => {
    setList((l) => [...l, { id: Date.now(), ...form, order: l.length + 1 }]);
    setModal(false);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.t }}>Clients & Collaborators</div>
          <div style={{ fontSize: 12, color: C.tm }}>{list.filter((c) => c.active).length} active partners</div>
        </div>
        <button style={btn()} onClick={() => setModal(true)}><Plus size={15} />Add Collaborator</button>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
        {list.map((c) => (
          <div key={c.id} style={{ ...card(), padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                {c.logo}
              </div>
              <Badge color={c.active ? "green" : "red"}>{c.active ? "Active" : "Inactive"}</Badge>
            </div>
            <div style={{ fontWeight: 600, color: C.t, fontSize: 14, marginBottom: 4 }}>{c.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.tm, fontSize: 12, marginBottom: 14 }}>
              <Globe size={12} />{c.website}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => toggle(c.id)}
                style={{ ...btn("ghost"), padding: "5px 10px", fontSize: 12, flex: 1, justifyContent: "center" }}
              >
                {c.active
                  ? <><ToggleRight size={14} color={C.green} />Deactivate</>
                  : <><ToggleLeft size={14} />Activate</>
                }
              </button>
              <button onClick={() => remove(c.id)} style={{ ...btn("ghost"), padding: "5px 8px", color: C.red }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal open={modal} title="Add Collaborator" onClose={() => setModal(false)} width={420}>
        <FormField label="Company Name">
          <input style={inp()} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Company name" />
        </FormField>
        <FormField label="Website URL">
          <input style={inp()} value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} placeholder="www.example.com" />
        </FormField>
        <FormField label="Logo Upload">
          <div style={{ border: `2px dashed ${C.bd}`, borderRadius: 12, padding: "24px 0", textAlign: "center", color: C.tm, fontSize: 13 }}>
            <ImgIcon size={24} style={{ margin: "0 auto 8px" }} /><br />
            Drop logo here or <span style={{ color: C.p, cursor: "pointer" }}>browse files</span>
          </div>
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={btn("ghost")} onClick={() => setModal(false)}>Cancel</button>
          <button style={btn()}        onClick={handleAdd}><Check size={14} />Add Collaborator</button>
        </div>
      </Modal>
    </div>
  );
};

export default ClientsPage;
