'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/services/api'
import { useUser } from '@clerk/nextjs'
import type { ActiveRide } from '@/types/api'

export function useActiveRides() {
  const [activeRides, setActiveRides] = useState<ActiveRide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const api = useApi()

  useEffect(() => {
    async function fetchActiveRides() {
      if (!user?.id) return

      try {
        setLoading(true)
        const rides = await api.getUserActiveRides(user.id)
        setActiveRides(rides)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch active rides')
        console.error('Error fetching active rides:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveRides()
  }, [user?.id, api])

  return { activeRides, loading, error }
} 