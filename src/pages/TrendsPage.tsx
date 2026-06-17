import { useMemo } from 'react'
import Header from '@/components/Header'
import TrendChart, { ChartDataPoint } from '@/components/TrendChart'
import { useTrendsStore, type Granularity } from '@/store/trends'

const DAY_OPTIONS_DAILY = [
  { label: '近 7 天', value: 7 },
  { label: '近 14 天', value: 14 },
  { label: '近 30 天', value: 30 },
]

const DAY_OPTIONS_HOURLY = [
  { label: '近 1 天', value: 1 },
  { label: '近 3 天', value: 3 },
  { label: '近 7 天', value: 7 },
]

export default function TrendsPage() {
  const granularity = useTrendsStore((s) => s.granularity)
  const days = useTrendsStore((s) => s.days)
  const setDays = useTrendsStore((s) => s.setDays)
  const setGranularity = useTrendsStore((s) => s.setGranularity)
  const getDailyData = useTrendsStore((s) => s.getDailyData)
  const getHourlyData = useTrendsStore((s) => s.getHourlyData)
  const getSummary = useTrendsStore((s) => s.getSummary)

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (granularity === 'hourly') {
      return getHourlyData().map((h) => ({
        label: days > 1 ? `${h.date.slice(5)} ${String(h.hour).padStart(2, '0')}:00` : `${String(h.hour).padStart(2, '0')}:00`,
        revenue: h.revenue,
        customers: h.customers,
        sessions: h.sessions,
        utilization: h.utilization,
      }))
    }
    return getDailyData().map((d) => ({
      label: d.date.slice(5),
      revenue: d.revenue,
      customers: d.customers,
      sessions: d.sessions,
      utilization: d.utilization,
    }))
  }, [granularity, getDailyData, getHourlyData, days])

  const summary = useMemo(() => getSummary(), [getSummary])

  const dayOptions = granularity === 'hourly' ? DAY_OPTIONS_HOURLY : DAY_OPTIONS_DAILY

  const totalStats = useMemo(() => {
    if (chartData.length === 0) {
      return { revenue: 0, customers: 0, sessions: 0, avgUtil: 0 }
    }
    const revenue = chartData.reduce((a, b) => a + b.revenue, 0)
    const customers = chartData.reduce((a, b) => a + b.customers, 0)
    const sessions = chartData.reduce((a, b) => a + b.sessions, 0)
    const avgUtil = Math.round(chartData.reduce((a, b) => a + b.utilization, 0) / chartData.length)
    return { revenue, customers, sessions, avgUtil }
  }, [chartData])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header title="运营趋势分析" subtitle="多维度经营数据可视化" />

      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-400">聚合粒度：</div>
            <div className="flex items-center p-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
              {([
                { label: '按日', value: 'daily' as Granularity },
                { label: '按小时', value: 'hourly' as Granularity },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGranularity(opt.value)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    granularity === opt.value
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-400">日期范围：</div>
            <div className="flex items-center p-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
              {dayOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDays(opt.value)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    days === opt.value
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-amber-900/30 to-amber-950/30 border border-amber-700/30 p-5">
            <div className="text-sm text-amber-300/80 mb-1">累计营收</div>
            <div className="text-2xl font-bold text-amber-300">¥{totalStats.revenue.toLocaleString()}</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border border-emerald-700/30 p-5">
            <div className="text-sm text-emerald-300/80 mb-1">累计接待</div>
            <div className="text-2xl font-bold text-emerald-300">{totalStats.customers} 人</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-sky-900/30 to-sky-950/30 border border-sky-700/30 p-5">
            <div className="text-sm text-sky-300/80 mb-1">累计上钟</div>
            <div className="text-2xl font-bold text-sky-300">{totalStats.sessions} 次</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-rose-900/30 to-rose-950/30 border border-rose-700/30 p-5">
            <div className="text-sm text-rose-300/80 mb-1">平均技师利用率</div>
            <div className="text-2xl font-bold text-rose-300">{totalStats.avgUtil}%</div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">
              {granularity === 'hourly' ? '小时级运营趋势' : '日级运营趋势'}
            </h2>
          </div>
          <TrendChart data={chartData} />
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">环比对比（首日 vs 末日）</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-medium">指标</th>
                  <th className="py-3 px-4 font-medium">首日值</th>
                  <th className="py-3 px-4 font-medium">末日值</th>
                  <th className="py-3 px-4 font-medium">变化量</th>
                  <th className="py-3 px-4 font-medium">变化率</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-200 font-medium">{row.metric}</td>
                    <td className="py-3 px-4 text-slate-300">{row.metric.includes('营收') ? '¥' : ''}{row.startValue.toLocaleString()}{row.metric.includes('利用率') ? '%' : ''}</td>
                    <td className="py-3 px-4 text-slate-300">{row.metric.includes('营收') ? '¥' : ''}{row.endValue.toLocaleString()}{row.metric.includes('利用率') ? '%' : ''}</td>
                    <td className={`py-3 px-4 font-medium ${row.change > 0 ? 'text-emerald-400' : row.change < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {row.change > 0 ? '+' : ''}
                      {row.metric.includes('营收') ? '¥' : ''}
                      {row.change.toLocaleString()}
                      {row.metric.includes('利用率') ? '%' : ''}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${
                          row.changePercent > 0
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : row.changePercent < 0
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        {row.changePercent > 0 ? '▲' : row.changePercent < 0 ? '▼' : '—'}
                        {Math.abs(row.changePercent).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
                {summary.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      数据不足，请选择更长的日期范围
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
