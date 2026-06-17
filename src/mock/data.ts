import type { Technician, Room, ServiceItem, Session, QueueCustomer, DailyStats, DailyTrendData, HourlyTrendData } from '@/types'

export const TECHNICIAN_NAMES = ['李师傅', '王师傅', '张师傅', '陈师傅', '赵师傅', '刘师傅', '周师傅', '吴师傅', '郑师傅', '孙师傅']

export const mockTechnicians: Technician[] = TECHNICIAN_NAMES.map((name, i) => {
  const id = 't' + (i + 1)
  const statuses: Array<Technician['status']> = ['working', 'working', 'idle', 'working', 'cleaning', 'idle', 'rest', 'idle', 'working', 'idle']
  return { id, name, status: statuses[i] }
})

export const mockRooms: Room[] = [
  { id: 'r1', roomNumber: '101', status: 'in_use' },
  { id: 'r2', roomNumber: '102', status: 'to_clean' },
  { id: 'r3', roomNumber: '103', status: 'in_use' },
  { id: 'r4', roomNumber: '201', status: 'cleaning' },
  { id: 'r5', roomNumber: '202', status: 'in_use' },
  { id: 'r6', roomNumber: '203', status: 'to_clean' },
  { id: 'r7', roomNumber: '301', status: 'in_use' },
  { id: 'r8', roomNumber: '302', status: 'cleaned' },
]

export const mockServices: ServiceItem[] = [
  { id: 's1', name: '经典足底按摩', duration: 60, price: 168 },
  { id: 's2', name: '泰式足疗', duration: 90, price: 258 },
  { id: 's3', name: '精油SPA', duration: 120, price: 388 },
  { id: 's4', name: '中式推拿', duration: 60, price: 188 },
  { id: 's5', name: '肩颈调理', duration: 45, price: 128 },
  { id: 's6', name: '全身放松', duration: 90, price: 298 },
]

const now = new Date()

export const mockSessions: Session[] = [
  {
    id: 'ses1',
    technicianId: 't1',
    roomId: 'r1',
    serviceId: 's1',
    startTime: new Date(now.getTime() - 25 * 60 * 1000),
    customerName: '钱先生',
  },
  {
    id: 'ses2',
    technicianId: 't2',
    roomId: 'r3',
    serviceId: 's2',
    startTime: new Date(now.getTime() - 40 * 60 * 1000),
    customerName: '孙女士',
  },
  {
    id: 'ses3',
    technicianId: 't4',
    roomId: 'r5',
    serviceId: 's3',
    startTime: new Date(now.getTime() - 65 * 60 * 1000),
    customerName: '李先生',
  },
  {
    id: 'ses4',
    technicianId: 't9',
    roomId: 'r7',
    serviceId: 's4',
    startTime: new Date(now.getTime() - 15 * 60 * 1000),
    customerName: '王女士',
  },
]

export const mockRoomTechMap: Record<string, string> = {
  r2: 't5',
  r4: 't5',
  r6: 't5',
}

export const mockQueue: QueueCustomer[] = [
  {
    id: 'q1',
    name: '周先生',
    serviceId: 's1',
    joinTime: new Date(now.getTime() - 8 * 60 * 1000),
  },
  {
    id: 'q2',
    name: '吴女士',
    serviceId: 's5',
    joinTime: new Date(now.getTime() - 22 * 60 * 1000),
  },
  {
    id: 'q3',
    name: '郑先生',
    serviceId: 's2',
    joinTime: new Date(now.getTime() - 5 * 60 * 1000),
  },
]

export const mockStats: DailyStats = {
  date: now.toISOString().split('T')[0],
  totalCustomers: 48,
  totalRevenue: 9868,
  sessionsCompleted: ['sc1', 'sc2', 'sc3', 'sc4', 'sc5'],
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashDate(dateStr: string): number {
  let hash = 5381
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) + hash + dateStr.charCodeAt(i)) & 0x7fffffff
  }
  return hash
}

const CUSTOMER_SURNAMES = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦', '许', '何', '吕', '施', '张', '孔', '曹', '严', '华', '金', '魏', '陶']
const CUSTOMER_GENDERS = ['先生', '女士']

export interface DayData {
  technicians: Technician[]
  rooms: Room[]
  sessions: Session[]
  queue: QueueCustomer[]
  stats: DailyStats
  roomTechMap: Record<string, string>
}

export function generateDayData(dateStr: string): DayData {
  const seed = hashDate(dateStr)
  const rand = seededRandom(seed)

  const totalCustomers = Math.floor(30 + rand() * 50)
  const totalRevenue = Math.floor(6000 + rand() * 8000)
  const sessionsCompleted: string[] = []
  for (let i = 0; i < totalCustomers; i++) {
    sessionsCompleted.push('hsc_' + dateStr + '_' + i)
  }

  const roomIds = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8']
  const rooms: Room[] = roomIds.map((id, i) => ({
    id,
    roomNumber: ['101', '102', '103', '201', '202', '203', '301', '302'][i],
    status: rand() > 0.6 ? 'cleaned' : (rand() > 0.5 ? 'in_use' : (rand() > 0.5 ? 'to_clean' : 'cleaning')),
  }))

  const techIds = TECHNICIAN_NAMES.map((_, i) => 't' + (i + 1))
  const statuses: Array<Technician['status']> = ['idle', 'working', 'cleaning', 'rest']
  const technicians: Technician[] = TECHNICIAN_NAMES.map((name, i) => {
    const r = rand()
    const status = r < 0.3 ? 'idle' : r < 0.65 ? 'working' : r < 0.8 ? 'cleaning' : 'rest'
    return { id: techIds[i], name, status }
  })

  const workingTechs = technicians.filter((t) => t.status === 'working')
  const inUseRooms = rooms.filter((r) => r.status === 'in_use')
  const sessionCount = Math.min(workingTechs.length, inUseRooms.length)
  const sessions: Session[] = []
  for (let i = 0; i < sessionCount; i++) {
    const svcIdx = Math.floor(rand() * mockServices.length)
    const surnameIdx = Math.floor(rand() * CUSTOMER_SURNAMES.length)
    const genderIdx = Math.floor(rand() * CUSTOMER_GENDERS.length)
    const hourOffset = Math.floor(rand() * 8) + 9
    const minOffset = Math.floor(rand() * 60)
    const startDt = new Date(dateStr + 'T' + String(hourOffset).padStart(2, '0') + ':' + String(minOffset).padStart(2, '0') + ':00')
    sessions.push({
      id: 'hses_' + dateStr + '_' + i,
      technicianId: workingTechs[i].id,
      roomId: inUseRooms[i].id,
      serviceId: mockServices[svcIdx].id,
      startTime: startDt,
      customerName: CUSTOMER_SURNAMES[surnameIdx] + CUSTOMER_GENDERS[genderIdx],
    })
  }

  const queueCount = Math.floor(rand() * 4)
  const queue: QueueCustomer[] = []
  for (let i = 0; i < queueCount; i++) {
    const svcIdx = Math.floor(rand() * mockServices.length)
    const surnameIdx = Math.floor(rand() * CUSTOMER_SURNAMES.length)
    const genderIdx = Math.floor(rand() * CUSTOMER_GENDERS.length)
    const hourOffset = Math.floor(rand() * 4) + 14
    const minOffset = Math.floor(rand() * 60)
    const joinDt = new Date(dateStr + 'T' + String(hourOffset).padStart(2, '0') + ':' + String(minOffset).padStart(2, '0') + ':00')
    queue.push({
      id: 'hq_' + dateStr + '_' + i,
      name: CUSTOMER_SURNAMES[surnameIdx] + CUSTOMER_GENDERS[genderIdx],
      serviceId: mockServices[svcIdx].id,
      joinTime: joinDt,
    })
  }

  const roomTechMap: Record<string, string> = {}
  const cleaningRooms = rooms.filter((r) => r.status === 'to_clean' || r.status === 'cleaning')
  const cleaningTechs = technicians.filter((t) => t.status === 'cleaning')
  cleaningRooms.forEach((room, i) => {
    if (i < cleaningTechs.length) {
      roomTechMap[room.id] = cleaningTechs[i].id
    }
  })

  return {
    technicians,
    rooms,
    sessions,
    queue,
    stats: {
      date: dateStr,
      totalCustomers,
      totalRevenue,
      sessionsCompleted,
    },
    roomTechMap,
  }
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function getDateRange(days: number): string[] {
  const dates: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(formatDate(d))
  }
  return dates
}

export function generateDailyTrend(dateStr: string): DailyTrendData {
  const seed = hashDate(dateStr)
  const rand = seededRandom(seed)
  const dayData = generateDayData(dateStr)
  const workingHours = 10
  const techCount = TECHNICIAN_NAMES.length
  const maxSessionsPerDay = techCount * workingHours
  const sessions = Math.floor(dayData.stats.totalCustomers * 0.8 + rand() * 10)
  const utilization = Math.min(95, Math.round((sessions / maxSessionsPerDay) * 100 + rand() * 10))
  return {
    date: dateStr,
    revenue: dayData.stats.totalRevenue,
    customers: dayData.stats.totalCustomers,
    sessions,
    utilization,
  }
}

export function generateDailyTrendRange(days: number): DailyTrendData[] {
  const dates = getDateRange(days)
  return dates.map((d) => generateDailyTrend(d))
}

export function generateHourlyTrend(dateStr: string): HourlyTrendData[] {
  const result: HourlyTrendData[] = []
  const seed = hashDate(dateStr + '_hourly')
  const rand = seededRandom(seed)
  const dayTotal = generateDailyTrend(dateStr)
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
  const weights = [0.3, 0.5, 0.7, 0.6, 0.4, 0.5, 0.7, 0.8, 0.9, 1.0, 1.2, 1.1, 0.8, 0.5]
  const weightSum = weights.reduce((a, b) => a + b, 0)
  let cumRevenue = 0
  let cumCustomers = 0
  let cumSessions = 0
  hours.forEach((hour, idx) => {
    const ratio = weights[idx] / weightSum
    const variance = 0.8 + rand() * 0.4
    const finalRatio = ratio * variance
    const revenue = Math.round(dayTotal.revenue * finalRatio)
    const customers = Math.max(1, Math.round(dayTotal.customers * finalRatio))
    const sessions = Math.max(1, Math.round(dayTotal.sessions * finalRatio))
    cumRevenue += revenue
    cumCustomers += customers
    cumSessions += sessions
    const techCount = TECHNICIAN_NAMES.length
    const utilPerHour = Math.min(100, Math.round((sessions / techCount) * 100 / 2))
    result.push({
      date: dateStr,
      hour,
      revenue,
      customers,
      sessions,
      utilization: utilPerHour,
    })
  })
  return result
}

export function generateHourlyTrendRange(days: number): HourlyTrendData[] {
  const dates = getDateRange(days)
  let result: HourlyTrendData[] = []
  dates.forEach((d) => {
    result = result.concat(generateHourlyTrend(d))
  })
  return result
}
