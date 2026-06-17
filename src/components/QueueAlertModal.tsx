import { useEffect } from 'react'
import { AlertTriangle, X, User, Clock, Phone } from 'lucide-react'
import type { QueueCustomer } from '@/types'
import { useStore } from '@/store'
import { getMinutesSince, formatDuration } from '@/utils'

interface QueueAlertModalProps {
  customer: QueueCustomer
  serviceName: string
  onClose: () => void
}

export function QueueAlertModal({ customer, serviceName, onClose }: QueueAlertModalProps) {
  const markNotified = useStore((s) => s.markNotified)
  const waitMinutes = getMinutesSince(customer.joinTime)

  useEffect(() => {
    markNotified(customer.id)
  }, [customer.id, markNotified])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-br from-red-900 via-red-950 to-gray-900 rounded-2xl shadow-2xl border border-red-500/30 overflow-hidden animate-fadeInUp">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-orange-400 to-red-400 animate-pulse" />

        <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-pulseRing opacity-40" />
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">排队等待超时提醒</h3>
                <p className="text-red-300 text-sm mt-1">请及时安抚顾客</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 bg-black/30 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-red-400" />
              <span className="text-gray-400 text-sm w-16">顾客姓名</span>
              <span className="text-white font-medium text-lg">{customer.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-red-400" />
              <span className="text-gray-400 text-sm w-16">等待时长</span>
              <span className="text-red-400 font-bold text-lg">
                {formatDuration(waitMinutes)}
                <span className="text-red-300 text-sm ml-2">(已超过20分钟)</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-red-400" />
              <span className="text-gray-400 text-sm w-16">服务项目</span>
              <span className="text-white font-medium">{serviceName}</span>
            </div>
          </div>

          <p className="mt-5 text-gray-400 text-sm leading-relaxed">
            建议前台人员主动联系该顾客，提供茶水服务或调整排队安排，
            避免顾客因等待时间过长产生不满情绪。
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-500/20"
            >
              我知道了，立即处理
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
