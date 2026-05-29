"use client"
import { useState, type FC } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Plus, Search, Edit2, Trash2, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { C } from "../../../constants/colors";
import { card, btn } from "../../../styles/shared";
import { Badge } from "../../../components/ui";
import { Faq, FaqResponse, type Pagination } from "@/types/dust";
import PaginationComponent from "@/components/ui/Pagination";
import LimitSelect from "@/components/ui/LimitSelect";
import { AccordionSkeleton, shimmerStyle } from "./loading";
import AddModal from "./_components/AddModal";
import DeleteModal from "./_components/DeleteModal";
import { api } from "@/lib/axios";
import { toast } from "sonner";

export interface FAQFormDraft {
  question: string;
  answer: string;
  isLink: boolean;
}

const EMPTY_DRAFT: FAQFormDraft = { question: "", answer: "", isLink: false }

const FAQPage: FC<FaqResponse> = (props) => {
  const { data: initialData, meta: initialMeta } = props
  const queryClient = useQueryClient()

  const [open, setOpen] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Faq | null>(null)
  const [form, setForm] = useState<FAQFormDraft>(EMPTY_DRAFT)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Faq | null>(null)

  // ─── Fetch FAQs ───────────────────────────────────────────────────────────
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["faqs", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search ? { search } : {}),
      })
      const { data } = await api.get(`/faq?${params}`)
      return data as { data: Faq[]; meta: Pagination }
    },
    initialData: search === "" && page === 1 && limit === 10
      ? { data: initialData, meta: initialMeta }
      : undefined,
    placeholderData: (prev) => prev, // keeps previous data while fetching (like keepPreviousData)
  })

  const list: Faq[] = data?.data ?? []
  const meta: Pagination = data?.meta ?? initialMeta

  // ─── Search debounce ──────────────────────────────────────────────────────
  const handleSearchChange = (val: string) => {
    setSearchInput(val)
    clearTimeout((handleSearchChange as any)._t)
    ;(handleSearchChange as any)._t = setTimeout(() => {
      setSearch(val)
      setPage(1)
    }, 400)
  }

  // ─── Save (Add / Edit) ────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (draft: FAQFormDraft) => {
      if (editing) {
        await api.patch(`/faq/${editing.id}`, draft)
      } else {
        await api.post("/faq", draft)
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Edited Successfully" : "Added Successfully")
      queryClient.invalidateQueries({ queryKey: ["faqs"] })
      if (!editing) setPage(1)
      setModal(false)
    },
    onError: (e) => {
      const msg = e instanceof AxiosError
        ? (e.response?.data?.error ?? e.message)
        : "Save failed"
      setFormError(msg)
      toast.error("Failed")
    },
  })

  const save = () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setFormError("Question and answer are required.")
      return
    }
    setFormError(null)
    saveMutation.mutate(form)
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/faq/${id}`)
    },
    onSuccess: () => {
      toast.success("Deleted Successfully")
      const newPage = list.length === 1 && page > 1 ? page - 1 : page
      setPage(newPage)
      queryClient.invalidateQueries({ queryKey: ["faqs"] })
    },
    onError: (e) => {
      const msg = e instanceof AxiosError
        ? (e.response?.data?.error ?? e.message)
        : "Delete failed"
      toast.error(msg)
    },
  })

  const confirmAndDelete = () => {
    if (!confirmDelete) return
    deleteMutation.mutate(confirmDelete.id!)
    setConfirmDelete(null)
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const openEdit = (f: Faq) => {
    setEditing(f)
    setForm({ question: f.question, answer: f.answer, isLink: f.isLink ?? false })
    setFormError(null)
    setModal(true)
  }

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_DRAFT)
    setFormError(null)
    setModal(true)
  }

  const onLimitChange = (val: number) => {
    setLimit(val)
    setPage(1)
  }

  const errorMsg = isError
    ? (error instanceof AxiosError ? (error.response?.data?.error ?? error.message) : "Failed to fetch FAQs")
    : null

  return (
    <div style={{ padding: 24 }}>
      <style>{shimmerStyle}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.t }}>Frequently Asked Questions</div>
          <div style={{ fontSize: 12, color: C.tm }}>
            {isFetching ? "Loading..." : `${meta.total} FAQs`}
          </div>
        </div>
        <button style={btn()} onClick={openAdd}><Plus size={15} />Add FAQ</button>
      </div>

      {errorMsg && (
        <div style={{ background: "#fef2f2", border: `1px solid #fecaca`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 14 }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {/* <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: C.white, border: `1px solid ${C.bd}`, borderRadius: 10, padding: "9px 12px" }}>
          <Search size={14} color={C.tm} />
          <input
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search FAQs..."
            style={{ border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", width: "100%", color: C.t }}
          />
          {isFetching && <Loader2 size={14} color={C.tm} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />}
        </div> */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LimitSelect onChange={onLimitChange} value={limit} />
        </div>
      </div>

      {/* Accordion list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {isFetching && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {Array.from({ length: 7 }).map((_, i) => <AccordionSkeleton key={i} wide={i % 2 === 0} />)}
          </div>
        )}

        {!isFetching && list.length === 0 && (
          <div style={{ ...card(), padding: 32, textAlign: "center", color: C.tm, fontSize: 13 }}>
            No FAQs found
          </div>
        )}

        {!isFetching && list.map((f) => (
          <div
            key={f.id}
            style={{
              ...card(), padding: 0, overflow: "hidden",
              opacity: deleteMutation.isPending && deleteMutation.variables === f.id ? 0.5 : 1,
              transition: "opacity 0.2s"
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", padding: "14px 16px", cursor: "pointer" }}
              onClick={() => setOpen(open === f.id ? null : f.id!)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: C.t }}>{f.question}</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {f.isLink && <Badge color="blue">Link</Badge>}
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(f) }}
                  style={{ ...btn("ghost"), padding: "4px 8px" }}
                  disabled={deleteMutation.isPending}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(f) }}
                  style={{ ...btn("ghost"), padding: "4px 8px", color: C.red }}
                  disabled={deleteMutation.isPending && deleteMutation.variables === f.id}
                >
                  {deleteMutation.isPending && deleteMutation.variables === f.id
                    ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                    : <Trash2 size={13} />
                  }
                </button>
                {open === f.id ? <ChevronDown size={16} color={C.tm} /> : <ChevronRight size={16} color={C.tm} />}
              </div>
            </div>
            {open === f.id && (
              <div style={{ padding: "12px 16px 14px", color: C.tm, fontSize: 13, borderTop: `1px solid ${C.bd}` }}>
                {f.isLink
                  ? <a href={f.answer} target="_blank" rel="noreferrer" style={{ color: C.p }}>{f.answer}</a>
                  : f.answer
                }
              </div>
            )}
          </div>
        ))}
      </div>

      <PaginationComponent meta={meta} page={page} loading={isFetching} onPageChange={setPage} />

      <AddModal
        editing={editing} form={form} formError={formError}
        modal={modal} save={save} saving={saveMutation.isPending}
        setForm={setForm} setModal={setModal}
      />

      <DeleteModal
        confirmAndDelete={confirmAndDelete}
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default FAQPage