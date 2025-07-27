'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/services/api'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Users, Navigation } from 'lucide-react'
import Link from 'next/link'

interface ActiveRide {
  id: string
  carpool_id: string
  carpool_name?: string
  start_time: string
  end_time?: string
  destination_address?: string
  participants: {
    id: string
    name: string
    is_driver: boolean
  }[] | null
}

export default function TrackLocationsPage() {
  const [activeRides, setActiveRides] = useState<ActiveRide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const api = useApi()
  const { user } = useUser()

  useEffect(() => {
    const fetchActiveRides = async () => {
      if (!user?.id) {
        console.log('🔔 Live Map: No user ID available, skipping fetch')
        return
      }

      try {
        setIsLoading(true)
        console.log('🔔 Live Map: Fetching active rides for user:', user.id)
        const ridesData = await api.getUserActiveRides(user.id)

        console.log('🔔 Live Map: Raw rides data:', ridesData)
        
        // Filter out rides that have no participants before processing them.
        const validRides = ridesData?.filter(
          (ride: any) => ride.participants && ride.participants.length > 0
        )

        if (validRides && validRides.length > 0) {
          const enhancedRides = await Promise.all(
            validRides.map(async (ride: any) => {
              try {
                // The active rides endpoint does not return carpool name/destination.
                // We need to fetch it separately for each ride.
                if (!ride.carpool_id) return ride

                const carpoolDetails = await api.getCarpool(ride.carpool_id)
                return {
                  ...ride,
                  carpool_name: carpoolDetails.carpool_name,
                  destination_address: carpoolDetails.destination_address,
                }
              } catch (error) {
                console.error(`Failed to fetch details for carpool ${ride.carpool_id}:`, error)
                // If fetching details fails, return the ride as is.
                // The UI will show fallback text like "Unnamed Carpool".
                return ride
              }
            })
          )
          // Deduplicate rides by ride ID to prevent duplicates
          const uniqueRides = enhancedRides.reduce((acc: any[], ride: any) => {
            const existingRide = acc.find(r => r.id === ride.id)
            if (!existingRide) {
              acc.push(ride)
            } else {
              console.log('🔔 Live Map: Duplicate ride found and removed:', ride.id)
            }
            return acc
          }, [])
          
          console.log('🔔 Live Map: After deduplication:', uniqueRides.length, 'rides')
          setActiveRides(uniqueRides)
        } else {
          setActiveRides([])
        }
      } catch (err) {
        setError('Failed to load active rides')
        console.error('Error fetching active rides:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveRides()
  }, [api, user?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5335]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    )
  }

  if (!activeRides.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Navigation className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Active Rides</h2>
          <p className="text-gray-500">There are currently no active rides to track.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Track Active Rides</h1>
        <p className="text-sm sm:text-base text-gray-600">Monitor real-time locations of your carpool members</p>
      </div>
      
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeRides.map((ride) => (
          <Card key={ride.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
            <CardHeader className="pb-3 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-[#2B5335] flex items-center">
                <Navigation className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {ride.carpool_name || 'Unnamed Carpool'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Destination</p>
                    <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{ride.destination_address || 'No destination set'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Time</p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      {new Date(ride.start_time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
                      })}{ride.end_time ? ` - ${new Date(ride.end_time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
                      })}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Members</p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      {(ride.participants?.length || 0)} {(ride.participants?.length || 0) === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href={`/maps/${ride.id}`} className="block">
                  <Button className="w-full bg-[#2B5335] hover:bg-[#1e3b25] text-white transition-colors text-sm">
                    <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    View Live Map
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 