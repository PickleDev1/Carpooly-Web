'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApi } from '@/services/api'
import { useUser } from '@clerk/nextjs'

interface Invite {
  id: string
  sender_email: string
  carpool_name: string
  status: string
}

export function useInvites() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()
  const api = useApi()

  const fetchInvites = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true)
    try {
      const data = await api.getInvites(user.id)
      setInvites(data || [])
    } catch (error) {
      console.error('Error fetching invites:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, api])

  useEffect(() => {
    fetchInvites()
  }, [fetchInvites])

  return { invites, isLoading, refresh: fetchInvites }
} 