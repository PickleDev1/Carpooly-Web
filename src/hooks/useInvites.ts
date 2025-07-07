'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useApi } from '@/services/api'
import { useUser } from '@clerk/nextjs'

interface Invite {
  id: string
  sender_email: string
  carpool_name: string
  status: string
  carpool_id?: string
  current_available_seats?: number
  total_seats?: number
}

export function useInvites() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user } = useUser()
  const api = useApi()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchInvites = useCallback(async (isBackgroundRefresh = false) => {
    if (!user?.id) return;
    
    if (isBackgroundRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    
    try {
      const data = await api.getInvites(user.id)
      setInvites(data || [])
    } catch (error) {
      console.error('Error fetching invites:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [user?.id, api])

  useEffect(() => {
    fetchInvites()
    
    // Set up polling every 30 seconds, but only when page is visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, clear interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else {
        // Page is visible, start polling
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            fetchInvites(true) // Background refresh
          }, 30000) // 30 seconds
        }
      }
    }

    // Start polling if page is visible
    if (!document.hidden) {
      intervalRef.current = setInterval(() => {
        fetchInvites(true) // Background refresh
      }, 30000)
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup interval and event listener on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchInvites])

  return { invites, isLoading, isRefreshing, refresh: fetchInvites }
} 