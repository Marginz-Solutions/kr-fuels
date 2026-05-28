"use client";
import {
  type FC,
  type ChangeEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Check,
  Edit2,
  Eye,
  EyeOff,
  MessageSquareQuote,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EMPTY_DRAFT, Testimonial, TestimonialFormDraft } from "@/types";
import { fetchTestimonials, createTestimonial, updateTestimonial, toggleTestimonial, deleteTestimonial } from "@/lib/api/testimonials";
import TestimonialAvatar from "./components/Testimonialavatar";
import StarRating from "./components/Starrating";
import { uploadTestimonialImage } from "@/lib/api/testimonials";

// ─── Utility ──────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface TestimonialsPageProps {
  initialTestimonials: Testimonial[];
}

// ─── ActiveBadge ──────────────────────────────────────────────────────────────

const ActiveBadge: FC<{ active: boolean }> = ({ active }) => (
  <span
    className={[
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      active
        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
        : "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
    ].join(" ")}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
    {active ? "Active" : "Inactive"}
  </span>
);

// ─── FieldLabel ───────────────────────────────────────────────────────────────

const FieldLabel: FC<{ children: React.ReactNode; htmlFor?: string }> = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
  >
    {children}
  </label>
);

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";

// ─── ConfirmDialog ────────────────────────────────────────────────────────────

const ConfirmDialog: FC<{
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}> = ({ name, onConfirm, onCancel, isDeleting }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-title"
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
        <Trash2 className="w-5 h-5 text-red-500" />
      </div>
      <h3 id="confirm-title" className="text-base font-semibold text-gray-900 text-center mb-1">
        Delete Testimonial?
      </h3>
      <p className="text-sm text-gray-500 text-center mb-6">
        You&apos;re about to delete{" "}
        <span className="font-medium text-gray-700">{name}&apos;s</span> review.
        This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 rounded-xl bg-red-500 py-2.5 text sm font-medium text-white hover:bg-red-600 transition flex items-center justify-center"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </div>
  </div>
);

// ─── TestimonialModal ─────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  editing: Testimonial | null;
  form: TestimonialFormDraft;
  onChange: (patch: Partial<TestimonialFormDraft>) => void;
  onSave: (uploadedImageUrl?: string) => void;
  onClose: () => void;
  isSaving: boolean;
}

const TestimonialModal: FC<ModalProps> = ({
  open,
  editing,
  form,
  onChange,
  onSave,
  onClose,
  isSaving,
}) => {
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(form.image ?? "");

  if (!open) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const field =
    (key: keyof TestimonialFormDraft) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ [key]: e.target.value });


const handleSave = async () => {
  let uploadedUrl: string | undefined;
  if (pendingFile) {
    try {
      setUploading(true);
      uploadedUrl = await uploadTestimonialImage(pendingFile); // ← clean one-liner
    } catch (err) {
      console.error("Upload failed:", err);
      setUploading(false);
      return;
    } finally {
      setUploading(false);
    }
  }
  onSave(uploadedUrl);
};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <MessageSquareQuote className="w-5 h-5 text-teal-700" />
            <h2 id="modal-title" className="text-base font-semibold text-gray-900">
              {editing ? "Edit Testimonial" : "Add Testimonial"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="m-name">Customer Name *</FieldLabel>
              <input
                id="m-name"
                className={inputCls}
                value={form.name}
                onChange={field("name")}
                placeholder="Full name"
                autoComplete="off"
              />
            </div>
            <div>
              <FieldLabel htmlFor="m-designation">Designation</FieldLabel>
              <input
                id="m-designation"
                className={inputCls}
                value={form.designation}
                onChange={field("designation")}
                placeholder="e.g. Fleet Manager"
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="m-company">Company</FieldLabel>
            <input
              id="m-company"
              className={inputCls}
              value={form.company}
              onChange={field("company")}
              placeholder="e.g. Tamil Nadu Transport Corp."
            />
          </div>

          <div>
            <FieldLabel htmlFor="m-image">Customer Image</FieldLabel>
            <input
              id="m-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={inputCls}
            />
            {uploading && (
              <p className="text-xs text-gray-500 mt-2">Uploading image...</p>
            )}
            {previewUrl && (
              <div className="mt-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border border-gray-200"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="m-rating">Star Rating</FieldLabel>
              <select
                id="m-rating"
                className={inputCls}
                value={form.rating}
                onChange={field("rating")}
              >
                <option value="">— No rating —</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)}{"☆".repeat(5 - n)} ({n})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => onChange({ isActive: !form.isActive })}
                className={[
                  "w-full rounded-xl border py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition",
                  form.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100",
                ].join(" ")}
              >
                {form.isActive ? (
                  <><Eye className="w-4 h-4" /> Published</>
                ) : (
                  <><EyeOff className="w-4 h-4" /> Hidden</>
                )}
              </button>
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="m-message">
              Review Message ({form.message.length}/500)
            </FieldLabel>
            <textarea
              id="m-message"
              className={`${inputCls} resize-vertical min-h-[110px]`}
              maxLength={500}
              value={form.message}
              onChange={field("message")}
              placeholder="Customer review text..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || !form.message.trim() || isSaving}
            className="flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {editing ? "Update" : "Add"} Testimonial
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const TestimonialsPage: FC<TestimonialsPageProps> = ({ initialTestimonials }) => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialFormDraft>(EMPTY_DRAFT);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  // useSuspenseQuery suspends while loading (triggers loading.tsx)
  // and throws on error (triggers error.tsx) — no manual handling needed.
  const { data: list = [] } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
    initialData: initialTestimonials,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setModalOpen(false);
    },
    onError: (error: Error) => {
      console.error("Create failed:", error.message);
    },
  });

  const updateMutation = useMutation({
  mutationFn: ({ id, form }: { id: string; form: TestimonialFormDraft }) =>
    updateTestimonial(id, form),

  onMutate: async ({ id, form }) => {
    await queryClient.cancelQueries({ queryKey: ["testimonials"] });
    const previous = queryClient.getQueryData<Testimonial[]>(["testimonials"]);

    queryClient.setQueryData<Testimonial[]>(["testimonials"], (old = []) =>
      old.map((t) =>
        t.id === id
          ? {
              ...t,
              name: form.name,
              designation: form.designation,
              company: form.company,
              message: form.message,
              image: form.image,
              rating: form.rating === "" ? undefined : Number(form.rating),
              isActive: form.isActive,
              updatedAt: Date.now(),
            }
          : t
      )
    );

    setModalOpen(false); // ← close modal instantly

    return { previous };
  },

  onError: (error: Error, _vars, context) => {
    if (context?.previous) {
      queryClient.setQueryData(["testimonials"], context.previous);
    }
    setModalOpen(true); // ← reopen modal on failure
    console.error("Update failed:", error.message);
  },

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["testimonials"] });
  },
});

  const toggleMutation = useMutation({
    mutationFn: toggleTestimonial,

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["testimonials"] });
      const previous = queryClient.getQueryData<Testimonial[]>(["testimonials"]);

      queryClient.setQueryData<Testimonial[]>(["testimonials"], (old = []) =>
        old.map((t) =>
          t.id === id ? { ...t, isActive: !t.isActive } : t
        )
      );

      return { previous };
    },

    onError: (error: Error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["testimonials"], context.previous);
      }
      console.error("Toggle failed:", error.message);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTestimonial,

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["testimonials"] });
      const previous = queryClient.getQueryData<Testimonial[]>(["testimonials"]);

      queryClient.setQueryData<Testimonial[]>(["testimonials"], (old = []) =>
        old.filter((t) => t.id !== id)
      );

      setDeleteTarget(null); // ← close dialog instantly

      return { previous };
    },

    onError: (error: Error, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["testimonials"], context.previous);
      }
      const restored = context?.previous?.find((t) => t.id === id) ?? null;
      setDeleteTarget(restored); // ← reopen dialog for same testimonial
      console.error("Delete failed:", error.message);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Derived list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list.filter((t) => {
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q) ||
        (t.company ?? "").toLowerCase().includes(q) ||
        (t.designation ?? "").toLowerCase().includes(q);
      const matchFilter =
        filterActive === "all" ||
        (filterActive === "active" && t.isActive) ||
        (filterActive === "inactive" && !t.isActive);
      return matchSearch && matchFilter;
    });
  }, [list, search, filterActive]);

  const stats = useMemo(
    () => ({
      total: list.length,
      active: list.filter((t) => t.isActive).length,
    }),
    [list]
  );

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_DRAFT);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((t: Testimonial) => {
    setEditing(t);
    setForm({
      name: t.name,
      designation: t.designation ?? "",
      company: t.company ?? "",
      message: t.message,
      image: t.image ?? "",
      rating: t.rating ?? "",
      isActive: t.isActive,
    });
    setModalOpen(true);
  }, []);

  const patchForm = useCallback((patch: Partial<TestimonialFormDraft>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const save = useCallback((uploadedImageUrl?: string) => {
    const payload: TestimonialFormDraft = {
      ...form,
      rating: form.rating === "" ? "" : Number(form.rating),
      image: uploadedImageUrl ?? form.image,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, form: payload });
    } else {
      createMutation.mutate(payload);
    }
  }, [editing, form, createMutation, updateMutation]);

  const toggleActive = useCallback((id: string) => {
    toggleMutation.mutate(id);
  }, [toggleMutation]);

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  }, [deleteTarget, deleteMutation]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full p-4 sm:p-6 bg-gray-50">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customer Testimonials</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {stats.active} active · {stats.total} total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_0_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, review…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm font-medium shrink-0">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterActive(f)}
                className={[
                  "px-3.5 py-2 capitalize transition",
                  filterActive === f
                    ? "bg-teal-700 text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table — desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Customer", "Designation / Company", "Message", "Rating", "Status", "Last Updated", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400 text-sm">
                    No testimonials match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <TestimonialAvatar name={t.name} image={t.image} size="sm" />
                        <span className="font-medium text-gray-900 text-sm">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 max-w-[160px]">
                      <div className="text-gray-700 text-xs font-medium truncate">{t.designation || "—"}</div>
                      <div className="text-gray-400 text-xs truncate">{t.company || ""}</div>
                    </td>
                    <td className="px-5 py-3.5 max-w-[280px]">
                      <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">{t.message}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {t.rating !== undefined ? <StarRating rating={t.rating} /> : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <ActiveBadge active={t.isActive} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-400 text-xs">
                      {formatDate(t.updatedAt)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleActive(t.id)}
                          title={t.isActive ? "Hide testimonial" : "Publish testimonial"}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                        >
                          {t.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => openEdit(t)}
                          title="Edit"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-teal-50 hover:text-teal-700 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          title="Delete"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Card list — mobile */}
        <div className="md:hidden divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-gray-400 text-sm">No testimonials match your search.</p>
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <TestimonialAvatar name={t.name} image={t.image} size="md" />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                      {(t.designation || t.company) && (
                        <div className="text-xs text-gray-500">
                          {[t.designation, t.company].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </div>
                  </div>
                  <ActiveBadge active={t.isActive} />
                </div>
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">{t.message}</p>
                <div className="flex items-center justify-between">
                  {t.rating !== undefined ? <StarRating rating={t.rating} /> : <span />}
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(t.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
                      {t.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => openEdit(t)} className="w-8 h-8 rounded-lg flex items-center justify-center text-teal-600 hover:bg-teal-50 transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(t)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 text-xs text-gray-400">
            Showing {filtered.length} of {list.length} testimonials
          </div>
        )}
      </div>

      {/* Modal */}
      <TestimonialModal
        open={modalOpen}
        editing={editing}
        form={form}
        onChange={patchForm}
        onSave={save}
        onClose={() => setModalOpen(false)}
        isSaving={isSaving}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => !deleteMutation.isPending && setDeleteTarget(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default TestimonialsPage;