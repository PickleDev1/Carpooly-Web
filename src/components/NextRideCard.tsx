'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Car, Users, ArrowRight, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useApi } from '@/services/api'
import type { NextRideInfo } from '@/types/api'

function formatRideTime(startTime: string): string {
  const date = new Date(startTime)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const rideDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  const daysDiff = Math.floor((rideDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  let dateStr: string
  if (daysDiff === 0) {
    dateStr = 'Today'
  } else if (daysDiff === 1) {
    dateStr = 'Tomorrow'
  } else if (daysDiff < 7) {
    dateStr = date.toLocaleDateString('en-US', { weekday: 'long' })
  } else {
    dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }
  
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  
  return `${dateStr} at ${timeStr}`
}

function getDriverDisplayText(nextRide: NextRideInfo | null): string {
  if (!nextRide) return 'No upcoming rides'
  
  if (nextRide.is_user_driver) {
    return 'You are driving'
  }
  
  if (nextRide.driver) {
    return `Driver: ${nextRide.driver.display_name || nextRide.driver.name}`
  }
  
  return 'No driver assigned'
}

export function NextRideCard() {
  const [nextRide, setNextRide] = useState<NextRideInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const api = useApi()
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function fetchNextRide() {
      try {
        setLoading(true)
        setError(null)
        const data = await api.getNextRide()
        if (mounted) {
          setNextRide(data)
        }
      } catch (err) {
        console.error('Failed to fetch next ride:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load next ride')
          setNextRide(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchNextRide()

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchNextRide()
    }, 5 * 60 * 1000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [api])

  const handleViewDetails = async () => {
    if (!nextRide?.ride) return
    
    const { ride } = nextRide
    
    // If ride is active (status === 1), navigate to live map
    if (ride.status === 1 && ride.id) {
      router.push(`/maps/${ride.id}`)
      return
    }
    
    // Navigate to calendar
    if (ride.carpool_id) {
      // If ride has an ID and start_time, navigate with date parameter
      // The calendar page will NOT auto-open the modal to avoid "no ride" errors
      // User can click the date if they want to see details
      if (ride.id && ride.start_time) {
        // Extract date in local timezone to avoid timezone conversion issues
        const rideDate = new Date(ride.start_time)
        // Use local date components instead of UTC to get correct date
        const year = rideDate.getFullYear()
        const month = String(rideDate.getMonth() + 1).padStart(2, '0')
        const day = String(rideDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}` // Format: YYYY-MM-DD in local timezone
        
        // Navigate to calendar with date - modal will NOT auto-open
        // This prevents "no ride" errors if the ride doesn't exist for that date
        router.push(`/carpools/${ride.carpool_id}/calendar?date=${dateStr}`)
      } else {
        // No ride ID or start_time - just navigate to calendar without date
        router.push(`/carpools/${ride.carpool_id}/calendar`)
      }
    }
  }

  if (loading) {
    return (
      <Card className="border-2 border-dashed border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-700">Next Ride</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading next ride...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-700">Next Ride</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Car className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-600 text-sm font-medium mb-2">Error loading ride</p>
            <p className="text-red-500 text-xs">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!nextRide) {
    return (
      <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-700">Next Ride</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">No upcoming rides scheduled</p>
            <p className="text-gray-500 text-xs mb-4">Start finding carpool partners to get matched</p>
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push('/matching')}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Find Matches
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { ride, carpool_name, driver, is_user_driver } = nextRide
  const formattedTime = formatRideTime(ride.start_time)

  return (
    <Card 
      className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 hover:shadow-xl hover:border-primary/40 transition-all duration-300 cursor-pointer group"
      onClick={handleViewDetails}
    >
      {/* Decorative accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60"></div>
      
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Next Ride</CardTitle>
          </div>
          {is_user_driver && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white shadow-md px-3 py-1">
              <Car className="w-3.5 h-3.5 mr-1.5" />
              <span className="font-semibold">Driving</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5 pb-6">
        {/* Carpool Name - Prominent */}
        <div>
          <h3 className="font-bold text-2xl text-gray-900 mb-3 group-hover:text-primary transition-colors">
            {carpool_name}
          </h3>
          
          {/* Time Display */}
          <div className="flex items-center gap-3 bg-blue-50/50 rounded-lg p-3 border border-blue-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-0.5">Ride Time</p>
              <p className="text-sm font-semibold text-gray-900">{formattedTime}</p>
            </div>
          </div>
        </div>

        {/* Driver Status */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
          {is_user_driver ? (
            <>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-0.5">Driver</p>
                <p className="text-sm font-semibold text-green-700">You are driving</p>
              </div>
            </>
          ) : driver ? (
            <>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-0.5">Driver</p>
                <p className="text-sm font-semibold text-gray-900">{driver.display_name || driver.name}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-medium uppercase tracking-wide mb-0.5">Driver</p>
                <p className="text-sm font-semibold text-amber-700">No driver assigned</p>
              </div>
            </>
          )}
        </div>

        {/* Participants */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-purple-600 font-medium uppercase tracking-wide mb-0.5">Participants</p>
            <p className="text-sm font-semibold text-gray-900">
              {ride.participants.length} {ride.participants.length === 1 ? 'person' : 'people'}
            </p>
          </div>
        </div>

        {/* View Details Button */}
        <Button
          variant="default"
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]"
          onClick={(e) => {
            e.stopPropagation()
            handleViewDetails()
          }}
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  )
}
