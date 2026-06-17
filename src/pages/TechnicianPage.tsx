import { useMemo } from 'react'
import { Clock, MapPin, User, Calendar, Timer, CheckCircle2, AlertCircle } from 'lucide-react'
import { useStore } from '@/store'
import { useAuthStore } from '@/store/auth'
import { useTick } from '@/hooks/useTick'
import { TechnicianStatusBadge } from '@/components/StatusBadge'
import Header from '@/components/Header'
import { getMinutesSince, formatDuration, formatDurationShort, formatCurrency, formatTime } from '@/utils'

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  subValue?: string
  color: string
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-slate-400 text-xs">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subValue && <p className="text-slate-500 text-xs mt-0.5">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}

export default function TechnicianPage() {
  useTick(30000)
  const tick = useTick(15000)

  const user = useAuthStore((s) => s.user)
  const technicians = useStore((s) => s.technicians)
  const rooms = useStore((s) => s.rooms)
  const services = useStore((s) => s.services)
  const sessions = useStore((s) => s.sessions)
  const stats = useStore((s) => s.stats)
  const selectedDate = useStore((s) => s.selectedDate)

  const techId = user?.technicianId

  const currentTech = useMemo(
    () => technicians.find((t) => t.id === techId),
    [technicians, techId]
  )

  const mySessions = useMemo(
    () => sessions.filter((s) => s.technicianId === techId),
    [sessions, techId, tick]
  )

  const myCompletedCount = useMemo(() => {
    return stats.sessionsCompleted.filter((sid) => {
      const session = sessions.find((s) => s.id === sid)
      return session?.technicianId === techId
    }).length
  }, [stats.sessionsCompleted, sessions, techId])

  const getServiceName = (serviceId: string) =>
    services.find((s) => s.id === serviceId)?.name ?? '-'

  const getServicePrice = (serviceId: string) =>
    services.find((s) => s.id === serviceId)?.price ?? 0

  const getRoomNumber = (roomId: string) =>
    rooms.find((r) => r.id === roomId)?.roomNumber ?? '-'

  const hashStr = (s: string): number => {
    let h = 2166136261
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  }

  const calcSessionProgress = (sessionId: string, duration: number, startTime: Date): number => {
    const isHistorical = selectedDate !== new Date().toISOString().split('T')[0]
    if (!isHistorical) {
      return getMinutesSince(startTime)
    }
    const ratio = (hashStr(sessionId) % 1000) / 1000
    const minRatio = 0.25
    const maxRatio = 0.85
    const p = minRatio + ratio * (maxRatio - minRatio)
    return Math.round(duration * p)
  }

  const today = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === today

  if (!currentTech) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header title="足道养生会馆 · 技师工作台" subtitle="个人管理系统" />
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <p className="text-slate-400">未找到对应技师信息</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header title="足道养生会馆 · 技师工作台" subtitle="个人管理系统" />

      <div className="max-w-[1600px] mx-auto p-6">
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl font-bold shadow-lg">
              {currentTech.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{currentTech.name}</h2>
                <TechnicianStatusBadge status={currentTech.status} />
              </div>
              <p className="text-slate-400">工号：{currentTech.id.toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">当前状态</p>
              <p className="text-lg font-medium text-white">
                {currentTech.status === 'idle' && '空闲中，可接单'}
                {currentTech.status === 'working' && '服务中'}
                {currentTech.status === 'cleaning' && '待打扫'}
                {currentTech.status === 'rest' && '休息中'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={CheckCircle2}
            label="今日已完成"
            value={myCompletedCount}
            subValue="单服务"
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            icon={Timer}
            label="当前服务中"
            value={mySessions.length}
            subValue="单进行中"
            color="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
          <StatCard
            icon={Calendar}
            label="今日日期"
            value={new Date(selectedDate + 'T00:00:00').getMonth() + 1 + '月' + new Date(selectedDate + 'T00:00:00').getDate() + '日'}
            subValue={isToday ? '今日' : '历史数据'}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <StatCard
            icon={Clock}
            label="当前时间"
            value={formatTime(new Date())}
            color="bg-gradient-to-br from-amber-500 to-orange-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">当前服务</h2>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium">
                {mySessions.length} 单进行中
              </span>
            </div>

            <div className="divide-y divide-slate-800/50">
              {mySessions.map((session) => {
                const service = services.find((s) => s.id === session.serviceId)
                const duration = service?.duration ?? 60
                const elapsed = calcSessionProgress(session.id, duration, session.startTime)
                const remaining = Math.max(0, duration - elapsed)
                const progress = Math.min(100, (elapsed / duration) * 100)

                return (
                  <div key={session.id} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-medium text-white mb-1">{service?.name}</p>
                        <p className="text-slate-500 text-sm">
                          时长 {duration}分钟 · {formatCurrency(service?.price ?? 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">顾客</p>
                        <p className="font-medium text-white">{session.customerName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span>{getRoomNumber(session.roomId)} 房间</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-400">
                        <User className="w-4 h-4" />
                        <span>{currentTech.name}</span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-400">已进行 {formatDuration(elapsed)}</span>
                        <span className="text-slate-500">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: progress + '%' }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-slate-500 text-sm">
                        开始时间：{formatTime(session.startTime)}
                      </p>
                      <p className={'font-mono font-bold ' + (remaining <= 10 ? 'text-amber-400' : 'text-slate-300')}>
                        预计剩余 {formatDurationShort(remaining)}
                      </p>
                    </div>
                  </div>
                )
              })}

              {mySessions.length === 0 && (
                <div className="p-12 text-center">
                  <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">当前没有进行中的服务</p>
                  <p className="text-slate-600 text-sm mt-1">请耐心等待安排</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-semibold">今日上钟记录</h2>
            </div>

            <div className="divide-y divide-slate-800/50 max-h-[500px] overflow-y-auto">
              {stats.sessionsCompleted.length > 0 ? (
                stats.sessionsCompleted
                  .filter((sid) => {
                    const session = sessions.find((s) => s.id === sid)
                    return session?.technicianId === techId
                  })
                  .map((sid) => {
                    const session = sessions.find((s) => s.id === sid)
                    if (!session) return null
                    const service = services.find((s) => s.id === session.serviceId)
                    const price = getServicePrice(session.serviceId)

                    return (
                      <div key={sid} className="p-4 hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-white">{service?.name}</p>
                            <p className="text-slate-500 text-sm">
                              顾客：{session.customerName} · {getRoomNumber(session.roomId)} 房
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gold-400">{formatCurrency(price)}</p>
                            <p className="text-slate-500 text-sm">
                              {formatTime(session.startTime)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 text-sm">已完成</span>
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">暂无今日完成记录</p>
                </div>
              )}

              {stats.sessionsCompleted.filter((sid) => {
                const session = sessions.find((s) => s.id === sid)
                return session?.technicianId === techId
              }).length === 0 && stats.sessionsCompleted.length > 0 && (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">暂无您的完成记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
