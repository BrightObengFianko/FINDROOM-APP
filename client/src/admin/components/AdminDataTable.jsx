function AdminDataTable({
  columns,
  rows,
  rowKey = 'id',
  minWidthClass = 'min-w-[860px]',
  emptyTitle = 'No records found',
  emptyDescription = 'Try changing your filters or search query.',
}) {
  if (!rows.length) {
    return (
      <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
        <p className="text-lg font-bold text-ink">{emptyTitle}</p>
        <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className={`${minWidthClass} w-full`}>
          <thead className="border-b border-slate-100 bg-slate-50/70">
            <tr>
              {columns.map((column) => (
                <th
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 ${column.headerClassName || ''}`}
                  key={column.key}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr className="align-middle" key={row[rowKey]}>
                {columns.map((column) => (
                  <td className={`px-4 py-3 text-sm text-slate-600 ${column.cellClassName || ''}`} key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDataTable
