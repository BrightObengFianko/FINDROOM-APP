function AdminLineChart({ points }) {
  const chartWidth = 560
  const chartHeight = 220
  const padding = 24
  const maxValue = Math.max(...points.map((point) => point.value), 1)
  const stepX = points.length > 1 ? (chartWidth - padding * 2) / (points.length - 1) : 0

  const linePoints = points
    .map((point, index) => {
      const x = padding + index * stepX
      const y = chartHeight - padding - (point.value / maxValue) * (chartHeight - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  const areaPoints = `${padding},${chartHeight - padding} ${linePoints} ${chartWidth - padding},${chartHeight - padding}`

  return (
    <div className="rounded-[22px] border border-slate-100 bg-white p-4">
      <svg className="h-[220px] w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <defs>
          <linearGradient id="admin-line-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            stroke="#e5e7eb"
            strokeDasharray="6 6"
            strokeWidth="1"
            x1={padding}
            x2={chartWidth - padding}
            y1={chartHeight - padding - (chartHeight - padding * 2) * ratio}
            y2={chartHeight - padding - (chartHeight - padding * 2) * ratio}
          />
        ))}

        <polygon fill="url(#admin-line-fill)" points={areaPoints} />
        <polyline
          fill="none"
          points={linePoints}
          stroke="#16a34a"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />

        {points.map((point, index) => {
          const x = padding + index * stepX
          const y = chartHeight - padding - (point.value / maxValue) * (chartHeight - padding * 2)

          return (
            <g key={point.label}>
              <circle cx={x} cy={y} fill="#ffffff" r="5" stroke="#16a34a" strokeWidth="3" />
              <text fill="#94a3b8" fontSize="11" textAnchor="middle" x={x} y={chartHeight - 6}>
                {point.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default AdminLineChart
