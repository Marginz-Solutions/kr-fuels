// components/ui/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react"
import { C } from "../../constants/colors"
import { btn } from "../../styles/shared"
import { FC } from "react"

interface PaginationMeta {
  total:      number
  page:       number
  limit:      number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface PaginationProps {
  meta:     PaginationMeta
  page:     number
  loading?: boolean
  onPageChange: (page: number) => void
}

const pageNumbers = (current: number, total: number): (number | "...")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4)        return [1, 2, 3, 4, 5, "...", total]
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "...", current - 1, current, current + 1, "...", total]
}

const Pagination: FC<PaginationProps> = ({ meta, page, loading = false, onPageChange }) => {
  if (meta.totalPages <= 1) return null

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, padding: "12px 0",flexWrap:"wrap" }}>

      {/* Range info */}
      <span style={{ fontSize: 12, color: C.tm, marginRight: 8 }}>
        {((page - 1) * meta.limit) + 1}–{Math.min(page * meta.limit, meta.total)} of {meta.total}
      </span>

      {/* Prev */}
      <button
        style={{ ...btn("ghost"), padding: "5px 8px" }}
        disabled={!meta.hasPrevPage || loading}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={15} />
      </button>

      {/* Page numbers */}
      {pageNumbers(page, meta.totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} style={{ padding: "0 2px", color: C.tm, fontSize: 13 }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            disabled={loading}
            style={{
              ...btn("ghost"),
              padding:      "5px 10px",
              minWidth:     32,
              fontSize:     13,
              background:   page === p ? C.p : "transparent",
              color:        page === p ? C.white : C.tm,
              fontWeight:   page === p ? 600 : 400,
              borderRadius: 8,
            }}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        style={{ ...btn("ghost"), padding: "5px 8px" }}
        disabled={!meta.hasNextPage || loading}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

export default Pagination