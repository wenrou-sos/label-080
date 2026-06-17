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
  generateDayData,
} from '@/mock/data'

const todayStr = new Date().toISOString().split('T')[0]

function rehydrateDates(state: Partial<StoreState>): Partial<StoreState> {
  if (state.sessions) {
    state.sessions = state.sessions.map((s) => ({
      ...s,
      startTime: new Date(s.startTime as unknown as string),
    }))
  }
  if (state.queue) {
    state.queue = state.queue.map((q) => ({
      ...q,
      joinTime: new Date(q.joinTime as unknown as string),
    }))
  }
  return state
}

interface StoreState {
  selectedDate: string
  isHistorical: boolean
  technicians: Technician[]
  rooms: Room[]
  services: ServiceItem[]
  sessions: Session[]
  queue: QueueCustomer[]
  stats: DailyStats
  notifiCustomerIds: string[]
  roomTechMap: Record<string, string>
  setSelectedDate: (date: string) => void
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
      selectedDate: todayStr,
      isHistorical: false,
      technicians: mockTechnicians,
      rooms: mockRooms,
      services: mockServices,
      sessions: mockSessions,
      queue: mockQueue,
      stats: mockStats,
      notifiCustomerIds: [],
      roomTechMap: mockRoomTechMap,

      setSelectedDate: (date) => {
        const isToday = date === todayStr
        if (isToday) {
          set({
            selectedDate: todayStr,
            isHistorical: false,
            technicians: mockTechnicians,
            rooms: mockRooms,
            sessions: mockSessions,
            queue: mockQueue,
            stats: mockStats,
            roomTechMap: mockRoomTechMap,
            notifiCustomerIds: [],
          })
        } else {
          const dayData = generateDayData(date)
          set({
            selectedDate: date,
            isHistorical: true,
            technicians: dayData.technicians,
            rooms: dayData.rooms,
            sessions: dayData.sessions,
            queue: dayData.queue,
            stats: dayData.stats,
            roomTechMap: dayData.roomTechMap,
            notifiCustomerIds: [],
          })
        }
      },

      updateTechnicianStatus: (id, status) => {
        const state = get()
        if (state.isHistorical) return
        set((s) => ({
          technicians: s.technicians.map((t) =>
            t.id === id ? { ...t, status } : t
          ),
        }))
      },

      updateRoomStatus: (id, status) => {
        const state = get()
        if (state.isHistorical) return
        set((s) => ({
          rooms: s.rooms.map((r) => (r.id === id ? { ...r, status } : r)),
        }))
      },

      startSession: (technicianId, roomId, serviceId, customerName) => {
        const state = get()
        if (state.isHistorical) return
        const newSession: Session = {
          id: `ses_${Date.now()}`,
          technicianId,
          roomId,
          serviceId,
          startTime: new Date(),
          customerName,
        }
        set((s) => ({
          sessions: [...s.sessions, newSession],
          technicians: s.technicians.map((t) =>
            t.id === technicianId ? { ...t, status: 'working' as TechnicianStatus } : t
          ),
          rooms: s.rooms.map((r) =>
            r.id === roomId ? { ...r, status: 'in_use' as RoomStatus } : r
          ),
        }))
      },

      endSession: (sessionId) => {
        const state = get()
        if (state.isHistorical) return
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
        const state = get()
        if (state.isHistorical) return
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId ? { ...r, status: 'cleaning' as RoomStatus } : r
          ),
        }))
      },

      finishRoomCleaning: (roomId) => {
        const state = get()
        if (state.isHistorical) return
        let techId = state.roomTechMap[roomId]
        const updates: Partial<StoreState> = {
          rooms: state.rooms.map((r) =>
            r.id === roomId ? { ...r, status: 'cleaned' as RoomStatus } : r
          ),
        }

        if (!techId) {
          const occupiedTechIds = new Set(Object.values(state.roomTechMap))
          const fallbackTech = state.technicians.find(
            (t) => t.status === 'cleaning' && !occupiedTechIds.has(t.id)
          )
          if (fallbackTech) {
            techId = fallbackTech.id
          }
        }

        if (techId) {
          const tech = state.technicians.find((t) => t.id === techId)
          if (tech && tech.status === 'cleaning') {
            updates.technicians = state.technicians.map((t) =>
              t.id === techId ? { ...t, status: 'idle' as TechnicianStatus } : t
            )
          }
          if (state.roomTechMap[roomId]) {
            const { [roomId]: _, ...restMap } = state.roomTechMap
            updates.roomTechMap = restMap
          }
        }

        set(updates as StoreState)
      },

      addToQueue: (name, serviceId) => {
        const state = get()
        if (state.isHistorical) return
        const newCustomer: QueueCustomer = {
          id: `q_${Date.now()}`,
          name,
          serviceId,
          joinTime: new Date(),
        }
        set((s) => ({
          queue: [...s.queue, newCustomer],
        }))
      },

      removeFromQueue: (customerId) => {
        const state = get()
        if (state.isHistorical) return
        set((s) => ({
          queue: s.queue.filter((q) => q.id !== customerId),
          notifiCustomerIds: s.notifiCustomerIds.filter((id) => id !== customerId),
        }))
      },

      markNotified: (customerId) => {
        const state = get()
        if (state.isHistorical) return
        set((s) => ({
          notifiCustomerIds: s.notifiCustomerIds.includes(customerId)
            ? s.notifiCustomerIds
            : [...s.notifiCustomerIds, customerId],
        }))
      },
    }),
    {
      name: 'foot-spa-store',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedDate: state.selectedDate,
        technicians: state.technicians,
        rooms: state.rooms,
        sessions: state.sessions,
        queue: state.queue,
        stats: state.stats,
        roomTechMap: state.roomTechMap,
        notifiCustomerIds: state.notifiCustomerIds,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          rehydrateDates(state)
        }
      },
      migrate: (persisted: any, version) => {
        if (version < 2) {
          return undefined
        }
        if (version < 3 && persisted) {
          rehydrateDates(persisted)
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
        useStore.setState(rehydrateDates(parsed.state))
      }
    } catch {
      // ignore
    }
  }
})
