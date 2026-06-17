import { Users, HandCoins, UserCheck, Clock } from 'lucide-react'
import { useStore } from '@/store'
import { useClock } from '@/hooks/useClock'
import { formatCurrency } from '@/utils'

export default function ScreenPage() {
  const { date, time } = useClock()
  const technicians = useStore((s) => s.technicians)
  const stats = useStore((s) => s.stats)

  const idleCount = technicians.filter((t) => t.status === 'idle').length
  const workingCount = technicians.filter((t) => t.status === 'working').length
  const totalTechnicians = technicians.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-indigo-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative h-screen flex flex-col p-12">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 bg-clip-text text-transparent tracking-wide">
              足道养生会馆
            </h1>
            <p className="text-brand-300 mt-2 text-xl tracking-widest">REAL-TIME OPERATION DISPLAY</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-3 text-brand-200">
              <Clock className="w-8 h-8 text-gold-400" />
              <span className="text-4xl font-mono font-bold tracking-wider">{time}</span>
            </div>
            <p className="text-brand-300 mt-1 text-lg">{date}</p>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-3 gap-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative h-full bg-gradient-to-br from-emerald-500/10 via-brand-800/50 to-brand-900/80 rounded-3xl p-10 backdrop-blur-xl border border-emerald-400/20 flex flex-col justify-center items-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-pulseRing opacity-20" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                  <Users className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-emerald-300 text-2xl font-medium tracking-wider mb-4">空闲技师</p>
              <div className="flex items-end gap-3">
                <span className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-500 leading-none">
                  {idleCount}
                </span>
                <span className="text-brand-300 text-2xl pb-4">/ {totalTechnicians} 位</span>
              </div>
              <div className="mt-6 flex gap-2">
                {Array.from({ length: totalTechnicians }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i < idleCount ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-brand-700'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-4 text-brand-400 text-lg">
                上钟中 <span className="text-red-400 font-bold">{workingCount}</span> 位
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 via-amber-400 to-gold-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative h-full bg-gradient-to-br from-gold-500/10 via-brand-800/50 to-brand-900/80 rounded-3xl p-10 backdrop-blur-xl border border-gold-400/20 flex flex-col justify-center items-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gold-400 rounded-full animate-pulseRing opacity-20" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center shadow-2xl shadow-gold-500/30">
                  <UserCheck className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-gold-300 text-2xl font-medium tracking-wider mb-4">今日已接待</p>
              <div className="flex items-end gap-3">
                <span className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-300 to-gold-500 leading-none">
                  {stats.totalCustomers}
                </span>
                <span className="text-brand-300 text-2xl pb-4">人次</span>
              </div>
              <div className="mt-8 w-full">
                <div className="h-2 bg-brand-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-400 to-amber-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((stats.totalCustomers / 100) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-brand-400 text-sm mt-2 text-center">今日目标 100 人次</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative h-full bg-gradient-to-br from-purple-500/10 via-brand-800/50 to-brand-900/80 rounded-3xl p-10 backdrop-blur-xl border border-purple-400/20 flex flex-col justify-center items-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-purple-400 rounded-full animate-pulseRing opacity-20" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <HandCoins className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-purple-300 text-2xl font-medium tracking-wider mb-4">今日营收</p>
              <div className="flex items-end gap-2">
                <span className="text-brand-300 text-3xl pb-6">¥</span>
                <span className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-pink-400 leading-none">
                  {stats.totalRevenue.toLocaleString('zh-CN')}
                </span>
              </div>
              <p className="mt-6 text-brand-400 text-lg">
                客单价 <span className="text-gold-400 font-bold">{formatCurrency(stats.totalCustomers > 0 ? Math.round(stats.totalRevenue / stats.totalCustomers) : 0)}</span>
              </p>
              <div className="mt-4 flex gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-300">{stats.sessionsCompleted.length}</p>
                  <p className="text-brand-400 text-sm mt-1">已完成</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-brand-400 text-lg tracking-wider">
            欢迎光临 · 专业足道 · 用心服务
          </p>
        </footer>
      </div>
    </div>
  )
}
