"use client"
import { useState, useEffect, useCallback, type FC } from "react";
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

export interface FAQFormDraft {
  question: string;
  answer: string;
  isLink: boolean;
}

const EMPTY_DRAFT: FAQFormDraft = { question: "", answer: "", isLink: false }

const FAQPage: FC<FaqResponse> = (props) => {
  const { data, meta: initialMeta } = props
  const [list, setList] = useState<Faq[]>(data)
  const [meta, setMeta] = useState<Pagination>(initialMeta)
  const [open, setOpen] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Faq | null>(null)
  const [form, setForm] = useState<FAQFormDraft>(EMPTY_DRAFT)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)

  const [confirmDelete, setConfirmDelete] = useState<Faq | null>(null)

  const fetchFaqs = useCallback(async (pg = page, lmt = limit, q = search) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pg.toString(),
        limit: lmt.toString(),
        ...(q ? { search: q } : {}),
      })
      const { data } = await api.get(`/faq?${params}`)
      setList(data.data)
      setMeta(data.meta)
    } catch (e) {
      const msg = e instanceof AxiosError
        ? (e.response?.data?.error ?? e.message)
        : "Failed to fetch FAQs"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false)
      return
    }
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
      fetchFaqs(1, limit, searchInput)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false)
      return
    }
    fetchFaqs(page, limit, search)

  }, [page, limit])

  const onLimitChange = (val: number) => {
    setLimit(val)
    setPage(1)
  }

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

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setFormError("Question and answer are required.")
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      if (editing) {
        await api.patch(`/faq/${editing.id}`, form)
        setList((l) => l.map((f) => (f.id === editing.id ? { ...f, ...form } : f)))
      } else {
        await api.post("/faq", form)
        setPage(1)
        await fetchFaqs(1, limit, search)
      }
      setModal(false)
    } catch (e) {
      const msg = e instanceof AxiosError
        ? (e.response?.data?.error ?? e.message)
        : "Save failed"
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  const promptDelete = (f: Faq) => {
    setConfirmDelete(f)
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    const id = confirmDelete.id!
    setConfirmDelete(null)
    setDeleting(id)
    try {
      await api.delete(`/faq/${id}`)
      const newPage = list.length === 1 && page > 1 ? page - 1 : page
      setPage(newPage)
      await fetchFaqs(newPage, limit, search)
    } catch (e) {
      const msg = e instanceof AxiosError
        ? (e.response?.data?.error ?? e.message)
        : "Delete failed"
      setError(msg)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <style>{shimmerStyle}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.t }}>Frequently Asked Questions</div>
          <div style={{ fontSize: 12, color: C.tm }}>
            {loading ? "Loading..." : `${meta.total} FAQs`}
          </div>
        </div>
        <button style={btn()} onClick={openAdd}><Plus size={15} />Add FAQ</button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: `1px solid #fecaca`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: C.white, border: `1px solid ${C.bd}`, borderRadius: 10, padding: "9px 12px" }}>
          <Search size={14} color={C.tm} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search FAQs..."
            style={{ border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", width: "100%", color: C.t }}
          />
          {loading && <Loader2 size={14} color={C.tm} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LimitSelect onChange={(val) => { onLimitChange(val) }} value={limit} />
        </div>
      </div>

      {/* Accordion list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <AccordionSkeleton wide />
            <AccordionSkeleton />
            <AccordionSkeleton wide />
            <AccordionSkeleton />
            <AccordionSkeleton wide />
            <AccordionSkeleton />
            <AccordionSkeleton wide />
          </div>
        )}

        {!loading && list.length === 0 && (
          <div style={{ ...card(), padding: 32, textAlign: "center", color: C.tm, fontSize: 13 }}>
            No FAQs found
          </div>
        )}
        {!loading && list.length > 0 && (
          list.map((f) => (
            <div key={f.id} style={{ ...card(), padding: 0, overflow: "hidden", opacity: deleting === f.id ? 0.5 : 1, transition: "opacity 0.2s" }}>
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
                    disabled={!!deleting}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); promptDelete(f) }}
                    style={{ ...btn("ghost"), padding: "4px 8px", color: C.red }}
                    disabled={deleting === f.id}
                  >
                    {deleting === f.id
                      ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                      : <Trash2 size={13} />
                    }
                  </button>
                  {open === f.id
                    ? <ChevronDown size={16} color={C.tm} />
                    : <ChevronRight size={16} color={C.tm} />
                  }
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
          ))
        )}
      </div>

      {/* Pagination */}
      <PaginationComponent
        meta={meta}
        page={page}
        loading={loading}
        onPageChange={setPage}
      />

      {/* Add / Edit Modal */}
      <AddModal editing={editing} form={form} formError={formError} modal={modal} save={save} saving={saving} setForm={setForm} setModal={setModal} />

      {/* Delete Confirmation Modal */}
      <DeleteModal confirmAndDelete={confirmAndDelete} confirmDelete={confirmDelete} setConfirmDelete={setConfirmDelete} />

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default FAQPage