const defaultPoints = [
  [28, 142],
  [88, 132],
  [148, 112],
  [208, 88],
  [268, 62],
  [328, 32],
]

const defaultLabels = ['May 1', 'May 8', 'May 15', 'May 22', 'May 29']
const defaultAxis = ['GHS 0', 'GHS 2k', 'GHS 4k', 'GHS 6k', 'GHS 8k', 'GHS 10k', 'GHS 12k', 'GHS 14k']

function LandlordLineChart({
  labels = defaultLabels,
  points = defaultPoints,
  axis = defaultAxis,
}) {
  const linePath = points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1][0]} 170 L ${points[0][0]} 170 Z`

  return (
    <div className="grid gap-3 xl:grid-cols-[40px_minmax(0,1fr)]">
      <div className="flex flex-col justify-between py-2 text-[11px] text-[#94a3b8]">
        {axis.slice().reverse().map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <div className="space-y-3">
        <div className="ld-chart-grid relative h-[190px] overflow-hidden rounded-[18px] border border-[#edf2f7] bg-[linear-gradient(180deg,rgba(250,252,251,0.98),rgba(246,250,246,0.9))] px-4 py-3">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 360 170">
            <defs>
              <linearGradient id="ld-chart-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(36,150,63,0.22)" />
                <stop offset="100%" stopColor="rgba(36,150,63,0)" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#ld-chart-fill)" />
            <path
              d={linePath}
              fill="none"
              stroke="#24963f"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            {points.map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} fill="#ffffff" r="5" stroke="#24963f" strokeWidth="2" />
                <circle cx={x} cy={y} fill="#24963f" r="2.5" />
              </g>
            ))}
          </svg>
        </div>

        <div className="grid grid-cols-5 gap-2 px-2 text-[11px] text-[#94a3b8]">
          {labels.map((label) => (
            <span className="text-center" key={label}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LandlordLineChart
