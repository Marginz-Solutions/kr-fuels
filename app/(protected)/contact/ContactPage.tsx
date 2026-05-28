"use client"
import { useEffect, useState, type FC } from "react";
import { C } from "../../../constants/colors";
import type { BadgeColor } from "../../../types";
import type {AdminContactEssentials,AdminContactPresents,EnquiryResponse,FeedbackResponse,Enquiry,Feedback,Pagination,} from "@/types/dust";
import { api } from "@/lib/axios";
import { TabSwitcher } from "./_components/TabSwitcher";
import Table from "./_components/Table";
import EssentialsCard from "./_components/EssentialsCard";
import PresentsCard from "./_components/PresentsCard";
import { btn } from "@/styles/shared";
import { EssentialsCardLoading, PresentsCardLoading } from "@/components/ui/AdminContactCardSkeleton";

export type Tab = "enquiry" | "feedback" | "admin-contact";

export type ListItem = Enquiry | Feedback;

export type Status = Feedback["status"];

export const STATUS_COLOR_MAP: Record<string, BadgeColor> = {
  "resolved": "green",
  "in-progress": "blue",
  "pending": "amber",
}

export const statusColor = (s: string): BadgeColor =>
  STATUS_COLOR_MAP[s] ?? "amber"

export const statusLabel = (s: string): string =>
  s === "in-progress" ? "In Progress" : s?.charAt(0).toUpperCase() + s?.slice(1);

export const tabOptions: Array<[Tab, string]> = [
  ["enquiry", "Form Submissions"],
  ["feedback", "Feedback"],
  ["admin-contact", "Contact Details"],
];

export const fmtDate = (d?: Date | string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const DEFAULT_META: Pagination = {
  total: 0, limit: 10, page: 1, totalPages: 1,
  hasNextPage: false, hasPrevPage: false,
};

// ─── Component 
const ContactPage: FC<EnquiryResponse> = (props) => {
  const [tab, setTab] = useState<Tab>("enquiry");
  const { data, meta: initialMeta } = props
  const [initialLoad, setInitialLoad] = useState(true)

  // ── table state ──
  const [list, setList] = useState<ListItem[]>(data);
  const [meta, setMeta] = useState<Pagination>(initialMeta);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── admin-contact state ──
  const [essentials, setEssentials] = useState<AdminContactEssentials | null>(null);
  const [presents, setPresents] = useState<AdminContactPresents | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [savingEss, setSavingEss] = useState(false);
  const [savingPre, setSavingPre] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // ── per-row action state ──
  const [resolving, setResolving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);


  // ─── Fetch table data (enquiry / feedback) 
  const fetchList = async (t: Tab, pg = 1, limit = 10) => {
    if (t === "admin-contact") return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: pg.toString(), limit: limit ? limit.toString() : "10" });
      const { data } = await api.get<EnquiryResponse | FeedbackResponse>(
        `/${t}?${params}`
      );
      setList(data.data as ListItem[]);
      setMeta(data.meta);
      setPage(pg);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch admin contact 
  const fetchContact = async () => {
    setContactLoading(true);
    setContactError(null);
    try {
      const ess = await api.get("/admin-contact/essentials");
      const pre = await api.get("/admin-contact/presents");
      setPresents(pre.data.data);
      setEssentials(ess.data.data);
    } catch (e: any) {
      setContactError(e.message);
    } finally {
      setContactLoading(false);
    }
  };

  // ─── Tab switch 
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false)
      return
    }
    setList([]);
    setMeta(DEFAULT_META);
    setPage(1);
    setError(null);
    if (tab === "admin-contact") {
      fetchContact();
    } else {
      fetchList(tab, 1);
    }
  }, [tab]);

  // ─── Resolve (PATCH status → "resolved") 
  const resolve = async (id: string) => {
    setResolving(id);
    try {
      await api.patch(`/${tab}/${id}`, { status: "resolved" });

      setList((l) =>
        l.map((x) => (x.id === id ? { ...x, status: "resolved" as Status } : x))
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setResolving(null);
    }
  };

  // ─── Delete 
  const remove = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/${tab}/${id}`);
      const newList = list.filter((x) => x.id !== id);
      if (newList.length === 0 && page > 1) {
        fetchList(tab, page - 1);
      } else {
        setList(newList);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  // ─── Save essentials 
  const saveEssentials = async () => {
    if (!essentials) return;
    setSavingEss(true);
    console.log(essentials)
    try {
      await api.patch("/admin-contact/essentials", essentials);
    } catch (e: any) {
      setContactError(e.message);
    } finally {
      setSavingEss(false);
    }
  };

  // ─── Save presents (social + address) 
  const savePresents = async () => {
    if (!presents) return;
    setSavingPre(true);
    try {
      await api.patch("/admin-contact/presents", presents);
    } catch (e: any) {
      setContactError(e.message);
    } finally {
      setSavingPre(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>

      {/* Tab switcher */}
      <TabSwitcher setTab={setTab} tab={tab} tabOptions={tabOptions} />

      {/* Global error banner */}
      {error && (
        <div style={{ background: "#fef2f2", border: `1px solid #fecaca`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button onClick={() => setError(null)} style={{ ...btn("ghost"), padding: "2px 8px", fontSize: 12 }}>Dismiss</button>
        </div>
      )}

      {/* Enquiry / Feedback table */}
      <Table deleting={deleting} fetchList={fetchList} list={list} loading={loading} meta={meta} page={page} remove={remove} resolve={resolve} resolving={resolving} tab={tab} setPage={setPage} />

      {/* Admin Contact */}
      {tab === "admin-contact" && (
        <>
          {contactError && (
            <div style={{ background: "#fef2f2", border: `1px solid #fecaca`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 14 }}>
              {contactError}
            </div>
          )}

          {contactLoading && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <EssentialsCardLoading />
              <PresentsCardLoading />
            </div>
          )}

          {!contactLoading && essentials && presents && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <EssentialsCard essentials={essentials} saveEssentials={saveEssentials} savingEss={savingEss} setEssentials={setEssentials} />
              <PresentsCard presents={presents} savePresents={savePresents} savingPre={savingPre} setPresents={setPresents} />
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
};

export default ContactPage;