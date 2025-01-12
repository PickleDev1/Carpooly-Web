'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/services/api'
import { useUserUuid } from '@/contexts/UserContext'
import { Carpool } from '@/types/api'

export function useCarpools() {
  const [carpools, setCarpools] = useState<Carpool[]>([])
  const [loading, setLoading] = useState(true)
  const { uuid } = useUserUuid()
  const api = useApi()

  useEffect(() => {
    async function fetchCarpools() {
      if (!uuid) return
      
      try {
        const data = await api.getCarpools(uuid)
        setCarpools(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching carpools:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCarpools()
  }, [uuid, api]) // Added api to the dependency array

  return { carpools, loading }
} 