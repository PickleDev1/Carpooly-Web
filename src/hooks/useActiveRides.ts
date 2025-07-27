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
      console.log('🔔 useActiveRides: Starting to fetch active rides...')
      console.log('🔔 useActiveRides: User ID:', user?.id)
      
      if (!user?.id) {
        console.log('🔔 useActiveRides: No user ID available, skipping fetch')
        return
      }

      try {
        console.log('🔔 useActiveRides: Setting loading state to true')
        setLoading(true)
        
        console.log('🔔 useActiveRides: Calling api.getUserActiveRides')
        const rides = await api.getUserActiveRides(user.id)
        
        console.log('🔔 useActiveRides: API response received:', rides)
        console.log('🔔 useActiveRides: Number of active rides:', rides?.length || 0)
        
        // Deduplicate rides based on ride ID to prevent duplicates
        const uniqueRides = rides ? rides.reduce((acc: any[], ride: any) => {
          const existingRide = acc.find(r => r.id === ride.id)
          if (!existingRide) {
            acc.push(ride)
          } else {
            console.log('🔔 useActiveRides: Duplicate ride found and removed:', ride.id)
          }
          return acc
        }, []) : []
        
        console.log('🔔 useActiveRides: After deduplication:', uniqueRides.length, 'rides')
        
        // Fetch carpool details for each ride
        if (uniqueRides && uniqueRides.length > 0) {
          console.log('🔔 useActiveRides: Fetching carpool details for each ride...')
                      const ridesWithDetails = await Promise.all(
              uniqueRides.map(async (ride: any) => {
              try {
                console.log(`🔔 useActiveRides: Fetching carpool details for carpool_id: ${ride.carpool_id}`)
                const carpoolDetails = await api.getCarpool(ride.carpool_id)
                console.log(`🔔 useActiveRides: Carpool details for ${ride.carpool_id}:`, carpoolDetails)
                
                return {
                  ...ride,
                  carpool_name: carpoolDetails?.carpool_name || 'Unknown Carpool',
                  destination_address: carpoolDetails?.destination_address || 'Unknown Destination'
                }
              } catch (err) {
                console.error(`🔔 useActiveRides: Error fetching carpool details for ${ride.carpool_id}:`, err)
                return {
                  ...ride,
                  carpool_name: 'Unknown Carpool',
                  destination_address: 'Unknown Destination'
                }
              }
            })
          )
          
          console.log('🔔 useActiveRides: Rides with carpool details:', ridesWithDetails)
          setActiveRides(ridesWithDetails)
        } else {
          setActiveRides(uniqueRides || [])
        }
        
        console.log('🔔 useActiveRides: Active rides state updated')
        
      } catch (err) {
        console.error('🔔 useActiveRides: Error fetching active rides:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch active rides')
      } finally {
        console.log('🔔 useActiveRides: Setting loading state to false')
        setLoading(false)
      }
    }

    console.log('🔔 useActiveRides: useEffect triggered, calling fetchActiveRides')
    fetchActiveRides()
  }, [user?.id, api])

  return { activeRides, loading, error }
} 