const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

const describeArc = (centerX, centerY, radius, startAngle, endAngle) => {
  const start = polarToCartesian(centerX, centerY, radius, endAngle)
  const end = polarToCartesian(centerX, centerY, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

function AdminDonutChart({ segments }) {
  const total = Math.max(segments.reduce((sum, segment) => sum + segment.value, 0), 1)
  let currentAngle = 0

  return (
    <div className="grid gap-4 rounded-[22px] border border-slate-100 bg-white p-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
      <svg className="mx-auto h-[180px] w-[180px]" viewBox="0 0 180 180">
        <circle cx="90" cy="90" fill="none" r="46" stroke="#f1f5f9" strokeWidth="28" />
        {segments.map((segment) => {
          const sweep = (segment.value / total) * 360
          const path = describeArc(90, 90, 46, currentAngle, currentAngle + sweep)
          currentAngle += sweep
          return (
            <path
              d={path}
              fill="none"
              key={segment.label}
              stroke={segment.color}
              strokeLinecap="round"
              strokeWidth="28"
            />
          )
        })}
      </svg>

      <div className="space-y-3">
        {segments.map((segment) => (
          <div className="flex items-center justify-between gap-3" key={segment.label}>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-sm font-medium text-slate-600">{segment.label}</span>
            </div>
            <span className="text-sm font-semibold text-ink">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDonutChart
