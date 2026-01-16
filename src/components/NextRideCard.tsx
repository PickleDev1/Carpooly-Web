'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Car, Users, ArrowRight } from 'lucide-react'
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

  const handleViewDetails = () => {
    if (nextRide?.ride?.carpool_id) {
      router.push(`/carpools/${nextRide.ride.carpool_id}/calendar`)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Ride</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500 text-sm">Loading next ride...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Ride</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500 text-sm">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!nextRide) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Ride</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No upcoming rides scheduled</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/matching')}
              className="mt-2"
            >
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
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewDetails}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Next Ride</span>
          {is_user_driver && (
            <Badge variant="default" className="bg-green-600">
              <Car className="w-3 h-3 mr-1" />
              Driving
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{carpool_name}</h3>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formattedTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {is_user_driver ? (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <Car className="w-4 h-4" />
              <span className="text-sm">You are driving</span>
            </div>
          ) : driver ? (
            <div className="flex items-center gap-2 text-gray-700">
              <Car className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Driver: {driver.display_name || driver.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <Car className="w-4 h-4" />
              <span className="text-sm">No driver assigned</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span className="text-sm">
            {ride.participants.length} participant{ride.participants.length !== 1 ? 's' : ''}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={(e) => {
            e.stopPropagation()
            handleViewDetails()
          }}
        >
          View Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
