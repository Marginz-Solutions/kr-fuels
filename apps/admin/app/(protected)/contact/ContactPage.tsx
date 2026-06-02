"use client"
import { useEffect, useState, type FC } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { C } from "../../../constants/colors";
import type { BadgeColor } from "../../../types";
import type { AdminContactEssentials, AdminContactPresents, EnquiryResponse, FeedbackResponse, Enquiry, Feedback, Pagination, FirestoreTimestamp } from "@/types/dust";
import { api } from "@/lib/axios";
import { TabSwitcher } from "./_components/TabSwitcher";
import Table from "./_components/Table";
import EssentialsCard from "./_components/EssentialsCard";
import PresentsCard from "./_components/PresentsCard";
import { EssentialsCardLoading, PresentsCardLoading } from "@/components/ui/AdminContactCardSkeleton";
import { toast } from "sonner";

export type Tab = "enquiry" | "feedback" | "admin-contact";
export type ListItem = Enquiry | Feedback;
export type Status = Feedback["status"];

export const STATUS_COLOR_MAP: Record<string, BadgeColor> = {
  "resolved": "green",
  "in-progress": "blue",
  "pending": "amber",
}

export const statusColor = (s: string): BadgeColor => STATUS_COLOR_MAP[s] ?? "amber"
export const statusLabel = (s: string): string =>
  s === "in-progress" ? "In Progress" : s?.charAt(0).toUpperCase() + s?.slice(1);

export const tabOptions: Array<[Tab, string]> = [
  ["enquiry", "Form Submissions"],
  ["feedback", "Feedback"],
  ["admin-contact", "Contact Details"],
];



export const fmtDate = (d?: Date | string | FirestoreTimestamp | null) => {
  if (!d) return "—";

  // Serialized Firestore Timestamp { _seconds, _nanoseconds }
  if (typeof d === "object" && "_seconds" in d) {
    return new Date(d._seconds * 1000).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  // Plain Date or string
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const DEFAULT_META: Pagination = {
  total: 0, limit: 10, page: 1, totalPages: 1,
  hasNextPage: false, hasPrevPage: false,
};

// ─── Component ────────────────────────────────────────────────────────────────
const ContactPage: FC<EnquiryResponse> = (props) => {
  const { data: initialData, meta: initialMeta } = props
  const queryClient = useQueryClient()

  const [tab, setTab] = useState<Tab>("enquiry")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Honour deep links from the dashboard tiles, e.g.
  //   /contact?tab=feedback&status=pending  /contact?tab=submissions
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get("tab")
    if (t === "feedback") setTab("feedback")
    else if (t === "submissions" || t === "enquiry") setTab("enquiry")
    else if (t === "admin-contact" || t === "contact") setTab("admin-contact")
  }, [])

  // ── admin-contact local state (forms) ──
  const [essentials, setEssentials] = useState<AdminContactEssentials | null>(null)
  const [presents, setPresents] = useState<AdminContactPresents | null>(null)

  // ─── Fetch enquiry / feedback list ───────────────────────────────────────
  const {
    data: listData,
    isFetching: loading,
    isError,
    error: listError,
    refetch: refetchList,
  } = useQuery({
    queryKey: ["contact-list", tab, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      const { data } = await api.get<EnquiryResponse | FeedbackResponse>(`/${tab}?${params}`)
      return data
    },
    enabled: tab !== "admin-contact",
    initialData: tab === "enquiry" && page === 1 && limit === 10
      ? { data: initialData, meta: initialMeta }
      : undefined,
    placeholderData: (prev) => prev,
  })

  const list: ListItem[] = (listData?.data as ListItem[]) ?? []
  const meta: Pagination = listData?.meta ?? DEFAULT_META

  // ─── Fetch admin contact ─────────────────────────────────────────────────
  const {
    isFetching: contactLoading,
    isError: isContactError,
    error: contactError,
  } = useQuery({
    queryKey: ["admin-contact"],
    queryFn: async () => {
      const [ess, pre] = await Promise.all([
        api.get("/admin-contact/essentials"),
        api.get("/admin-contact/presents"),
      ])
      setEssentials(ess.data.data)
      setPresents(pre.data.data)
      return { essentials: ess.data.data, presents: pre.data.data }
    },
    enabled: tab === "admin-contact",
    staleTime: Infinity, // don't re-fetch unless invalidated
  })

  // ─── Resolve mutation ────────────────────────────────────────────────────
  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/${tab}/${id}`, { status: "resolved" }),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ["contact-list", tab, page, limit],
        (old: any) => old
          ? { ...old, data: old.data.map((x: ListItem) => x.id === id ? { ...x, status: "resolved" } : x) }
          : old
      )
      toast.success("Status Updated")
    },
    onError: () => toast.error("Failed"),
  })

  // ─── Delete mutation ─────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/${tab}/${id}`),
    onSuccess: (_, id) => {
      toast.success("Deleted Successfully")
      const isLastOnPage = list.length === 1 && page > 1
      if (isLastOnPage) {
        setPage((p) => p - 1)
      } else {
        queryClient.invalidateQueries({ queryKey: ["contact-list", tab] })
      }
    },
    onError: () => toast.error("Failed"),
  })

  // ─── Save essentials mutation ─────────────────────────────────────────────
  const saveEssentialsMutation = useMutation({
    mutationFn: () => api.patch("/admin-contact/essentials", essentials),
    onSuccess: () => toast.success("Saved"),
    onError: () => toast.error("Failed"),
  })

  // ─── Save presents mutation ───────────────────────────────────────────────
  const savePresentsMutation = useMutation({
    mutationFn: () => api.patch("/admin-contact/presents", presents),
    onSuccess: () => toast.success("Saved"),
    onError: () => toast.error("Failed"),
  })

  const errorMsg = isError
    ? (listError instanceof AxiosError ? (listError.response?.data?.error ?? listError.message) : "Failed to fetch")
    : null

  const contactErrorMsg = isContactError
    ? (contactError instanceof AxiosError ? (contactError.response?.data?.error ?? contactError.message) : "Failed to fetch contact")
    : null

  const handleTabChange = (t: Tab) => {
    setTab(t)
    setPage(1)
  }

  return (
    <div style={{ padding: 24 }}>

      <TabSwitcher setTab={handleTabChange} tab={tab} tabOptions={tabOptions} />

      {errorMsg && (
        <div style={{ background: "#fef2f2", border: `1px solid #fecaca`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {errorMsg}
        </div>
      )}

      <Table
        tab={tab}
        meta={meta}
        list={list}
        loading={loading}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        deleting={deleteMutation.isPending ? deleteMutation.variables ?? null : null}
        resolving={resolveMutation.isPending ? resolveMutation.variables ?? null : null}
        refetch={() => refetchList()}
        resolve={(id) => resolveMutation.mutate(id)}
        remove={(id) => deleteMutation.mutate(id)}
      />

      {tab === "admin-contact" && (
        <>
          {contactErrorMsg && (
            <div style={{ background: "#fef2f2", border: `1px solid #fecaca`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 14 }}>
              {contactErrorMsg}
            </div>
          )}

          {contactLoading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 20 }}>
              <EssentialsCardLoading />
              <PresentsCardLoading />
            </div>
          )}

          {!contactLoading && essentials && presents && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
              gap: 20,
            }}>
              <EssentialsCard
                essentials={essentials}
                saveEssentials={() => saveEssentialsMutation.mutate()}
                savingEss={saveEssentialsMutation.isPending}
                setEssentials={setEssentials}
              />
              <PresentsCard
                presents={presents}
                savePresents={() => savePresentsMutation.mutate()}
                savingPre={savePresentsMutation.isPending}
                setPresents={setPresents}
              />
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default ContactPage