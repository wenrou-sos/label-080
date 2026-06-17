import type { TechnicianStatus, RoomStatus } from '@/types'
import { TECHNICIAN_STATUS_LABEL, ROOM_STATUS_LABEL } from '@/types'

interface TechnicianStatusBadgeProps {
  status: TechnicianStatus
}

export function TechnicianStatusBadge({ status }: TechnicianStatusBadgeProps) {
  const colorMap: Record<TechnicianStatus, string> = {
    idle: 'bg-status-idle/20 text-status-idle border-status-idle/40',
    working: 'bg-status-working/20 text-status-working border-status-working/40',
    cleaning: 'bg-status-cleaning/20 text-status-cleaning border-status-cleaning/40',
    rest: 'bg-status-rest/20 text-status-rest border-status-rest/40',
  }

  const dotMap: Record<TechnicianStatus, string> = {
    idle: 'bg-status-idle',
    working: 'bg-status-working animate-pulse',
    cleaning: 'bg-status-cleaning',
    rest: 'bg-status-rest',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorMap[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[status]}`} />
      {TECHNICIAN_STATUS_LABEL[status]}
    </span>
  )
}

interface RoomStatusBadgeProps {
  status: RoomStatus
}

export function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  const colorMap: Record<RoomStatus, string> = {
    cleaned: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    to_clean: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    cleaning: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${colorMap[status]}`}
    >
      {ROOM_STATUS_LABEL[status]}
    </span>
  )
}
