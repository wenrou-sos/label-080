import type { Technician, Room, ServiceItem, Session, QueueCustomer, DailyStats } from '@/types'

export const mockTechnicians: Technician[] = [
  { id: 't1', name: '李师傅', status: 'working' },
  { id: 't2', name: '王师傅', status: 'working' },
  { id: 't3', name: '张师傅', status: 'idle' },
  { id: 't4', name: '陈师傅', status: 'working' },
  { id: 't5', name: '赵师傅', status: 'cleaning' },
  { id: 't6', name: '刘师傅', status: 'idle' },
  { id: 't7', name: '周师傅', status: 'rest' },
  { id: 't8', name: '吴师傅', status: 'idle' },
  { id: 't9', name: '郑师傅', status: 'working' },
  { id: 't10', name: '孙师傅', status: 'idle' },
]

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

export const mockRoomTechMap: Record<string, string> = {}

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
