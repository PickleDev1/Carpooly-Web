import { useState, useEffect } from 'react'
import { useApi } from '@/services/api'
import { useUserUuid } from '@/contexts/UserContext'
import { useUser } from '@clerk/nextjs'

interface Invite {
  id: string
  sender_email: string
  carpool_name: string
  status: string
}

export function useInvites() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const { uuid } = useUserUuid()
  const { user } = useUser()
  const api = useApi()

  useEffect(() => {
    async function fetchInvites() {
      if (!uuid || !user?.emailAddresses?.[0]?.emailAddress) return
      
      try {
        console.log('Fetching invites for:', {
          uuid,
          email: user.emailAddresses[0].emailAddress
        })
        const data = await api.getInvites(uuid)
        console.log('Received invites:', data)
        setInvites(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching invites:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvites()
  }, [uuid, user])

  return { invites, loading }
} 