"use client";
import Image from "next/image";
import {
  type FC,
  type ReactNode,
  type ChangeEvent,
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
  X,
  Package,
  LayoutGrid,
  Tag,
  Upload,
  AlertTriangle,
  FolderOpen,
  Layers,
  Wrench,
  Zap,
  Gauge,
  FlaskConical,
  Menu,
  Hash,
  ArrowRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, ProductFormDraft, PRODUCT_EMPTY_DRAFT, ProductCategory } from "@/types";
import { API_BASE } from "@/lib/api-base";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
  fetchCategories,
  createCategory
} from "@/lib/api/products";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryItem {
  name: string;
  icon: FC<{ className?: string }>;
}

interface ProductsPageProps {
  initialProducts: Product[];
  initialCategories: ProductCategory[];
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function formatDate(ts: string | number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const StatusBadge: FC<{ active: boolean }> = ({ active }) => (
  <span
    className={[
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      active
        ? "bg-brand text-white"
        : "bg-line text-mutedfg ring-1 ring-line",
    ].join(" ")}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-white" : "bg-mutedfg"}`} />
    {active ? "Active" : "Inactive"}
  </span>
);

// ─── CategoryBadge ────────────────────────────────────────────────────────────

const CategoryBadge: FC<{ category: string }> = ({ category }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand text-white">
    <Tag className="w-2.5 h-2.5" />
    {category}
  </span>
);

// ─── ProductPlaceholder ───────────────────────────────────────────────────────

const ProductPlaceholder: FC<{ name: string; size?: "sm" | "md" | "lg" }> = ({
  name,
  size = "md",
}) => {
  const sizeMap = { sm: "h-20", md: "h-36", lg: "h-44" };
  const iconMap = { sm: "w-7 h-7", md: "w-10 h-10", lg: "w-14 h-14" };
  return (
    <div className={`w-full ${sizeMap[size]} flex flex-col items-center justify-center gap-2 bg-cream`}>
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-line shadow-sm">
        <Package className={`${iconMap[size]} text-mutedfg`} />
      </div>
      <span className="text-[10px] font-semibold text-mutedfg uppercase tracking-widest">
        {getInitials(name)}
      </span>
    </div>
  );
};

// ─── SkeletonCard ─────────────────────────────────────────────────────────────

const SkeletonCard: FC = () => (
  <div className="bg-white rounded-2xl border border-line overflow-hidden animate-pulse">
    <div className="h-36 bg-line" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-line rounded-full w-2/3" />
      <div className="h-2.5 bg-line rounded-full w-full" />
      <div className="h-2.5 bg-line rounded-full w-4/5" />
      <div className="flex gap-2 pt-1">
        <div className="h-6 bg-line rounded-lg w-16" />
        <div className="h-6 bg-line rounded-lg w-12" />
      </div>
    </div>
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────

const EmptyState: FC<{ category: string; onAdd: () => void }> = ({
  category,
  onAdd,
}) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-cream border border-line flex items-center justify-center mb-4 shadow-sm">
      <FolderOpen className="w-7 h-7 text-mutedfg" />
    </div>
    <h3 className="text-sm font-semibold text-ink mb-1">
      No products in {category}
    </h3>
    <p className="text-xs text-mutedfg mb-5 max-w-xs">
      Add your first product to this category. It will appear here once created.
    </p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm transition"
    >
      <Plus className="w-3.5 h-3.5" /> Add Product
    </button>
  </div>
);

// ─── ConfirmDialog ────────────────────────────────────────────────────────────

// Renders modal/overlay content into <body> so `fixed inset-0` escapes the
// scrolling <main> stacking context and dims the whole viewport (above the
// sticky topbar at z-index 100), not just the content column.
function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

const ConfirmDialog: FC<{
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}> = ({ name, onConfirm, onCancel, isDeleting }) => (
  <Portal>
  <div
    className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
        <AlertTriangle className="w-5 h-5 text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-ink text-center mb-1">
        Delete Product?
      </h3>
      <p className="text-sm text-mutedfg text-center mb-6">
        You&apos;re about to delete{" "}
        <span className="font-medium text-ink">{name}</span>. This action
        cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink hover:bg-cream transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </>
          )}
        </button>
      </div>
    </div>
  </div>
  </Portal>
);

// ─── AddCategoryModal ─────────────────────────────────────────────────────────

const ICON_OPTIONS: { label: string; icon: FC<{ className?: string }> }[] = [
  { label: "Zap", icon: Zap },
  { label: "Gauge", icon: Gauge },
  { label: "Flask", icon: FlaskConical },
  { label: "Layers", icon: Layers },
  { label: "Wrench", icon: Wrench },
  { label: "Package", icon: Package },
  { label: "Hash", icon: Hash },
  { label: "Grid", icon: LayoutGrid },
];

const ICON_MAP: Record<string, FC<{ className?: string }>> = {
  Zap, Gauge, Flask: FlaskConical, Layers, Wrench, Package, Hash, Grid: LayoutGrid,
};

const AddCategoryModal: FC<{
  open: boolean;
  existingNames: string[];
  onAdd: (cat: { name: string; icon_label: string }) => void;
  onClose: () => void;
  isSaving?: boolean;
}> = ({ open, existingNames, onAdd, onClose, isSaving }) => {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(0);

  useEffect(() => {
    if (!open) {
      setName("");
      setSelectedIcon(0);
    }
  }, [open]);

  if (!open) return null;

  const isDuplicate = existingNames
    .map((n) => n.toLowerCase())
    .includes(name.trim().toLowerCase());
  const canSubmit = name.trim().length > 0 && !isDuplicate;

  const handleAdd = () => {
    if (!canSubmit) return;
    onAdd({
      name: name.trim(),
      icon_label: ICON_OPTIONS[selectedIcon].label, // ← send label string, not component
    });
  };

  return (
    <Portal>
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink">New Category</h2>
              <p className="text-xs text-mutedfg">Add a product category to the sidebar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-mutedfg hover:bg-line transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-mutedfg uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              autoFocus
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder-mutedfg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Pressure Gauges"
              maxLength={40}
            />
            {isDuplicate && name.trim() && (
              <p className="text-xs text-red-500 mt-1.5">
                A category with this name already exists.
              </p>
            )}
          </div>

          <div>
            <p className="block text-xs font-semibold text-mutedfg uppercase tracking-wider mb-2">
              Sidebar Icon
            </p>
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map(({ label, icon: Icon }, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedIcon(i)}
                  className={[
                    "flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition",
                    selectedIcon === i
                      ? "border-brand bg-brand text-white ring-2 ring-brand"
                      : "border-line bg-cream text-mutedfg hover:border-mutedfg hover:bg-line",
                  ].join(" ")}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {name.trim() && (
            <div className="flex items-center gap-3 bg-cream rounded-xl px-4 py-3 border border-line">
              <span className="text-xs text-mutedfg font-medium">Preview:</span>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = ICON_OPTIONS[selectedIcon].icon;
                  return (
                    <div className="w-6 h-6 rounded-md bg-white border border-line flex items-center justify-center shadow-sm">
                      <Icon className="w-3.5 h-3.5 text-brand" />
                    </div>
                  );
                })()}
                <span className="text-sm font-medium text-ink">{name.trim()}</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-line text-mutedfg">0</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line bg-cream/60">
          <button
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-mutedfg hover:bg-line transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!canSubmit || isSaving}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Create Category
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
};

// ─── FieldLabel ───────────────────────────────────────────────────────────────

const FieldLabel: FC<{ children: React.ReactNode; htmlFor?: string }> = ({
  children,
  htmlFor,
}) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-semibold text-mutedfg uppercase tracking-wider mb-1.5"
  >
    {children}
  </label>
);

const inputCls =
  "w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder-mutedfg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition";

// ─── DragDropUpload ───────────────────────────────────────────────────────────

const DragDropUpload: FC<{ onFile: (f: File) => void; preview?: string }> = ({
  onFile,
  preview,
}) => {
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => ref.current?.click()}
      className={[
        "relative border-2 border-dashed rounded-xl cursor-pointer transition-all",
        dragging
          ? "border-brand bg-brand/10"
          : "border-line bg-cream hover:border-brand hover:bg-brand/5",
      ].join(" ")}
    >
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      {preview ? (
        <div className="p-3">
          {/* Upload preview can be a local blob: URL — next/image can't optimize those */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
          <p className="text-center text-xs text-brand mt-2 font-medium">
            Click to change image
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 gap-2">
          <div className="w-10 h-10 rounded-xl bg-white border border-line shadow-sm flex items-center justify-center mb-1">
            <Upload className="w-5 h-5 text-mutedfg" />
          </div>
          <p className="text-sm font-medium text-mutedfg">
            Drop image here or <span className="text-brand">browse</span>
          </p>
          <p className="text-xs text-mutedfg">PNG, JPG, WEBP up to 5MB</p>
        </div>
      )}
    </div>
  );
};

// ─── ProductModal ─────────────────────────────────────────────────────────────

interface ProductModalProps {
  open: boolean;
  editing: Product | null;
  form: ProductFormDraft;
  categories: string[];
  onChange: (patch: Partial<ProductFormDraft>) => void;
  onSave: (imageUrl?: string) => void;
  onClose: () => void;
  isSaving: boolean;
}

const ProductModal: FC<ProductModalProps> = ({
  open, editing, form, categories, onChange, onSave, onClose, isSaving,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(form.product_image ?? "");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ product_name?: string; product_category?: string }>({});

  useEffect(() => {
    setPreviewUrl(form.product_image ?? "");
    setPendingFile(null);
    setErrors({});
  }, [open, form.product_image]);

  if (!open) return null;

  const field =
    (key: keyof ProductFormDraft) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      onChange({ [key]: e.target.value });
      if (errors[key as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    };

  const handleFile = (file: File) => {
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.product_name.trim()) newErrors.product_name = "Product name is required";
    if (!form.product_category.trim()) newErrors.product_category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    let uploadedUrl: string | undefined;
    if (pendingFile) {
      try {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", pendingFile);
        const res = await fetch(`${API_BASE}/products/upload`, { method: "POST", credentials: "include", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploadedUrl = data.url;
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

  const isLoading = isSaving || uploading;

  const inputCls = "w-full h-[38px] rounded-[10px] border border-line bg-cream px-3 text-[13px] text-ink placeholder-mutedfg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition";
  const errorInputCls = "border-red-300 focus:ring-red-400/20 focus:border-red-400";

  return (
    <Portal>
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-white rounded-[20px] border border-line/70 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-brand flex items-center justify-center">
              <Package className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <p className="text-[15px] font-medium text-ink leading-tight">
                {editing ? "Edit product" : "Add new product"}
              </p>
              <p className="text-[12px] text-mutedfg mt-0.5">
                {editing ? "Update product information" : "Fill in the details below"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-mutedfg hover:bg-cream hover:text-mutedfg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-mutedfg">
                Product name *
              </label>
              <input
                className={[inputCls, errors.product_name ? errorInputCls : ""].join(" ")}
                value={form.product_name}
                onChange={field("product_name")}
                placeholder="e.g. GFI Sequential Kit"
                autoComplete="off"
              />
              {errors.product_name && (
                <p className="text-[12px] text-red-500">{errors.product_name}</p>
              )}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-mutedfg">
                Category *
              </label>
              <select
                className={[inputCls, "appearance-none cursor-pointer", errors.product_category ? errorInputCls : ""].join(" ")}
                value={form.product_category}
                onChange={field("product_category")}
              >
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.product_category && (
                <p className="text-[12px] text-red-500">{errors.product_category}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-mutedfg">
              Description
            </label>
            <textarea
              className="w-full rounded-[10px] border border-line bg-cream px-3 py-2.5 text-[13px] text-ink placeholder-mutedfg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-vertical min-h-[88px] leading-relaxed"
              maxLength={500}
              value={form.description}
              onChange={field("description")}
              placeholder="Short product description…"
            />
            <p className="text-[11px] text-mutedfg text-right">{form.description.length} / 500</p>
          </div>

          {/* External link (website product card → vibhu.com section) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-mutedfg">
              External link (website)
            </label>
            <input
              className="w-full rounded-[10px] border border-line bg-cream px-3 py-2.5 text-[13px] text-ink placeholder-mutedfg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              value={form.external_url ?? ""}
              onChange={field("external_url")}
              placeholder="https://vibhu.com/… (opens from the website product card)"
            />
          </div>

          {/* Image upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-mutedfg">
              Product image
            </label>
            <DragDropUpload onFile={handleFile} preview={previewUrl || undefined} />
            {uploading && (
              <p className="text-[12px] text-brand flex items-center gap-1.5 mt-1">
                <span className="w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin inline-block" />
                Uploading image…
              </p>
            )}
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-mutedfg">
              Visibility
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_active}
              onClick={() => onChange({ is_active: !form.is_active })}
              className={[
                "w-full rounded-[10px] border py-2.5 text-[13px] font-medium flex items-center justify-center gap-2 transition",
                form.is_active
                  ? "border-brand bg-brand text-white hover:bg-brand-dark"
                  : "border-line bg-cream text-mutedfg hover:bg-line",
              ].join(" ")}
            >
              {form.is_active ? (
                <><Eye className="w-4 h-4" /> Published — visible to customers</>
              ) : (
                <><EyeOff className="w-4 h-4" /> Hidden — not visible to customers</>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-line bg-cream/60">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-[10px] border border-line text-[13px] text-mutedfg hover:bg-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="h-9 px-5 rounded-[10px] bg-brand text-[13px] font-medium text-white hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {editing ? "Update" : "Add"} product
          </button>
        </div>

      </div>
    </div>
    </Portal>
  );
};

// ─── ProductDetailModal ───────────────────────────────────────────────────────

const ProductDetailModal: FC<{
  product: Product | null;
  onClose: () => void;
  onEdit: (p: Product) => void;
}> = ({ product, onClose, onEdit }) => {
  if (!product) return null;

  return (
    <Portal>
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        <div className="relative">
          {product.product_image ? (
            <Image
              src={product.product_image}
              alt={product.product_name}
              width={512}
              height={192}
              sizes="(max-width: 512px) 100vw, 512px"
              className="w-full h-48 object-cover"
            />
          ) : (
            <ProductPlaceholder name={product.product_name} size="lg" />
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-mutedfg hover:bg-white shadow-sm transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4">
            <StatusBadge active={product.is_active} />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-base font-bold text-ink">{product.product_name}</h2>
              <div className="mt-1">
                <CategoryBadge category={product.product_category} />
              </div>
            </div>
            <button
              onClick={() => onEdit(product)}
              className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs font-medium text-mutedfg hover:bg-cream transition shrink-0"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>

          {product.description && (
            <p className="text-sm text-mutedfg leading-relaxed mb-5">
              {product.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Category", value: product.product_category },
              { label: "Status", value: product.is_active ? "Active" : "Inactive" },
              { label: "Created", value: formatDate(product.created_at) },
              { label: "Updated", value: formatDate(product.updated_at) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-cream rounded-xl p-3">
                <p className="text-xs font-semibold text-mutedfg uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-medium text-ink">{value}</p>
              </div>
            ))}
          </div>

          {(product.gallery_images?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold text-mutedfg uppercase tracking-wider mb-3">Gallery</p>
              <div className="grid grid-cols-3 gap-2">
                {product.gallery_images!.map((img, i) => (
                  <Image key={i} src={img} alt={`Gallery ${i + 1}`} width={120} height={80} sizes="120px" className="w-full h-20 object-cover rounded-xl border border-line" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-line bg-cream/60 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-line px-5 py-2 text-sm font-medium text-mutedfg hover:bg-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
};

// ─── ProductCard ──────────────────────────────────────────────────────────────

const ProductCard: FC<{
  product: Product;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}> = ({ product, onView, onEdit, onDelete, onToggle }) => (
  <div className="group relative rounded-[20px] border border-line/70 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1">

    {/* Image */}
    <div className="relative h-52 overflow-hidden cursor-pointer" onClick={onView}>
      {product.product_image ? (
        <Image
          src={product.product_image}
          alt={product.product_name}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <ProductPlaceholder name={product.product_name} size="lg" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

      {/* Status */}
      <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        product.is_active
          ? "bg-brand text-white border-brand"
          : "bg-ink/80 text-line border-ink/50 backdrop-blur-md"
      }`}>
        {product.is_active ? "● Active" : "○ Hidden"}
      </div>

      {/* Floating actions — visible on hover */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          title="Edit product"
          aria-label="Edit product"
          className="w-[34px] h-[34px] rounded-full bg-white/90 flex items-center justify-center text-mutedfg hover:bg-brand hover:text-white transition"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          title={product.is_active ? "Hide product" : "Publish product"}
          aria-label={product.is_active ? "Hide product" : "Publish product"}
          className="w-[34px] h-[34px] rounded-full bg-white/90 flex items-center justify-center text-mutedfg hover:bg-ink hover:text-white transition"
        >
          {product.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete product"
          aria-label="Delete product"
          className="w-[34px] h-[34px] rounded-full bg-white/90 flex items-center justify-center text-mutedfg hover:bg-red-500 hover:text-white transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category pill */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] text-white backdrop-blur-md">
        {product.product_category}
      </div>
    </div>

    {/* Body */}
    <div className="p-4 flex flex-col gap-3">
      <div>
        <h3
          onClick={onView}
          className="text-[15px] font-medium text-ink line-clamp-1 cursor-pointer hover:text-brand transition leading-snug"
        >
          {product.product_name}
        </h3>
        {product.description && (
          <p className="mt-1.5 text-[13px] text-mutedfg leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-line">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-mutedfg">Last updated</span>
          <span className="text-[13px] font-medium text-mutedfg">{formatDate(product.updated_at)}</span>
        </div>
        <button
          onClick={onView}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-brand text-[13px] font-medium text-white hover:bg-brand-dark transition"
        >
          View details
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProductsPage: FC<ProductsPageProps> = ({ initialProducts, initialCategories }) => {
  const queryClient = useQueryClient();

  const [activeCategory, setActiveCategory] = useState<string>(initialCategories[0]?.name ?? "");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormDraft>(PRODUCT_EMPTY_DRAFT);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [addCatModalOpen, setAddCatModalOpen] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data: list = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    initialData: initialProducts, // ← server data shown instantly, refetch happens in background
  });

  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ["product_categories"],
    queryFn: fetchCategories,
    initialData: initialCategories, // ← same for categories
  });

  const categories: CategoryItem[] = useMemo(
    () =>
      fetchedCategories.map((c) => ({
        name: c.name,
        icon: ICON_MAP[c.icon_label] ?? Package,
      })),
    [fetchedCategories]
  );

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setModalOpen(false);
    },
    onError: (error: Error) => console.error("Create failed:", error.message),
  });

  const updateMutation = useMutation({
  mutationFn: ({ id, form }: { id: string; form: ProductFormDraft }) =>
    updateProduct(id, form),

  onMutate: async ({ id, form }) => {
    await queryClient.cancelQueries({ queryKey: ["products"] });
    const previous = queryClient.getQueryData<Product[]>(["products"]);

    queryClient.setQueryData<Product[]>(["products"], (old = []) =>
      old.map((p) =>
        p.id === id
          ? { ...p, ...form, updated_at: Date.now() }
          : p
      )
    );

    setModalOpen(false); // ← close instantly

    return { previous };
  },

  onError: (error: Error, _vars, context) => {
    if (context?.previous) {
      queryClient.setQueryData(["products"], context.previous);
    }
    setModalOpen(true); // ← reopen on failure
    console.error("Update failed:", error.message);
  },

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});

  const toggleMutation = useMutation({
  mutationFn: toggleProduct,

  // ── 1. Instantly update UI before server responds ──────────────────────────
  onMutate: async (id: string) => {
    await queryClient.cancelQueries({ queryKey: ["products"] });

    // Snapshot current data to rollback on error
    const previous = queryClient.getQueryData<Product[]>(["products"]);

    // Optimistically flip is_active
    queryClient.setQueryData<Product[]>(["products"], (old = []) =>
      old.map((p) =>
        p.id === id ? { ...p, is_active: !p.is_active } : p
      )
    );

    return { previous }; // ← passed to onError as context
  },

  // ── 2. On error — roll back to snapshot ───────────────────────────────────
  onError: (error: Error, _id, context) => {
    if (context?.previous) {
      queryClient.setQueryData(["products"], context.previous);
    }
    console.error("Toggle failed:", error.message);
  },

  // ── 3. On success — sync with real server data ─────────────────────────────
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});

  const deleteMutation = useMutation({
  mutationFn: deleteProduct,

  // ── 1. Instantly remove card from UI ──────────────────────────────────────
  onMutate: async (id: string) => {
    await queryClient.cancelQueries({ queryKey: ["products"] });

    const previous = queryClient.getQueryData<Product[]>(["products"]);

    queryClient.setQueryData<Product[]>(["products"], (old = []) =>
      old.filter((p) => p.id !== id)
    );

    setDeleteTarget(null); // ← close dialog instantly

    return { previous };
  },

  // ── 2. On error — roll back and reopen dialog ─────────────────────────────
  onError: (error: Error, id, context) => {
    if (context?.previous) {
      queryClient.setQueryData(["products"], context.previous);
    }
    const restored = context?.previous?.find((p) => p.id === id) ?? null;
    setDeleteTarget(restored); // ← reopen confirm dialog for the same product
    console.error("Delete failed:", error.message);
  },

  // ── 3. On success — sync with server ──────────────────────────────────────
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});

  const createCategoryMutation = useMutation({
    mutationFn: ({ name, icon_label }: { name: string; icon_label: string }) =>
      createCategory(name, icon_label),
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ["product_categories"] });
      setActiveCategory(newCat.name);
      setAddCatModalOpen(false);
    },
    onError: (error: Error) => console.error("Create category failed:", error.message),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Derived data ───────────────────────────────────────────────────────────
  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    list.forEach((p) => {
      counts[p.product_category] = (counts[p.product_category] ?? 0) + 1;
    });
    return counts;
  }, [list]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list.filter((p) => {
      const matchCat = p.product_category === activeCategory;
      const matchSearch =
        !q ||
        p.product_name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && p.is_active) ||
        (filterStatus === "inactive" && !p.is_active);
      return matchCat && matchSearch && matchStatus;
    });
  }, [list, activeCategory, search, filterStatus]);

  const stats = useMemo(
    () => ({ total: list.length, active: list.filter((p) => p.is_active).length }),
    [list]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openAdd = useCallback(() => {
    setEditing(null);
    setForm({ ...PRODUCT_EMPTY_DRAFT, product_category: activeCategory });
    setModalOpen(true);
    setSidebarOpen(false);
  }, [activeCategory]);

  const openEdit = useCallback((p: Product) => {
    setEditing(p);
    setForm({
      product_name: p.product_name,
      product_category: p.product_category,
      description: p.description,
      product_image: p.product_image,
      gallery_images: p.gallery_images ?? [],
      is_active: p.is_active,
      external_url: p.external_url ?? "",
    });
    setViewProduct(null);
    setModalOpen(true);
  }, []);

  const patchForm = useCallback(
    (patch: Partial<ProductFormDraft>) =>
      setForm((prev) => ({ ...prev, ...patch })),
    []
  );

  const save = useCallback(
    (uploadedImageUrl?: string) => {
      const payload: ProductFormDraft = {
        ...form,
        product_image: uploadedImageUrl ?? form.product_image,
      };
      if (editing) {
        updateMutation.mutate({ id: editing.id, form: payload });
      } else {
        createMutation.mutate(payload);
      }
    },
    [editing, form, createMutation, updateMutation]
  );

  const selectCategory = (cat: string) => {
    setActiveCategory(cat);
    setSidebarOpen(false);
    setSearch("");
    setFilterStatus("all");
  };

  const handleAddCategory = useCallback(
    (cat: { name: string; icon_label: string }) => {
      createCategoryMutation.mutate(cat);
    },
    [createCategoryMutation]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0 bg-cream">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 min-h-0">
        {/* Category rail */}
        <aside
          className={[
            "fixed top-0 left-0 h-full z-[120] flex flex-col bg-white border-r border-line shadow-xl transition-transform duration-300",
            "w-64 lg:static lg:h-full lg:shrink-0 lg:translate-x-0 lg:shadow-none lg:z-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-brand" />
              <span className="text-sm font-bold text-ink">Categories</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-mutedfg hover:bg-line"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-3">
            {categories.map(({ name, icon: Icon }) => {
              const isActive = activeCategory === name;
              const count = categoryCounts[name] ?? 0;
              return (
                <button
                  key={name}
                  onClick={() => selectCategory(name)}
                  className={[
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all",
                    isActive ? "bg-brand text-white" : "text-mutedfg hover:bg-cream",
                  ].join(" ")}
                >
                  <span className={["w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors", isActive ? "bg-white/20" : "bg-line"].join(" ")}>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-mutedfg"}`} />
                  </span>
                  <span className="flex-1 text-left truncate">{name}</span>
                  <span className={["text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center", isActive ? "bg-white/20 text-white" : "bg-line text-mutedfg"].join(" ")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-line">
            <button
              onClick={() => setAddCatModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2.5 text-xs font-medium text-mutedfg hover:border-brand hover:text-brand hover:bg-brand/5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 h-full min-h-0 overflow-y-auto p-4 sm:p-6 lg:pl-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-line text-mutedfg hover:bg-cream transition"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-ink">{activeCategory}</h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand text-white">
                    {categoryCounts[activeCategory] ?? 0}
                  </span>
                </div>
                <p className="text-sm text-mutedfg mt-0.5">
                  {stats.active} active · {stats.total} total across all categories
                </p>
              </div>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-sm transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-line shadow-[0_2px_18px_rgba(26,46,41,0.05)] overflow-hidden mb-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedfg pointer-events-none" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-line bg-cream text-sm text-ink placeholder-mutedfg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
                />
              </div>
              <div className="flex rounded-xl border border-line overflow-hidden text-sm font-medium shrink-0">
                {(["all", "active", "inactive"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className={["px-3.5 py-2 capitalize transition", filterStatus === f ? "bg-brand text-white" : "bg-white text-mutedfg hover:bg-cream"].join(" ")}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <EmptyState category={activeCategory} onAdd={openAdd} />
            ) : (
              filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onView={() => setViewProduct(p)}
                  onEdit={() => openEdit(p)}
                  onDelete={() => setDeleteTarget(p)}
                  onToggle={() => toggleMutation.mutate(p.id)}
                />
              ))
            )}
          </div>

          {filtered.length > 0 && (
            <p className="text-xs text-mutedfg mt-5 text-center">
              Showing {filtered.length} of{" "}
              {list.filter((p) => p.product_category === activeCategory).length} products in{" "}
              {activeCategory}
            </p>
          )}
        </main>
      </div>

      <ProductDetailModal
        product={viewProduct}
        onClose={() => setViewProduct(null)}
        onEdit={openEdit}
      />

      <ProductModal
        open={modalOpen}
        editing={editing}
        form={form}
        categories={categoryNames}
        onChange={patchForm}
        onSave={save}
        onClose={() => setModalOpen(false)}
        isSaving={isSaving}
      />

      <AddCategoryModal
        open={addCatModalOpen}
        existingNames={categories.map((c) => c.name)}
        onAdd={handleAddCategory}
        onClose={() => !createCategoryMutation.isPending && setAddCatModalOpen(false)}
        isSaving={createCategoryMutation.isPending}
      />

      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.product_name}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => !deleteMutation.isPending && setDeleteTarget(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default ProductsPage;