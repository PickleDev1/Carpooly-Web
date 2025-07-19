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
    <div className="px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">My Carpools</h1>
      <CarpoolList />
    </div>
  )
} 