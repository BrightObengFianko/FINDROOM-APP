import { ChevronLeft, ChevronRight } from 'lucide-react'

function AdminPagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [4, 6, 8],
}) {
  if (!totalItems) {
    return null
  }

  const startRow = (page - 1) * pageSize + 1
  const endRow = Math.min(page * pageSize, totalItems)

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-500">
        Showing <span className="font-semibold text-ink">{startRow}</span>
        {' - '}
        <span className="font-semibold text-ink">{endRow}</span>
        {' of '}
        <span className="font-semibold text-ink">{totalItems}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-500">
          <span>Rows per page</span>
          <select
            className="field w-auto min-w-[76px] px-3 py-2"
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            value={pageSize}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            type="button"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1
            return (
              <button
                className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-sm font-semibold transition ${
                  page === pageNumber
                    ? 'bg-brand-500 text-white'
                    : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                type="button"
              >
                {pageNumber}
              </button>
            )
          })}

          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPagination
