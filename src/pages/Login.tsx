import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Sparkles, User, Lock, LogIn, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import type { UserRole } from '@/types'

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  { value: 'admin', label: '管理员', description: '拥有所有系统功能权限' },
  { value: 'reception', label: '前台', description: '管理排队和房间状态' },
  { value: 'technician', label: '技师', description: '查看个人上钟记录和状态' },
]

const accountHints: Record<UserRole, { username: string; password: string }> = {
  admin: { username: 'admin', password: '123456' },
  reception: { username: 'reception', password: '123456' },
  technician: { username: 'tech1', password: '123456' },
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const user = useAuthStore((s) => s.user)

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as { from?: string })?.from || '/'

  if (isAuthenticated && user) {
    const redirectPath = user.role === 'technician' ? '/technician' : '/reception'
    return <Navigate to={redirectPath} replace />
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setUsername(accountHints[role].username)
    setPassword(accountHints[role].password)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const success = login(username.trim(), password)
    setIsLoading(false)

    if (success) {
      const loggedInUser = useAuthStore.getState().user
      const redirectPath = loggedInUser?.role === 'technician' ? '/technician' : from
      navigate(redirectPath, { replace: true })
    } else {
      setError('用户名或密码错误，请重试')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30 mb-4">
            <Sparkles className="w-8 h-8 text-gold-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">足道养生会馆</h1>
          <p className="text-slate-400">智能管理系统</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">账号登录</h2>

          <div className="mb-6">
            <p className="text-sm text-slate-400 mb-3">选择登录身份</p>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => handleRoleSelect(role.value)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    selectedRole === role.value
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <p className={`font-medium text-sm ${selectedRole === role.value ? 'text-brand-400' : 'text-white'}`}>
                    {role.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError('')
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="请输入密码"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 text-white font-medium hover:from-brand-500 hover:to-brand-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  登录
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-500 mb-2">演示账号（密码均为 123456）：</p>
            <div className="text-xs text-slate-400 space-y-1">
              <p>管理员：<span className="text-slate-300 font-mono">admin</span></p>
              <p>前台：<span className="text-slate-300 font-mono">reception</span></p>
              <p>技师：<span className="text-slate-300 font-mono">tech1</span>（李师傅）、<span className="text-slate-300 font-mono">tech2</span>（王师傅）、<span className="text-slate-300 font-mono">tech3</span>（张师傅）</p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2024 足道养生会馆 · 智能管理系统 v1.0
        </p>
      </div>
    </div>
  )
}
