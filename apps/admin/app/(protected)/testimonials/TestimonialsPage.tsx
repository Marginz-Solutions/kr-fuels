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
import {
  fetchTestimonials,
  createTestimonial,
  updateTestimonial,
  toggleTestimonial,
  deleteTestimonial,
  uploadTestimonialImage,
} from "@/lib/api/testimonials";
import TestimonialAvatar from "./components/Testimonialavatar";
import StarRating from "./components/Starrating";
import { toast } from "sonner";
import { C } from "../../../constants/colors";
import { card, btn, inp, iconBtn } from "../../../styles/shared";
import { Badge, StatCard } from "../../../components/ui";
import { fmtDate } from "../contact/ContactPage";

interface TestimonialsPageProps {
  initialTestimonials: Testimonial[];
}

// ─── FieldLabel ───────────────────────────────────────────────────────────────

const FieldLabel: FC<{ children: React.ReactNode; htmlFor?: string }> = ({
  children,
  htmlFor,
}) => (
  <label
    htmlFor={htmlFor}
    style={{
      display: "block",
      fontSize: 11,
      fontWeight: 600,
      color: C.tm,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      marginBottom: 6,
    }}
  >
    {children}
  </label>
);

// ─── ConfirmDialog (Delete Modal) ─────────────────────────────────────────────

const ConfirmDialog: FC<{
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}> = ({ name, onConfirm, onCancel, isDeleting }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      zIndex: 1100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-title"
  >
    <div
      style={{
        background: C.white,
        borderRadius: 16,
        padding: 28,
        width: 380,
        boxShadow: "0 14px 44px rgba(26,46,41,0.16)",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: `${C.red}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <Trash2 size={22} color={C.red} />
      </div>

      {/* Text */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          id="confirm-title"
          style={{ fontWeight: 700, fontSize: 16, color: C.t, marginBottom: 6 }}
        >
          Delete Testimonial
        </div>
        <div style={{ fontSize: 13, color: C.tm, lineHeight: 1.5 }}>
          Are you sure you want to delete{" "}
          <span style={{ fontWeight: 600, color: C.t }}>{name}&apos;s</span>{" "}
          review? This action cannot be undone.
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onCancel}
          disabled={isDeleting}
          style={{ ...btn("ghost"), flex: 1, justifyContent: "center" }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          style={{
            ...btn(),
            flex: 1,
            justifyContent: "center",
            background: C.red,
            borderColor: C.red,
          }}
        >
          {isDeleting ? (
            <div
              style={{
                width: 14,
                height: 14,
                border: `2px solid ${C.white}`,
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }}
            />
          ) : (
            <>
              <Trash2 size={14} /> Delete
            </>
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

const inputStyle = {
  ...inp({ width: "100%" }),
  borderRadius: 10,
  fontSize: 13,
  padding: "9px 12px",
};

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
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      onChange({ [key]: e.target.value });

  const handleSave = async () => {
    let uploadedUrl: string | undefined;
    if (pendingFile) {
      try {
        setUploading(true);
        uploadedUrl = await uploadTestimonialImage(pendingFile);
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

  const disabled =
    !form.name.trim() ||
    !form.message.trim() ||
    isSaving ||
    uploading ||
    !form.designation.trim() ||
    !form.company.trim();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        style={{
          background: C.white,
          borderRadius: 16,
          boxShadow: "0 16px 48px rgba(26,46,41,0.16)",
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${C.bd}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${C.p}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquareQuote size={16} color={C.p} />
            </div>
            <span
              id="modal-title"
              style={{ fontWeight: 700, fontSize: 15, color: C.t }}
            >
              {editing ? "Edit Testimonial" : "Add Testimonial"}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              ...btn("ghost"),
              padding: 7,
              borderRadius: "50%",
              color: C.tm,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Row: Name + Designation */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
            <div>
              <FieldLabel htmlFor="m-name">Customer Name *</FieldLabel>
              <input
                id="m-name"
                style={inputStyle}
                value={form.name}
                onChange={field("name")}
                placeholder="Full name"
                autoComplete="off"
              />
            </div>
            <div>
              <FieldLabel htmlFor="m-designation">Designation *</FieldLabel>
              <input
                id="m-designation"
                style={inputStyle}
                value={form.designation}
                onChange={field("designation")}
                placeholder="e.g. Fleet Manager"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <FieldLabel htmlFor="m-company">Company *</FieldLabel>
            <input
              id="m-company"
              style={inputStyle}
              value={form.company}
              onChange={field("company")}
              placeholder="e.g. Tamil Nadu Transport Corp."
            />
          </div>

          {/* Image */}
          <div>
            <FieldLabel htmlFor="m-image">Customer Image</FieldLabel>
            <input
              id="m-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ ...inputStyle, cursor: "pointer" }}
            />
            {uploading && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: C.tm,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    border: `2px solid ${C.p}`,
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                Uploading image…
              </div>
            )}
            {previewUrl && (
              <div style={{ marginTop: 10 }}>
                {/* Local object-URL preview — next/image can't optimize blob: URLs */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${C.bd}`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Row: Rating + Status */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
            <div>
              <FieldLabel htmlFor="m-rating">Star Rating</FieldLabel>
              <select
                id="m-rating"
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.rating}
                onChange={field("rating")}
              >
                <option value="">— No rating —</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)}
                    {"☆".repeat(5 - n)} ({n})
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
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: `1px solid ${form.isActive ? C.p + "55" : C.bd}`,
                  background: form.isActive ? `${C.p}12` : C.bg,
                  color: form.isActive ? C.p : C.tm,
                  padding: "9px 12px",
                  fontSize: 13,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {form.isActive ? (
                  <>
                    <Eye size={14} /> Published
                  </>
                ) : (
                  <>
                    <EyeOff size={14} /> Hidden
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Message */}
          <div>
            <FieldLabel htmlFor="m-message">
              Review Message ({form.message.length}/500)
            </FieldLabel>
            <textarea
              id="m-message"
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 110,
                lineHeight: 1.5,
              }}
              maxLength={500}
              value={form.message}
              onChange={field("message")}
              placeholder="Customer review text…"
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            padding: "14px 20px",
            borderTop: `1px solid ${C.bd}`,
            background: C.bg,
          }}
        >
          <button
            onClick={onClose}
            style={{ ...btn("ghost"), padding: "8px 18px" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={disabled}
            style={{
              ...btn(),
              padding: "8px 20px",
              opacity: disabled ? 0.45 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            {isSaving || uploading ? (
              <div
                style={{
                  width: 14,
                  height: 14,
                  border: `2px solid ${C.white}`,
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.6s linear infinite",
                }}
              />
            ) : (
              <Check size={14} />
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
  const { data: list = [], isLoading } = useQuery({
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
      toast.success("Testimonial added successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to add testimonial: " + error.message);
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
                updatedAt: new Date(), 
              }
            : t
        )
      );
      setModalOpen(false);
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(["testimonials"], context.previous);
      setModalOpen(true);
      toast.error("Failed to update testimonial: " + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial updated successfully!");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTestimonial,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["testimonials"] });
      const previous = queryClient.getQueryData<Testimonial[]>(["testimonials"]);
      queryClient.setQueryData<Testimonial[]>(["testimonials"], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
      );
      return { previous };
    },
    onError: (error: Error, _id, context) => {
      if (context?.previous)
        queryClient.setQueryData(["testimonials"], context.previous);
      toast.error("Failed to toggle testimonial: " + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial status updated!");
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
      setDeleteTarget(null);
      return { previous };
    },
    onError: (error: Error, id, context) => {
      if (context?.previous)
        queryClient.setQueryData(["testimonials"], context.previous);
      const restored = context?.previous?.find((t) => t.id === id) ?? null;
      setDeleteTarget(restored);
      toast.error("Failed to delete testimonial: " + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial deleted successfully!");
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
      inactive: list.filter((t) => !t.isActive).length,
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

  const save = useCallback(
    (uploadedImageUrl?: string) => {
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
    },
    [editing, form, createMutation, updateMutation]
  );

  const toggleActive = useCallback(
    (id: string) => {
      toggleMutation.mutate(id);
    },
    [toggleMutation]
  );

  const confirmDelete = useCallback(() => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  }, [deleteTarget, deleteMutation]);

  // ── Skeleton rows ──────────────────────────────────────────────────────────
  const SkeletonTable = () => (
    <>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: C.bg }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <th key={i} style={{ padding: "10px 16px" }}>
                <div className="sk" style={{ height: 11, width: i === 6 ? 50 : 70 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, ri) => (
            <tr
              key={ri}
              style={{
                borderTop: `1px solid ${C.bd}`,
                background: ri % 2 === 0 ? C.white : "#fafcfb",
              }}
            >
              {Array.from({ length: 7 }).map((_, ci) => (
                <td key={ci} style={{ padding: "12px 16px" }}>
                  <div
                    className="sk"
                    style={{
                      height: 13,
                      width: ci === 0 ? "75%" : ci === 2 ? "90%" : ci === 6 ? "60%" : "65%",
                      animationDelay: `${ri * 0.07}s`,
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 24 }}>
      {/* spin keyframe */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard icon={<MessageSquareQuote size={18} />} label="Total Testimonials" value={stats?.total} sub="All reviews" />
        <StatCard icon={<Eye size={18} />} label="Active" value={stats?.active} sub="Published" />
        <StatCard icon={<EyeOff size={18} />} label="Inactive" value={stats?.inactive} sub="Hidden" />
      </div>

      {/* Main card */}
      <div style={{ ...card(), padding: 0, overflow: "hidden" }}>

        {/* Toolbar */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: `1px solid ${C.bd}`,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div
            style={{
              flex: 1,
              minWidth: 200,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: C.bg,
              borderRadius: 10,
              padding: "7px 12px",
              border: `1px solid ${C.bd}`,
            }}
          >
            <Search size={14} color={C.tm} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, review…"
              style={{
                border: "none",
                background: "transparent",
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                width: "100%",
                color: C.t,
              }}
            />
          </div>

          {/* Filter tabs */}
          <div
            style={{
              display: "flex",
              borderRadius: 10,
              border: `1px solid ${C.bd}`,
              overflow: "hidden",
            }}
          >
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterActive(f)}
                style={{
                  ...btn(filterActive === f ? "primary" : "ghost"),
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 0,
                  border: "none",
                  textTransform: "capitalize",
                  background: filterActive === f ? C.p : "transparent",
                  color: filterActive === f ? C.white : C.tm,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Add button */}
          <button style={btn()} onClick={openAdd}>
            <Plus size={14} /> Add Testimonial
          </button>
        </div>

        {/* Skeleton loading */}
        {isLoading && <SkeletonTable />}

        {/* Desktop table */}
        {!isLoading && (
          <div
            style={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Desktop table — hidden on mobile via CSS */}
            <table
              style={{
                width: "100%",
                minWidth: 800,
                borderCollapse: "collapse",
              }}
              className="testimonials-desktop-table"
            >
              <thead>
                <tr style={{ background: C.bg }}>
                  {[
                    "Customer",
                    "Designation / Company",
                    "Message",
                    "Rating",
                    "Status",
                    "Last Updated",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.tm,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: "64px 16px",
                        textAlign: "center",
                        color: C.tm,
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <MessageSquareQuote size={32} color={C.bd} />
                        <span>No testimonials match your search.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t, i) => (
                    <tr
                      key={t.id}
                      style={{
                        borderTop: `1px solid ${C.bd}`,
                        background: i % 2 === 0 ? C.white : "#fafcfb",
                      }}
                    >
                      {/* Customer */}
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <TestimonialAvatar name={t.name} image={t.image} size="sm" />
                          <span
                            style={{ fontWeight: 500, color: C.t, fontSize: 13 }}
                          >
                            {t.name}
                          </span>
                        </div>
                      </td>

                      {/* Designation / Company */}
                      <td
                        style={{
                          padding: "12px 16px",
                          maxWidth: 160,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            color: C.t,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {t.designation || "—"}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: C.tm,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {t.company || ""}
                        </div>
                      </td>

                      {/* Message */}
                      <td
                        style={{
                          padding: "12px 16px",
                          maxWidth: 280,
                          fontSize: 12,
                          color: C.tm,
                          lineHeight: 1.5,
                        }}
                      >
                        <div
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {t.message}
                        </div>
                      </td>

                      {/* Rating */}
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        {t.rating !== undefined ? (
                          <StarRating rating={t.rating} />
                        ) : (
                          <span style={{ color: C.bd, fontSize: 12 }}>—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 16px" }}>
                        <Badge color={t.isActive ? "green" : "red"}>
                          {t.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>

                      {/* Updated */}
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: C.tm,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmtDate(t.updatedAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => toggleActive(t.id)}
                            title={t.isActive ? "Hide" : "Publish"}
                            aria-label={t.isActive ? "Hide testimonial" : "Publish testimonial"}
                            style={iconBtn("ghost", 30, { color: C.tm })}
                          >
                            {t.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            onClick={() => openEdit(t)}
                            title="Edit"
                            aria-label="Edit testimonial"
                            style={iconBtn("ghost")}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(t)}
                            title="Delete"
                            aria-label="Delete testimonial"
                            style={iconBtn("ghost", 30, { color: C.red })}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile card list */}
        {!isLoading && (
          <div className="testimonials-mobile-list">
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "48px 16px",
                  textAlign: "center",
                  color: C.tm,
                  fontSize: 13,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MessageSquareQuote size={32} color={C.bd} />
                <span>No testimonials match your search.</span>
              </div>
            ) : (
              filtered.map((t, i) => (
                <div
                  key={t.id}
                  style={{
                    borderTop: i === 0 ? "none" : `1px solid ${C.bd}`,
                    padding: "14px 16px",
                    background: i % 2 === 0 ? C.white : "#fafcfb",
                  }}
                >
                  {/* Header row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <TestimonialAvatar name={t.name} image={t.image} size="md" />
                      <div>
                        <div
                          style={{ fontWeight: 600, color: C.t, fontSize: 13 }}
                        >
                          {t.name}
                        </div>
                        {(t.designation || t.company) && (
                          <div style={{ fontSize: 11, color: C.tm, marginTop: 2 }}>
                            {[t.designation, t.company].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge color={t.isActive ? "green" : "red"}>
                      {t.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Message */}
                  <div
                    style={{
                      fontSize: 12,
                      color: C.tm,
                      lineHeight: 1.6,
                      marginBottom: 10,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {t.message}
                  </div>

                  {/* Footer row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      {t.rating !== undefined ? (
                        <StarRating rating={t.rating} />
                      ) : (
                        <span />
                      )}
                      <div style={{ fontSize: 11, color: C.tm, marginTop: 3 }}>
                        {fmtDate(t.updatedAt)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => toggleActive(t.id)}
                        title={t.isActive ? "Hide" : "Publish"}
                        aria-label={t.isActive ? "Hide testimonial" : "Publish testimonial"}
                        style={iconBtn("ghost", 30, { color: C.tm })}
                      >
                        {t.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        onClick={() => openEdit(t)}
                        title="Edit"
                        aria-label="Edit testimonial"
                        style={iconBtn("ghost")}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        title="Delete"
                        aria-label="Delete testimonial"
                        style={iconBtn("ghost", 30, { color: C.red })}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer count */}
        {!isLoading && filtered.length > 0 && (
          <div
            style={{
              padding: "10px 16px",
              borderTop: `1px solid ${C.bd}`,
              background: C.bg,
              fontSize: 12,
              color: C.tm,
            }}
          >
            Showing {filtered.length} of {list.length} testimonials
          </div>
        )}
      </div>

      {/* Responsive visibility */}
      <style>{`
        .testimonials-desktop-table { display: table; }
        .testimonials-mobile-list  { display: none; }
        @media (max-width: 767px) {
          .testimonials-desktop-table { display: none !important; }
          .testimonials-mobile-list  { display: block; }
        }
      `}</style>

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