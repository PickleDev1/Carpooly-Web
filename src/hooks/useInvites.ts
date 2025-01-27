'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    async function fetchInvites() {
      if (!user?.id) return;
      
      try {
        const data = await api.getInvites(user.id)
        setInvites(data || [])
      } catch (error) {
        console.error('Error fetching invites:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvites()
  }, [user?.id, api])

  return { invites, isLoading }
} 