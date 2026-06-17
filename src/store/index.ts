import { create } from 'zustand'
import type {
  Technician,
  Room,
  ServiceItem,
  Session,
  QueueCustomer,
  DailyStats,
  TechnicianStatus,
  RoomStatus,
} from '@/types'
import {
  mockTechnicians,
  mockRooms,
  mockServices,
  mockSessions,
  mockQueue,
  mockStats,
} from '@/mock/data'

interface StoreState {
  technicians: Technician[]
  rooms: Room[]
  services: ServiceItem[]
  sessions: Session[]
  queue: QueueCustomer[]
  stats: DailyStats
  notifiCustomerIds: string[]
  updateTechnicianStatus: (id: string, status: TechnicianStatus) => void
  updateRoomStatus: (id: string, status: RoomStatus) => void
  startSession: (
    technicianId: string,
    roomId: string,
    serviceId: string,
    customerName: string
  ) => void
  endSession: (sessionId: string) => void
  addToQueue: (name: string, serviceId: string) => void
  removeFromQueue: (customerId: string) => void
  markNotified: (customerId: string) => void
}

export const useStore = create<StoreState>((set, get) => ({
  technicians: mockTechnicians,
  rooms: mockRooms,
  services: mockServices,
  sessions: mockSessions,
  queue: mockQueue,
  stats: mockStats,
  notifiCustomerIds: [],

  updateTechnicianStatus: (id, status) =>
    set((state) => ({
      technicians: state.technicians.map((t) =>
        t.id === id ? { ...t, status } : t
      ),
    })),

  updateRoomStatus: (id, status) =>
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === id ? { ...r, status } : r)),
    })),

  startSession: (technicianId, roomId, serviceId, customerName) => {
    const newSession: Session = {
      id: `ses_${Date.now()}`,
      technicianId,
      roomId,
      serviceId,
      startTime: new Date(),
      customerName,
    }
    set((state) => ({
      sessions: [...state.sessions, newSession],
      technicians: state.technicians.map((t) =>
        t.id === technicianId ? { ...t, status: 'working' as TechnicianStatus } : t
      ),
    }))
  },

  endSession: (sessionId) => {
    const state = get()
    const session = state.sessions.find((s) => s.id === sessionId)
    if (!session) return

    const service = state.services.find((s) => s.id === session.serviceId)
    const price = service?.price ?? 0

    set((s) => ({
      sessions: s.sessions.filter((ses) => ses.id !== sessionId),
      technicians: s.technicians.map((t) =>
        t.id === session.technicianId
          ? { ...t, status: 'cleaning' as TechnicianStatus }
          : t
      ),
      rooms: s.rooms.map((r) =>
        r.id === session.roomId ? { ...r, status: 'to_clean' as RoomStatus } : r
      ),
      stats: {
        ...s.stats,
        totalCustomers: s.stats.totalCustomers + 1,
        totalRevenue: s.stats.totalRevenue + price,
        sessionsCompleted: [...s.stats.sessionsCompleted, sessionId],
      },
    }))
  },

  addToQueue: (name, serviceId) => {
    const newCustomer: QueueCustomer = {
      id: `q_${Date.now()}`,
      name,
      serviceId,
      joinTime: new Date(),
    }
    set((state) => ({
      queue: [...state.queue, newCustomer],
    }))
  },

  removeFromQueue: (customerId) =>
    set((state) => ({
      queue: state.queue.filter((q) => q.id !== customerId),
      notifiCustomerIds: state.notifiCustomerIds.filter((id) => id !== customerId),
    })),

  markNotified: (customerId) =>
    set((state) => ({
      notifiCustomerIds: state.notifiCustomerIds.includes(customerId)
        ? state.notifiCustomerIds
        : [...state.notifiCustomerIds, customerId],
    })),
}))
