'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/services/api'

interface ActiveRide {
  id: string
  carpool_id: string
  carpool_name?: string
  destination_address?: string
  start_time: string
  status: number
  participants?: Array<{
    id: string
    name: string
    is_driver?: boolean
  }>
}

export function ActiveRideSection() {
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const api = useApi()

  useEffect(() => {
    let mounted = true

    const fetchActiveRide = async () => {
      
      try {
        console.log('🔔 ActiveRideSection: Fetching active rides')
        const rides = await api.getActiveRides()
        console.log('🔔 ActiveRideSection: Raw rides data:', rides)
        
        if (mounted) {
          // Deduplicate rides by ride ID to prevent duplicates
          const uniqueRides = rides ? rides.reduce((acc: any[], ride: any) => {
            const existingRide = acc.find(r => r.id === ride.id)
            if (!existingRide) {
              acc.push(ride)
            } else {
              console.log('🔔 ActiveRideSection: Duplicate ride found and removed:', ride.id)
            }
            return acc
          }, []) : []
          
          console.log('🔔 ActiveRideSection: After deduplication:', uniqueRides.length, 'rides')
          
          // Use the first active ride if multiple exist
          const firstRide = uniqueRides && uniqueRides.length > 0 ? uniqueRides[0] : null
          setActiveRide(firstRide)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('🔔 ActiveRideSection: Failed to fetch active ride:', err)
        if (mounted) {
          setActiveRide(null)
          setIsLoading(false)
        }
      }
    }

    fetchActiveRide()

    return () => {
      mounted = false
    }
  }, [api])

  if (isLoading) return <div>Loading ride details...</div>
  if (!activeRide) return null

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Active Ride</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Left side: Ride details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <p><strong>Carpool:</strong> {activeRide.carpool_name || 'Unknown Carpool'}</p>
              <p><strong>Start Time:</strong> {new Date(activeRide.start_time).toLocaleString()}</p>
              <p><strong>Destination:</strong> {activeRide.destination_address || 'No destination set'}</p>
              <p><strong>Status:</strong> {activeRide.status === 0 ? 'Active' : 'Inactive'}</p>
              <p><strong>Participants:</strong> {activeRide.participants?.length || 0} members</p>
            </div>
          </div>

          {/* Right side: Ride Info */}
          <div className="h-[400px] bg-gray-50 rounded-lg p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold mb-2">Active Carpool Ride</h3>
              <p className="text-gray-600 mb-4">
                This ride is currently active and being tracked.
              </p>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500">Ride ID</p>
                <p className="font-mono text-xs break-all">{activeRide.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 