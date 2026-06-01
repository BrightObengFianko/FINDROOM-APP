const statusStyles = {
  Active: 'bg-[#eef9ef] text-[#23933d]',
  Confirmed: 'bg-[#eef9ef] text-[#23933d]',
  Completed: 'bg-[#eef9ef] text-[#23933d]',
  Pending: 'bg-[#fff5df] text-[#d89214]',
  Cancelled: 'bg-[#fff1f1] text-[#e35656]',
  Inactive: 'bg-[#f4f6f8] text-[#64748b]',
}

function LandlordStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex min-w-[76px] items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold ${
        statusStyles[status] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {status}
    </span>
  )
}

export default LandlordStatusBadge
