"use client";
import { useMemo, useState, type FC } from "react";
import {
  Plus, Globe, Trash2, ToggleLeft, ToggleRight, Check, Edit2,
  Search, Users, Building2, Handshake, ExternalLink, AlertTriangle,
} from "lucide-react";

import { C } from "../../../constants/colors";
import { card, btn, inp, iconBtn } from "../../../styles/shared";
import { Badge, Modal, FormField } from "../../../components/ui";
import type { Client, ClientType } from "../../../types";
import { normalizeUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchClients, createClient, updateClient, toggleClient, deleteClient,
} from "@/lib/api/clients";
import { toast } from "sonner";

type FormState = { name: string; type: ClientType; website: string; logo: string; active: boolean };
const EMPTY_FORM: FormState = { name: "", type: "collaborator", website: "", logo: "", active: true };

type TypeFilter = "all" | ClientType;
type ActiveFilter = "all" | "active" | "inactive";

const ClientsPage: FC = () => {
  const queryClient = useQueryClient();

  // ── filters ──
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [search, setSearch] = useState("");

  // ── modals ──
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirm, setConfirm] = useState<
    { kind: "toggle" | "delete"; client: Client } | null
  >(null);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["clients", typeFilter, activeFilter, search],
    queryFn: () =>
      fetchClients({
        type: typeFilter === "all" ? undefined : typeFilter,
        active: activeFilter === "all" ? undefined : activeFilter === "active" ? "true" : "false",
        q: search.trim() || undefined,
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["clients"] });

  const createMut = useMutation({
    mutationFn: (payload: FormState) => createClient(payload),
    onSuccess: () => { invalidate(); setModalOpen(false); toast.success("Partner added"); },
    onError: (e: Error) => toast.error(e.message || "Failed to add partner"),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormState }) => updateClient(id, payload),
    onSuccess: () => { invalidate(); setModalOpen(false); toast.success("Partner updated"); },
    onError: (e: Error) => toast.error(e.message || "Failed to update partner"),
  });
  const toggleMut = useMutation({
    mutationFn: (id: string) => toggleClient(id),
    onSuccess: () => { invalidate(); setConfirm(null); toast.success("Status updated"); },
    onError: (e: Error) => toast.error(e.message || "Failed to update status"),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => { invalidate(); setConfirm(null); toast.success("Partner removed"); },
    onError: (e: Error) => toast.error(e.message || "Failed to remove partner"),
  });

  // ── stats (computed across the full unfiltered set would need a second query;
  //    here we summarise the current result set) ──
  const stats = useMemo(() => {
    const total = list.length;
    const active = list.filter((c) => c.active).length;
    const clients = list.filter((c) => c.type === "client").length;
    const collaborators = list.filter((c) => c.type === "collaborator").length;
    return { total, active, clients, collaborators };
  }, [list]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (c: Client) => {
    setEditing(c);
    setForm({ name: c.name, type: c.type, website: c.website ?? "", logo: c.logo ?? "", active: c.active });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Company name is required"); return; }
    if (editing) updateMut.mutate({ id: editing.id, payload: form });
    else createMut.mutate(form);
  };

  const renderLogo = (logo?: string) => {
    if (logo && /^https?:\/\//i.test(logo)) {
      // Partner logos can be arbitrary external URLs → unoptimized (still lazy-loaded).
      return <Image src={logo} alt="" width={52} height={52} unoptimized style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 12 }} />;
    }
    return <span style={{ fontSize: 24 }}>{logo || "🏢"}</span>;
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.t }}>Clients & Collaborators</div>
          <div style={{ fontSize: 12, color: C.tm }}>Partner companies shown on the public website</div>
        </div>
        <button style={btn()} onClick={openAdd}><Plus size={15} />Add Partner</button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 18 }}>
        <StatTile icon={<Users size={16} />} label="Total Partners" value={stats.total} />
        <StatTile icon={<Check size={16} />} label="Active" value={stats.active} />
        <StatTile icon={<Building2 size={16} />} label="Clients" value={stats.clients} />
        <StatTile icon={<Handshake size={16} />} label="Collaborators" value={stats.collaborators} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.tm }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            style={{ ...inp(), paddingLeft: 30, width: "100%" }}
          />
        </div>
        <SegmentedFilter
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as TypeFilter)}
          options={[["all", "All"], ["client", "Clients"], ["collaborator", "Collaborators"]]}
        />
        <SegmentedFilter
          value={activeFilter}
          onChange={(v) => setActiveFilter(v as ActiveFilter)}
          options={[["all", "All"], ["active", "Active"], ["inactive", "Inactive"]]}
        />
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div style={{ color: C.tm, fontSize: 13, padding: 40, textAlign: "center" }}>Loading partners…</div>
      ) : list.length === 0 ? (
        <div style={{ ...card(), padding: 40, textAlign: "center", color: C.tm, fontSize: 13 }}>
          No partners match the current filters.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {list.map((c) => (
            <div key={c.id} style={{ ...card(), padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {renderLogo(c.logo)}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Badge color={c.type === "client" ? "blue" : "amber"}>{c.type === "client" ? "Client" : "Collaborator"}</Badge>
                  <Badge color={c.active ? "green" : "red"}>{c.active ? "Active" : "Inactive"}</Badge>
                </div>
              </div>
              <div style={{ fontWeight: 600, color: C.t, fontSize: 14, marginBottom: 4 }}>{c.name}</div>
              {c.website ? (
                <Link
                  href={normalizeUrl(c.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, color: C.p, fontSize: 12, marginBottom: 14, textDecoration: "none" }}
                >
                  <Globe size={12} />{c.website}<ExternalLink size={11} />
                </Link>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.tm, fontSize: 12, marginBottom: 14 }}>
                  <Globe size={12} />No website
                </div>
              )}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => openEdit(c)} aria-label="Edit partner" style={{ ...btn("ghost"), padding: "5px 10px", fontSize: 12, flex: 1, justifyContent: "center" }}>
                  <Edit2 size={13} />Edit
                </button>
                <button onClick={() => setConfirm({ kind: "toggle", client: c })} title={c.active ? "Deactivate" : "Activate"} aria-label={c.active ? "Deactivate partner" : "Activate partner"} style={iconBtn("ghost")}>
                  {c.active ? <ToggleRight size={14} color={C.p} /> : <ToggleLeft size={14} />}
                </button>
                <button onClick={() => setConfirm({ kind: "delete", client: c })} title="Delete partner" aria-label="Delete partner" style={iconBtn("ghost", 30, { color: C.red })}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} title={editing ? "Edit Partner" : "Add Partner"} onClose={() => setModalOpen(false)} width={440}>
        <FormField label="Company Name">
          <input style={inp()} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Company name" />
        </FormField>
        <FormField label="Type">
          <div style={{ display: "flex", gap: 8 }}>
            {(["client", "collaborator"] as ClientType[]).map((t) => (
              <button
                key={t}
                onClick={() => setForm((p) => ({ ...p, type: t }))}
                style={{ ...btn(form.type === t ? undefined : "ghost"), padding: "7px 14px", fontSize: 12, flex: 1, justifyContent: "center" }}
              >
                {t === "client" ? "Client" : "Collaborator"}
              </button>
            ))}
          </div>
        </FormField>
        <FormField label="Website URL">
          <input style={inp()} value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} placeholder="www.example.com" />
        </FormField>
        <FormField label="Logo (image URL or emoji)">
          <input style={inp()} value={form.logo} onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))} placeholder="https://…/logo.png  or  🏢" />
        </FormField>
        <FormField label="Status">
          <div style={{ display: "flex", gap: 8 }}>
            {[true, false].map((v) => (
              <button
                key={String(v)}
                onClick={() => setForm((p) => ({ ...p, active: v }))}
                style={{ ...btn(form.active === v ? undefined : "ghost"), padding: "7px 14px", fontSize: 12, flex: 1, justifyContent: "center" }}
              >
                {v ? "Active" : "Inactive"}
              </button>
            ))}
          </div>
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button style={btn("ghost")} onClick={() => setModalOpen(false)}>Cancel</button>
          <button style={btn()} onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
            <Check size={14} />{editing ? "Save Changes" : "Add Partner"}
          </button>
        </div>
      </Modal>

      {/* Confirm dialog (toggle + delete) */}
      <Modal open={!!confirm} title={confirm?.kind === "delete" ? "Delete Partner" : "Change Status"} onClose={() => setConfirm(null)} width={400}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 18 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${confirm?.kind === "delete" ? C.red : C.amber}18`, display: "flex", alignItems: "center", justifyContent: "center", color: confirm?.kind === "delete" ? C.red : C.amber, flexShrink: 0 }}>
            <AlertTriangle size={18} />
          </div>
          <div style={{ fontSize: 13, color: C.t, lineHeight: 1.5 }}>
            {confirm?.kind === "delete" ? (
              <>Are you sure you want to permanently delete <strong>{confirm?.client.name}</strong>? This cannot be undone.</>
            ) : (
              <>Are you sure you want to {confirm?.client.active ? "deactivate" : "activate"} <strong>{confirm?.client.name}</strong>? {confirm?.client.active ? "It will be hidden from the website." : "It will appear on the website."}</>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={btn("ghost")} onClick={() => setConfirm(null)}>Cancel</button>
          {confirm?.kind === "delete" ? (
            <button style={{ ...btn(), background: C.red }} onClick={() => deleteMut.mutate(confirm.client.id)} disabled={deleteMut.isPending}>
              <Trash2 size={14} />Delete
            </button>
          ) : (
            <button style={btn()} onClick={() => confirm && toggleMut.mutate(confirm.client.id)} disabled={toggleMut.isPending}>
              <Check size={14} />Confirm
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

// ── small helpers ──
const StatTile: FC<{ icon: React.ReactNode; label: string; value: number; color?: string }> = ({ icon, label, value, color = C.t }) => (
  <div style={{ ...card(), padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", color: C.white }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.t, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.tm, marginTop: 3 }}>{label}</div>
    </div>
  </div>
);

const SegmentedFilter: FC<{ value: string; onChange: (v: string) => void; options: Array<[string, string]> }> = ({ value, onChange, options }) => (
  <div style={{ display: "inline-flex", border: `1px solid ${C.bd}`, borderRadius: 10, overflow: "hidden" }}>
    {options.map(([val, label]) => (
      <button
        key={val}
        onClick={() => onChange(val)}
        style={{
          padding: "7px 12px", fontSize: 12, border: "none", cursor: "pointer",
          background: value === val ? C.p : "transparent",
          color: value === val ? C.white : C.tm, fontWeight: value === val ? 600 : 400,
        }}
      >
        {label}
      </button>
    ))}
  </div>
);

export default ClientsPage;
