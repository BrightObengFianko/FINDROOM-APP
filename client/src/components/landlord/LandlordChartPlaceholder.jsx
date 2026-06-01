const fallbackPoints = [18, 26, 38, 52, 68, 84]
const defaultLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']

function LandlordChartPlaceholder({ points = fallbackPoints, labels = defaultLabels }) {
  const safePoints = points.length ? points : fallbackPoints
  const maxPoint = Math.max(...safePoints, 1)
  const step = safePoints.length > 1 ? 100 / (safePoints.length - 1) : 100
  const linePoints = safePoints
    .map((point, index) => {
      const x = Number((index * step).toFixed(2))
      const y = Number((100 - (point / maxPoint) * 100).toFixed(2))
      return `${x},${y}`
    })
    .join(' ')

  const areaPoints = `0,100 ${linePoints} 100,100`

  return (
    <div>
      <div className="relative h-52 overflow-hidden rounded-[24px] bg-slate-50/80 p-3 sm:h-60 sm:p-4">
        <div className="absolute inset-4 grid grid-rows-4">
          {[0, 1, 2, 3].map((line) => (
            <div className="border-b border-dashed border-slate-200/80" key={line} />
          ))}
        </div>

        <svg className="relative z-10 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="landlord-chart-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(14 165 233 / 0.22)" />
              <stop offset="100%" stopColor="rgb(14 165 233 / 0)" />
            </linearGradient>
          </defs>
          <polygon fill="url(#landlord-chart-fill)" points={areaPoints} />
          <polyline
            fill="none"
            points={linePoints}
            stroke="rgb(14 165 233)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          {safePoints.map((point, index) => {
            const x = Number((index * step).toFixed(2))
            const y = Number((100 - (point / maxPoint) * 100).toFixed(2))

            return (
              <circle
                cx={x}
                cy={y}
                fill="white"
                key={`${point}-${index}`}
                r="3.4"
                stroke="rgb(14 165 233)"
                strokeWidth="2"
              />
            )
          })}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-6 gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:gap-2 sm:text-xs">
        {labels.map((label) => (
          <span className="text-center" key={label}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default LandlordChartPlaceholder
