import { useState, useEffect } from 'react'

export function useTick(intervalMs = 60000) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return tick
}
