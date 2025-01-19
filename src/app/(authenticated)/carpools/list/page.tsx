'use client'

import { useState, useEffect } from 'react'
import { CarpoolList } from '@/components/CarpoolList'
import { useApi } from '@/services/api'

export default function ListCarpoolsPage() {
  const api = useApi()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await api.getCurrentUser()
        console.log('User data:', userData)
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [api])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Carpools</h1>
      <CarpoolList />
    </div>
  )
} 