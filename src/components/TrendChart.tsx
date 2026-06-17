import { useMemo } from 'react'

export interface ChartDataPoint {
  label: string
  revenue: number
  customers: number
  sessions: number
  utilization: number
}

interface TrendChartProps {
  data: ChartDataPoint[]
}

export default function TrendChart({ data }: TrendChartProps) {
  const { maxRevenue, maxUtilization, revenueScale, utilizationScale, customersScale, sessionsScale, maxCustomers, maxSessions } = useMemo(() => {
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
    const maxUtilization = Math.max(...data.map((d) => d.utilization), 100)
    const maxCustomers = Math.max(...data.map((d) => d.customers), 1)
    const maxSessions = Math.max(...data.map((d) => d.sessions), 1)
    return {
      maxRevenue,
      maxUtilization,
      maxCustomers,
      maxSessions,
      revenueScale: maxRevenue / 100,
      utilizationScale: maxUtilization / 100,
      customersScale: maxCustomers / 100,
      sessionsScale: maxSessions / 100,
    }
  }, [data])

  const linePoints = (key: 'customers' | 'sessions' | 'utilization') => {
    if (data.length === 0) return ''
    const w = 100
    const h = 100
    const step = data.length > 1 ? w / (data.length - 1) : 0
    const scale = key === 'utilization' ? utilizationScale : key === 'customers' ? customersScale : sessionsScale
    return data
      .map((d, i) => {
        const x = data.length === 1 ? 50 : i * step
        const y = h - Math.min(100, d[key] / scale)
        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
  }

  const yAxisLines = [0, 25, 50, 75, 100]

  return (
    <div className="w-full">
      <div className="flex items-center gap-6 mb-4 flex-wrap text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-sm bg-gradient-to-t from-amber-500 to-amber-300"></span>
          <span className="text-slate-300">营收</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-1 rounded bg-emerald-400"></span>
          <span className="text-slate-300">接待人数</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-1 rounded bg-sky-400"></span>
          <span className="text-slate-300">上钟数</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-1 rounded bg-rose-400"></span>
          <span className="text-slate-300">技师利用率</span>
        </div>
      </div>

      <div className="relative" style={{ height: '380px' }}>
        <div className="absolute left-0 top-0 bottom-0 w-14 flex flex-col justify-between py-1 text-xs text-slate-500">
          {yAxisLines
            .slice()
            .reverse()
            .map((p) => (
              <div key={p} className="h-0 flex items-center">
                <span>{p}%</span>
              </div>
            ))}
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-16 flex flex-col justify-between py-1 text-xs text-slate-500 text-right">
          {yAxisLines
            .slice()
            .reverse()
            .map((p) => (
              <div key={p} className="h-0 flex items-center justify-end">
                <span>¥{Math.round((maxRevenue * p) / 100)}</span>
              </div>
            ))}
        </div>

        <div className="absolute left-14 right-16 top-0 bottom-8">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {yAxisLines
                .slice()
                .reverse()
                .map((p) => (
                  <div key={p} className="w-full h-px bg-slate-800/60"></div>
                ))}
            </div>

            <div className="absolute inset-0 flex items-end gap-1">
              {data.map((d, i) => {
                const barH = Math.min(100, d.revenue / revenueScale)
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col justify-end relative group"
                    style={{ height: '100%' }}
                  >
                    <div
                      className="w-full bg-gradient-to-t from-amber-600/80 to-amber-300/60 rounded-t-sm transition-all hover:from-amber-500 hover:to-amber-200"
                      style={{ height: `${barH}%` }}
                    ></div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 bg-slate-900/95 border border-slate-700 rounded px-3 py-2 text-xs whitespace-nowrap">
                      <div className="font-semibold text-slate-200 mb-1">{d.label}</div>
                      <div className="text-amber-400">营收: ¥{d.revenue.toLocaleString()}</div>
                      <div className="text-emerald-400">接待: {d.customers} 人</div>
                      <div className="text-sky-400">上钟: {d.sessions} 次</div>
                      <div className="text-rose-400">利用率: {d.utilization}%</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {data.length > 1 && (
                <>
                  <polyline
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={linePoints('customers')}
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: 'drop-shadow(0 0 2px rgba(52, 211, 153, 0.5))' }}
                  />
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={linePoints('sessions')}
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: 'drop-shadow(0 0 2px rgba(56, 189, 248, 0.5))' }}
                  />
                  <polyline
                    fill="none"
                    stroke="#fb7185"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="1.5 1"
                    points={linePoints('utilization')}
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: 'drop-shadow(0 0 2px rgba(251, 113, 133, 0.6))' }}
                  />
                </>
              )}
              {data.map((d, i) => {
                const w = 100
                const step = data.length > 1 ? w / (data.length - 1) : 0
                const x = data.length === 1 ? 50 : i * step
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={100 - Math.min(100, d.customers / customersScale)}
                      r="0.8"
                      fill="#34d399"
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle
                      cx={x}
                      cy={100 - Math.min(100, d.sessions / sessionsScale)}
                      r="0.8"
                      fill="#38bdf8"
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle
                      cx={x}
                      cy={100 - Math.min(100, d.utilization / utilizationScale)}
                      r="1"
                      fill="#fb7185"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        <div className="absolute left-14 right-16 bottom-0 h-8 flex items-stretch">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex items-center justify-center text-xs text-slate-500">
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
