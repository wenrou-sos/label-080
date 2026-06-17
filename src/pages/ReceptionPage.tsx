import { useState, useEffect, useMemo } from 'react'
import {
  LayoutDashboard,
  Users,
  Clock,
  DoorOpen,
  UserPlus,
  UserMinus,
  CheckCircle2,
  Timer,
  Sparkles,
  Monitor,
  AlertCircle,
} from 'lucide-react'
import { useStore } from '@/store'
import { useTick } from '@/hooks/useTick'
import { TechnicianStatusBadge, RoomStatusBadge } from '@/components/StatusBadge'
import { QueueAlertModal } from '@/components/QueueAlertModal'
import { getMinutesSince, formatDuration, formatDurationShort, formatCurrency } from '@/utils'
import type { RoomStatus, TechnicianStatus } from '@/types'

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

export default function ReceptionPage() {
  useTick(30000)
  const tick = useTick(15000)

  const technicians = useStore((s) => s.technicians)
  const rooms = useStore((s) => s.rooms)
  const services = useStore((s) => s.services)
  const sessions = useStore((s) => s.sessions)
  const queue = useStore((s) => s.queue)
  const stats = useStore((s) => s.stats)
  const notifiCustomerIds = useStore((s) => s.notifiCustomerIds)

  const updateTechnicianStatus = useStore((s) => s.updateTechnicianStatus)
  const updateRoomStatus = useStore((s) => s.updateRoomStatus)
  const endSession = useStore((s) => s.endSession)
  const removeFromQueue = useStore((s) => s.removeFromQueue)
  const addToQueue = useStore((s) => s.addToQueue)

  const [newCustomerName, setNewCustomerName] = useState('')
  const [newServiceId, setNewServiceId] = useState(services[0]?.id ?? '')
  const [alertCustomer, setAlertCustomer] = useState<{ id: string; name: string; serviceId: string } | null>(null)

  useEffect(() => {
    const overdue = queue.find(
      (q) => getMinutesSince(q.joinTime) >= 20 && !notifiCustomerIds.includes(q.id)
    )
    if (overdue) {
      setAlertCustomer({
        id: overdue.id,
        name: overdue.name,
        serviceId: overdue.serviceId,
      })
    }
  }, [queue, notifiCustomerIds, tick])

  const idleTechnicians = technicians.filter((t) => t.status === 'idle').length

  const getServiceName = (serviceId: string) =>
    services.find((s) => s.id === serviceId)?.name ?? '-'

  const getTechnicianName = (technicianId: string) =>
    technicians.find((t) => t.id === technicianId)?.name ?? '-'

  const getRoomNumber = (roomId: string) =>
    rooms.find((r) => r.id === roomId)?.roomNumber ?? '-'

  const handleRoomClick = (roomId: string, currentStatus: RoomStatus) => {
    if (currentStatus === 'to_clean') {
      updateRoomStatus(roomId, 'cleaning')
      return
    }
    if (currentStatus === 'cleaning') {
      updateRoomStatus(roomId, 'cleaned')
      const relatedSession = sessions.find((s) => s.roomId === roomId)
      if (relatedSession) {
        const tech = technicians.find((t) => t.id === relatedSession.technicianId)
        if (tech && tech.status === 'cleaning') {
          updateTechnicianStatus(tech.id, 'idle')
        }
      }
      return
    }
  }

  const handleAddToQueue = () => {
    if (!newCustomerName.trim()) return
    addToQueue(newCustomerName.trim(), newServiceId)
    setNewCustomerName('')
  }

  const sortedQueue = useMemo(
    () => [...queue].sort((a, b) => a.joinTime.getTime() - b.joinTime.getTime()),
    [queue, tick]
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">足道养生会馆 · 运营控制台</h1>
              <p className="text-slate-400 text-sm">前台管理系统</p>
            </div>
          </div>
          <a
            href="/screen"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 border border-brand-500/30 transition-colors text-sm font-medium"
          >
            <Monitor className="w-4 h-4" />
            打开大屏幕
          </a>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="空闲技师"
            value={idleTechnicians}
            subValue={`共 ${technicians.length} 位`}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            icon={Timer}
            label="今日已接待"
            value={stats.totalCustomers}
            subValue={`目标 100 人次`}
            color="bg-gradient-to-br from-gold-500 to-amber-600"
          />
          <StatCard
            icon={LayoutDashboard}
            label="今日营收"
            value={formatCurrency(stats.totalRevenue)}
            subValue={`已完成 ${stats.sessionsCompleted.length} 单`}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <StatCard
            icon={UserPlus}
            label="排队中"
            value={queue.length}
            subValue={
              queue.some((q) => getMinutesSince(q.joinTime) >= 20)
                ? '有超时等待'
                : '状态正常'
            }
            color={
              queue.some((q) => getMinutesSince(q.joinTime) >= 20)
                ? 'bg-gradient-to-br from-red-500 to-orange-600'
                : 'bg-gradient-to-br from-blue-500 to-cyan-600'
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-400" />
                  <h2 className="text-lg font-semibold">当前上钟情况</h2>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-medium">
                    {sessions.length} 单进行中
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm border-b border-slate-800">
                      <th className="px-5 py-3 font-medium">技师</th>
                      <th className="px-5 py-3 font-medium">房间</th>
                      <th className="px-5 py-3 font-medium">顾客</th>
                      <th className="px-5 py-3 font-medium">服务项目</th>
                      <th className="px-5 py-3 font-medium">已进行</th>
                      <th className="px-5 py-3 font-medium">预计剩余</th>
                      <th className="px-5 py-3 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => {
                      const tech = technicians.find((t) => t.id === session.technicianId)
                      const service = services.find((s) => s.id === session.serviceId)
                      const elapsed = getMinutesSince(session.startTime)
                      const remaining = Math.max(0, (service?.duration ?? 60) - elapsed)
                      const progress = service
                        ? Math.min(100, (elapsed / service.duration) * 100)
                        : 0

                      return (
                        <tr
                          key={session.id}
                          className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-medium">
                                {tech?.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{tech?.name}</p>
                                {tech && <TechnicianStatusBadge status={tech.status} />}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-mono text-lg font-bold text-gold-400">
                              {getRoomNumber(session.roomId)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-300">{session.customerName}</td>
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-medium">{service?.name}</p>
                              <p className="text-slate-500 text-xs mt-0.5">
                                {service?.duration}分钟 · {formatCurrency(service?.price ?? 0)}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="w-32">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-400">{formatDurationShort(elapsed)}</span>
                                <span className="text-slate-500">{Math.round(progress)}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`font-mono font-bold ${
                                remaining <= 10 ? 'text-amber-400' : 'text-slate-300'
                              }`}
                            >
                              {formatDurationShort(remaining)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => endSession(session.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-sm font-medium transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              结束服务
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {sessions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                          暂无进行中的服务
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-400" />
                  <h2 className="text-lg font-semibold">技师状态一览</h2>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-status-idle" /> 空闲
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-status-working" /> 上钟
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-status-cleaning" /> 待打扫
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-status-rest" /> 休息
                  </span>
                </div>
              </div>
              <div className="p-5 grid grid-cols-5 gap-3">
                {technicians.map((tech) => {
                  const statusColors: Record<TechnicianStatus, string> = {
                    idle: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400/50',
                    working: 'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-400/50',
                    cleaning: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400/50',
                    rest: 'from-slate-500/20 to-slate-600/10 border-slate-500/30 hover:border-slate-400/50',
                  }
                  return (
                    <div
                      key={tech.id}
                      className={`relative p-3 rounded-xl bg-gradient-to-br ${statusColors[tech.status]} border transition-all cursor-pointer`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-sm font-medium">
                          {tech.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{tech.name}</p>
                          <TechnicianStatusBadge status={tech.status} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-400" />
                  <h2 className="text-lg font-semibold">顾客排队</h2>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-medium">
                  {queue.length} 位
                </span>
              </div>

              <div className="p-4 border-b border-slate-800 bg-slate-800/30">
                <p className="text-xs text-slate-400 mb-2">添加排队顾客</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="顾客姓名"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddToQueue()}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  <select
                    value={newServiceId}
                    onChange={(e) => setNewServiceId(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddToQueue}
                    className="px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-800/50 max-h-80 overflow-y-auto">
                {sortedQueue.map((customer, idx) => {
                  const waitMinutes = getMinutesSince(customer.joinTime)
                  const isOverdue = waitMinutes >= 20
                  return (
                    <div
                      key={customer.id}
                      className={`p-4 flex items-center gap-3 ${
                        isOverdue ? 'bg-red-500/5' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          idx === 0
                            ? 'bg-gold-500 text-slate-900'
                            : idx === 1
                            ? 'bg-slate-400 text-slate-900'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{customer.name}</p>
                          {isOverdue && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-medium">
                              <AlertCircle className="w-3 h-3" />
                              超时
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {getServiceName(customer.serviceId)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-mono font-bold text-sm ${
                            isOverdue ? 'text-red-400' : 'text-slate-300'
                          }`}
                        >
                          {formatDuration(waitMinutes)}
                        </p>
                        {isOverdue && (
                          <p className="text-red-500/70 text-xs">请安抚</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromQueue(customer.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        title="移除"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
                {queue.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm">暂无排队顾客</div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-brand-400" />
                  <h2 className="text-lg font-semibold">房间状态</h2>
                </div>
                <p className="text-xs text-slate-500">点击切换状态</p>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {rooms.map((room) => {
                  const statusBg: Record<RoomStatus, string> = {
                    cleaned: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 hover:border-emerald-400/50',
                    to_clean: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 hover:border-amber-400/50',
                    cleaning: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 hover:border-blue-400/50',
                  }
                  const isClickable = room.status !== 'cleaned'

                  return (
                    <button
                      key={room.id}
                      onClick={() => isClickable && handleRoomClick(room.id, room.status)}
                      disabled={!isClickable}
                      className={`p-4 rounded-xl bg-gradient-to-br ${statusBg[room.status]} border transition-all text-left ${
                        isClickable ? 'cursor-pointer' : 'cursor-default opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-lg">{room.roomNumber}</span>
                        {room.status === 'cleaning' && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        )}
                      </div>
                      <RoomStatusBadge status={room.status} />
                      {isClickable && (
                        <p className="text-slate-500 text-xs mt-2">
                          {room.status === 'to_clean' ? '点击开始打扫' : '点击完成打扫'}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {alertCustomer && (
        <QueueAlertModal
          customer={{
            id: alertCustomer.id,
            name: alertCustomer.name,
            serviceId: alertCustomer.serviceId,
            joinTime: queue.find((q) => q.id === alertCustomer.id)?.joinTime ?? new Date(),
          }}
          serviceName={getServiceName(alertCustomer.serviceId)}
          onClose={() => setAlertCustomer(null)}
        />
      )}
    </div>
  )
}
