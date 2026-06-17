import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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
  mockRoomTechMap,
} from '@/mock/data'

interface StoreState {
  technicians: Technician[]
  rooms: Room[]
  services: ServiceItem[]
  sessions: Session[]
  queue: QueueCustomer[]
  stats: DailyStats
  notifiCustomerIds: string[]
  roomTechMap: Record<string, string>
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
  finishRoomCleaning: (roomId: string) => void
  startRoomCleaning: (roomId: string) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      technicians: mockTechnicians,
      rooms: mockRooms,
      services: mockServices,
      sessions: mockSessions,
      queue: mockQueue,
      stats: mockStats,
      notifiCustomerIds: [],
      roomTechMap: mockRoomTechMap,

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
          rooms: state.rooms.map((r) =>
            r.id === roomId ? { ...r, status: 'in_use' as RoomStatus } : r
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
          roomTechMap: {
            ...s.roomTechMap,
            [session.roomId]: session.technicianId,
          },
          stats: {
            ...s.stats,
            totalCustomers: s.stats.totalCustomers + 1,
            totalRevenue: s.stats.totalRevenue + price,
            sessionsCompleted: [...s.stats.sessionsCompleted, sessionId],
          },
        }))
      },

      startRoomCleaning: (roomId) => {
        set((state) => ({
          rooms: state.rooms.map((r) =>
            r.id === roomId ? { ...r, status: 'cleaning' as RoomStatus } : r
          ),
        }))
      },

      finishRoomCleaning: (roomId) => {
        const state = get()
        const techId = state.roomTechMap[roomId]
        const updates: Partial<StoreState> = {
          rooms: state.rooms.map((r) =>
            r.id === roomId ? { ...r, status: 'cleaned' as RoomStatus } : r
          ),
        }

        if (techId) {
          const tech = state.technicians.find((t) => t.id === techId)
          if (tech && tech.status === 'cleaning') {
            updates.technicians = state.technicians.map((t) =>
              t.id === techId ? { ...t, status: 'idle' as TechnicianStatus } : t
            )
          }
          const { [roomId]: _, ...restMap } = state.roomTechMap
          updates.roomTechMap = restMap
        }

        set(updates as StoreState)
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
    }),
    {
      name: 'foot-spa-store',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        technicians: state.technicians,
        rooms: state.rooms,
        sessions: state.sessions,
        queue: state.queue,
        stats: state.stats,
        roomTechMap: state.roomTechMap,
        notifiCustomerIds: state.notifiCustomerIds,
      }),
      migrate: (persisted, version) => {
        if (version === 0) {
          return undefined
        }
        return persisted
      },
    }
  )
)

window.addEventListener('storage', (event) => {
  if (event.key === 'foot-spa-store' && event.newValue) {
    try {
      const parsed = JSON.parse(event.newValue)
      if (parsed.state) {
        useStore.setState(parsed.state)
      }
    } catch {
      // ignore
    }
  }
})
