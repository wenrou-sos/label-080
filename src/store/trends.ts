import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DailyTrendData, HourlyTrendData } from '@/types'
import { generateDailyTrendRange, generateHourlyTrendRange } from '@/mock/data'

export type Granularity = 'daily' | 'hourly'

export interface TrendSummary {
  metric: string
  startValue: number
  endValue: number
  change: number
  changePercent: number
}

interface TrendsState {
  dailyData: Record<string, DailyTrendData>
  hourlyData: Record<string, HourlyTrendData[]>
  days: number
  granularity: Granularity
  setDays: (days: number) => void
  setGranularity: (g: Granularity) => void
  getDailyData: () => DailyTrendData[]
  getHourlyData: () => HourlyTrendData[]
  getSummary: () => TrendSummary[]
  ensureData: () => void
}

function buildDailyCache(days: number): Record<string, DailyTrendData> {
  const arr = generateDailyTrendRange(days)
  const cache: Record<string, DailyTrendData> = {}
  arr.forEach((d) => {
    cache[d.date] = d
  })
  return cache
}

function buildHourlyCache(days: number): Record<string, HourlyTrendData[]> {
  const arr = generateHourlyTrendRange(days)
  const cache: Record<string, HourlyTrendData[]> = {}
  arr.forEach((h) => {
    if (!cache[h.date]) {
      cache[h.date] = []
    }
    cache[h.date].push(h)
  })
  return cache
}

function getDates(days: number): string[] {
  const dates: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export const useTrendsStore = create<TrendsState>()(
  persist(
    (set, get) => ({
      dailyData: buildDailyCache(30),
      hourlyData: buildHourlyCache(7),
      days: 7,
      granularity: 'daily',

      setDays: (days) => {
        set({ days })
        get().ensureData()
      },

      setGranularity: (g) => {
        const maxDays = g === 'hourly' ? 7 : 30
        const currentDays = get().days
        const nextDays = Math.min(currentDays, maxDays)
        set({ granularity: g, days: nextDays })
        get().ensureData()
      },

      ensureData: () => {
        const state = get()
        const dates = getDates(state.days)
        const { dailyData, hourlyData } = state
        let dailyDirty = false
        let hourlyDirty = false
        const newDaily = { ...dailyData }
        const newHourly = { ...hourlyData }
        dates.forEach((date) => {
          if (!newDaily[date]) {
            const arr = generateDailyTrendRange(1)
            if (arr[0]) {
              newDaily[date] = arr[0]
              dailyDirty = true
            }
          }
          if (!newHourly[date]) {
            newHourly[date] = generateHourlyTrendRange(1)
            hourlyDirty = true
          }
        })
        if (dailyDirty || hourlyDirty) {
          set({ dailyData: newDaily, hourlyData: newHourly })
        }
      },

      getDailyData: () => {
        get().ensureData()
        const state = get()
        const dates = getDates(state.days)
        return dates.map((d) => state.dailyData[d]).filter(Boolean)
      },

      getHourlyData: () => {
        get().ensureData()
        const state = get()
        const dates = getDates(state.days)
        const result: HourlyTrendData[] = []
        dates.forEach((d) => {
          if (state.hourlyData[d]) {
            state.hourlyData[d].forEach((h) => result.push(h))
          }
        })
        return result
      },

      getSummary: () => {
        const state = get()
        const dates = getDates(state.days)
        if (dates.length < 2) return []
        const startDate = dates[0]
        const endDate = dates[dates.length - 1]

        if (state.granularity === 'hourly') {
          const startHours = state.hourlyData[startDate] || []
          const endHours = state.hourlyData[endDate] || []
          const sumHours = (arr: HourlyTrendData[]) => ({
            revenue: arr.reduce((a, b) => a + b.revenue, 0),
            customers: arr.reduce((a, b) => a + b.customers, 0),
            sessions: arr.reduce((a, b) => a + b.sessions, 0),
            utilization: arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b.utilization, 0) / arr.length) : 0,
          })
          const s = sumHours(startHours)
          const e = sumHours(endHours)
          return [
            { metric: '营收（元）', startValue: s.revenue, endValue: e.revenue, change: e.revenue - s.revenue, changePercent: s.revenue === 0 ? 0 : Math.round(((e.revenue - s.revenue) / s.revenue) * 10000) / 100 },
            { metric: '接待人数', startValue: s.customers, endValue: e.customers, change: e.customers - s.customers, changePercent: s.customers === 0 ? 0 : Math.round(((e.customers - s.customers) / s.customers) * 10000) / 100 },
            { metric: '上钟数', startValue: s.sessions, endValue: e.sessions, change: e.sessions - s.sessions, changePercent: s.sessions === 0 ? 0 : Math.round(((e.sessions - s.sessions) / s.sessions) * 10000) / 100 },
            { metric: '技师利用率（%）', startValue: s.utilization, endValue: e.utilization, change: e.utilization - s.utilization, changePercent: s.utilization === 0 ? 0 : Math.round(((e.utilization - s.utilization) / s.utilization) * 10000) / 100 },
          ]
        }

        const s = state.dailyData[startDate]
        const e = state.dailyData[endDate]
        if (!s || !e) return []
        return [
          { metric: '营收（元）', startValue: s.revenue, endValue: e.revenue, change: e.revenue - s.revenue, changePercent: s.revenue === 0 ? 0 : Math.round(((e.revenue - s.revenue) / s.revenue) * 10000) / 100 },
          { metric: '接待人数', startValue: s.customers, endValue: e.customers, change: e.customers - s.customers, changePercent: s.customers === 0 ? 0 : Math.round(((e.customers - s.customers) / s.customers) * 10000) / 100 },
          { metric: '上钟数', startValue: s.sessions, endValue: e.sessions, change: e.sessions - s.sessions, changePercent: s.sessions === 0 ? 0 : Math.round(((e.sessions - s.sessions) / s.sessions) * 10000) / 100 },
          { metric: '技师利用率（%）', startValue: s.utilization, endValue: e.utilization, change: e.utilization - s.utilization, changePercent: s.utilization === 0 ? 0 : Math.round(((e.utilization - s.utilization) / s.utilization) * 10000) / 100 },
        ]
      },
    }),
    {
      name: 'spa-trends-storage',
      partialize: (state) => ({ dailyData: state.dailyData, hourlyData: state.hourlyData, days: state.days, granularity: state.granularity }),
    },
  ),
)
