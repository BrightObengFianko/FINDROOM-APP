import { Filter, Search } from 'lucide-react'

function AdminPageToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
  onFilterClick,
  filterLabel = 'Filter',
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <label className="relative block w-full xl:max-w-sm">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          className="field pl-11"
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder={searchPlaceholder}
          value={searchValue}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        {children}
        {onFilterClick ? (
          <button
            className="action-button-secondary justify-center"
            onClick={onFilterClick}
            type="button"
          >
            <Filter size={16} />
            {filterLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default AdminPageToolbar
