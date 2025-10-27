import { useState, useEffect } from 'react'

export function useWaitingTime(createdAt: Date | string | undefined) {
  const [waitingMinutes, setWaitingMinutes] = useState(0)

  useEffect(() => {
    if (!createdAt) return

    const updateWaitingTime = () => {
      const created = new Date(createdAt)
      const now = new Date()
      const diffMs = now.getTime() - created.getTime()
      const minutes = Math.floor(diffMs / 60000)
      setWaitingMinutes(minutes)
    }

    updateWaitingTime()
    const interval = setInterval(updateWaitingTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [createdAt])

  return { waitingMinutes }
}
