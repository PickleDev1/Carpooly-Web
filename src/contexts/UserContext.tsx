'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useApi } from '@/services/api'

interface UserContextType {
  uuid: string | null
  loading: boolean
  error: string | null
}

const UserContext = createContext<UserContextType>({
  uuid: null,
  loading: true,
  error: null
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [uuid, setUuid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isLoaded } = useUser()
  const api = useApi()

  useEffect(() => {
    async function fetchUserUuid() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const userData = await api.getUserMe()
        setUuid(userData.id)
      } catch (err) {
        console.error('Error fetching user UUID:', err)
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded) {
      fetchUserUuid()
    }
  }, [user, isLoaded, api])

  return (
    <UserContext.Provider value={{ uuid, loading, error }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserUuid = () => useContext(UserContext) 