import { useState, useEffect } from 'react'
import { formatDate, formatTime } from '@/utils'

export function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return {
    now,
    date: formatDate(now),
    time: formatTime(now),
  }
}
