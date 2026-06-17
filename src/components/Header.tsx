import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, Monitor, LogOut, User, TrendingUp, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import type { UserRole } from '@/types'

interface HeaderProps {
  title: string
  subtitle?: string
  showScreenLink?: boolean
  children?: React.ReactNode
}

const roleConfig: Record<UserRole, { bgClass: string; borderClass: string; accentClass: string; label: string }> = {
  admin: {
    bgClass: 'from-purple-900/80',
    borderClass: 'border-purple-700/50',
    accentClass: 'from-purple-500 to-purple-700',
    label: '管理员',
  },
  reception: {
    bgClass: 'from-blue-900/80',
    borderClass: 'border-blue-700/50',
    accentClass: 'from-blue-500 to-blue-700',
    label: '前台',
  },
  technician: {
    bgClass: 'from-emerald-900/80',
    borderClass: 'border-emerald-700/50',
    accentClass: 'from-emerald-500 to-emerald-700',
    label: '技师',
  },
}

export default function Header({ title, subtitle, showScreenLink = false, children }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const config = user ? roleConfig[user.role] : roleConfig.admin
  const canAccessReception = user?.role === 'admin' || user?.role === 'reception'
  const canAccessTechnician = user?.role === 'admin' || user?.role === 'technician'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`bg-gradient-to-r ${config.bgClass} to-slate-900/80 backdrop-blur-xl border-b ${config.borderClass} sticky top-0 z-40`}>
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.accentClass} flex items-center justify-center shadow-lg`}>
              <Sparkles className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
            </div>
          </div>
          <div className="w-px h-10 bg-slate-700" />
          {children}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/30 border border-slate-700/30">
            {canAccessReception && (
              <button
                onClick={() => navigate('/reception')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/reception'
                    ? 'bg-slate-700/60 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                控制台
              </button>
            )}
            {canAccessReception && (
              <button
                onClick={() => navigate('/trends')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/trends'
                    ? 'bg-slate-700/60 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                趋势
              </button>
            )}
            {canAccessTechnician && (
              <button
                onClick={() => navigate('/technician')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/technician'
                    ? 'bg-slate-700/60 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                <User className="w-4 h-4" />
                工作台
              </button>
            )}
          </div>

          {showScreenLink && (
            <a
              href="/screen"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-600/50 transition-colors text-sm font-medium"
            >
              <Monitor className="w-4 h-4" />
              打开大屏幕
            </a>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <User className="w-4 h-4 text-slate-400" />
            <div className="text-sm">
              <span className="text-slate-400">{config.label}：</span>
              <span className="text-white font-medium">{user?.name}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors text-sm font-medium"
            title="退出登录"
          >
            <LogOut className="w-4 h-4" />
            退出
          </button>
        </div>
      </div>
    </div>
  )
}
