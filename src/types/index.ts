export type UserRole = 'admin' | 'reception' | 'technician'

export interface AuthUser {
  id: string
  username: string
  role: UserRole
  name: string
  technicianId?: string
}

export type TechnicianStatus = 'idle' | 'working' | 'cleaning' | 'rest'

export type RoomStatus = 'in_use' | 'cleaned' | 'to_clean' | 'cleaning'

export interface Technician {
  id: string
  name: string
  status: TechnicianStatus
  avatar?: string
}

export interface Room {
  id: string
  roomNumber: string
  status: RoomStatus
}

export interface ServiceItem {
  id: string
  name: string
  duration: number
  price: number
}

export interface Session {
  id: string
  technicianId: string
  roomId: string
  serviceId: string
  startTime: Date
  customerName: string
}

export interface QueueCustomer {
  id: string
  name: string
  phone?: string
  serviceId: string
  joinTime: Date
}

export interface DailyStats {
  date: string
  totalCustomers: number
  totalRevenue: number
  sessionsCompleted: string[]
}

export const TECHNICIAN_STATUS_LABEL: Record<TechnicianStatus, string> = {
  idle: '空闲',
  working: '上钟中',
  cleaning: '待打扫',
  rest: '休息',
}

export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  in_use: '使用中',
  cleaned: '已打扫',
  to_clean: '待打扫',
  cleaning: '打扫中',
}

export interface DailyTrendData {
  date: string
  revenue: number
  customers: number
  sessions: number
  utilization: number
}

export interface HourlyTrendData {
  date: string
  hour: number
  revenue: number
  customers: number
  sessions: number
  utilization: number
}
