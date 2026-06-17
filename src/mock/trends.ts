import type { DailyTrendData, HourlyTrendData } from '@/types'

const CACHE_KEY = 'foot-spa-trends-cache'
const TECHNICIAN_COUNT = 10
const BUSINESS_START_HOUR = 9
const BUSINESS_END_HOUR = 23

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) & 0x7fffffff
  }
  return h
}

function getDayOfWeekFactor(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  if (day === 0 || day === 6) return 1.3
  if (day === 5) return 1.15
  return 1.0
}

function getHourFactor(hour: number): number {
  if (hour >= 10 && hour <= 11) return 0.7
  if (hour >= 14 && hour <= 16) return 1.3
  if (hour >= 19 && hour <= 21) return 1.5
  if (hour >= 22) return 0.4
  return 1.0
}

function generateDailyTrend(dateStr: string): DailyTrendData {
  const seed = hashStr(dateStr + '_trend')
  const rand = seededRandom(seed)
  const dowFactor = getDayOfWeekFactor(dateStr)

  const baseCustomers = Math.floor((30 + rand() * 40) * dowFactor)
  const avgPrice = 180 + Math.floor(rand() * 80)
  const revenue = Math.floor(baseCustomers * avgPrice * (0.85 + rand() * 0.3))
  const sessions = Math.floor(baseCustomers * (0.8 + rand() * 0.2))
  const workingHours = BUSINESS_END_HOUR - BUSINESS_START_HOUR
  const maxCapacity = TECHNICIAN_COUNT * workingHours
  const utilization = Math.min(100, Math.round((sessions / maxCapacity) * 100 * (0.6 + rand() * 0.8)))

  return {
    date: dateStr,
    revenue,
    customers: baseCustomers,
    sessions,
    utilization: Math.max(5, utilization),
  }
}

function generateHourlyTrends(dateStr: string): HourlyTrendData[] {
  const daily = generateDailyTrend(dateStr)
  const results: HourlyTrendData[] = []
  const hourlyDistribution: number[] = []
  let distSum = 0

  for (let h = BUSINESS_START_HOUR; h < BUSINESS_END_HOUR; h++) {
    const factor = getHourFactor(h)
    const seed = hashStr(dateStr + '_hour_' + h)
    const rand = seededRandom(seed)
    const val = factor * (0.7 + rand() * 0.6)
    hourlyDistribution.push(val)
    distSum += val
  }

  for (let i = 0; i < hourlyDistribution.length; i++) {
    const hour = BUSINESS_START_HOUR + i
    const ratio = hourlyDistribution[i] / distSum

    const seed = hashStr(dateStr + '_hdetail_' + hour)
    const rand = seededRandom(seed)
    const jitter = 0.8 + rand() * 0.4

    const customers = Math.max(0, Math.round(daily.customers * ratio * jitter))
    const sessions = Math.max(0, Math.min(customers, Math.round(daily.sessions * ratio * jitter)))
    const revenue = Math.max(0, Math.round(daily.revenue * ratio * jitter))
    const hourUtil = customers > 0
      ? Math.min(100, Math.max(0, Math.round((sessions / TECHNICIAN_COUNT) * 100 * (0.5 + rand() * 1.0))))
      : 0

    results.push({
      date: dateStr,
      hour,
      revenue,
      customers,
      sessions,
      utilization: hourUtil,
    })
  }

  return results
}

interface TrendCache {
  version: number
  daily: Record<string, DailyTrendData>
  hourly: Record<string, HourlyTrendData[]>
}

function loadCache(): TrendCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.version !== 1) return null
    return parsed as TrendCache
  } catch {
    return null
  }
}

function saveCache(cache: TrendCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // ignore quota errors
  }
}

function ensureCache(): TrendCache {
  let cache = loadCache()
  if (!cache) {
    cache = { version: 1, daily: {}, hourly: {} }
  }
  return cache
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function getDailyTrends(startDate: string, endDate: string): DailyTrendData[] {
  const cache = ensureCache()
  const results: DailyTrendData[] = []
  let dirty = false

  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const current = new Date(start)

  while (current <= end) {
    const dateStr = formatDateStr(current)
    if (!cache.daily[dateStr]) {
      cache.daily[dateStr] = generateDailyTrend(dateStr)
      dirty = true
    }
    results.push(cache.daily[dateStr])
    current.setDate(current.getDate() + 1)
  }

  if (dirty) saveCache(cache)
  return results
}

export function getHourlyTrends(startDate: string, endDate: string): HourlyTrendData[] {
  const cache = ensureCache()
  const results: HourlyTrendData[] = []
  let dirty = false

  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const current = new Date(start)

  while (current <= end) {
    const dateStr = formatDateStr(current)
    if (!cache.hourly[dateStr]) {
      cache.hourly[dateStr] = generateHourlyTrends(dateStr)
      dirty = true
    }
    results.push(...cache.hourly[dateStr])
    current.setDate(current.getDate() + 1)
  }

  if (dirty) saveCache(cache)
  return results
}

export function getDateRangePreset(days: number): { start: string; end: string } {
  const today = new Date()
  const end = formatDateStr(today)
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - (days - 1))
  return { start: formatDateStr(startDate), end }
}
